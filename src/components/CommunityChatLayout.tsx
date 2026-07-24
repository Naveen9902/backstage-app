'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Bell, Info, Pin, Hash, MessageSquare, Lock, Settings, LogOut, ChevronLeft, Image as ImageIcon, Menu, X, Megaphone, Smile, MoreVertical } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import EmojiPicker from 'emoji-picker-react';

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

const ALL_CHANNELS = ['announcements', 'general', 'staff-chat', 'networking', 'q-and-a'];

export default function CommunityChatLayout({ eventId, event, currentUser, otherEvents = [], returnHref = "/user/community", initialChannel }: CommunityChatLayoutProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [mobileView, setMobileView] = useState<'channels' | 'chat'>('channels');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeChannel, setActiveChannel] = useState(initialChannel || 'announcements');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const manager = event.manager;
  const attendees = event.fans || [];
  
  let staff: User[] = [];
  if (event.staffingRequests) {
    event.staffingRequests.forEach((req: any) => {
      if (req.applications) {
        req.applications.forEach((app: any) => {
          if (app.status === 'HIRED' && app.workerProfile?.user) {
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
      const otherId = parts[1] === currentUser.id ? parts[2] : parts[1];
      
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
    const ids = [currentUser.id, otherUserId].sort();
    return `dm_${ids[0]}_${ids[1]}`;
  };

  const fetchMessages = async () => {
    try {
      const endpoint = currentUser.role === 'MANAGER' ? `/api/chat/${eventId}` : `/api/user/community/${eventId}/messages`;
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
    
    const channel = supabase.channel(`community_${eventId}_${activeChannel}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'EventChatMessage', filter: `eventId=eq.${eventId}` },
        (payload) => {
          if (payload.new.channel === activeChannel) fetchMessages();
        }
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [eventId, activeChannel]);

  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView();
    }
  }, [messages]);

  useEffect(() => {
    setShouldAutoScroll(true);
  }, [activeChannel]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => { setSelectedImageBase64(event.target?.result as string); };
    reader.readAsDataURL(file);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !selectedImageBase64) return;

    const messageText = text;
    const messageImage = selectedImageBase64;
    setText(''); 
    setSelectedImageBase64(null);
    setShowEmojiPicker(false);

    const optimisticMsg: Message = {
      id: Date.now().toString(),
      text: messageText,
      imageUrl: messageImage,
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
      const endpoint = currentUser.role === 'MANAGER' ? `/api/chat/${eventId}` : `/api/user/community/${eventId}/messages`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText, imageUrl: messageImage, channel: activeChannel })
      });
      if (res.ok) fetchMessages();
    } catch (err) {
      console.error(err);
      fetchMessages();
    }
  };

  const handleChannelSelect = (ch: string) => {
    setActiveChannel(ch);
    setMobileView('chat');
  };

  return (
    <div className="flex h-full w-full bg-white overflow-hidden text-[#242424] relative md:rounded-xl shadow-sm md:border border-gray-200">
      
      {/* ============================================================== */}
      {/* DESKTOP SIDEBARS (Hidden on mobile) */}
      {/* ============================================================== */}
      <div className="hidden md:flex h-full shrink-0">
        
        {/* 1. Servers Sidebar (Far Left) */}
        <div className="w-16 bg-[#2b2b2b] flex flex-col items-center py-4 gap-4 z-20 shrink-0">
          <Link href={returnHref} className="w-12 h-12 rounded-[16px] bg-[#3a3a3a] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#CD7F32] hover:rounded-xl transition-all mb-2 cursor-pointer shadow-sm">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          
          <div className="relative group cursor-pointer">
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-white rounded-r-md"></div>
            <div className="w-12 h-12 rounded-[16px] bg-[#CD7F32] flex items-center justify-center text-white font-bold shadow-lg overflow-hidden border border-white/20">
              {event.coverImageUrl ? (
                <img src={event.coverImageUrl} className="w-full h-full object-cover" alt="Event" />
              ) : (
                <span className="text-xl">{event.title?.charAt(0)}</span>
              )}
            </div>
          </div>

          <div className="w-8 h-px bg-white/10 my-2"></div>
          
          <div 
            onClick={() => setShowSwitcher(!showSwitcher)}
            className={`w-12 h-12 rounded-[24px] flex items-center justify-center transition-all cursor-pointer mt-2 shadow-sm ${showSwitcher ? 'bg-green-500 text-white rounded-[16px]' : 'bg-[#3a3a3a] text-green-500 hover:bg-green-500 hover:text-white hover:rounded-[16px]'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </div>
        </div>

        {/* 2. Channels Sidebar (Inner Left) */}
        <div className="w-64 bg-[#f8f6f0] border-r border-[#e0dcd3] z-10 shrink-0 relative overflow-hidden flex flex-col">
          <div className={`absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out ${showSwitcher ? '-translate-x-full' : 'translate-x-0'}`}>
            <div className="h-16 flex items-center px-4 font-bold text-lg border-b border-[#e0dcd3] shadow-[0_1px_2px_rgba(0,0,0,0.02)] shrink-0">
              <div className="flex flex-col">
                <span className="font-serif leading-tight truncate w-56">{event.title}</span>
                {event.status === 'ONGOING' && (
                   <span className="text-[10px] bg-[#CD7F32] text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider inline-block w-fit mt-1">Live Now</span>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Production Channels</h3>
                <div className="space-y-0.5">
                  {ALL_CHANNELS.filter(ch => !(ch === 'staff-chat' && currentUser.role === 'USER')).map(ch => (
                    <div 
                      key={ch}
                      onClick={() => handleChannelSelect(ch)}
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
                <div className="space-y-1">
                  {manager && manager.id !== currentUser.id && (
                    <div 
                      onClick={() => handleChannelSelect(getDmChannelId(manager.id))}
                      className={`flex items-center gap-3 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                        activeChannel === getDmChannelId(manager.id) ? 'bg-[#e8e4db] text-[#9b581e] font-semibold' : 'text-gray-700 hover:bg-[#e8e4db]/50'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden relative shrink-0">
                        {manager.avatarUrl && <img src={manager.avatarUrl} className="w-full h-full object-cover"/>}
                        <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-[#f8f6f0]"></div>
                      </div>
                      <span className="text-sm truncate">{manager.name}</span>
                    </div>
                  )}
                  {staff.filter(s => s.id !== currentUser.id).map((s) => {
                    const dmId = getDmChannelId(s.id);
                    return (
                      <div 
                        key={s.id}
                        onClick={() => handleChannelSelect(dmId)}
                        className={`flex items-center gap-3 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                          activeChannel === dmId ? 'bg-[#e8e4db] text-[#9b581e] font-semibold' : 'text-gray-700 hover:bg-[#e8e4db]/50'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden relative shrink-0">
                          {s.avatarUrl && <img src={s.avatarUrl} className="w-full h-full object-cover"/>}
                          <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-[#f8f6f0]"></div>
                        </div>
                        <span className="text-sm truncate">{s.name.split(' ')[0]} {s.name.split(' ')[1]?.[0] || ''}.</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="h-16 bg-[#ebe7df] border-t border-[#e0dcd3] p-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 cursor-pointer hover:bg-black/5 p-1 -ml-1 rounded">
                <div className="w-9 h-9 rounded-full bg-gray-400 overflow-hidden relative shrink-0">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} className="w-full h-full object-cover" alt="User" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#CD7F32] text-white font-bold">{currentUser.name.charAt(0)}</div>
                  )}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#ebe7df]"></div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-gray-800 leading-none truncate">{currentUser.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">{currentUser.role === 'MANAGER' ? 'ORGANIZER' : 'STAFF'}</span>
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
      </div>

      {/* ============================================================== */}
      {/* MOBILE CHANNELS LIST (Visible on mobile when mobileView === 'channels') */}
      {/* ============================================================== */}
      <div className={`md:hidden flex-col w-full h-full bg-white ${mobileView === 'channels' ? 'flex' : 'hidden'}`}>
        {/* Mobile Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 bg-white shrink-0">
          <Link href={returnHref} className="p-2 -ml-2 text-gray-400 hover:text-gray-800 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-lg text-gray-900 truncate">Chat</h1>
          </div>
          <button onClick={() => setShowSwitcher(!showSwitcher)} className="p-2 -mr-2 text-gray-400 hover:text-gray-800 rounded-full">
            <MoreVertical className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Community Switcher Overlay */}
        {showSwitcher && (
          <div className="absolute inset-0 bg-black/50 z-50 flex flex-col justify-end" onClick={() => setShowSwitcher(false)}>
            <div className="bg-white rounded-t-3xl p-4 flex flex-col max-h-[70vh] shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold font-serif text-xl">Your Communities</h2>
                <button onClick={() => setShowSwitcher(false)} className="p-2 bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500"/></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {otherEvents.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No other communities joined yet.</p>
                ) : (
                  otherEvents.map(ev => {
                    const href = currentUser.role === 'MANAGER' ? `/manager/events/${ev.id}/chat` : `/user/community/${ev.id}`;
                    return (
                      <Link key={ev.id} href={href} className="flex items-center gap-4 p-3 rounded-2xl border border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-[#CD7F32] overflow-hidden shrink-0">
                          {ev.coverImageUrl ? <img src={ev.coverImageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white font-bold">{ev.title?.charAt(0)}</div>}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-[15px]">{ev.title}</span>
                          <span className="text-xs text-[#CD7F32] font-semibold">Switch to Chat</span>
                        </div>
                      </Link>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pb-6">
          <div className="px-4 py-6">
            <h1 className="font-serif font-bold text-3xl text-gray-900 leading-tight mb-2">{event.title}</h1>
            <p className="text-sm text-gray-500">The official community hub for the event.</p>
          </div>

          <div className="px-2">
            <div className="px-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Channels</div>
            <div className="space-y-1">
              {ALL_CHANNELS.filter(ch => !(ch === 'staff-chat' && currentUser.role === 'USER')).map(ch => (
                <button 
                  key={ch}
                  onClick={() => handleChannelSelect(ch)}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl active:bg-gray-100 transition-colors text-left"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${activeChannel === ch ? 'bg-[#CD7F32]/10 text-[#CD7F32]' : 'bg-gray-100 text-gray-500'}`}>
                    <Hash className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 border-b border-gray-100 pb-3 -mb-3">
                    <h3 className={`font-semibold text-lg truncate ${activeChannel === ch ? 'text-[#CD7F32]' : 'text-gray-900'}`}>{ch}</h3>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="px-2 mt-8">
            <div className="px-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Direct Messages</div>
            <div className="space-y-1">
              {manager && manager.id !== currentUser.id && (
                <button 
                  onClick={() => handleChannelSelect(getDmChannelId(manager.id))}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl active:bg-gray-100 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden relative shrink-0">
                    {manager.avatarUrl && <img src={manager.avatarUrl} className="w-full h-full object-cover"/>}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0 border-b border-gray-100 pb-3 -mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">{manager.name}</h3>
                    <p className="text-sm text-gray-500 truncate">Organizer</p>
                  </div>
                </button>
              )}
              {staff.filter(s => s.id !== currentUser.id).map((s) => (
                <button 
                  key={s.id}
                  onClick={() => handleChannelSelect(getDmChannelId(s.id))}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl active:bg-gray-100 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden relative shrink-0">
                    {s.avatarUrl && <img src={s.avatarUrl} className="w-full h-full object-cover"/>}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0 border-b border-gray-100 pb-3 -mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">{s.name}</h3>
                    <p className="text-sm text-gray-500 truncate">Staff</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MAIN CHAT AREA (Desktop: Always, Mobile: Only when mobileView === 'chat') */}
      {/* ============================================================== */}
      <div className={`flex-1 flex-col min-w-0 bg-[#f4efe5] ${mobileView === 'chat' ? 'flex' : 'hidden md:flex'}`}>
        
        {/* Chat Header */}
        <div className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-[#e0dcd3] shadow-[0_1px_2px_rgba(0,0,0,0.02)] shrink-0 bg-white md:bg-[#f4efe5] z-10">
          <div className="flex items-center gap-3 text-gray-800">
            <button 
              className="md:hidden p-2 -ml-2 text-[#CD7F32] hover:bg-orange-50 rounded-full"
              onClick={() => setMobileView('channels')}
            >
              <div className="flex items-center gap-1">
                <ChevronLeft className="w-7 h-7" />
              </div>
            </button>
            <div className="flex items-center gap-2">
              {!activeChannel.startsWith('dm_') && <Hash className="w-6 h-6 text-gray-300 hidden md:block" />}
              <h2 className="font-bold text-[19px] md:text-lg font-serif">{getChatTitle()}</h2>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[#CD7F32] md:text-gray-500">
            <Search className="w-5 h-5 cursor-pointer hover:text-gray-800" />
            <Info className="w-5 h-5 cursor-pointer hover:text-gray-800 hidden md:block" />
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5" onScroll={handleScroll}>
          <div className="text-center py-4">
             <span className="bg-white/40 text-gray-400 text-xs font-bold px-3 py-1 rounded-full">{new Date(event.date || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
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
                      {msg.imageUrl && (
                        <div className="mt-2 max-w-[200px] md:max-w-sm rounded-xl overflow-hidden border border-black/10">
                          <img src={msg.imageUrl} alt="attachment" className="w-full h-auto" />
                        </div>
                      )}
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
          {showEmojiPicker && (
            <div className="absolute bottom-[100%] left-0 md:right-6 md:left-auto z-50 w-full md:w-auto shadow-2xl rounded-t-xl md:rounded-lg overflow-hidden border border-gray-200">
              <EmojiPicker onEmojiClick={(e) => setText(prev => prev + e.emoji)} theme="light" width="100%" />
            </div>
          )}
          {selectedImageBase64 && (
            <div className="mb-2 bg-white p-2 rounded-xl border border-gray-200 w-max relative shadow-sm">
              <button 
                onClick={() => setSelectedImageBase64(null)}
                className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 shadow-md"
              >
                <X className="w-3 h-3" />
              </button>
              <img src={selectedImageBase64} alt="preview" className="h-20 w-auto rounded-lg object-contain" />
            </div>
          )}
          <form onSubmit={sendMessage} className="bg-gray-100 md:bg-[#242424] rounded-full flex items-center p-1 md:p-2 shadow-inner md:shadow-lg border border-transparent md:border-none relative">
            <button type="button" disabled={activeChannel === 'announcements' && currentUser.role !== 'MANAGER'} className="p-2 text-[#CD7F32] md:text-gray-400 md:hover:text-white transition-colors disabled:opacity-30">
              <div className="w-7 h-7 rounded-full bg-white md:bg-gray-600 flex items-center justify-center shadow-sm md:shadow-none">
                <span className="text-lg font-bold leading-none mb-0.5 text-[#CD7F32] md:text-white">+</span>
              </div>
            </button>
            <input 
              type="text" 
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={activeChannel === 'announcements' && currentUser.role !== 'MANAGER' ? "Only organizers can post in #announcements" : `Message ${getChatTitle()}`} 
              disabled={activeChannel === 'announcements' && currentUser.role !== 'MANAGER'}
              className="flex-1 bg-transparent text-gray-800 md:text-white placeholder-gray-500 md:placeholder-gray-500 border-none outline-none px-2 focus:ring-0 disabled:opacity-50 text-[15px]"
            />
            
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} disabled={activeChannel === 'announcements' && currentUser.role !== 'MANAGER'}/>
            
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={activeChannel === 'announcements' && currentUser.role !== 'MANAGER'} className="p-2 text-[#CD7F32] md:text-gray-400 md:hover:text-white transition-colors disabled:opacity-30">
              <ImageIcon className="w-6 h-6" />
            </button>
            
            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} disabled={activeChannel === 'announcements' && currentUser.role !== 'MANAGER'} className={`p-2 transition-colors disabled:opacity-30 ${showEmojiPicker ? 'text-[#b57339]' : 'text-[#CD7F32] md:text-gray-400 md:hover:text-white'}`}>
              <Smile className="w-6 h-6" />
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-16 right-0 z-50 shadow-2xl">
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
          {event.coverImageUrl ? (
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${event.coverImageUrl})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#CD7F32]/80 to-[#CD7F32] flex items-center justify-center">
              <span className="text-white font-serif text-4xl font-bold opacity-30">{event.title?.charAt(0)}</span>
            </div>
          )}
          
          <div className="absolute -bottom-8 left-4 w-16 h-16 bg-white rounded-2xl p-1 shadow-md border border-gray-100">
            <div className="w-full h-full bg-[#CD7F32] rounded-xl flex items-center justify-center text-white font-bold text-xl overflow-hidden">
               {event.coverImageUrl ? <img src={event.coverImageUrl} className="w-full h-full object-cover"/> : event.title?.charAt(0)}
            </div>
          </div>
        </div>

        <div className="pt-10 px-4 pb-6 border-b border-[#e0dcd3]">
          <h2 className="font-serif font-bold text-xl text-gray-900 mb-2 leading-tight">{event.title}</h2>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">{event.description || "The official community hub for the event."}</p>
          
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

    </div>
  );
}

function UserIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
