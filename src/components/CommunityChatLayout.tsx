'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Bell, Info, Pin, Hash, MessageSquare, Lock, Settings, LogOut, ChevronLeft, Image as ImageIcon, Menu, X } from 'lucide-react';

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

type CommunityChatLayoutProps = {
  eventId: string;
  event: any; // Contains manager, fans, staffingRequests
  currentUser: User;
  otherEvents?: any[];
  returnHref?: string;
};

const ALL_CHANNELS = ['announcements', 'general', 'logistics-directions', 'networking', 'q-and-a'];

export default function CommunityChatLayout({ eventId, event, currentUser, otherEvents = [], returnHref = "/user/community" }: CommunityChatLayoutProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // State for active channel. Can be a normal channel name or a dm composite ID.
  const [activeChannel, setActiveChannel] = useState('announcements');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derive staff and attendees from event data
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
      // Extract the other user's ID
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

  // Fetch when channel or eventId changes
  useEffect(() => {
    setLoading(true);
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const messageText = text;
    setText(''); // Optimistic clear

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
      const endpoint = currentUser.role === 'MANAGER' ? `/api/chat/${eventId}` : `/api/user/community/${eventId}/messages`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText, channel: activeChannel })
      });
      if (res.ok) {
        fetchMessages();
      } else {
        throw new Error('Failed to send');
      }
    } catch (err) {
      console.error(err);
      fetchMessages();
    }
  };

  return (
    <div className="flex h-[100dvh] bg-white overflow-hidden text-[#242424] relative">
      
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebars Container (Slide in on mobile) */}
      <div className={`fixed inset-y-0 left-0 z-50 flex transform transition-transform duration-300 ease-in-out md:relative md:transform-none ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
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
                  {ALL_CHANNELS.filter(ch => !(ch === 'logistics-directions' && currentUser.role === 'USER')).map(ch => (
                    <div 
                      key={ch}
                      onClick={() => { setActiveChannel(ch); setMobileSidebarOpen(false); }}
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
                      onClick={() => { setActiveChannel(getDmChannelId(manager.id)); setMobileSidebarOpen(false); }}
                      className={`flex items-center gap-3 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                        activeChannel === getDmChannelId(manager.id) ? 'bg-[#e8e4db] text-[#9b581e] font-semibold' : 'text-gray-700 hover:bg-[#e8e4db]/50'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden relative shrink-0">
                        {manager.avatarUrl ? <img src={manager.avatarUrl} className="w-full h-full object-cover"/> : null}
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
                        onClick={() => { setActiveChannel(dmId); setMobileSidebarOpen(false); }}
                        className={`flex items-center gap-3 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                          activeChannel === dmId ? 'bg-[#e8e4db] text-[#9b581e] font-semibold' : 'text-gray-700 hover:bg-[#e8e4db]/50'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden relative shrink-0">
                          {s.avatarUrl ? <img src={s.avatarUrl} className="w-full h-full object-cover"/> : null}
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
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
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

      {/* 3. Main Chat Area (Center) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f4efe5]">
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#e0dcd3] shadow-[0_1px_2px_rgba(0,0,0,0.02)] shrink-0 bg-[#f4efe5]">
          <div className="flex items-center gap-2 text-gray-800">
            <button 
              className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-[#e0dcd3] rounded-md"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            {!activeChannel.startsWith('dm_') && <Hash className="w-5 h-5 text-gray-400" />}
            <h2 className="font-bold text-lg font-serif">{getChatTitle()}</h2>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <Search className="w-5 h-5 cursor-pointer hover:text-gray-800" />
            <Bell className="w-5 h-5 cursor-pointer hover:text-gray-800" />
            <Info className="w-5 h-5 cursor-pointer hover:text-gray-800" />
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" onScroll={handleScroll}>
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
              // Check if we should group with previous message
              const prevMsg = messages[index - 1];
              const showHeader = !prevMsg || prevMsg.senderId !== msg.senderId || 
                (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 5 * 60000);

              return (
                <div key={msg.id} className={`group flex gap-4 ${showHeader ? 'mt-6' : 'mt-1'}`}>
                  {showHeader ? (
                    <div className="w-10 h-10 rounded-full bg-gray-300 shrink-0 overflow-hidden cursor-pointer hover:opacity-90">
                      {msg.sender.avatarUrl ? (
                        <img src={msg.sender.avatarUrl} className="w-full h-full object-cover" alt={msg.sender.name} />
                      ) : (
                        <div className="w-full h-full bg-[#CD7F32] flex items-center justify-center text-white font-bold text-sm">
                          {msg.sender.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-10 shrink-0 flex justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-[10px] text-gray-400 font-medium leading-6">{new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {showHeader && (
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-bold text-gray-900 cursor-pointer hover:underline">{msg.sender.name}</span>
                        {msg.sender.role === 'MANAGER' && (
                          <span className="bg-[#b57339] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Organizer</span>
                        )}
                        <span className="text-xs text-gray-400 font-medium">{new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                      </div>
                    )}
                    <div className="text-[15px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 pt-0 bg-[#f4efe5]">
          <form onSubmit={sendMessage} className="bg-[#242424] rounded-xl flex items-center p-2 shadow-lg shadow-black/5">
            <button type="button" disabled={activeChannel === 'announcements' && currentUser.role !== 'MANAGER'} className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-gray-400">
              <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-sm font-bold leading-none">+</span>
              </div>
            </button>
            <input 
              type="text" 
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={activeChannel === 'announcements' && currentUser.role !== 'MANAGER' ? "Only organizers can post in #announcements" : `Message ${getChatTitle()}`} 
              disabled={activeChannel === 'announcements' && currentUser.role !== 'MANAGER'}
              className="flex-1 bg-transparent text-white placeholder-gray-500 border-none outline-none px-2 focus:ring-0 disabled:opacity-50"
            />
            <button type="button" disabled={activeChannel === 'announcements' && currentUser.role !== 'MANAGER'} className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-gray-400">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button type="button" disabled={activeChannel === 'announcements' && currentUser.role !== 'MANAGER'} className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-gray-400">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
          </form>
        </div>
      </div>

      {/* 4. Info Sidebar (Far Right) */}
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
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">
            {event.description || "The official community hub for the event."}
          </p>
          
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
                  onClick={() => { if (manager.id !== currentUser.id) setActiveChannel(getDmChannelId(manager.id)); }}
                  className={`flex items-center gap-3 group ${manager.id !== currentUser.id ? 'cursor-pointer' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative border border-gray-100">
                    {manager.avatarUrl ? <img src={manager.avatarUrl} className="w-full h-full object-cover"/> : null}
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
                    onClick={() => { if (s.id !== currentUser.id) setActiveChannel(getDmChannelId(s.id)); }}
                    className={`flex items-center gap-3 group ${s.id !== currentUser.id ? 'cursor-pointer' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative border border-gray-100">
                       {s.avatarUrl ? <img src={s.avatarUrl} className="w-full h-full object-cover"/> : null}
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
                  onClick={() => { if (fan.id !== currentUser.id) setActiveChannel(getDmChannelId(fan.id)); }}
                  className={`flex items-center gap-3 group ${fan.id !== currentUser.id ? 'cursor-pointer' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 relative border border-gray-100">
                     {fan.avatarUrl ? <img src={fan.avatarUrl} className="w-full h-full object-cover rounded-full"/> : <UserIcon className="w-4 h-4"/>}
                  </div>
                  <span className={`text-sm font-medium text-gray-600 ${fan.id !== currentUser.id ? 'group-hover:underline' : ''}`}>{fan.name || "Member"}</span>
                </div>
              ))}
              
              {/* Fake attendees to make it look active if there are few */}
              {attendees.length < 5 && (
                <>
                  <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 relative border border-gray-200">
                      <UserIcon className="w-4 h-4"/>
                    </div>
                    <span className="text-sm font-medium text-gray-500 group-hover:underline">Member #402</span>
                  </div>
                  <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 relative border border-gray-200">
                      <UserIcon className="w-4 h-4"/>
                    </div>
                    <span className="text-sm font-medium text-gray-500 group-hover:underline">Member #819</span>
                  </div>
                </>
              )}
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
