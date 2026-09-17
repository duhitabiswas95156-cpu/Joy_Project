import React, { useState } from 'react';
import { X, Send, Sparkles, MessageCircle, Bot, CheckCircle } from 'lucide-react';

interface SupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'joy';
  text: string;
  time: string;
}

export const SupportChatModal: React.FC<SupportChatModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'joy',
      text: 'Hi there! I’m your Joy Wedding Concierge. Need help formatting schedule items, wording your dress code, or notifying guests about updates?',
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const quickPrompts = [
    'How do notifications get sent to guests?',
    'What is the ideal rehearsal dinner timeline?',
    'Can I restrict events to Bridal Party only?',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    setTimeout(() => {
      let reply = "You're all set! Joy automatically handles guest timezones and sends branded WhatsApp and Email updates whenever you confirm a schedule change.";
      if (text.toLowerCase().includes('bridal party')) {
        reply = "Yes! You can set 'Guest Visibility' to Bridal Party Only. Guests who aren't invited to that specific event won't see it on their schedule tab.";
      } else if (text.toLowerCase().includes('rehearsal')) {
        reply = "A standard rehearsal dinner typically begins at 4:00 PM for the venue walkthrough, followed by cocktails and dinner around 6:00 PM!";
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'joy',
        text: reply,
        time: 'Just now',
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <div className="fixed bottom-20 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[520px] animate-in slide-in-from-bottom-5 duration-200">
      {/* Header */}
      <div className="bg-[#2D2D2D] text-white p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-amber-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold flex items-center space-x-1">
              <span>withjoy Support</span>
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online • Instant replies</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/50 text-xs">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[82%] p-3 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-[#2D2D2D] text-white rounded-br-xs'
                  : 'bg-white border border-stone-200 text-stone-800 rounded-bl-xs shadow-2xs'
              }`}
            >
              <p className="leading-relaxed">{msg.text}</p>
              <div className={`text-[9px] mt-1 ${msg.sender === 'user' ? 'text-gray-300' : 'text-stone-400'} text-right`}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 bg-white border-t border-stone-100 flex items-center space-x-1.5 overflow-x-auto text-[11px] no-scrollbar shrink-0">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="whitespace-nowrap bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-full transition-colors shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="p-3 bg-white border-t border-stone-200 flex items-center space-x-2 shrink-0">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about schedules, RSVPs, or guest notifications..."
          className="flex-1 text-xs border border-stone-200 rounded-full px-3.5 py-2 focus:ring-0 focus:border-stone-500 outline-none"
        />
        <button 
          onClick={() => handleSend()}
          disabled={!inputText.trim()}
          className="w-8 h-8 rounded-full bg-[#2D2D2D] text-white flex items-center justify-center hover:bg-black transition-colors disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
