'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { apiCall } from '@/lib/api-client';
import Navigation from '../components/Navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import { FeedbackItem, FeedbackType, FeedbackStatus } from '@/lib/types';
import { Bug, Lightbulb, ThumbsUp, Loader2, Plus, Filter } from 'lucide-react';

export default function FeedbackPage() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<FeedbackType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | 'all'>('all');

  const fetchFeedback = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await apiCall('/api/feedback', {}, user);
      setFeedback(data.feedback || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleVote = async (feedbackId: string) => {
    if (!user) return;

    try {
      await apiCall('/api/feedback', {
        method: 'PATCH',
        body: JSON.stringify({ feedbackId, action: 'vote' }),
      }, user);

      await fetchFeedback();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const filteredFeedback = feedback.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  const getStatusColor = (status: FeedbackStatus) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
      case 'in-progress': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      case 'resolved': return 'bg-green-500/20 border-green-500/30 text-green-300';
      case 'wont-fix': return 'bg-slate-500/20 border-slate-500/30 text-slate-400';
      default: return 'bg-slate-500/20 border-slate-500/30 text-slate-300';
    }
  };

  const hasVoted = (item: FeedbackItem) => {
    return user?.email && item.votes.includes(user.email);
  };

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-white mb-2">Feedback & Requests</h1>
            <p className="text-slate-300 text-lg">Report bugs and suggest features. Vote on what matters most!</p>
          </div>

          {/* Controls */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Submit Feedback
            </button>

            {/* Filters */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-transparent text-white text-sm border-none outline-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="bug">Bugs Only</option>
                <option value="feature">Features Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-transparent text-white text-sm border-none outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="wont-fix">Won't Fix</option>
              </select>
            </div>

            <div className="ml-auto text-slate-400 text-sm">
              {filteredFeedback.length} {filteredFeedback.length === 1 ? 'item' : 'items'}
            </div>
          </div>

          {/* Submission Form */}
          {showForm && (
            <FeedbackForm
              onSuccess={() => {
                setShowForm(false);
                fetchFeedback();
              }}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Feedback List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 text-lg">No feedback yet. Be the first to submit!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedback.map((item) => (
                <div
                  key={item._id?.toString()}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Vote Button */}
                    <button
                      onClick={() => handleVote(item._id!.toString())}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                        hasVoted(item)
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <ThumbsUp className={`w-5 h-5 ${hasVoted(item) ? 'fill-current' : ''}`} />
                      <span className="text-sm font-bold">{item.voteCount}</span>
                    </button>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        {item.type === 'bug' ? (
                          <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-xs font-semibold">
                            <Bug className="w-3 h-3" />
                            BUG
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-300 text-xs font-semibold">
                            <Lightbulb className="w-3 h-3" />
                            FEATURE
                          </div>
                        )}

                        <div className={`px-2 py-1 border rounded text-xs font-semibold uppercase ${getStatusColor(item.status)}`}>
                          {item.status.replace('-', ' ')}
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-slate-300 mb-3 whitespace-pre-wrap">{item.description}</p>

                      {item.adminResponse && (
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mb-3">
                          <div className="text-xs font-semibold text-purple-300 mb-1">Admin Response:</div>
                          <p className="text-sm text-slate-300">{item.adminResponse}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>by {item.submittedBy.name}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString('sv-SE')}</span>
                        {item.pageUrl && (
                          <>
                            <span>•</span>
                            <span className="text-blue-400">{item.pageUrl}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Feedback Submission Form Component
function FeedbackForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const { user } = useAuth();
  const [type, setType] = useState<FeedbackType>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      await apiCall('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          type,
          title,
          description,
          pageUrl: window.location.href,
        }),
      }, user);

      onSuccess();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-white mb-4">Submit Feedback</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="bug"
                checked={type === 'bug'}
                onChange={(e) => setType(e.target.value as FeedbackType)}
                className="w-4 h-4"
              />
              <Bug className="w-4 h-4 text-red-400" />
              <span className="text-white">Bug Report</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="feature"
                checked={type === 'feature'}
                onChange={(e) => setType(e.target.value as FeedbackType)}
                className="w-4 h-4"
              />
              <Lightbulb className="w-4 h-4 text-blue-400" />
              <span className="text-white">Feature Request</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Title (max 200 chars)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
            className="w-full bg-slate-900 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            placeholder="Brief description..."
          />
          <div className="text-xs text-slate-500 mt-1">{title.length}/200</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Description (max 2000 chars)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            required
            rows={6}
            className="w-full bg-slate-900 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 resize-none"
            placeholder={type === 'bug' ? 'What went wrong? Steps to reproduce?' : 'What would you like to see? Why is it useful?'}
          />
          <div className="text-xs text-slate-500 mt-1">{description.length}/2000</div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting || !title || !description}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
