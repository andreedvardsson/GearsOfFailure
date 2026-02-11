'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { MessageSquare, X } from 'lucide-react';
import ChatWidget from './ChatWidget';
import { getDatabase, ref, onValue, query, limitToLast, Database } from 'firebase/database';
import { app } from '@/lib/firebase/config';

export default function FloatingChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadTime, setLastReadTime] = useState(0);
  const [db, setDb] = useState<Database | null>(null);

  // Initialize Firebase Realtime Database
  useEffect(() => {
    if (typeof window !== 'undefined' && app) {
      const database = getDatabase(app);
      setDb(database);
    }
  }, []);

  // Track unread messages
  useEffect(() => {
    if (!db || !user) return;

    const messagesRef = ref(db, 'chat/general');
    const messagesQuery = query(messagesRef, limitToLast(100));

    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setUnreadCount(0);
        return;
      }

      // Count messages newer than last read time
      const messages = Object.values(data) as Array<{ timestamp: number; email: string }>;
      const unread = messages.filter(
        (msg) => msg.timestamp > lastReadTime && msg.email !== user.email
      ).length;

      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [db, user, lastReadTime]);

  // Mark as read when opening chat
  const handleOpen = () => {
    setIsOpen(true);
    setLastReadTime(Date.now());
    setUnreadCount(0);
  };

  const handleClose = () => {
    setIsOpen(false);
    setLastReadTime(Date.now());
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 group"
          aria-label="Open chat"
        >
          <MessageSquare className="w-6 h-6" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-900 text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Open Chat
          </div>
        </button>
      )}

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-slate-950 border-2 border-green-500 rounded-lg shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-green-900/20 border-b border-green-500/30 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-bold font-mono">CHAT</span>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Widget */}
          <div className="flex-1 min-h-0">
            <ChatWidget />
          </div>
        </div>
      )}
    </>
  );
}
