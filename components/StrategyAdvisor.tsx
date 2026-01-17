import React, { useState, useRef, useEffect } from 'react';
import { getStrategyStream } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, User, Compass, Loader2 } from 'lucide-react';
import { GenerateContentResponse } from "@google/genai";
import { useLanguage } from '../contexts/LanguageContext';

export const StrategyAdvisor: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Reset conversation on language change or init
    if (initialized.current && messages.length > 0) {
        // Optional: clear messages or keep them? 
        // For simplicity, we just add a new welcome message in the new language
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

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
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
                
                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                    msg.role === 'user' 
                        ? `bg-blue-600 text-white ${dir === 'rtl' ? 'rounded-tl-none' : 'rounded-tr-none'}`
                        : `bg-white text-slate-800 border border-slate-200 ${dir === 'rtl' ? 'rounded-tr-none' : 'rounded-tl-none'}`
                }`}>
                    <div className="whitespace-pre-wrap leading-relaxed text-sm">
                        {msg.text}
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
        <div className="relative">
            <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('strategyPlaceholder')}
                className={`w-full ${dir === 'rtl' ? 'pl-14 pr-4' : 'pl-4 pr-14'} py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none h-16 max-h-32 shadow-inner text-sm`}
            />
            <button
                onClick={handleSend}
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
