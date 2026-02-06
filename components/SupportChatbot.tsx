
import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../constants';
import { askSupport } from '../services/geminiService';

const QUICK_QUESTIONS = [
  "How can I improve my credit score?",
  "Analyze my tax compliance risk.",
  "What is my loan eligibility limit?",
  "Tips for optimizing cash flow."
];

const SupportChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'FinPulse Intelligence Assistant active. How may I facilitate your financial analysis today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;
    const userMsg = textToSend.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);
    try {
      const response = await askSupport(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Service temporarily restricted. Please attempt later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen ? (
        <div className="bg-white w-80 sm:w-96 h-[500px] rounded-[24px] border border-slate-200 flex flex-col shadow-soft animate-in zoom-in-95 duration-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between active-gradient">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                <ICONS.Help size={18} />
              </div>
              <div className="leading-none">
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">System Assistant</p>
                <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">Secure Link Active</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm font-medium ${
                  m.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="flex justify-start"><div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none flex space-x-1"><div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce"></div><div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div><div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div></div></div>}
          </div>

          {/* Quick Questions Chips */}
          <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-slate-50 bg-white">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isTyping}
                className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-tight transition-all border border-transparent hover:border-blue-100 whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="p-4 bg-white border-t border-slate-100">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Query system..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-xs text-slate-900 focus:ring-2 focus:ring-blue-100 outline-none font-bold placeholder:text-slate-300"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-1.5 top-1.5 p-1.5 bg-slate-900 rounded-lg text-white hover:bg-slate-800 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-soft hover:scale-105 active:scale-95 transition-all group"
        >
          <ICONS.Chat size={20} />
        </button>
      )}
    </div>
  );
};

export default SupportChatbot;
