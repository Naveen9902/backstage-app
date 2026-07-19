'use client';

import { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';

export default function CommunityChat({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const [event, setEvent] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/user/events/${eventId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setEvent(data);
      })
      .catch(console.error);

    fetch(`/api/user/community/${eventId}/messages`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [eventId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/user/community/${eventId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newMessage, parentId })
      });
      
      if (res.ok) {
        const message = await res.json();
        if (parentId) {
          // Update parent with new reply
          setMessages(prev => prev.map(msg => 
            msg.id === parentId ? { ...msg, replies: [...(msg.replies || []), message] } : msg
          ));
          setReplyingTo(null);
        } else {
          setMessages(prev => [...prev, message]);
        }
        setNewMessage('');
      }
    } catch (error) {
      console.error(error);
    }
    setSending(false);
  };

  const handleLike = async (messageId: string, isReply: boolean = false, parentId?: string) => {
    // Optimistic UI update
    setMessages(prev => {
      return prev.map(msg => {
        if (!isReply && msg.id === messageId) {
          return {
            ...msg,
            isLikedByMe: !msg.isLikedByMe,
            likesCount: msg.isLikedByMe ? msg.likesCount - 1 : msg.likesCount + 1
          };
        } else if (isReply && msg.id === parentId) {
          return {
            ...msg,
            replies: msg.replies?.map((r: any) => 
              r.id === messageId 
                ? { ...r, isLikedByMe: !r.isLikedByMe, likesCount: r.isLikedByMe ? r.likesCount - 1 : r.likesCount + 1 }
                : r
            )
          };
        }
        return msg;
      });
    });

    try {
      await fetch(`/api/user/community/${eventId}/messages/${messageId}/like`, { method: 'POST' });
    } catch (e) {
      console.error("Like failed", e);
      // Ideally revert state on fail
    }
  };

  const renderComment = ({ msg, isReply = false, parentId }: { msg: any, isReply?: boolean, parentId?: string }) => (
    <div key={msg.id} className={`flex gap-4 group ${isReply ? 'mt-4' : ''}`}>
      <div className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 shrink-0 overflow-hidden flex items-center justify-center text-gray-700`}>
        {msg.sender?.avatarUrl ? (
          <img src={msg.sender.avatarUrl} alt={msg.sender.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-bold text-sm">{msg.sender?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
        )}
      </div>
      <div className={`flex-1 ${!isReply ? 'pb-6 border-b border-gray-100' : ''}`}>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-bold text-sm text-[#242424] hover:underline cursor-pointer">
            @{msg.sender?.name?.replace(/\s+/g, '').toLowerCase() || 'anonymous'}
          </span>
          <span className="text-[11px] text-gray-500 font-medium">
            {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-gray-800 text-sm whitespace-pre-wrap mb-2.5 leading-relaxed">{msg.text}</p>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-4 text-[12px] font-bold text-gray-500">
          <button 
            onClick={() => handleLike(msg.id, isReply, parentId)}
            className={`flex items-center gap-1.5 transition-colors ${msg.isLikedByMe ? 'text-[#CD7F32]' : 'hover:text-gray-800'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={msg.isLikedByMe ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
            {msg.likesCount > 0 ? msg.likesCount : 'Like'}
          </button>
          
          {!isReply && (
            <button 
              onClick={() => { setReplyingTo(replyingTo === msg.id ? null : msg.id); setNewMessage(''); }}
              className="hover:text-gray-800 transition-colors"
            >
              Reply
            </button>
          )}
        </div>

        {/* Replies */}
        {!isReply && msg.replies && msg.replies.length > 0 && (
          <div className="mt-2 space-y-4">
            {msg.replies.map((reply: any) => renderComment({ msg: reply, isReply: true, parentId: msg.id }))}
          </div>
        )}

        {/* Reply Input */}
        {replyingTo === msg.id && !isReply && (
          <form onSubmit={(e) => handleSendMessage(e, msg.id)} className="mt-4 flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-[#242424] shrink-0 overflow-hidden flex items-center justify-center text-white">
              <span className="font-bold text-xs">ME</span>
            </div>
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Add a reply..."
                rows={1}
                autoFocus
                className="w-full bg-transparent border-b border-gray-300 focus:border-[#CD7F32] transition-colors resize-none py-1 text-sm focus:outline-none"
                disabled={sending}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setReplyingTo(null)} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">Cancel</button>
                <button type="submit" disabled={!newMessage.trim() || sending} className="px-4 py-1.5 text-xs font-bold bg-[#CD7F32] hover:bg-[#a06227] disabled:bg-gray-300 text-white rounded-full transition-colors">
                  {sending ? 'Replying...' : 'Reply'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-[#CD7F32]/30 border-t-[#CD7F32] rounded-full animate-spin" /></div>;
  if (!event) return <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-[#EAE6DF]"><p className="text-gray-500">Community not found.</p><Link href="/user/community" className="text-[#CD7F32] hover:underline mt-4 block">Back to Hub</Link></div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] text-[#242424] font-sans">
      <div className="bg-white rounded-t-2xl border border-b-0 border-[#EAE6DF] p-6 flex items-center gap-4 shrink-0">
        <Link href="/user/community" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </Link>
        <div className="w-12 h-12 bg-[#FCD5B5] rounded-full flex items-center justify-center text-[#CD7F32]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div>
          <h1 className="text-xl font-bold font-serif">{event.title} Community</h1>
          <p className="text-sm text-gray-500">{event._count?.fans || 0} Members</p>
        </div>
      </div>

      <div className="bg-white border-x border-[#EAE6DF] flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <p className="font-medium text-gray-500">No comments yet</p>
            <p className="text-sm">Be the first to start the discussion!</p>
          </div>
        ) : (
          messages.map((msg) => renderComment({ msg }))
        )}
        <div ref={messagesEndRef} />
      </div>

      {!replyingTo && (
        <div className="bg-white rounded-b-2xl border border-[#EAE6DF] p-6 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 relative">
          <form onSubmit={(e) => handleSendMessage(e)} className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-[#242424] shrink-0 overflow-hidden flex items-center justify-center text-white">
              <span className="font-bold text-sm">ME</span>
            </div>
            <div className="flex-1 flex flex-col items-end gap-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                className="w-full bg-transparent border-b border-gray-300 focus:border-[#CD7F32] transition-colors resize-none py-2 text-sm focus:outline-none"
                disabled={sending}
              />
              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setNewMessage('')} className={`px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors ${!newMessage.trim() ? 'opacity-0 pointer-events-none' : ''}`}>
                  Cancel
                </button>
                <button type="submit" disabled={!newMessage.trim() || sending} className="px-6 py-2 text-sm font-bold bg-[#CD7F32] hover:bg-[#a06227] disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors">
                  {sending ? 'Commenting...' : 'Comment'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
