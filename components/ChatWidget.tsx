import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Minimize2, Bot, Headphones, Mic, PhoneOff, Radio } from 'lucide-react';
import { getSupportChatStream, connectToLiveSession } from '../services/geminiService';
import { ChatMessage } from '../types';
import { GenerateContentResponse, LiveServerMessage } from "@google/genai";
import { useLanguage } from '../contexts/LanguageContext';
import { ViewState } from '../App';

interface ChatWidgetProps {
    onNavigate: (view: ViewState) => void;
}

// Allowed navigation targets for the AI
const VALID_VIEWS: ViewState[] = [
    'dashboard', 
    'forms', 
    'documents', 
    'letters', 
    'rfe', 
    'strategy', 
    'marketplace', 
    'translations', 
    'caselaw', 
    'interview', 
    'knowledge', 
    'risk',
    'analytics'
];

// --- Audio Helper Functions ---

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array, sampleRate: number): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: `audio/pcm;rate=${sampleRate}`,
  };
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ onNavigate }) => {
  const { t, language, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  // Text Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // Voice Chat State
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Refs for Voice
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null); // LiveSession type is internal to SDK
  const nextStartTimeRef = useRef<number>(0);
  const sourceNodesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // --- Effect: Localization Context ---
  useEffect(() => {
     if (!initialized.current) {
        setMessages([{
            id: 'init',
            role: 'model',
            text: t('supportIntro'),
            timestamp: new Date()
        }]);
        initialized.current = true;
     } else if (messages.length > 0) {
         setMessages(prev => [...prev, {
             id: 'lang-switch-' + Date.now(),
             role: 'model',
             text: t('supportIntro'),
             timestamp: new Date()
         }]);
     }
  }, [language]);

  // --- Effect: Scroll on message ---
  useEffect(() => {
    if (isOpen && !isVoiceMode) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isVoiceMode]);

  // --- Cleanup on unmount ---
  useEffect(() => {
      return () => {
          stopVoiceSession();
      };
  }, []);

  // --- Voice Session Management ---

  const startVoiceSession = async () => {
      setErrorMessage('');
      setVoiceStatus('connecting');
      setIsVoiceMode(true);
      
      try {
        // 1. Setup Audio Contexts
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        
        const inputCtx = new AudioContextClass(); 
        const outputCtx = new AudioContextClass();
        
        inputAudioContextRef.current = inputCtx;
        audioContextRef.current = outputCtx;
        nextStartTimeRef.current = 0;

        // 2. Get Microphone Stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        // 3. Connect to Live API
        const sessionPromise = connectToLiveSession(language, {
            onOpen: () => {
                setVoiceStatus('listening');
                console.log('Voice session opened');

                // Start Input Stream Processing
                const source = inputCtx.createMediaStreamSource(stream);
                const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
                
                scriptProcessor.onaudioprocess = (e) => {
                   const inputData = e.inputBuffer.getChannelData(0);
                   const pcmBlob = createBlob(inputData, inputCtx.sampleRate);
                   
                   sessionPromise.then((session) => {
                       if (audioContextRef.current) { 
                           session.sendRealtimeInput({ media: pcmBlob });
                       }
                   });
                };
                
                source.connect(scriptProcessor);
                scriptProcessor.connect(inputCtx.destination);
            },
            onMessage: async (message: LiveServerMessage) => {
                // Handle Tool Calls (Navigation)
                if (message.toolCall) {
                    for (const fc of message.toolCall.functionCalls) {
                        if (fc.name === 'changeView') {
                            const rawView = (fc.args as any).view;
                            const view = rawView?.replace(/['"]/g, '').trim();
                            
                            if (VALID_VIEWS.includes(view as ViewState)) {
                                console.log("Voice Navigation to:", view);
                                onNavigate(view as ViewState);
                                
                                // Confirm back to model
                                sessionPromise.then((session) => {
                                    session.sendToolResponse({
                                        functionResponses: {
                                            id: fc.id,
                                            name: fc.name,
                                            response: { result: "Navigated successfully" }
                                        }
                                    });
                                });
                            }
                        }
                    }
                }

                // Handle Audio Output
                const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                
                if (base64Audio) {
                    setVoiceStatus('speaking');
                    const ctx = audioContextRef.current;
                    if (!ctx) return;

                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                    
                    try {
                        const audioBuffer = await decodeAudioData(
                            decode(base64Audio),
                            ctx,
                            24000, 
                            1
                        );
                        
                        const source = ctx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(ctx.destination);
                        
                        source.onended = () => {
                            sourceNodesRef.current.delete(source);
                            if (sourceNodesRef.current.size === 0) {
                                setVoiceStatus('listening');
                            }
                        };
                        
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        sourceNodesRef.current.add(source);
                    } catch (e) {
                        console.error("Audio decode error", e);
                    }
                }
                
                // Handle Interruptions
                if (message.serverContent?.interrupted) {
                    sourceNodesRef.current.forEach(node => {
                        try { node.stop(); } catch(e) {}
                    });
                    sourceNodesRef.current.clear();
                    nextStartTimeRef.current = 0;
                    setVoiceStatus('listening');
                }
            },
            onClose: (e) => {
                console.log('Session closed', e);
                stopVoiceSession();
            },
            onError: (e) => {
                console.error('Session error', e);
                setErrorMessage('Connection failed. Please try again.');
                setVoiceStatus('idle');
            }
        });

        sessionRef.current = sessionPromise;

      } catch (e) {
          console.error('Failed to start voice session', e);
          setErrorMessage('Could not access microphone.');
          setVoiceStatus('idle');
      }
  };

  const stopVoiceSession = async () => {
      // 1. Close Live Session
      if (sessionRef.current) {
          sessionRef.current.then((session: any) => session.close());
          sessionRef.current = null;
      }
      
      // 2. Stop Microphone
      if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
      }

      // 3. Close Audio Contexts
      if (inputAudioContextRef.current) {
          inputAudioContextRef.current.close();
          inputAudioContextRef.current = null;
      }
      if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
      }
      
      sourceNodesRef.current.clear();
      setIsVoiceMode(false);
      setVoiceStatus('idle');
  };

  // --- Text Chat Logic ---

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: 'model',
        text: '',
        timestamp: new Date()
      }]);

      const streamResult = await getSupportChatStream(history, userMsg.text, language);

      let fullText = '';
      let hasNavigated = false;

      for await (const chunk of streamResult) {
         const c = chunk as GenerateContentResponse;
         const chunkText = c.text || '';
         fullText += chunkText;
         
         // Check for Text Navigation Token: [[NAVIGATE:viewId]]
         const match = fullText.match(/\[\[NAVIGATE:(.*?)\]\]/);
         if (match && !hasNavigated) {
             const rawView = match[1].trim();
             const view = rawView.replace(/['"]/g, ''); // Remove potential quotes
             
             if (VALID_VIEWS.includes(view as ViewState)) {
                 console.log("Text Navigation to:", view);
                 onNavigate(view as ViewState);
                 hasNavigated = true;
             }
         }

         // Remove token from display text
         const displayText = fullText.replace(/\[\[NAVIGATE:.*?\]\]/g, '');

         setMessages(prev => prev.map(msg => 
            msg.id === aiMsgId ? { ...msg, text: displayText } : msg
         ));
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date()
      }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 z-50 animate-in fade-in slide-in-from-bottom-4`}
      >
        <MessageCircle className="w-7 h-7" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 animate-in fade-in slide-in-from-bottom-4 overflow-hidden`}>
      {/* Header */}
      <div className="bg-blue-600 p-4 flex items-center justify-between text-white shrink-0 z-10 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
             <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">{t('supportAgent')}</h3>
            <span className="text-xs text-blue-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> {t('online')}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
            <button 
                onClick={() => isVoiceMode ? stopVoiceSession() : startVoiceSession()}
                className={`p-1.5 rounded-lg transition-colors ${isVoiceMode ? 'bg-red-500 hover:bg-red-600 text-white' : 'hover:bg-white/20 text-white'}`}
                title={isVoiceMode ? "End Call" : "Voice Mode"}
            >
                <Headphones className="w-5 h-5" />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <Minimize2 className="w-5 h-5" />
            </button>
             <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Mode Content */}
      {isVoiceMode ? (
          // --- VOICE MODE UI ---
          <div className="flex-1 bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
              </div>

              {/* Status Indicator */}
              <div className="z-10 flex flex-col items-center gap-6">
                  {errorMessage ? (
                      <div className="text-red-400 text-center mb-4 font-medium">{errorMessage}</div>
                  ) : (
                      <>
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
                            voiceStatus === 'speaking' 
                                ? 'bg-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.6)] scale-110' 
                                : voiceStatus === 'listening'
                                ? 'bg-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.4)] animate-pulse'
                                : 'bg-slate-700'
                        }`}>
                             {voiceStatus === 'connecting' ? (
                                 <Loader2 className="w-12 h-12 text-white animate-spin" />
                             ) : voiceStatus === 'speaking' ? (
                                 <Radio className="w-12 h-12 text-white animate-bounce" />
                             ) : (
                                 <Mic className="w-12 h-12 text-white" />
                             )}
                        </div>
                        
                        <div className="text-center">
                            <h4 className="text-xl font-bold text-white mb-1">
                                {voiceStatus === 'connecting' ? 'Connecting...' :
                                 voiceStatus === 'listening' ? 'Listening...' :
                                 voiceStatus === 'speaking' ? 'Speaking...' : 'Ready'}
                            </h4>
                            <p className="text-slate-400 text-sm">
                                {language === 'es' ? 'Habla ahora' : language === 'zh' ? '请说' : language === 'ar' ? 'تحدث الآن' : 'Speak clearly'}
                            </p>
                        </div>
                      </>
                  )}
              </div>

              {/* Controls */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
                  <button 
                      onClick={stopVoiceSession}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-3 font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
                  >
                      <PhoneOff className="w-5 h-5" /> End Call
                  </button>
              </div>
          </div>
      ) : (
          // --- TEXT MODE UI ---
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                                ? `bg-blue-600 text-white ${dir === 'rtl' ? 'rounded-bl-none' : 'rounded-br-none'}`
                                : `bg-white text-slate-800 border border-slate-200 ${dir === 'rtl' ? 'rounded-br-none' : 'rounded-bl-none'}`
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isStreaming && (
                    <div className="flex justify-start">
                        <div className={`bg-white px-3 py-2 rounded-2xl ${dir === 'rtl' ? 'rounded-br-none' : 'rounded-bl-none'} border border-slate-200 shadow-sm flex items-center gap-2`}>
                            <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                            <span className="text-xs text-slate-400">Typing...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                <div className="relative flex items-center">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('typeMessage')}
                        className={`w-full ${dir === 'rtl' ? 'pr-4 pl-12' : 'pl-4 pr-12'} py-3 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isStreaming}
                        className={`absolute ${dir === 'rtl' ? 'left-1.5' : 'right-1.5'} p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-slate-300 transition-colors`}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
          </>
      )}
    </div>
  );
};