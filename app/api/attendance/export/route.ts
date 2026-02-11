import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Student, AttendanceRecord } from '@/lib/types';
import { isAdmin } from '@/lib/auth/admin-helpers';
import { COURSE_CONFIG, COLLECTIONS } from '@/lib/constants';

// Helper to check if a date is a weekday (Mon-Fri)
function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5; // Monday = 1, Friday = 5
}

// Helper to check if a date is a scheduled session day (attendance required)
function isScheduledDay(dateString: string): boolean {
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();

  // Week 1 special case: Only Tue, Wed, Thu are scheduled sessions
  if (dateString >= COURSE_CONFIG.START_DATE && dateString <= '2026-01-23') {
    return dateString === COURSE_CONFIG.WEEK_1_DATES.TUESDAY ||
           dateString === COURSE_CONFIG.WEEK_1_DATES.WEDNESDAY ||
           dateString === COURSE_CONFIG.WEEK_1_DATES.THURSDAY;
  }

  // Week 2+ (from Jan 26): Only Tue, Wed, Thu are scheduled
  return dayOfWeek === COURSE_CONFIG.SCHEDULED_DAYS.TUESDAY ||
         dayOfWeek === COURSE_CONFIG.SCHEDULED_DAYS.WEDNESDAY ||
         dayOfWeek === COURSE_CONFIG.SCHEDULED_DAYS.THURSDAY;
}

// Generate weekdays from course start to today (or custom range)
function generateWeekdayDates(fromDate?: string, toDate?: string): string[] {
  const dates: string[] = [];

  // Default: from course start to today
  const startDate = fromDate ? new Date(fromDate) : new Date(COURSE_CONFIG.START_DATE);
  const endDate = toDate ? new Date(toDate) : new Date();

  // Iterate through each day in the range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    if (isWeekday(currentDate)) {
      dates.push(currentDate.toLocaleDateString('sv-SE'));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

// GET - Export attendance data as CSV
export async function GET(request: NextRequest) {
  try {
    const adminEmail = request.headers.get('x-user-email');

    if (!adminEmail || !(await isAdmin(adminEmail))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Optional query parameters for custom date range
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from') || undefined;
    const toDate = searchParams.get('to') || undefined;

    const db = await getDatabase();
    const studentsCollection = db.collection<Student>(COLLECTIONS.STUDENTS);

    // Get all students with attendance
    const students = await studentsCollection
      .find({})
      .project({ name: 1, email: 1, team: 1, attendance: 1 })
      .sort({ name: 1 })
      .toArray() as Student[];

    // Generate weekdays from course start to today (or custom range)
    const sortedDates = generateWeekdayDates(fromDate, toDate);

    // Helper function to get attendance status for a date
    const getStatus = (student: Student, date: string): string => {
      const record = student.attendance?.find(a => a.date === date);
      if (!record) return '';

      switch (record.status) {
        case 'present': return '✓';
        case 'present-late': return 'L';
        case 'excused': return 'E';
        case 'absent': return 'X';
        default: return '';
      }
    };

    // Calculate stats (rate based on scheduled days only)
    const calculateStats = (student: Student) => {
      const scheduledDates = sortedDates.filter(isScheduledDay);
      const records = student.attendance?.filter(a => sortedDates.includes(a.date)) || [];
      const scheduledRecords = records.filter(r => isScheduledDay(r.date));
      const presentCount = scheduledRecords.filter(r => r.status === 'present' || r.status === 'present-late').length;
      const rate = scheduledDates.length > 0 ? Math.round((presentCount / scheduledDates.length) * 100) : 0;
      return {
        total: scheduledDates.length,
        present: records.filter(r => r.status === 'present').length,
        late: records.filter(r => r.status === 'present-late').length,
        excused: records.filter(r => r.status === 'excused').length,
        absent: records.filter(r => r.status === 'absent').length,
        rate,
      };
    };

    // Build CSV
    const headers = [
      'Student Name',
      'Email',
      'Team',
      ...sortedDates.map(date => {
        const d = new Date(date);
        return `${d.toLocaleDateString('sv-SE', { weekday: 'short' })} ${date}`;
      }),
      'Present',
      'Late',
      'Excused',
      'Absent',
      'Rate %',
    ];

    const rows = students.map(student => {
      const stats = calculateStats(student);
      return [
        student.name,
        student.email,
        student.team?.toString() || '-',
        ...sortedDates.map(date => getStatus(student, date)),
        stats.present.toString(),
        stats.late.toString(),
        stats.excused.toString(),
        stats.absent.toString(),
        `${stats.rate}%`,
      ];
    });

    // Add summary row
    const totalPresent = students.reduce((sum, s) => {
      const stats = calculateStats(s);
      return sum + stats.present;
    }, 0);
    const totalLate = students.reduce((sum, s) => {
      const stats = calculateStats(s);
      return sum + stats.late;
    }, 0);
    const totalExcused = students.reduce((sum, s) => {
      const stats = calculateStats(s);
      return sum + stats.excused;
    }, 0);
    const totalAbsent = students.reduce((sum, s) => {
      const stats = calculateStats(s);
      return sum + stats.absent;
    }, 0);
    const avgRate = students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + calculateStats(s).rate, 0) / students.length)
      : 0;

    rows.push([]);
    rows.push([
      'TOTALS',
      '',
      '',
      ...sortedDates.map(() => ''),
      totalPresent.toString(),
      totalLate.toString(),
      totalExcused.toString(),
      totalAbsent.toString(),
      `${avgRate}%`,
    ]);

    // Convert to CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => {
          // Escape cells containing commas or quotes
          if (cell.includes(',') || cell.includes('"')) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        }).join(',')
      ),
    ].join('\n');

    // Add legend at the end
    const legend = '\n\nLegend:\n✓ = Present\nL = Late\nE = Excused\nX = Absent\n(blank) = Not marked';
    const finalCsv = csvContent + legend;

    // Return CSV file
    const filename = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(finalCsv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
