'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { apiCall } from '@/lib/api-client';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { AttendanceRecord } from '@/lib/types';

const WEEKLY_SCHEDULE = [
  { day: 'Mon', type: 'Self-Study', time: '', required: false, description: 'Independent learning day' },
  { day: 'Tue', type: 'Boiler Room', time: '08:00', required: true, description: 'Live Zoom session - Attendance required' },
  { day: 'Wed', type: 'Workshop', time: '09:00', required: true, description: 'Live Zoom session - Attendance required' },
  { day: 'Thu', type: 'Workshop', time: '09:00', required: true, description: 'Live Zoom session - Attendance required' },
  { day: 'Fri', type: 'Self-Study', time: '', required: false, description: 'Independent learning day' },
];

export default function AttendanceWidget() {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, [user]);

  const fetchAttendance = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await apiCall('/api/attendance/checkin', {}, user);
      setTodayAttendance(data.attendance);
      setRecentAttendance(data.recentAttendance || []);
    } catch (err: unknown) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!user) return;

    try {
      setChecking(true);
      setError('');
      setSuccess('');

      const data = await apiCall(
        '/api/attendance/checkin',
        { method: 'POST', body: JSON.stringify({}) },
        user
      );

      setTodayAttendance(data.attendance);
      setSuccess(data.message || 'Checked in successfully!');

      // Refresh recent attendance
      await fetchAttendance();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check in';
      setError(errorMessage);
    } finally {
      setChecking(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'present-late':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'excused':
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

  const getDayStatus = (dayOffset: number) => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + 1 + dayOffset); // Monday = 0
    const dateStr = date.toLocaleDateString('sv-SE');
    return recentAttendance.find(a => a.date === dateStr);
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 animate-pulse">
        <div className="h-32 bg-white/5 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-950/40 via-purple-950/40 to-blue-950/40 backdrop-blur-sm border border-blue-400/30 rounded-lg p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Calendar className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Daily Check-In</h3>
          <p className="text-sm text-slate-400">
            {new Date().toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Check-In Status */}
      {todayAttendance ? (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-green-300">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">
              {todayAttendance.status === 'present-late' ? 'Checked in (Late)' : 'Checked in'}
            </span>
          </div>
          <p className="text-sm text-green-200 mt-1">
            at {new Date(todayAttendance.timestamp).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ) : (
        <div className="mb-4">
          <button
            onClick={handleCheckIn}
            disabled={checking}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-blue-500/50 disabled:to-purple-500/50 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {checking ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Checking in...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Check In for Today</span>
              </>
            )}
          </button>

          {new Date().getHours() >= 10 && (
            <p className="text-xs text-yellow-300 mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Check-in window (08:00-10:00) has passed - will be marked as late
            </p>
          )}
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-sm text-green-200">{success}</p>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Weekly Schedule */}
      <div className="border-t border-white/10 pt-4">
        <h4 className="text-sm font-semibold text-slate-300 mb-3">Weekly Schedule</h4>
        <div className="space-y-2 mb-4">
          {WEEKLY_SCHEDULE.map((day, index) => {
            const status = getDayStatus(index);
            return (
              <div
                key={day.day}
                className={`p-3 rounded-lg border ${
                  day.required
                    ? 'bg-blue-500/10 border-blue-400/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`text-sm font-bold ${day.required ? 'text-blue-300' : 'text-slate-400'}`}>
                        {day.day}
                      </div>
                      {day.time && (
                        <div className="text-xs text-slate-500">{day.time}</div>
                      )}
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${day.required ? 'text-white' : 'text-slate-300'}`}>
                        {day.type}
                      </div>
                      <div className="text-xs text-slate-500">{day.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {status && getStatusIcon(status.status)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-slate-400 bg-white/5 rounded p-2">
          💡 Check-in window: 08:00-10:00 on scheduled days (Tue/Wed/Thu)
        </div>
      </div>
    </div>
  );
}
