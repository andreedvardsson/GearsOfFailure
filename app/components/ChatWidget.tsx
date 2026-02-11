'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDatabase, ref, push, onValue, query, limitToLast, Database } from 'firebase/database';
import { app } from '@/lib/firebase/config';
import { Send, AlertTriangle } from 'lucide-react';

interface ChatMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: number;
}

export default function ChatWidget() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [db, setDb] = useState<Database | null>(null);

  // Initialize Firebase Realtime Database
  useEffect(() => {
    if (typeof window !== 'undefined' && app) {
      const database = getDatabase(app);
      setDb(database);
    }
  }, []);

  // Listen for messages
  useEffect(() => {
    if (!db) return;

    const messagesRef = ref(db, 'chat/general');
    const messagesQuery = query(messagesRef, limitToLast(100));

    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesList: ChatMessage[] = Object.entries(data).map(([id, msg]: [string, any]) => ({
          id,
          name: msg.name,
          email: msg.email,
          message: msg.message,
          timestamp: msg.timestamp,
        }));
        setMessages(messagesList.sort((a, b) => a.timestamp - b.timestamp));

        // Calculate online users (unique users active in last 5 minutes)
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        const recentEmails = new Set(
          messagesList
            .filter(msg => msg.timestamp > fiveMinutesAgo)
            .map(msg => msg.email)
        );
        setOnlineCount(recentEmails.size);
      }
    });

    return () => unsubscribe();
  }, [db]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !newMessage.trim()) return;

    // Rate limiting: 5 seconds between messages
    const now = Date.now();
    if (now - lastSent < 5000) {
      alert('Please wait a few seconds before sending another message.');
      return;
    }

    try {
      setSending(true);
      const messagesRef = ref(db, 'chat/general');

      await push(messagesRef, {
        name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        email: user.email,
        message: newMessage.trim().substring(0, 200), // Max 200 chars
        timestamp: Date.now(),
      });

      setNewMessage('');
      setLastSent(now);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-green-500/30 rounded-lg overflow-hidden font-mono text-sm">
      {/* Header */}
      <div className="bg-green-900/20 border-b border-green-500/30 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-bold">GENERAL CHAT</span>
          </div>
          {onlineCount > 0 && (
            <span className="text-xs text-green-400/70">
              {onlineCount} online
            </span>
          )}
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-900/20 border-b border-yellow-500/30 px-3 py-2 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-yellow-200 text-xs leading-tight">
          This chat is monitored and logged. Professional conduct required.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 min-h-0">
        {messages.length === 0 ? (
          <div className="text-slate-500 text-xs text-center py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="text-xs leading-relaxed">
              <span className="text-slate-500">[{formatTime(msg.timestamp)}]</span>{' '}
              <span className={msg.email === user.email ? 'text-cyan-400 font-bold' : 'text-green-400'}>
                {msg.name}:
              </span>{' '}
              <span className="text-slate-200">{msg.message}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-green-500/30 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type message (max 200 chars)..."
            maxLength={200}
            disabled={sending}
            className="flex-1 bg-slate-900 border border-green-500/30 rounded px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-green-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-3 py-2 rounded flex items-center gap-1 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-slate-600 mt-1">
          {newMessage.length}/200 • Rate limited: 1 msg per 5 sec
        </div>
      </form>
    </div>
  );
}
