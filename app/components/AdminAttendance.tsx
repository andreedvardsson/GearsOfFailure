'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { apiCall } from '@/lib/api-client';
import { Calendar, CheckCircle, Clock, AlertCircle, XCircle, Loader2, Download } from 'lucide-react';
import { AttendanceRecord, AttendanceStatus } from '@/lib/types';

interface StudentAttendance {
  _id?: string;
  name: string;
  email: string;
  team: number | null;
  attendance?: AttendanceRecord[];
}

export default function AdminAttendance() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [weekDates, setWeekDates] = useState<string[]>([]);
  const [today, setToday] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, [user]);

  const fetchAttendance = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await apiCall('/api/attendance/admin', {}, user);
      setStudents(data.students || []);
      setWeekDates(data.weekDates || []);
      setToday(data.today || '');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch attendance';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();

      // Fetch the CSV file
      const response = await fetch('/api/attendance/export', {
        headers: {
          'x-user-email': user.email || '',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export attendance');
      }

      // Get the blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export';
      alert(errorMessage);
    }
  };

  const getAttendanceForDate = (student: StudentAttendance, date: string): AttendanceRecord | null => {
    return student.attendance?.find(a => a.date === date) || null;
  };

  const getStatusIcon = (status: AttendanceStatus | null) => {
    if (!status) return <div className="w-6 h-6 rounded-full bg-slate-700/50 border border-slate-600"></div>;

    switch (status) {
      case 'present':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'present-late':
        return <Clock className="w-6 h-6 text-yellow-400" />;
      case 'excused':
        return <AlertCircle className="w-6 h-6 text-blue-400" />;
      case 'absent':
        return <XCircle className="w-6 h-6 text-red-400" />;
      default:
        return <div className="w-6 h-6 rounded-full bg-slate-700/50"></div>;
    }
  };

  const handleMarkAttendance = async (studentEmail: string, date: string, currentStatus: AttendanceStatus | null) => {
    // Cycle through statuses: null -> present -> excused -> absent -> null
    const statusCycle: (AttendanceStatus | null)[] = [null, 'present', 'excused', 'absent'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

    if (nextStatus === null) {
      // TODO: Add delete functionality
      return;
    }

    try {
      await apiCall(
        '/api/attendance/admin',
        {
          method: 'POST',
          body: JSON.stringify({
            studentEmail,
            date,
            status: nextStatus,
          }),
        },
        user
      );

      // Refresh data
      await fetchAttendance();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark attendance';
      alert(errorMessage);
    }
  };

  const getTodayStats = () => {
    const todayRecords = students.map(s => getAttendanceForDate(s, today));
    const present = todayRecords.filter(r => r?.status === 'present').length;
    const late = todayRecords.filter(r => r?.status === 'present-late').length;
    const excused = todayRecords.filter(r => r?.status === 'excused').length;
    const absent = todayRecords.filter(r => r?.status === 'absent').length;
    const pending = students.length - (present + late + excused + absent);

    return { present, late, excused, absent, pending, total: students.length };
  };

  const stats = getTodayStats();
  const attendanceRate = stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/20 border border-red-500/30 rounded-lg">
        <p className="text-red-200 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Stats */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white">Today's Attendance</h3>
            <p className="text-slate-400">
              {new Date(today).toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
              title="Export attendance report as CSV"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
            <div className="text-right">
              <div className="text-4xl font-black text-green-400">{attendanceRate}%</div>
              <div className="text-sm text-slate-400">Attendance Rate</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-200">Present</span>
            </div>
            <div className="text-2xl font-bold text-green-300">{stats.present}</div>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-200">Late</span>
            </div>
            <div className="text-2xl font-bold text-yellow-300">{stats.late}</div>
          </div>

          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-200">Excused</span>
            </div>
            <div className="text-2xl font-bold text-blue-300">{stats.excused}</div>
          </div>

          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-200">Absent</span>
            </div>
            <div className="text-2xl font-bold text-red-300">{stats.absent}</div>
          </div>

          <div className="bg-slate-500/20 border border-slate-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-200">Pending</span>
            </div>
            <div className="text-2xl font-bold text-slate-300">{stats.pending}</div>
          </div>
        </div>
      </div>

      {/* Attendance Grid */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 overflow-x-auto">
        <h3 className="text-2xl font-bold text-white mb-4">Weekly Attendance Grid</h3>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-3 text-slate-300 font-semibold">Student</th>
              <th className="text-left p-3 text-slate-300 font-semibold">Team</th>
              {weekDates.map(date => (
                <th key={date} className="text-center p-3 text-slate-300 font-semibold">
                  <div>{new Date(date).toLocaleDateString('sv-SE', { weekday: 'short' })}</div>
                  <div className="text-xs text-slate-500">{new Date(date).toLocaleDateString('sv-SE', { month: 'numeric', day: 'numeric' })}</div>
                </th>
              ))}
              <th className="text-center p-3 text-slate-300 font-semibold">Rate</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const weekRecords = weekDates.map(date => getAttendanceForDate(student, date));
              const presentCount = weekRecords.filter(r => r?.status === 'present' || r?.status === 'present-late').length;
              const rate = weekDates.length > 0 ? Math.round((presentCount / weekDates.length) * 100) : 0;

              return (
                <tr key={student.email} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3 text-white">{student.name}</td>
                  <td className="p-3 text-slate-400">
                    {student.team ? `Team ${student.team}` : '-'}
                  </td>
                  {weekDates.map(date => {
                    const record = getAttendanceForDate(student, date);
                    return (
                      <td key={date} className="p-3 text-center">
                        <button
                          onClick={() => handleMarkAttendance(student.email, date, record?.status || null)}
                          className="inline-flex items-center justify-center hover:scale-110 transition-transform"
                          title={record ? `${record.status} (click to change)` : 'Click to mark'}
                        >
                          {getStatusIcon(record?.status || null)}
                        </button>
                      </td>
                    );
                  })}
                  <td className="p-3 text-center">
                    <span className={`font-bold ${rate >= 80 ? 'text-green-400' : rate >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {rate}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-400" /> Present
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-yellow-400" /> Late
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="w-4 h-4 text-blue-400" /> Excused
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="w-4 h-4 text-red-400" /> Absent
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-slate-700/50 border border-slate-600"></div> Not Marked
          </div>
          <span className="ml-auto">Click any cell to cycle through statuses</span>
        </div>
      </div>
    </div>
  );
}
