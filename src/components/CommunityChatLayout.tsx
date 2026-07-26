'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Bell, Info, Pin, Hash, MessageSquare, Lock, Settings, LogOut, ChevronLeft, Image as ImageIcon, Menu, X, Megaphone, Smile, MoreVertical, FileText, Video, Music, Download, AlertCircle, Paperclip } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

type User = {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
};

type Message = {
  id: string;
  text: string;
  imageUrl?: string | null;
  createdAt: string;
  senderId: string;
  sender: User;
};

type CommunityChatLayoutProps = {
  eventId: string;
  event: any; 
  currentUser: User;
  otherEvents?: any[];
  returnHref?: string;
  initialChannel?: string;
};

const ALL_CHANNELS = ['announcements', 'general', 'networking', 'q-and-a'];

export default function CommunityChatLayout({ eventId, event, currentUser, otherEvents = [], returnHref = "/user/community", initialChannel }: CommunityChatLayoutProps) {
  const safeUser = currentUser || { id: 'guest', name: 'Member', role: 'USER', avatarUrl: null };
  const safeEvent = event || {};
  const manager = safeEvent?.manager || null;
  const attendees = safeEvent?.fans || [];

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [mobileView, setMobileView] = useState<'channels' | 'chat'>('chat');
  const [showSplash, setShowSplash] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);
  
  const [selectedFile, setSelectedFile] = useState<{
    dataUrl: string;
    fileName: string;
    fileType: 'image' | 'video' | 'audio' | 'file';
    fileSizeMb: string;
  } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeChannel, setActiveChannel] = useState(initialChannel || (safeUser.role === 'MANAGER' ? 'announcements' : 'general'));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleChannelSelect = (channel: string) => {
    setActiveChannel(channel);
    setMobileView('chat');
    setShowSwitcher(false);
  };
  
  let staff: User[] = [];
  if (safeEvent.staffingRequests && Array.isArray(safeEvent.staffingRequests)) {
    safeEvent.staffingRequests.forEach((req: any) => {
      if (req && req.applications && Array.isArray(req.applications)) {
        req.applications.forEach((app: any) => {
          if ((app.status === 'HIRED' || app.status === 'ACCEPTED') && app.workerProfile?.user) {
            if (!staff.find(s => s.id === app.workerProfile.user.id)) {
              staff.push(app.workerProfile.user);
            }
          }
        });
      }
    });
  }

  const getChatTitle = () => {
    if (activeChannel.startsWith('dm_')) {
      const parts = activeChannel.split('_');
      const otherId = parts[1] === safeUser.id ? parts[2] : parts[1];
      
      if (manager && otherId === manager.id) return `@ ${manager.name}`;
      const foundStaff = staff.find(s => s.id === otherId);
      if (foundStaff) return `@ ${foundStaff.name}`;
      const foundFan = attendees.find((a: any) => a.id === otherId);
      if (foundFan) return `@ ${foundFan.name}`;
      
      return "@ Unknown User";
    }
    return `# ${activeChannel}`;
  };

  const getDmChannelId = (otherUserId: string) => {
    const ids = [safeUser.id, otherUserId].sort();
    return `dm_${ids[0]}_${ids[1]}`;
  };

  const fetchMessages = async () => {
    try {
      const endpoint = safeUser.role === 'MANAGER' ? `/api/chat/${eventId}` : `/api/user/community/${eventId}/messages`;
      const res = await fetch(`${endpoint}?channel=${encodeURIComponent(activeChannel)}`);
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
    setLoading(true);
    fetchMessages();
    
    let channel: any = null;
    try {
      if (supabase && typeof supabase.channel === 'function') {
        channel = supabase.channel(`community_${eventId}_${activeChannel}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'EventChatMessage', filter: `eventId=eq.${eventId}` },
            (payload) => {
              if (payload?.new?.channel === activeChannel) fetchMessages();
            }
          ).subscribe();
      }
    } catch (e) {}

    return () => { 
      try {
        if (channel && supabase && typeof supabase.removeChannel === 'function') {
          supabase.removeChannel(channel);
        }
      } catch (e) {}
    };
  }, [eventId, activeChannel]);

  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll]);

  useEffect(() => {
    setShouldAutoScroll(true);
  }, [activeChannel]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const maxBytes = 10 * 1024 * 1024; // 10MB limit
    if (file.size > maxBytes) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setFileError(`File size exceeds 10MB limit (${sizeMb}MB selected). Please choose a smaller file.`);
      e.target.value = '';
      return;
    }

    const mime = file.type.toLowerCase();
    let fileType: 'image' | 'video' | 'audio' | 'file' = 'file';
    if (mime.startsWith('image/')) fileType = 'image';
    else if (mime.startsWith('video/')) fileType = 'video';
    else if (mime.startsWith('audio/')) fileType = 'audio';

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFile({
        dataUrl: event.target?.result as string,
        fileName: file.name,
        fileType,
        fileSizeMb: (file.size / (1024 * 1024)).toFixed(2)
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !selectedFile) return;

    const messageText = text;
    const messagePayload = selectedFile ? JSON.stringify(selectedFile) : null;
    setText(''); 
    setSelectedFile(null);
    setFileError(null);
    setShowEmojiPicker(false);

    const optimisticMsg: Message = {
      id: Date.now().toString(),
      text: messageText,
      imageUrl: messagePayload,
      createdAt: new Date().toISOString(),
      senderId: safeUser.id,
      sender: {
        id: safeUser.id,
        name: safeUser.name || 'You',
        avatarUrl: safeUser.avatarUrl || null,
        role: safeUser.role,
      }
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const endpoint = safeUser.role === 'MANAGER' ? `/api/chat/${eventId}` : `/api/user/community/${eventId}/messages`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText, imageUrl: messagePayload, channel: activeChannel })
      });
      if (res.ok) fetchMessages();
    } catch (err) {
      console.error(err);
      fetchMessages();
    }
  };

  const renderMediaAttachment = (mediaData?: string | null) => {
    if (!mediaData) return null;
    try {
      if (mediaData.startsWith('{')) {
        const parsed = JSON.parse(mediaData);
        if (parsed.fileType === 'image') {
          return (
            <div className="mt-2 max-w-[240px] md:max-w-md rounded-xl overflow-hidden border border-black/10 shadow-sm">
              <img src={parsed.dataUrl} alt={parsed.fileName} className="w-full h-auto max-h-80 object-contain" />
            </div>
          );
        }
        if (parsed.fileType === 'video') {
          return (
            <div className="mt-2 max-w-[260px] md:max-w-md rounded-xl overflow-hidden border border-black/10 shadow-sm bg-black">
              <video src={parsed.dataUrl} controls className="w-full h-auto max-h-80" />
            </div>
          );
        }
        if (parsed.fileType === 'audio') {
          return (
            <div className="mt-2 p-2 bg-gray-50 rounded-xl border border-gray-200 max-w-xs">
              <audio src={parsed.dataUrl} controls className="w-full h-10" />
              <p className="text-[10px] text-gray-500 mt-1 font-mono px-1 truncate">{parsed.fileName}</p>
            </div>
          );
        }
        return (
          <a 
            href={parsed.dataUrl} 
            download={parsed.fileName} 
            className="mt-2 flex items-center gap-3 p-3 bg-white/80 hover:bg-white rounded-xl border border-gray-200 shadow-sm max-w-xs transition-all group/file"
          >
            <div className="w-10 h-10 rounded-lg bg-[#CD7F32]/20 text-[#CD7F32] flex items-center justify-center font-bold text-lg shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-xs text-gray-800 truncate group-hover/file:text-[#CD7F32]">{parsed.fileName}</p>
              <p className="text-[10px] text-gray-400 font-mono">{parsed.fileSizeMb} MB</p>
            </div>
            <Download className="w-4 h-4 text-gray-400 group-hover/file:text-[#CD7F32] shrink-0" />
          </a>
        );
      }
    } catch (e) {
      // Fallback for plain URL images
    }

    return (
      <div className="mt-2 max-w-[240px] md:max-w-sm rounded-xl overflow-hidden border border-black/10">
        <img src={mediaData} alt="attachment" className="w-full h-auto" />
      </div>
    );
  };

  return (
    <div className="flex h-full w-full bg-white overflow-hidden text-[#242424] relative md:rounded-xl shadow-sm md:border border-gray-200">
      
      {/* ============================================================== */}
      {/* ANIMATED SPLASH SCREEN OVERLAY */}
      {/* ============================================================== */}
      {showSplash && (
        <motion.div 
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 bg-[#121215] flex flex-col items-center justify-center p-6 text-white text-center select-none"
        >
          {/* Ambient Glow Orbs */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#CD7F32]/25 rounded-full blur-[90px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-56 h-56 bg-amber-500/15 rounded-full blur-[80px] pointer-events-none" />

          {/* Center Card Content */}
          <div className="relative z-10 flex flex-col items-center max-w-sm w-full space-y-6">
            {/* Animated Event Avatar */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-3xl p-1 bg-gradient-to-tr from-[#CD7F32] via-amber-500 to-amber-200 shadow-2xl shadow-[#CD7F32]/40 relative">
                <div className="w-full h-full bg-[#1a1a20] rounded-[22px] overflow-hidden flex items-center justify-center border border-white/20">
                  {safeEvent.coverImageUrl ? (
                    <img src={safeEvent.coverImageUrl} className="w-full h-full object-cover" alt={safeEvent.title} />
                  ) : (
                    <span className="text-3xl font-black font-serif text-[#CD7F32]">
                      {safeEvent.title?.charAt(0) || "B"}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute -inset-2 rounded-[32px] border border-[#CD7F32]/40 animate-ping pointer-events-none" />
            </motion.div>

            {/* Event Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="space-y-2 px-4"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-[#CD7F32]/20 border border-[#CD7F32]/40 text-[#CD7F32] text-[11px] font-black tracking-widest uppercase shadow-sm">
                COMMUNITY HUB
              </span>
              <h2 className="text-2xl font-extrabold text-white font-serif drop-shadow-md leading-tight line-clamp-2">
                {safeEvent.title || "Community Chat"}
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                Entering community chat &amp; connecting to live members...
              </p>
            </motion.div>

            {/* Animated Loading Bar */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden relative border border-white/10"
            >
              <div className="h-full bg-gradient-to-r from-[#CD7F32] to-amber-400 rounded-full animate-pulse w-full origin-left duration-1000" />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* ============================================================== */}
      {/* 1. Servers Sidebar (Far Left - Visible on Mobile & Desktop) */}
      {/* ============================================================== */}
      <div className="w-14 md:w-16 bg-[#2b2b2b] flex flex-col items-center py-4 gap-4 z-20 shrink-0 h-full">
        <Link href={returnHref} className="w-10 h-10 md:w-12 md:h-12 rounded-[16px] bg-[#3a3a3a] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#CD7F32] hover:rounded-xl transition-all mb-2 cursor-pointer shadow-sm">
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </Link>
        
        <div className="relative group cursor-pointer" onClick={() => setMobileView(mobileView === 'channels' ? 'chat' : 'channels')}>
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-white rounded-r-md"></div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-[16px] bg-[#CD7F32] flex items-center justify-center text-white font-bold shadow-lg overflow-hidden border border-white/20">
            {event.coverImageUrl ? (
              <img src={event.coverImageUrl} className="w-full h-full object-cover" alt="Event" />
            ) : (
              <span className="text-lg md:text-xl">{event.title?.charAt(0)}</span>
            )}
          </div>
        </div>

        <div className="w-8 h-px bg-white/10 my-2"></div>
        
        <div 
          onClick={() => setShowSwitcher(!showSwitcher)}
          className={`w-10 h-10 md:w-12 md:h-12 rounded-[24px] flex items-center justify-center transition-all cursor-pointer mt-2 shadow-sm ${showSwitcher ? 'bg-green-500 text-white rounded-[16px]' : 'bg-[#3a3a3a] text-green-500 hover:bg-green-500 hover:text-white hover:rounded-[16px]'}`}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. Channels Sidebar (Inner Left - Responsive on Mobile & Desktop) */}
      {/* ============================================================== */}
      <div className={`w-56 md:w-64 bg-[#f8f6f0] border-r border-[#e0dcd3] z-10 shrink-0 relative overflow-hidden flex-col h-full ${mobileView === 'channels' ? 'flex' : 'hidden md:flex'}`}>
        <div className={`absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out ${showSwitcher ? '-translate-x-full' : 'translate-x-0'}`}>
          <div className="h-16 flex items-center px-4 font-bold text-lg border-b border-[#e0dcd3] shadow-[0_1px_2px_rgba(0,0,0,0.02)] shrink-0">
            <div className="flex flex-col">
              <span className="font-serif leading-tight truncate w-48 md:w-56">{event.title}</span>
              {event.status === 'ONGOING' && (
                 <span className="text-[10px] bg-[#CD7F32] text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider inline-block w-fit mt-1">Live Now</span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Production Channels</h3>
              <div className="space-y-0.5">
                {ALL_CHANNELS.filter(ch => !(ch === 'staff-chat' && safeUser.role === 'USER')).map(ch => (
                  <div 
                    key={ch}
                    onClick={() => { handleChannelSelect(ch); setMobileView('chat'); }}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer group transition-colors ${
                      activeChannel === ch ? 'bg-[#e8e4db] text-[#9b581e] font-semibold' : 'text-gray-600 hover:bg-[#e8e4db]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 opacity-70" />
                      <span>{ch}</span>
                    </div>
                    {activeChannel === ch && <Pin className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100" />}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Direct Messages</h3>
              <div className="space-y-0.5">
                {manager && manager.id !== safeUser.id && (
                  <div 
                    onClick={() => { handleChannelSelect(getDmChannelId(manager.id)); setMobileView('chat'); }}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer group transition-colors ${
                      activeChannel === getDmChannelId(manager.id) ? 'bg-[#e8e4db] text-[#9b581e] font-semibold' : 'text-gray-600 hover:bg-[#e8e4db]/50'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-gray-300 overflow-hidden relative shrink-0">
                      {manager.avatarUrl && <img src={manager.avatarUrl} className="w-full h-full object-cover"/>}
                      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="truncate">{manager.name}</span>
                  </div>
                )}
                {staff.filter(s => s.id !== safeUser.id).map((s) => (
                  <div 
                    key={s.id}
                    onClick={() => { handleChannelSelect(getDmChannelId(s.id)); setMobileView('chat'); }}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer group transition-colors ${
                      activeChannel === getDmChannelId(s.id) ? 'bg-[#e8e4db] text-[#9b581e] font-semibold' : 'text-gray-600 hover:bg-[#e8e4db]/50'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-gray-300 overflow-hidden relative shrink-0">
                      {s.avatarUrl && <img src={s.avatarUrl} className="w-full h-full object-cover"/>}
                      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="truncate">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-16 bg-[#ebe7df] border-t border-[#e0dcd3] p-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 cursor-pointer hover:bg-black/5 p-1 -ml-1 rounded">
              <div className="w-9 h-9 rounded-full bg-gray-400 overflow-hidden relative shrink-0">
                {safeUser.avatarUrl ? (
                  <img src={safeUser.avatarUrl} className="w-full h-full object-cover" alt="User" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#CD7F32] text-white font-bold">{(safeUser.name || 'Member').charAt(0)}</div>
                )}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#ebe7df]"></div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-gray-800 leading-none truncate">{(safeUser.name || 'Member').split(' ')[0]}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">{safeUser.role === 'MANAGER' ? 'ORGANIZER' : 'STAFF'}</span>
              </div>
            </div>
            <div className="flex gap-1 text-gray-500 shrink-0">
              <Settings className="w-4 h-4 cursor-pointer hover:text-gray-800" />
            </div>
          </div>
        </div>

        <div className={`absolute inset-0 flex flex-col bg-[#1e1e1e] border-r border-[#2b2b2b] text-white transition-transform duration-300 ease-in-out ${showSwitcher ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-16 flex items-center px-4 border-b border-[#2b2b2b] shrink-0 bg-[#181818] shadow-sm">
              <button onClick={() => setShowSwitcher(false)} className="mr-3 text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-[#2b2b2b] transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="font-serif font-bold text-lg text-white truncate">Your Communities</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {otherEvents.length === 0 ? (
                <div className="text-center p-8 text-gray-500 flex flex-col items-center justify-center h-full">
                  <Hash className="w-8 h-8 mb-4 text-gray-600" />
                  <p className="text-sm">No other communities joined yet.</p>
                </div>
              ) : (
                otherEvents.map(ev => {
                  const href = currentUser.role === 'MANAGER' ? `/manager/events/${ev.id}/chat` : `/user/community/${ev.id}`;
                  return (
                    <Link key={ev.id} href={href} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#2b2b2b] transition-all border border-transparent hover:border-[#3a3a3a] group cursor-pointer shadow-sm hover:shadow-md">
                      <div className="w-11 h-11 rounded-[12px] bg-[#CD7F32] overflow-hidden shrink-0 shadow-inner border border-white/10 relative">
                        {ev.coverImageUrl ? (
                          <img src={ev.coverImageUrl} className="w-full h-full object-cover" alt={ev.title} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-[#CD7F32] to-[#8b5521]">{ev.title?.charAt(0)}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="font-bold text-[15px] text-gray-100 truncate leading-tight mb-0.5 group-hover:text-white transition-colors">{ev.title}</h3>
                        <p className="text-[11px] text-[#e0a66d] font-semibold uppercase tracking-wider group-hover:text-[#ffc58a] transition-colors">Join Chat</p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
            
            <div className="p-4 bg-[#181818] border-t border-[#2b2b2b] shrink-0 text-center">
              <Link href={returnHref} className="block w-full py-2.5 bg-[#2b2b2b] border border-[#3a3a3a] text-gray-300 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#CD7F32] hover:border-[#CD7F32] hover:text-white transition-all shadow-sm">
                Discover Events
              </Link>
            </div>
          </div>
        </div>



      {/* ============================================================== */}
      {/* MAIN CHAT AREA (Desktop: Always, Mobile: Only when mobileView === 'chat') */}
      {/* ============================================================== */}
      <div className={`flex-1 flex-col min-w-0 bg-[#f4efe5] ${mobileView === 'chat' ? 'flex' : 'hidden md:flex'}`}>
        
        {/* Chat Header */}
        <div className="h-16 flex items-center justify-between px-3 md:px-6 border-b border-[#e0dcd3] shadow-[0_1px_2px_rgba(0,0,0,0.02)] shrink-0 bg-white md:bg-[#f4efe5] z-10 gap-2">
          <div className="flex items-center gap-2 text-gray-800 min-w-0 shrink-0">
            <button 
              className="md:hidden p-1.5 -ml-1 text-[#CD7F32] hover:bg-orange-50 rounded-full"
              onClick={() => setMobileView(mobileView === 'chat' ? 'channels' : 'chat')}
              title="Toggle Channels"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-1.5 min-w-0">
              {!activeChannel.startsWith('dm_') && <Hash className="w-5 h-5 text-gray-400 shrink-0" />}
              <h2 className="font-bold text-[16px] md:text-lg font-serif truncate">{getChatTitle()}</h2>
            </div>
          </div>

          {/* Quick Channel Pills for Instant 1-Tap Switching */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-[200px] md:max-w-none no-scrollbar">
            {ALL_CHANNELS.filter(ch => !(ch === 'staff-chat' && safeUser.role === 'USER')).map(ch => (
              <button
                key={ch}
                onClick={() => handleChannelSelect(ch)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap border shrink-0 ${
                  activeChannel === ch 
                    ? 'bg-[#CD7F32] text-white border-[#CD7F32] shadow-sm' 
                    : 'bg-black/5 hover:bg-black/10 text-gray-700 border-transparent'
                }`}
              >
                #{ch}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[#CD7F32] md:text-gray-500 shrink-0">
            {showSearchInput ? (
              <div className="flex items-center bg-white px-3 py-1 rounded-full border border-gray-300 shadow-sm">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="bg-transparent text-xs text-gray-800 outline-none w-28 md:w-40"
                  autoFocus
                />
                <button onClick={() => { setSearchQuery(''); setShowSearchInput(false); }} className="text-gray-400 hover:text-gray-600 ml-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowSearchInput(true)} className="p-1.5 hover:bg-black/5 rounded-full transition-colors">
                <Search className="w-5 h-5 cursor-pointer hover:text-gray-800" />
              </button>
            )}
            <button onClick={() => setShowInfoModal(true)} className="p-1.5 hover:bg-black/5 rounded-full transition-colors" title="Event Info">
              <Info className="w-5 h-5 cursor-pointer hover:text-gray-800" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5" onScroll={handleScroll}>
          <div className="text-center py-4">
             <span className="bg-white/40 text-gray-400 text-xs font-bold px-3 py-1 rounded-full">{new Date(safeEvent.date || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>

          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-6 h-6 border-2 border-[#CD7F32]/30 border-t-[#CD7F32] rounded-full animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
              <div className="w-16 h-16 bg-[#e8e4db] rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-gray-300" />
              </div>
              <p>Welcome to the beginning of the {getChatTitle()} chat.</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const prevMsg = messages[index - 1];
              const showHeader = !prevMsg || prevMsg.senderId !== msg.senderId || 
                (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 5 * 60000);

              // Native Mobile specific: align own messages to right on mobile
              const isMe = msg.senderId === currentUser.id;

              return (
                <div key={msg.id} className={`group flex gap-3 md:gap-4 ${showHeader ? 'mt-6' : 'mt-1'} ${isMe ? 'flex-row-reverse md:flex-row' : ''}`}>
                  {showHeader ? (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-300 shrink-0 overflow-hidden">
                      {msg.sender.avatarUrl ? (
                        <img src={msg.sender.avatarUrl} className="w-full h-full object-cover" alt={msg.sender.name} />
                      ) : (
                        <div className="w-full h-full bg-[#CD7F32] flex items-center justify-center text-white font-bold text-sm">
                          {msg.sender.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-8 md:w-10 shrink-0 flex justify-center opacity-0 md:group-hover:opacity-100">
                      <span className="text-[10px] text-gray-400 font-medium leading-6 hidden md:block">{new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                    </div>
                  )}

                  <div className={`flex-1 min-w-0 flex flex-col ${isMe ? 'items-end md:items-start' : 'items-start'}`}>
                    {showHeader && (
                      <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse md:flex-row' : ''}`}>
                        <span className="font-bold text-gray-900">{msg.sender.name}</span>
                        {msg.sender.role === 'MANAGER' && (
                          <span className="bg-[#b57339] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Organizer</span>
                        )}
                        <span className="text-xs text-gray-400 font-medium">{new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                      </div>
                    )}
                    
                    <div className={`
                      text-[15px] whitespace-pre-wrap leading-relaxed px-4 py-2 
                      ${activeChannel === 'announcements' 
                        ? 'bg-[#fffcf5] border border-[#f3d7b4] text-[#8a5b28] p-3 rounded-2xl rounded-tl-sm font-medium relative overflow-hidden' 
                        : isMe 
                          ? 'bg-[#CD7F32] text-white rounded-2xl rounded-tr-sm md:bg-transparent md:text-gray-800 md:px-0 md:py-0 md:rounded-none' 
                          : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm shadow-sm md:bg-transparent md:border-none md:shadow-none md:px-0 md:py-0 md:rounded-none'
                      }
                    `}>
                      {activeChannel === 'announcements' && (
                        <Megaphone className="absolute top-2 right-2 w-12 h-12 text-[#CD7F32] opacity-5 -rotate-12" />
                      )}
                      {msg.text}
                      {renderMediaAttachment(msg.imageUrl)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 md:p-6 bg-white md:bg-[#f4efe5] relative border-t border-gray-100 md:border-none">
          {fileError && (
            <div className="mb-2 bg-red-50 text-red-600 p-2.5 rounded-xl border border-red-200 text-xs font-semibold flex items-center justify-between shadow-sm animate-shake">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fileError}</span>
              </div>
              <button onClick={() => setFileError(null)} className="p-0.5 hover:bg-red-100 rounded-full">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {selectedFile && (
            <div className="mb-3 bg-white p-3 rounded-2xl border border-gray-200 w-max max-w-sm relative shadow-md flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setSelectedFile(null)}
                className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 shadow-md hover:bg-black transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {selectedFile.fileType === 'image' && (
                <img src={selectedFile.dataUrl} alt="preview" className="h-16 w-16 rounded-xl object-cover border border-gray-100" />
              )}
              {selectedFile.fileType === 'video' && (
                <div className="h-16 w-20 bg-black rounded-xl overflow-hidden flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
              )}
              {selectedFile.fileType === 'audio' && (
                <div className="h-16 w-16 bg-[#CD7F32]/10 text-[#CD7F32] rounded-xl flex items-center justify-center font-bold">
                  <Music className="w-6 h-6" />
                </div>
              )}
              {selectedFile.fileType === 'file' && (
                <div className="h-16 w-16 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center font-bold">
                  <FileText className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-gray-900 truncate max-w-[180px]">{selectedFile.fileName}</p>
                <p className="text-[10px] text-gray-400 font-mono">{selectedFile.fileSizeMb} MB (Max 10MB)</p>
              </div>
            </div>
          )}

          <form onSubmit={sendMessage} className="bg-gray-100 md:bg-[#242424] rounded-full flex items-center p-1 md:p-2 shadow-inner md:shadow-lg border border-transparent md:border-none relative">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={activeChannel === 'announcements' && safeUser.role !== 'MANAGER'} 
              className="p-1.5 text-[#CD7F32] md:text-gray-400 md:hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
              title="Upload file (Images, Videos, Audio, GIFs, Docs max 10MB)"
            >
              <div className="w-7 h-7 rounded-full bg-white md:bg-gray-600 flex items-center justify-center shadow-sm md:shadow-none hover:scale-105 transition-transform">
                <span className="text-lg font-bold leading-none mb-0.5 text-[#CD7F32] md:text-white">+</span>
              </div>
            </button>

            <input 
              type="text" 
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={activeChannel === 'announcements' && safeUser.role !== 'MANAGER' ? "Only organizers can post in #announcements" : `Message ${getChatTitle()}`} 
              disabled={activeChannel === 'announcements' && safeUser.role !== 'MANAGER'}
              className="flex-1 bg-transparent text-gray-800 md:text-white placeholder-gray-500 md:placeholder-gray-500 border-none outline-none px-2 focus:ring-0 disabled:opacity-50 text-[15px]"
            />
            
            <input 
              type="file" 
              accept="image/*,video/*,audio/*,.gif,.pdf,.doc,.docx,.txt,.csv,.xlsx,.zip" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              disabled={activeChannel === 'announcements' && safeUser.role !== 'MANAGER'}
            />
            
            <button 
              type="button" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
              disabled={activeChannel === 'announcements' && safeUser.role !== 'MANAGER'} 
              className={`p-1.5 transition-colors disabled:opacity-30 cursor-pointer shrink-0 ${showEmojiPicker ? 'text-[#b57339]' : 'text-[#CD7F32] md:text-gray-400 md:hover:text-white'}`}
              title="Add Emoji"
            >
              <Smile className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-14 right-2 sm:right-4 z-50 shadow-2xl max-w-[90vw] sm:max-w-xs">
                <EmojiPicker 
                  onEmojiClick={(emojiData) => {
                    setText(prev => prev + emojiData.emoji);
                    setShowEmojiPicker(false);
                  }} 
                />
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ============================================================== */}
      {/* DESKTOP INFO SIDEBAR (Hidden on mobile) */}
      {/* ============================================================== */}
      <div className="hidden lg:flex w-72 bg-[#fdfdfc] border-l border-[#e0dcd3] flex-col z-10 shrink-0 overflow-y-auto">
        {/* Event Hero Area */}
        <div className="relative h-40 bg-[#e8e4db] shrink-0 border-b border-[#e0dcd3]">
          {safeEvent.coverImageUrl ? (
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${safeEvent.coverImageUrl})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#CD7F32]/80 to-[#CD7F32] flex items-center justify-center">
              <span className="text-white font-serif text-4xl font-bold opacity-30">{safeEvent.title?.charAt(0)}</span>
            </div>
          )}
          
          <div className="absolute -bottom-8 left-4 w-16 h-16 bg-white rounded-2xl p-1 shadow-md border border-gray-100">
            <div className="w-full h-full bg-[#CD7F32] rounded-xl flex items-center justify-center text-white font-bold text-xl overflow-hidden">
               {safeEvent.coverImageUrl ? <img src={safeEvent.coverImageUrl} className="w-full h-full object-cover"/> : safeEvent.title?.charAt(0)}
            </div>
          </div>
        </div>

        <div className="pt-10 px-4 pb-6 border-b border-[#e0dcd3]">
          <h2 className="font-serif font-bold text-xl text-gray-900 mb-2 leading-tight">{safeEvent.title}</h2>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">{safeEvent.description || "The official community hub for the event."}</p>
          
          <div className="bg-[#f3ede4] rounded-lg p-3 border border-[#e8dccb]">
            <div className="flex gap-2 items-start text-[#9b581e]">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Post-Event Access</h4>
                <p className="text-[10px] leading-tight text-gray-600">This community stays open after the event for archival and networking purposes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Member List */}
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Organizers — 1</h3>
            <div className="space-y-2">
              {manager && (
                <div 
                  onClick={() => { if (manager.id !== currentUser.id) handleChannelSelect(getDmChannelId(manager.id)); }}
                  className={`flex items-center gap-3 group ${manager.id !== currentUser.id ? 'cursor-pointer' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative border border-gray-100">
                    {manager.avatarUrl && <img src={manager.avatarUrl} className="w-full h-full object-cover"/>}
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className={`text-sm font-semibold text-[#b57339] ${manager.id !== currentUser.id ? 'group-hover:underline' : ''}`}>{manager.name}</span>
                </div>
              )}
            </div>
          </div>

          {staff.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Staff — {staff.length}</h3>
              <div className="space-y-2">
                {staff.map(s => (
                  <div 
                    key={s.id} 
                    onClick={() => { if (s.id !== currentUser.id) handleChannelSelect(getDmChannelId(s.id)); }}
                    className={`flex items-center gap-3 group ${s.id !== currentUser.id ? 'cursor-pointer' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative border border-gray-100">
                       {s.avatarUrl && <img src={s.avatarUrl} className="w-full h-full object-cover"/>}
                       <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <span className={`text-sm font-semibold text-gray-700 ${s.id !== currentUser.id ? 'group-hover:underline' : ''}`}>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Attendees — {attendees.length}</h3>
            <div className="space-y-2">
              {attendees.map((fan: any) => (
                <div 
                  key={fan.id}
                  onClick={() => { if (fan.id !== currentUser.id) handleChannelSelect(getDmChannelId(fan.id)); }}
                  className={`flex items-center gap-3 group ${fan.id !== currentUser.id ? 'cursor-pointer' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 relative border border-gray-100">
                     {fan.avatarUrl ? <img src={fan.avatarUrl} className="w-full h-full object-cover rounded-full"/> : <UserIcon className="w-4 h-4"/>}
                  </div>
                  <span className={`text-sm font-medium text-gray-600 ${fan.id !== currentUser.id ? 'group-hover:underline' : ''}`}>{fan.name || "Member"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Info Modal for Mobile & Desktop */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end animate-fadeIn" onClick={() => setShowInfoModal(false)}>
          <div className="w-full max-w-md bg-[#242424] text-white h-full p-6 overflow-y-auto shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <h3 className="font-serif font-bold text-xl flex items-center gap-2">
                <Info className="w-5 h-5 text-[#CD7F32]" />
                Event Details
              </h3>
              <button onClick={() => setShowInfoModal(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative h-48 rounded-2xl overflow-hidden mb-6 border border-white/10 shadow-lg shrink-0">
              {safeEvent.coverImageUrl ? (
                <img src={safeEvent.coverImageUrl} className="w-full h-full object-cover" alt={safeEvent.title} />
              ) : (
                <div className="w-full h-full bg-[#CD7F32] flex items-center justify-center font-bold text-3xl">
                  {safeEvent.title?.charAt(0)}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <h2 className="font-serif font-bold text-xl text-white leading-snug">{safeEvent.title}</h2>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              <div>
                <h4 className="text-xs font-bold text-[#CD7F32] uppercase tracking-wider mb-2">Description</h4>
                <p className="text-sm text-gray-300 leading-relaxed font-light">{safeEvent.description || "Official community chat for event attendees and organizers."}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#333333] p-4 rounded-xl border border-white/5">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Date</span>
                  <span className="text-xs font-bold text-white">{new Date(safeEvent.date || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="bg-[#333333] p-4 rounded-xl border border-white/5">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Location</span>
                  <span className="text-xs font-bold text-white truncate block">{safeEvent.location || "Main Event Area"}</span>
                </div>
              </div>

              {manager && (
                <div className="bg-[#333333] p-4 rounded-xl border border-white/5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#CD7F32] flex items-center justify-center font-bold text-white shrink-0">
                    {manager.avatarUrl ? <img src={manager.avatarUrl} className="w-full h-full rounded-full object-cover" /> : manager.name?.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{manager.name}</span>
                    <span className="text-[10px] text-[#CD7F32] uppercase font-bold tracking-wider">Event Organizer</span>
                  </div>
                </div>
              )}

              {attendees.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#CD7F32] uppercase tracking-wider mb-3">Community Members ({attendees.length})</h4>
                  <div className="flex -space-x-2 overflow-hidden py-1">
                    {attendees.slice(0, 10).map((a: any, i: number) => (
                      <div key={a.id || i} className="inline-block h-8 w-8 rounded-full ring-2 ring-[#242424] bg-gray-600 text-white flex items-center justify-center font-bold text-xs">
                        {a.avatarUrl ? <img src={a.avatarUrl} className="w-full h-full rounded-full object-cover" /> : (a.name?.charAt(0) || 'M')}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowInfoModal(false)}
              className="mt-6 w-full py-3 bg-[#CD7F32] text-white font-bold rounded-xl text-sm shadow-lg hover:bg-[#b56e29] transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function UserIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
