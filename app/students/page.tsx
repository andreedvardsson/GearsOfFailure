import { getDatabase } from '@/lib/mongodb';
import { Student } from '@/lib/types';
import StudentGrid from '../components/StudentGrid';
import StudentPageWrapper from './StudentPageWrapper';

export const dynamic = 'force-dynamic';

async function getStudents() {
  const db = await getDatabase();
  const collection = db.collection<Student>(process.env.STUDENTS_COLLECTION || 'chas_2026_students');

  const students = await collection.find({}).sort({ name: 1 }).toArray();

  // Convert ObjectId to string for client-side rendering
  return students.map((student) => ({
    ...student,
    _id: student._id?.toString(),
  })) as unknown as Student[];
}

export default async function Home() {
  const students = await getStudents();

  const stats = {
    total: students.length,
    complete: students.filter(s => s.dataComplete).length,
    malmo: students.filter(s => s.boilerRoom === 'Malmö - Scandic St Jörgen').length,
    jonkoping: students.filter(s => s.boilerRoom === 'Jönköping - Scandic Elmia').length,
  };

  return (
    <StudentPageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            Student Manager
          </h1>
          <p className="text-slate-300 text-lg">
            IT- och Cybersäkerhetstekniker 2026
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-slate-300">Total Students</div>
          </div>
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-300">{stats.complete}</div>
            <div className="text-sm text-green-200">Complete Data</div>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-300">{stats.malmo}</div>
            <div className="text-sm text-blue-200">Malmö</div>
          </div>
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-300">{stats.jonkoping}</div>
            <div className="text-sm text-purple-200">Jönköping</div>
          </div>
        </div>

        {/* Student Grid */}
        <StudentGrid students={students} />
      </div>
    </div>
    </StudentPageWrapper>
  );
}
