import React, { useState, useRef, useEffect } from 'react';
import { getStrategyStream } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, User, Compass, Loader2, Trash2, Download, MessageSquare, Copy } from 'lucide-react';
import { GenerateContentResponse } from "@google/genai";
import { useLanguage } from '../contexts/LanguageContext';
import Markdown from 'react-markdown';

export const StrategyAdvisor: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const SUGGESTED_PROMPTS = [
    "What are the steps for a marriage-based Green Card?",
    "How do I respond to a Request for Evidence (RFE)?",
    "What is the Visa Bulletin and how does it work?",
    "Can I travel outside the US while my application is pending?"
  ];

  useEffect(() => {
    // Reset conversation on language change or init
    if (initialized.current && messages.length > 0) {
        setMessages(prev => [...prev, {
            id: 'system-lang-change-' + Date.now(),
            role: 'model',
            text: t('strategyIntro'),
            timestamp: new Date()
        }]);
    } else {
        setMessages([{
            id: 'welcome',
            role: 'model',
            text: t('strategyIntro'),
            timestamp: new Date()
        }]);
        initialized.current = true;
    }
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || inputValue;
    if (!textToSend.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textOverride) setInputValue('');
    setIsStreaming(true);

    try {
      // Prepare history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Create placeholder for AI response
      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: 'model',
        text: '',
        timestamp: new Date()
      }]);

      const streamResult = await getStrategyStream(history, userMsg.text, language);

      let fullText = '';
      
      for await (const chunk of streamResult) {
        const c = chunk as GenerateContentResponse;
        const chunkText = c.text || '';
        fullText += chunkText;
        
        setMessages(prev => prev.map(msg => 
            msg.id === aiMsgId ? { ...msg, text: fullText } : msg
        ));
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm having trouble connecting to the strategy database right now. Please try again.",
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

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      setMessages([{
          id: 'welcome',
          role: 'model',
          text: t('strategyIntro'),
          timestamp: new Date()
      }]);
    }
  };

  const handleExportChat = () => {
    const chatText = messages.map(m => `[${m.role.toUpperCase()}] - ${m.timestamp.toLocaleString()}\n${m.text}\n\n`).join('');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Strategy_Session_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
                <h2 className="font-bold text-slate-800">{t('stratTitle')}</h2>
                <p className="text-xs text-slate-500">AI-powered advice • Not legal representation</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleExportChat}
                className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                title="Export Chat"
            >
                <Download className="w-5 h-5" />
            </button>
            <button 
                onClick={handleClearChat}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Clear Chat"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
        {messages.map((msg) => (
            <div 
                key={msg.id} 
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600' : 'bg-teal-600'}`}>
                    {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Compass className="w-5 h-5 text-white" />}
                </div>
                
                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm relative group ${
                    msg.role === 'user' 
                        ? `bg-blue-600 text-white ${dir === 'rtl' ? 'rounded-tl-none' : 'rounded-tr-none'}`
                        : `bg-white text-slate-800 border border-slate-200 ${dir === 'rtl' ? 'rounded-tr-none' : 'rounded-tl-none'}`
                }`}>
                    {msg.role === 'model' && (
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(msg.text);
                                // Optional: add a toast here if we had the toast state in this component
                            }}
                            className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                            title="Copy to clipboard"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    )}
                    <div className="text-sm prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-100">
                        {msg.role === 'user' ? (
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                        ) : (
                            <Markdown>{msg.text}</Markdown>
                        )}
                    </div>
                </div>
            </div>
        ))}
        {isStreaming && (
            <div className="flex gap-4">
                 <div className="w-8 h-8 rounded-full bg-teal-600 flex-shrink-0 flex items-center justify-center">
                    <Compass className="w-5 h-5 text-white" />
                </div>
                <div className={`bg-white px-4 py-3 rounded-2xl ${dir === 'rtl' ? 'rounded-tr-none' : 'rounded-tl-none'} border border-slate-200 flex items-center gap-2`}>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    <span className="text-xs text-slate-500">Thinking...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 bg-white">
        {messages.length <= 1 && (
            <div className="mb-4 flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button
                        key={i}
                        onClick={() => handleSend(prompt)}
                        className="text-xs bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 px-3 py-2 rounded-full border border-slate-200 transition-colors flex items-center gap-1.5"
                    >
                        <MessageSquare className="w-3 h-3" />
                        {prompt}
                    </button>
                ))}
            </div>
        )}
        <div className="relative">
            <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('strategyPlaceholder')}
                className={`w-full ${dir === 'rtl' ? 'pl-14 pr-4' : 'pl-4 pr-14'} py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none h-16 max-h-32 shadow-inner text-sm`}
            />
            <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isStreaming}
                className={`absolute ${dir === 'rtl' ? 'left-2' : 'right-2'} top-2 bottom-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white px-4 rounded-lg transition-colors flex items-center justify-center`}
            >
                <Send className="w-5 h-5" />
            </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
            {t('strategyDisclaimer')}
        </p>
      </div>

    </div>
  );
};
