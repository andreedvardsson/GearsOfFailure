'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { apiCall } from '@/lib/api-client';
import { LogOut, Users, Flag, LayoutDashboard, Shield, MessageCircle, Network, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<'student' | 'admin' | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) return;
      try {
        const profile = await apiCall('/api/user/profile', {}, user);
        if (profile.exists === false) {
          // Profile doesn't exist yet - create it
          console.log('Creating profile for new user...');
          await fetch('/api/user/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, role: 'student' }),
          });
          setUserRole('student');
        } else {
          setUserRole(profile.role || 'student');
        }
      } catch (error: unknown) {
        console.error('Error fetching user role:', error);
        console.error('Full error:', error);
        setUserRole('student'); // Default to student if error
      }
    };
    fetchRole();
  }, [user]);

  if (!user) return null;

  const navItems = [
    { href: '/', label: 'Teams', icon: Flag, show: true },
    { href: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard, show: true },
    { href: '/course', label: 'Course Materials', icon: BookOpen, show: true },
    { href: '/feedback', label: 'Feedback', icon: MessageCircle, show: true },
    { href: '/architecture', label: 'Architecture', icon: Network, show: true },
    { href: '/students', label: 'Students', icon: Users, show: userRole === 'admin' },
    { href: '/admin', label: 'Admin', icon: Shield, show: userRole === 'admin' },
  ];

  return (
    <nav className="bg-slate-900/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Navigation Links */}
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
              TEAM FLAGS
            </Link>
            <div className="hidden md:flex items-center gap-4">
              {navItems
                .filter((item) => item.show)
                .map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      pathname === href
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                ))}
            </div>
          </div>

          {/* Right: User Info & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm text-slate-300">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
