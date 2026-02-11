'use client';

import { useState } from 'react';
import Navigation from '../components/Navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import AsciiDiagram from '../components/AsciiDiagram';
import { Code, Database, Lock, Layers, Network, GitBranch } from 'lucide-react';

export default function ArchitecturePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'auth' | 'data' | 'tech'>('overview');

  const systemArchitecture = `
╔═══════════════════════════════════════════════════════════════════════╗
║                          CLIENT LAYER                                 ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║    ┌─────────────┐      ┌──────────────────┐      ┌──────────────┐  ║
║    │ Web Browser │ ───> │ Next.js 16 App   │ ───> │ Firebase     │  ║
║    │             │      │ (React 19)       │      │ Auth Client  │  ║
║    └─────────────┘      └──────────────────┘      └──────────────┘  ║
║                                 │                         │          ║
╚═════════════════════════════════╪═════════════════════════╪══════════╝
                                  │                         │
                                  ▼                         ▼
╔═════════════════════════════════════════════════════════════════════════╗
║                        APPLICATION LAYER                                ║
╠═════════════════════════════════════════════════════════════════════════╣
║                                                                         ║
║     ┌────────────────┐      ┌─────────────────┐      ┌──────────────┐ ║
║     │ Next.js API    │ <──> │ Firebase Admin  │ <──> │ Auth         │ ║
║     │ Routes         │      │ SDK             │      │ Middleware   │ ║
║     └────────────────┘      └─────────────────┘      └──────────────┘ ║
║            │                                                            ║
╚════════════╪════════════════════════════════════════════════════════════╝
             │
             ▼
╔═════════════════════════════════════════════════════════════════════════╗
║                           DATA LAYER                                    ║
╠═════════════════════════════════════════════════════════════════════════╣
║                                                                         ║
║      ┌──────────────────────┐              ┌──────────────────────┐    ║
║      │ MongoDB Atlas        │              │ Firebase Realtime DB │    ║
║      │ ─────────────────    │              │ ──────────────────── │    ║
║      │ • Students           │              │ • Live Chat          │    ║
║      │ • Submissions        │              │ • Real-time Sync     │    ║
║      │ • Attendance         │              │                      │    ║
║      │ • Feedback           │              │                      │    ║
║      └──────────────────────┘              └──────────────────────┘    ║
║                                                                         ║
╚═════════════════════════════════════════════════════════════════════════╝

               ┌──────────────────────────────────────┐
               │     HOSTED ON VERCEL (Edge)          │
               │     Firebase Authentication          │
               └──────────────────────────────────────┘
  `;

  const authFlow = `
┌─────────┐    ┌─────────┐    ┌──────────────┐    ┌─────────┐    ┌─────────┐
│ Student │    │ Browser │    │ Firebase Auth│    │   API   │    │ MongoDB │
└────┬────┘    └────┬────┘    └──────┬───────┘    └────┬────┘    └────┬────┘
     │              │                │                 │              │
     │ 1. Enter     │                │                 │              │
     │ @chasacademy │                │                 │              │
     │ .se email    │                │                 │              │
     │─────────────>│                │                 │              │
     │              │                │                 │              │
     │              │ 2. Sign in/up  │                 │              │
     │              │───────────────>│                 │              │
     │              │                │                 │              │
     │              │                │ 3. Verify       │              │
     │              │                │    domain       │              │
     │              │                │────────┐        │              │
     │              │                │        │        │              │
     │              │                │<───────┘        │              │
     │              │                │                 │              │
     │              │                │ [IF NEW USER]   │              │
     │              │                │ 4. Send email   │              │
     │ 5. Click     │                │    verification │              │
     │    link      │                │────────┐        │              │
     │──────────┐   │                │        │        │              │
     │          │   │                │<───────┘        │              │
     │<─────────┘   │                │                 │              │
     │              │                │                 │              │
     │              │ 6. Auth token  │                 │              │
     │              │<───────────────│                 │              │
     │              │                │                 │              │
     │              │ 7. Request     │                 │              │
     │              │    with token  │                 │              │
     │              │────────────────┼────────────────>│              │
     │              │                │                 │              │
     │              │                │ 8. Verify token │              │
     │              │                │<────────────────│              │
     │              │                │                 │              │
     │              │                │ 9. Token valid  │              │
     │              │                │─────────────────>│              │
     │              │                │                 │              │
     │              │                │                 │ 10. Fetch    │
     │              │                │                 │     profile  │
     │              │                │                 │─────────────>│
     │              │                │                 │              │
     │              │                │                 │ 11. Return   │
     │              │                │                 │     role     │
     │              │                │                 │<─────────────│
     │              │                │                 │              │
     │              │ 12. Authorized │                 │              │
     │              │     response   │                 │              │
     │              │<───────────────┼─────────────────│              │
     │              │                │                 │              │
     │ 13. Show     │                │                 │              │
     │  dashboard   │                │                 │              │
     │<─────────────│                │                 │              │
     │              │                │                 │              │
     ▼              ▼                ▼                 ▼              ▼
  `;

  const dataModel = `
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STUDENT (MongoDB)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ _id: ObjectId                                                               │
│ name: string                                                                │
│ email: string                  ────┐                                        │
│ role: "student" | "admin"          │                                        │
│ team: number (1-8)                 │                                        │
│ individualSubmissions: []          │   Has Many                             │
│ attendance: []                     │   ────────────────┐                    │
│ createdAt: Date                    │                   │                    │
└────────────────────────────────────┼───────────────────┼────────────────────┘
                                     │                   │
                                     │                   │
              ┌──────────────────────┘                   └────────────────┐
              │                                                           │
              ▼                                                           ▼
┌──────────────────────────────────┐              ┌──────────────────────────────────┐
│   SUBMISSION (Embedded)          │              │   ATTENDANCE (Embedded)          │
├──────────────────────────────────┤              ├──────────────────────────────────┤
│ submissionId: string             │              │ date: string                     │
│ title: string                    │              │ status: "present"/"absent"       │
│ workDone: string[]               │              │ timestamp: Date                  │
│ blockers: string[]               │              │ markedBy: string                 │
│ status: string                   │              └──────────────────────────────────┘
│ submittedAt: Date                │
└──────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         FEEDBACK (MongoDB)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ _id: ObjectId                                                               │
│ type: "bug" | "feature"                                                     │
│ title: string                                                               │
│ description: string                                                         │
│ status: "new" | "in-progress" | "resolved" | "wont-fix"                     │
│ submittedBy: { name, email }                                                │
│ votes: string[]         ◄── Array of user emails who voted                 │
│ voteCount: number                                                           │
│ pageUrl: string                                                             │
│ adminResponse: string (optional)                                            │
│ createdAt: Date                                                             │
│ updatedAt: Date                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                    CHAT_MESSAGE (Firebase Realtime DB)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ id: string (auto-generated)                                                 │
│ name: string                                                                │
│ email: string                                                               │
│ message: string                                                             │
│ timestamp: number                                                           │
└─────────────────────────────────────────────────────────────────────────────┘

RELATIONSHIPS:
━━━━━━━━━━━━━
• STUDENT has many SUBMISSIONS (embedded array)
• STUDENT has many ATTENDANCE records (embedded array)
• STUDENT belongs to one TEAM (1-8)
• STUDENT can vote on many FEEDBACK items
• FEEDBACK receives votes from many STUDENTS
• CHAT_MESSAGE references STUDENT by email
  `;

  const techStack = `
                    ╔════════════════════════════════════════╗
                    ║    TEAM FLAGS DEVSECOPS PLATFORM       ║
                    ╚════════════════════════════════════════╝
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        ▼                            ▼                            ▼
┌───────────────┐           ┌───────────────┐          ┌────────────────┐
│   FRONTEND    │           │    BACKEND    │          │   DATABASES    │
├───────────────┤           ├───────────────┤          ├────────────────┤
│ • Next.js 16  │           │ • Next.js API │          │ • MongoDB      │
│ • React 19    │◄─────────►│   Routes      │◄────────►│   Atlas        │
│ • TypeScript  │           │ • Firebase    │          │   ┌─────────┐  │
│ • Tailwind    │           │   Admin SDK   │          │   │Students │  │
│   CSS         │           │ • MongoDB     │          │   │Feedback │  │
│ • Lucide      │           │   Driver      │          │   └─────────┘  │
│   Icons       │           │               │          │                │
└───────────────┘           └───────────────┘          │ • Firebase     │
                                                       │   Realtime DB  │
                                                       │   ┌─────────┐  │
        ┌──────────────────────────────────────────┐ │   │  Chat   │  │
        │                                          │ │   └─────────┘  │
        ▼                                          ▼ └────────────────┘
┌──────────────────┐                      ┌────────────────┐
│  AUTHENTICATION  │                      │    HOSTING     │
├──────────────────┤                      ├────────────────┤
│ • Firebase Auth  │                      │ • Vercel       │
│ • Email          │                      │ • Edge         │
│   Verification   │                      │   Functions    │
│ • Role-Based     │                      │ • CI/CD        │
│   Access Control │                      │   Pipeline     │
│   - Student      │                      └────────────────┘
│   - Admin        │
└──────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                            CORE FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✓ Daily Attendance Check-in      ✓ Live Chat (Real-time)
  ✓ Work Submission Tracking        ✓ Public Feedback & Voting
  ✓ Team Leaderboard Analytics      ✓ CSV Attendance Exports
  ✓ Admin Dashboard                 ✓ Role-Based Permissions
  `;

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-white mb-2">System Architecture</h1>
            <p className="text-slate-300 text-lg">
              Technical documentation and architecture diagrams for the Team Flags platform
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'System Overview', icon: Layers },
              { id: 'auth', label: 'Authentication', icon: Lock },
              { id: 'data', label: 'Data Model', icon: Database },
              { id: 'tech', label: 'Tech Stack', icon: Code },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-8">
            {activeTab === 'overview' && (
              <>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Network className="w-6 h-6 text-purple-400" />
                    <h2 className="text-2xl font-bold text-white">System Architecture</h2>
                  </div>
                  <p className="text-slate-300 mb-6">
                    The Team Flags platform is built on a modern serverless architecture using Next.js 16,
                    MongoDB Atlas, and Firebase services. The system is designed for scalability, real-time
                    collaboration, and secure authentication.
                  </p>
                  <AsciiDiagram content={systemArchitecture} id="system-arch" />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-purple-300 mb-2">Client Layer</h3>
                    <p className="text-slate-300 text-sm">
                      Modern React application built with Next.js 16 and TypeScript.
                      Features real-time chat, attendance tracking, and submission forms.
                    </p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-blue-300 mb-2">Application Layer</h3>
                    <p className="text-slate-300 text-sm">
                      Next.js API routes handle authentication, data validation, and business logic.
                      Firebase Admin SDK manages auth tokens.
                    </p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-green-300 mb-2">Data Layer</h3>
                    <p className="text-slate-300 text-sm">
                      MongoDB stores student profiles, submissions, and attendance.
                      Firebase Realtime DB powers instant chat messaging.
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'auth' && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-6 h-6 text-red-400" />
                  <h2 className="text-2xl font-bold text-white">Authentication Flow</h2>
                </div>
                <p className="text-slate-300 mb-6">
                  Secure authentication using Firebase Auth with email verification.
                  Only @chasacademy.se emails are allowed. Role-based access control (RBAC)
                  distinguishes between students and admins.
                </p>
                <AsciiDiagram content={authFlow} id="auth-flow" />
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h3 className="font-bold text-blue-300 mb-2">Security Features</h3>
                    <ul className="text-slate-300 text-sm space-y-1 list-disc list-inside">
                      <li>Email domain restriction (@chasacademy.se)</li>
                      <li>Email verification required (production)</li>
                      <li>Firebase JWT token authentication</li>
                      <li>Role-based access control (student/admin)</li>
                      <li>Protected routes with middleware</li>
                    </ul>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <h3 className="font-bold text-purple-300 mb-2">User Roles</h3>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li><strong>Student:</strong> Submit work, check in, chat, vote on feedback</li>
                      <li><strong>Admin:</strong> All student features + manage attendance, view submissions, export reports</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-6 h-6 text-green-400" />
                  <h2 className="text-2xl font-bold text-white">Data Model</h2>
                </div>
                <p className="text-slate-300 mb-6">
                  Entity-relationship diagram showing how data is structured and related.
                  MongoDB stores structured data with flexible schemas, while Firebase
                  Realtime DB handles real-time chat messages.
                </p>
                <AsciiDiagram content={dataModel} id="data-model" />
                <div className="mt-6 bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <h3 className="font-bold text-white mb-3">Collections</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-green-400">MongoDB Collections:</strong>
                      <ul className="text-slate-300 mt-2 space-y-1 list-disc list-inside">
                        <li>chas_2026_students - Student profiles and data</li>
                        <li>feedback - Bug reports and feature requests</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-orange-400">Firebase Realtime DB:</strong>
                      <ul className="text-slate-300 mt-2 space-y-1 list-disc list-inside">
                        <li>chat/general - Live chat messages</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tech' && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Code className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">Technology Stack</h2>
                </div>
                <p className="text-slate-300 mb-6">
                  Complete overview of the technologies, frameworks, and services powering
                  the Team Flags platform. Built with modern, production-ready tools.
                </p>
                <AsciiDiagram content={techStack} id="tech-stack" />
                <div className="mt-6 grid md:grid-cols-3 gap-4">
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <GitBranch className="w-5 h-5 text-cyan-400" />
                      <h3 className="font-bold text-cyan-300">Core Framework</h3>
                    </div>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li><strong>Next.js 16:</strong> React framework with Turbopack</li>
                      <li><strong>React 19:</strong> UI library with latest features</li>
                      <li><strong>TypeScript:</strong> Type-safe development</li>
                      <li><strong>Tailwind CSS:</strong> Utility-first styling</li>
                    </ul>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Database className="w-5 h-5 text-green-400" />
                      <h3 className="font-bold text-green-300">Data & Storage</h3>
                    </div>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li><strong>MongoDB Atlas:</strong> Primary database</li>
                      <li><strong>Firebase Realtime DB:</strong> Live chat</li>
                      <li><strong>Firebase Auth:</strong> User authentication</li>
                    </ul>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="w-5 h-5 text-purple-400" />
                      <h3 className="font-bold text-purple-300">Features</h3>
                    </div>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>Daily attendance check-in</li>
                      <li>Work submission tracking</li>
                      <li>Real-time chat with audit logs</li>
                      <li>Public feedback with voting</li>
                      <li>Team leaderboard & analytics</li>
                      <li>CSV attendance exports</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
