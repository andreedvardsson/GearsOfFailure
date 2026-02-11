'use client';

import { Student } from '@/lib/types';
import { useState } from 'react';
import { Mail, MapPin, Award, AlertCircle, CheckCircle2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentCardProps {
  student: Student;
}

export default function StudentCard({ student }: StudentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={cn(
        'bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-5 cursor-pointer transition-all hover:bg-white/15 hover:border-white/30',
        isExpanded && 'ring-2 ring-blue-500'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{student.name}</h3>
          <div className="flex items-center text-sm text-slate-300">
            <Mail className="w-3 h-3 mr-1" />
            <a
              href={`mailto:${student.email}`}
              className="hover:text-blue-400"
              onClick={(e) => e.stopPropagation()}
            >
              {student.email}
            </a>
          </div>
        </div>
        {student.dataComplete ? (
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
        )}
      </div>

      {/* Location */}
      {student.boilerRoom && (
        <div className="flex items-center text-sm text-slate-300 mb-2">
          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="truncate">
            {student.boilerRoom}
            {student.homeCity && student.longCommute && (
              <span className="text-yellow-400 ml-1">(from {student.homeCity})</span>
            )}
          </span>
        </div>
      )}

      {/* Team */}
      {student.team && (
        <div className="flex items-center text-sm text-slate-300 mb-2">
          <Users className="w-3 h-3 mr-1" />
          <span>Team {student.team}</span>
        </div>
      )}

      {/* Career Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {student.careerTags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Experience */}
      <div className="flex items-center text-sm text-slate-300 mb-3">
        <Award className="w-3 h-3 mr-1" />
        <span>Experience: {student.experience}</span>
      </div>

      {/* Expanded Details */}
      {isExpanded && student.dataComplete && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3 text-sm">
          {student.interests && (
            <div>
              <p className="text-slate-400 font-medium mb-1">Interests:</p>
              <p className="text-slate-300">{student.interests}</p>
            </div>
          )}

          {student.careerGoal && (
            <div>
              <p className="text-slate-400 font-medium mb-1">Career Goal:</p>
              <p className="text-slate-300">{student.careerGoal}</p>
            </div>
          )}

          {student.whyCourse && (
            <div>
              <p className="text-slate-400 font-medium mb-1">Why This Course:</p>
              <p className="text-slate-300">{student.whyCourse}</p>
            </div>
          )}

          {student.funFact && (
            <div>
              <p className="text-slate-400 font-medium mb-1">Fun Fact:</p>
              <p className="text-slate-300">{student.funFact}</p>
            </div>
          )}
        </div>
      )}

      {/* Notes for incomplete profiles */}
      {isExpanded && !student.dataComplete && student.notes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-yellow-400 text-sm italic">{student.notes[0]}</p>
        </div>
      )}

      {/* Click hint */}
      {!isExpanded && student.dataComplete && (
        <p className="text-xs text-slate-500 mt-2">Click to expand...</p>
      )}
    </div>
  );
}
