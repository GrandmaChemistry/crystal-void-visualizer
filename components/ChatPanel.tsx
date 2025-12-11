import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { streamCrystalExplanation } from '../services/geminiService';
import { ChatMessage, CrystalType } from '../types';

interface ChatPanelProps {
  currentType: CrystalType;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ currentType }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '你好！我是你的晶体学助教。关于 FCC 或 BCC 结构有什么问题吗？' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let modelResponseText = '';
    const modelMsgIndex = messages.length + 1; // Index where the new model message will be

    // Add placeholder for model message
    setMessages(prev => [...prev, { role: 'model', text: '' }]);

    await streamCrystalExplanation(userMsg.text, currentType, (chunk) => {
      modelResponseText += chunk;
      setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs[modelMsgIndex]) {
            newMsgs[modelMsgIndex].text = modelResponseText;
        }
        return newMsgs;
      });
      scrollToBottom();
    });

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700 shadow-xl w-full md:w-80 lg:w-96 transition-all duration-300">
      <div className="p-4 border-b border-slate-700 bg-slate-800 flex items-center gap-2">
        <Bot className="w-5 h-5 text-purple-400" />
        <h2 className="font-semibold text-slate-100">AI 晶体学助教</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600/20 text-blue-100 border border-blue-600/30' : 'bg-slate-700 text-slate-200 border border-slate-600'}`}>
              {msg.text || <Loader2 className="w-4 h-4 animate-spin text-purple-400" />}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="relative">
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-4 pr-10 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            placeholder="询问关于空隙或结构的问题..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-purple-400 disabled:opacity-50 disabled:hover:text-slate-400 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">
          由 Gemini 3 Pro 提供支持
        </p>
      </div>
    </div>
  );
};

export default ChatPanel;