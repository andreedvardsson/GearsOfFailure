'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { apiCall } from '@/lib/api-client';
import Navigation from '../components/Navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import SubmissionForm from '../components/SubmissionForm';
import AttendanceWidget from '../components/AttendanceWidget';
import ChatWidget from '../components/ChatWidget';
import { IndividualSubmission } from '@/lib/types';
import { Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<IndividualSubmission[]>([]);
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSubmissions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await apiCall('/api/submissions', {}, user);
      setSubmissions(data.submissions || []);
      setStudentName(data.studentName || user.email);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch submissions';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-white mb-2">My Dashboard</h1>
            <p className="text-slate-300 text-lg">Welcome back, {studentName}!</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Attendance & Submission Form */}
            <div className="lg:col-span-1 space-y-6">
              {/* Attendance Widget */}
              <AttendanceWidget />

              {/* Submission Form */}
              <SubmissionForm onSubmitSuccess={fetchSubmissions} />
            </div>

            {/* Middle Column - Submissions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Submissions History */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">My Submissions</h2>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-200">{error}</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">No submissions yet. Submit your first progress report!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <div
                        key={submission.submissionId}
                        className={`border rounded-lg p-4 ${getStatusColor(submission.status)}`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg">{submission.title}</h3>
                            <div className="flex items-center gap-3 text-sm mt-1 opacity-80">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(submission.date).toLocaleDateString('sv-SE')}
                              </span>
                              {submission.week && <span>Week {submission.week}</span>}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase`}>
                            {submission.status}
                          </span>
                        </div>

                        {/* Work Done */}
                        {submission.workDone && submission.workDone.length > 0 && (
                          <div className="mb-3">
                            <h4 className="font-semibold text-sm mb-1 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Accomplished:
                            </h4>
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
                            <h4 className="font-semibold text-sm mb-1 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              Blockers:
                            </h4>
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
                            <h4 className="font-semibold text-sm mb-1">Next Steps:</h4>
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
            </div>

            {/* Right Column - Chat Widget */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 h-[calc(100vh-8rem)]">
                <ChatWidget />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
