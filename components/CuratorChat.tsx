
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, ArrowUp } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToCurator } from '../services/gemini';

const CuratorChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Namaste. I am your AI Curator. How can I assist you?", timestamp: Date.now() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { if (isOpen) scrollToBottom(); }, [messages, isOpen, isLoading]);

  const processMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMessage: ChatMessage = { role: 'user', text: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const responseText = await sendMessageToCurator(userMessage.text, messages.map(m => ({ role: m.role, text: m.text })));
    
    setMessages(prev => [...prev, { 
        role: 'model', 
        text: responseText || "I'm having trouble connecting right now.", 
        timestamp: Date.now() 
    }]);
    setIsLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-black text-white shadow-2xl hover:scale-105 transition-all"
        aria-label="Open AI Curator Chat"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      <div className={`fixed bottom-6 right-6 w-[95vw] md:w-[380px] h-[550px] bg-white border border-gray-100 z-50 flex flex-col transition-all duration-300 shadow-2xl rounded-3xl overflow-hidden ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  <span className="text-sm font-black uppercase tracking-widest">MOCA Curator</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-4 h-4" />
              </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-black text-white rounded-2xl rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none'}`}>
                          {msg.text}
                      </div>
                  </div>
              ))}
              {isLoading && (
                  <div className="flex gap-1 p-2 bg-gray-50 w-fit rounded-lg animate-pulse">
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{animationDelay:'0.4s'}}></div>
                  </div>
              )}
              <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-50">
              <form 
                onSubmit={(e) => { e.preventDefault(); processMessage(input); }} 
                className="relative"
              >
                  <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Ask about MOCA..." 
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-5 pr-12 text-sm focus:ring-2 focus:ring-black/5 outline-none" 
                  />
                  <button 
                    type="submit" 
                    disabled={!input.trim() || isLoading} 
                    className="absolute right-2 top-2 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center disabled:opacity-10 transition-all hover:bg-gray-800"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
              </form>
          </div>
      </div>
    </>
  );
};

export default CuratorChat;
