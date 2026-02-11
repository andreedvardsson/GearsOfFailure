'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { apiCall } from '@/lib/api-client';
import { Plus, Trash2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface SubmissionFormProps {
  onSubmitSuccess: () => void;
}

export default function SubmissionForm({ onSubmitSuccess }: SubmissionFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [week, setWeek] = useState('');
  const [workDone, setWorkDone] = useState(['']);
  const [blockers, setBlockers] = useState(['']);
  const [nextSteps, setNextSteps] = useState(['']);
  const [status, setStatus] = useState<'green' | 'yellow' | 'red'>('green');

  const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, '']);
  };

  const removeItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setter((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await apiCall(
        '/api/submissions',
        {
          method: 'POST',
          body: JSON.stringify({
            title,
            week: week ? parseInt(week) : undefined,
            workDone: workDone.filter((w) => w.trim()),
            blockers: blockers.filter((b) => b.trim()),
            nextSteps: nextSteps.filter((n) => n.trim()),
            status,
          }),
        },
        user
      );

      setSuccess(true);
      // Reset form
      setTitle('');
      setWeek('');
      setWorkDone(['']);
      setBlockers(['']);
      setNextSteps(['']);
      setStatus('green');

      // Call parent callback
      onSubmitSuccess();

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Submit Individual Progress</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-sm text-green-200">Progress submitted successfully!</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">
            Title / Workshop Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Workshop 1 - Docker Basics"
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Week (optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">Week (Optional)</label>
          <input
            type="number"
            value={week}
            onChange={(e) => setWeek(e.target.value)}
            placeholder="e.g., 1"
            min="1"
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">
            Status <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-3">
            {(['green', 'yellow', 'red'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  status === s
                    ? s === 'green'
                      ? 'bg-green-500/30 text-green-300 border-2 border-green-400'
                      : s === 'yellow'
                      ? 'bg-yellow-500/30 text-yellow-300 border-2 border-yellow-400'
                      : 'bg-red-500/30 text-red-300 border-2 border-red-400'
                    : 'bg-white/5 text-slate-300 border border-white/20'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Work Done */}
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">
            What did you accomplish? <span className="text-red-400">*</span>
          </label>
          {workDone.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                required={index === 0}
                value={item}
                onChange={(e) => updateItem(setWorkDone, index, e.target.value)}
                placeholder="Describe what you accomplished"
                className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {workDone.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(setWorkDone, index)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(setWorkDone)}
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add another item
          </button>
        </div>

        {/* Blockers */}
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">Blockers / Challenges (Optional)</label>
          {blockers.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(setBlockers, index, e.target.value)}
                placeholder="What's blocking your progress?"
                className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {blockers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(setBlockers, index)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(setBlockers)}
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add blocker
          </button>
        </div>

        {/* Next Steps */}
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">Next Steps (Optional)</label>
          {nextSteps.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(setNextSteps, index, e.target.value)}
                placeholder="What will you work on next?"
                className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {nextSteps.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(setNextSteps, index)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(setNextSteps)}
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add next step
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            'Submit Progress'
          )}
        </button>
      </div>
    </form>
  );
}
