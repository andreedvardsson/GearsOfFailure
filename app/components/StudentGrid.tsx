'use client';

import { Student } from '@/lib/types';
import { useState } from 'react';
import StudentCard from './StudentCard';
import { Search } from 'lucide-react';

interface StudentGridProps {
  students: Student[];
}

export default function StudentGrid({ students }: StudentGridProps) {
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [careerFilter, setCareerFilter] = useState<string>('all');
  const [dataFilter, setDataFilter] = useState<string>('all');

  // Get unique career tags
  const allCareerTags = Array.from(
    new Set(students.flatMap((s) => s.careerTags))
  ).sort();

  // Filter students
  const filteredStudents = students.filter((student) => {
    // Search filter
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      student.name.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.careerTags.some((tag) => tag.toLowerCase().includes(searchLower));

    // Location filter
    const matchesLocation =
      locationFilter === 'all' || student.boilerRoom === locationFilter;

    // Career filter
    const matchesCareer =
      careerFilter === 'all' || student.careerTags.includes(careerFilter);

    // Data completeness filter
    const matchesData =
      dataFilter === 'all' ||
      (dataFilter === 'complete' && student.dataComplete) ||
      (dataFilter === 'incomplete' && !student.dataComplete);

    return matchesSearch && matchesLocation && matchesCareer && matchesData;
  });

  return (
    <div>
      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Location filter */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Locations</option>
            <option value="Malmö - Scandic St Jörgen">Malmö</option>
            <option value="Jönköping - Scandic Elmia">Jönköping</option>
          </select>

          {/* Career filter */}
          <select
            value={careerFilter}
            onChange={(e) => setCareerFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Career Interests</option>
            {allCareerTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          {/* Data completeness filter */}
          <select
            value={dataFilter}
            onChange={(e) => setDataFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Students</option>
            <option value="complete">Complete Data</option>
            <option value="incomplete">Incomplete Data</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-slate-300">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>

      {/* Student Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStudents.map((student) => (
          <StudentCard key={student.email} student={student} />
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">No students found matching your filters</p>
        </div>
      )}
    </div>
  );
}
