'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

type User = {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
};

type Message = {
  id: string;
  text: string;
  createdAt: string;
  senderId: string;
  sender: User;
};

export default function EventChat({ eventId, currentUser }: { eventId: string, currentUser: any }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [eventId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const messageText = text;
    setText(''); // Optimistic clear

    // Optimistic UI update
    const optimisticMsg: Message = {
      id: Date.now().toString(),
      text: messageText,
      createdAt: new Date().toISOString(),
      senderId: currentUser.id,
      sender: {
        id: currentUser.id,
        name: currentUser.name || 'You',
        avatarUrl: currentUser.avatarUrl || null,
        role: currentUser.role,
      }
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await fetch(`/api/chat/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText })
      });
      if (res.ok) {
        fetchMessages(); // Refresh to get official timestamp & ID
      } else {
        throw new Error('Failed to send');
      }
    } catch (err) {
      console.error(err);
      // Revert optimistic if failed (simple version: just refresh)
      fetchMessages();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-[#242424] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#CD7F32] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
          </div>
          <div>
            <h3 className="font-bold text-lg font-serif">Event Chat</h3>
            <p className="text-xs text-white/70">Managers & Accepted Talents</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
        {loading && messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 bg-white p-6 rounded-lg border border-dashed border-gray-300">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUser.id;
            const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;

            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}
              >
                <div className={`flex max-w-[75%] gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {showAvatar ? (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-600 uppercase overflow-hidden">
                      {msg.sender?.avatarUrl ? (
                        <img src={msg.sender.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        msg.sender?.name?.substring(0,2) || 'U'
                      )}
                    </div>
                  ) : (
                    <div className="w-8 h-8 flex-shrink-0"></div>
                  )}
                  
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {showAvatar && (
                      <span className="text-xs text-gray-500 font-medium mb-1 mx-1">
                        {msg.sender?.name} {msg.sender?.role === 'MANAGER' ? '(Manager)' : ''}
                      </span>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                      isMe 
                        ? 'bg-[#CD7F32] text-white rounded-tr-sm' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 mx-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-gray-200">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-100 text-gray-900 border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-[#CD7F32] outline-none placeholder-gray-500"
          />
          <button 
            type="submit"
            disabled={!text.trim()}
            className="bg-[#242424] hover:bg-black text-white p-3 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
