import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { DEFAULT_AVATAR } from '../../data/initialData';
import { 
  Send, 
  MessageSquare, 
  User as UserIcon, 
  Hash, 
  Bot, 
  Loader2,
  Users
} from 'lucide-react';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId?: string;
  text: string;
  timestamp: string;
}

export const ChatSpace: React.FC = () => {
  const { currentUser, token, users } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeReceiver, setActiveReceiver] = useState<User | null>(null); // null means Global Chat
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const fetchMessages = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/chat/messages', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.messages) {
            setMessages(data.messages);
          }
        }
      } catch (err) {
        console.error('Error loading chat messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [token]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeReceiver]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !token) return;

    const payload = {
      text: inputText,
      receiverId: activeReceiver ? activeReceiver.id : undefined
    };

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages(prev => [...prev, data.message]);
          setInputText('');
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Filter messages based on selected room/DM
  const displayedMessages = messages.filter(msg => {
    if (activeReceiver === null) {
      // Global chat messages don't have a receiverId
      return !msg.receiverId;
    } else {
      // Private DM between currentUser and activeReceiver
      return (
        (msg.senderId === currentUser?.id && msg.receiverId === activeReceiver.id) ||
        (msg.senderId === activeReceiver.id && msg.receiverId === currentUser?.id)
      );
    }
  });

  // Filter out current user from contacts
  const chatContacts = users.filter(u => u.id !== currentUser?.id);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex h-[580px]">
      
      {/* Sidebar: Chat Channels & Direct Messages */}
      <div className="w-1/3 border-r border-slate-800 bg-slate-900/80 flex flex-col justify-between">
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">Communications</h3>
          </div>

          {/* Channels Section */}
          <div className="mb-6">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Public Rooms
            </span>
            <button
              onClick={() => setActiveReceiver(null)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 transition-all ${
                activeReceiver === null 
                  ? 'bg-indigo-600 text-white font-semibold' 
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Hash className="w-4 h-4" />
              <span># general-lab-chat</span>
            </button>
          </div>

          {/* Direct Messages Section */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Direct Messages (DMs)
            </span>
            <div className="space-y-1.5">
              {chatContacts.map(contact => {
                const isSelected = activeReceiver?.id === contact.id;
                return (
                  <button
                    key={contact.id}
                    onClick={() => setActiveReceiver(contact)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
                      isSelected 
                        ? 'bg-indigo-600 text-white font-semibold' 
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="relative">
                      <img 
                        src={contact.avatarUrl || DEFAULT_AVATAR} 
                        alt={contact.name} 
                        className="w-6 h-6 rounded-full object-cover border border-slate-700"
                      />
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-slate-900"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate block font-medium">{contact.name}</span>
                      </div>
                      <span className={`text-[9px] uppercase font-mono block ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {contact.role.replace('_', ' ')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current user footer badge */}
        {currentUser && (
          <div className="p-3 bg-slate-950/40 border-t border-slate-800/80 flex items-center gap-2.5">
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.name} 
              className="w-7 h-7 rounded-full object-cover border border-indigo-500/40"
            />
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-200 block truncate leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[9px] font-mono text-indigo-400 block uppercase">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Message Logging & Chat Space */}
      <div className="flex-1 flex flex-col justify-between bg-slate-950/30">
        {/* Chat Room Header */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-indigo-400">
              {activeReceiver === null ? <Users className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">
                {activeReceiver === null ? '# general-lab-chat' : activeReceiver.name}
              </h4>
              <p className="text-[10px] text-slate-400">
                {activeReceiver === null 
                  ? 'Public group conversation for lab coordination' 
                  : `Secure Direct Message · ${activeReceiver.title}`}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Messages Section */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              <span>Retrieving message logs...</span>
            </div>
          ) : displayedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs italic gap-1">
              <MessageSquare className="w-8 h-8 text-slate-700 mb-1" />
              <span>No messages in this chat yet.</span>
              <span className="text-[10px] text-slate-600">Send a message to initiate the thread.</span>
            </div>
          ) : (
            displayedMessages.map((msg) => {
              const isOutgoing = msg.senderId === currentUser?.id;
              return (
                <div key={msg.id} className={`flex items-start gap-2.5 ${isOutgoing ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-[10px] ${
                    isOutgoing ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}>
                    {msg.senderName.charAt(0)}
                  </div>

                  <div className="max-w-[70%] space-y-0.5">
                    <div className={`flex items-center gap-1.5 text-[9px] ${isOutgoing ? 'flex-row-reverse text-right' : ''}`}>
                      <span className="font-bold text-slate-300">{msg.senderName}</span>
                      <span className="text-slate-500 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[8px] uppercase px-1 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700">
                        {msg.senderRole.replace('_', ' ')}
                      </span>
                    </div>

                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isOutgoing 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder={activeReceiver === null ? 'Message #general-lab-chat...' : `Message ${activeReceiver.name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};
