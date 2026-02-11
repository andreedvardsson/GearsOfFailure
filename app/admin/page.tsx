'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { apiCall } from '@/lib/api-client';
import Navigation from '../components/Navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminAttendance from '../components/AdminAttendance';
import { Calendar, CheckCircle, AlertCircle, Loader2, Users, FileText, UserCheck, Shield } from 'lucide-react';
import Link from 'next/link';

interface SubmissionWithStudent {
  submissionId: string;
  week?: number;
  date: string;
  title: string;
  workDone: string[];
  blockers: string[];
  nextSteps: string[];
  status: 'green' | 'yellow' | 'red';
  submittedAt: Date;
  studentName: string;
  studentEmail: string;
  studentTeam: number | null;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'submissions' | 'attendance'>('submissions');
  const [submissions, setSubmissions] = useState<SubmissionWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ totalStudents: 0, totalSubmissions: 0 });
  const [filter, setFilter] = useState<'all' | 'green' | 'yellow' | 'red'>('all');

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const data = await apiCall('/api/admin/submissions', {}, user);
        setSubmissions(data.submissions || []);
        setStats({
          totalStudents: data.totalStudents || 0,
          totalSubmissions: data.totalSubmissions || 0,
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        if (errorMessage.includes('Forbidden')) {
          setError('You do not have admin access. Please contact the administrator.');
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  const filteredSubmissions =
    filter === 'all' ? submissions : submissions.filter((s) => s.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green':
        return 'bg-green-500/20 border-green-500/30 text-green-300';
      case 'yellow':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      case 'red':
        return 'bg-red-500/20 border-red-500/30 text-red-300';
      default:
        return 'bg-slate-500/20 border-slate-500/30 text-slate-300';
    }
  };

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-300 text-lg">Manage student submissions and attendance</p>

            {/* Quick Access Cards */}
            <div className="mt-6 mb-6">
              <Link
                href="/admin/login-history"
                className="inline-flex items-center gap-3 px-6 py-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 text-blue-300 rounded-lg transition-all group"
              >
                <Shield className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-semibold text-white">Login History</div>
                  <div className="text-sm text-blue-200">View authentication audit trail</div>
                </div>
              </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setActiveTab('submissions')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'submissions'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                <FileText className="w-5 h-5" />
                Submissions
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'attendance'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                <UserCheck className="w-5 h-5" />
                Attendance
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-6 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-200 text-lg">{error}</p>
            </div>
          ) : (
            <>
              {/* Render based on active tab */}
              {activeTab === 'attendance' ? (
                <AdminAttendance />
              ) : (
                <>
                  {/* Stats */}
                  <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-6 h-6 text-blue-400" />
                    <span className="text-sm text-slate-300">Students with Submissions</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{stats.totalStudents}</div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-6 h-6 text-purple-400" />
                    <span className="text-sm text-slate-300">Total Submissions</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{stats.totalSubmissions}</div>
                </div>

                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <span className="text-sm text-green-200">Green Status</span>
                  </div>
                  <div className="text-3xl font-bold text-green-300">
                    {submissions.filter((s) => s.status === 'green').length}
                  </div>
                </div>

                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-6 h-6 text-yellow-400" />
                    <span className="text-sm text-yellow-200">Needs Attention</span>
                  </div>
                  <div className="text-3xl font-bold text-yellow-300">
                    {submissions.filter((s) => s.status === 'yellow' || s.status === 'red').length}
                  </div>
                </div>
              </div>

              {/* Filter */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-300">Filter by status:</span>
                  <div className="flex gap-2">
                    {(['all', 'green', 'yellow', 'red'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          filter === f
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        {f !== 'all' && ` (${submissions.filter((s) => s.status === f).length})`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submissions List */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6">All Submissions</h2>

                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">
                      {filter === 'all'
                        ? 'No submissions yet.'
                        : `No ${filter} submissions found.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSubmissions.map((submission) => (
                      <div
                        key={submission.submissionId}
                        className={`border rounded-lg p-5 ${getStatusColor(submission.status)}`}
                      >
                        {/* Student Info */}
                        <div className="flex items-start justify-between mb-3 pb-3 border-b border-white/10">
                          <div>
                            <h3 className="font-bold text-xl">{submission.studentName}</h3>
                            <div className="flex items-center gap-4 text-sm mt-1 opacity-80">
                              <span>{submission.studentEmail}</span>
                              {submission.studentTeam && (
                                <span className="px-2 py-0.5 bg-white/10 rounded">
                                  Team {submission.studentTeam}
                                </span>
                              )}
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase`}
                          >
                            {submission.status}
                          </span>
                        </div>

                        {/* Submission Details */}
                        <div className="mb-3">
                          <h4 className="font-bold text-lg">{submission.title}</h4>
                          <div className="flex items-center gap-3 text-sm mt-1 opacity-80">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(submission.date).toLocaleDateString('sv-SE')}
                            </span>
                            {submission.week && <span>Week {submission.week}</span>}
                            <span className="opacity-60">
                              Submitted {new Date(submission.submittedAt).toLocaleString('sv-SE')}
                            </span>
                          </div>
                        </div>

                        {/* Work Done */}
                        {submission.workDone && submission.workDone.length > 0 && (
                          <div className="mb-3">
                            <h5 className="font-semibold text-sm mb-1 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Accomplished:
                            </h5>
                            <ul className="list-disc list-inside text-sm space-y-1 opacity-90">
                              {submission.workDone.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Blockers */}
                        {submission.blockers && submission.blockers.length > 0 && (
                          <div className="mb-3">
                            <h5 className="font-semibold text-sm mb-1 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              Blockers:
                            </h5>
                            <ul className="list-disc list-inside text-sm space-y-1 opacity-90">
                              {submission.blockers.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Next Steps */}
                        {submission.nextSteps && submission.nextSteps.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-sm mb-1">Next Steps:</h5>
                            <ul className="list-disc list-inside text-sm space-y-1 opacity-90">
                              {submission.nextSteps.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
