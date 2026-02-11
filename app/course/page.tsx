'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import Navigation from '@/app/components/Navigation';
import {
  BookOpen,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  PlayCircle,
  FileText,
  Code,
  Calendar,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeekData {
  weekNumber: number;
  title: string;
  description: string;
  published: boolean;
  startDate: string;
  isUnlocked: boolean;
  daysSinceStart: number;
  daysUntilUnlock: number;
  isCurrent: boolean;
  learningTargets?: string[];
  studyMaterials?: StudyMaterial[];
  exercises?: Exercise[];
  workshopSchedule?: WorkshopDay[];
}

interface StudyMaterial {
  title: string;
  type: 'video' | 'article' | 'documentation' | 'tutorial';
  url: string;
  duration?: string;
  required: boolean;
}

interface Exercise {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  solution?: string;
}

interface WorkshopDay {
  day: string;
  activities: Array<{
    time: string;
    activity: string;
    description?: string;
  }>;
}

function WeekCard({ week }: { week: WeekData }) {
  const [isExpanded, setIsExpanded] = useState(week.isCurrent);
  const [forceUnlocked, setForceUnlocked] = useState(false);

  const isAccessible = week.isUnlocked || forceUnlocked;

  const handleUnlockEarly = () => {
    setForceUnlocked(true);
    setIsExpanded(true);
  };

  return (
    <div
      className={cn(
        "border-2 rounded-xl overflow-hidden transition-all duration-300",
        week.isCurrent
          ? "border-blue-400 bg-blue-500/10 shadow-lg shadow-blue-500/20"
          : isAccessible
          ? "border-green-400/50 bg-white/5"
          : "border-slate-700 bg-slate-900/50"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "p-6 cursor-pointer hover:bg-white/5 transition-colors",
          isAccessible && "cursor-pointer"
        )}
        onClick={() => isAccessible && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {/* Week Number Badge */}
              <div className={cn(
                "px-3 py-1 rounded-full text-sm font-bold",
                week.isCurrent
                  ? "bg-blue-500 text-white"
                  : isAccessible
                  ? "bg-green-500/20 text-green-400"
                  : "bg-slate-800 text-slate-500"
              )}>
                Week {week.weekNumber}
              </div>

              {/* Status Icons */}
              {week.isCurrent && (
                <div className="flex items-center gap-1 text-blue-400 text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Current Week</span>
                </div>
              )}
              {!week.isUnlocked && !forceUnlocked && (
                <div className="flex items-center gap-1 text-slate-500 text-sm">
                  <Lock className="w-4 h-4" />
                  <span>Unlocks in {week.daysUntilUnlock} days</span>
                </div>
              )}
              {week.isUnlocked && !week.isCurrent && (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              )}
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {week.title}
            </h2>
            <p className="text-slate-300 text-sm">
              {week.description}
            </p>

            {/* Start Date */}
            <div className="flex items-center gap-2 mt-3 text-slate-400 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Starts {new Date(week.startDate).toLocaleDateString('sv-SE', {
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>

          {/* Expand/Collapse Icon */}
          {isAccessible && (
            <div>
              {isExpanded ? (
                <ChevronUp className="w-6 h-6 text-slate-400" />
              ) : (
                <ChevronDown className="w-6 h-6 text-slate-400" />
              )}
            </div>
          )}
        </div>

        {/* Unlock Early Button */}
        {!week.isUnlocked && !forceUnlocked && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUnlockEarly();
            }}
            className="mt-4 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 text-blue-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            Unlock Early
          </button>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && isAccessible && (
        <div className="border-t border-slate-700 bg-black/20">
          {/* Learning Targets */}
          {week.learningTargets && week.learningTargets.length > 0 && (
            <div className="p-6 border-b border-slate-700">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-3">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Learning Targets
              </h3>
              <ul className="space-y-2">
                {week.learningTargets.map((target, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{target}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Study Materials */}
          {week.studyMaterials && week.studyMaterials.length > 0 && (
            <div className="p-6 border-b border-slate-700">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-3">
                <PlayCircle className="w-5 h-5 text-purple-400" />
                Study Materials
              </h3>

              {/* Required Materials */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-400 mb-2">Required</h4>
                <ul className="space-y-2">
                  {week.studyMaterials
                    .filter((m) => m.required)
                    .map((material, idx) => (
                      <li key={idx}>
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            {material.type === 'video' && <PlayCircle className="w-4 h-4 text-purple-400" />}
                            {material.type === 'article' && <FileText className="w-4 h-4 text-purple-400" />}
                            {material.type === 'documentation' && <BookOpen className="w-4 h-4 text-purple-400" />}
                            {material.type === 'tutorial' && <Code className="w-4 h-4 text-purple-400" />}
                          </div>
                          <div className="flex-1">
                            <div className="text-white group-hover:text-blue-300 transition-colors font-medium">
                              {material.title}
                            </div>
                            <div className="text-sm text-slate-400">
                              {material.type} • {material.duration}
                            </div>
                          </div>
                        </a>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Optional Materials */}
              {week.studyMaterials.some((m) => !m.required) && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">Recommended</h4>
                  <ul className="space-y-2">
                    {week.studyMaterials
                      .filter((m) => !m.required)
                      .map((material, idx) => (
                        <li key={idx}>
                          <a
                            href={material.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                              {material.type === 'video' && <PlayCircle className="w-4 h-4 text-slate-400" />}
                              {material.type === 'article' && <FileText className="w-4 h-4 text-slate-400" />}
                              {material.type === 'documentation' && <BookOpen className="w-4 h-4 text-slate-400" />}
                              {material.type === 'tutorial' && <Code className="w-4 h-4 text-slate-400" />}
                            </div>
                            <div className="flex-1">
                              <div className="text-white group-hover:text-blue-300 transition-colors font-medium">
                                {material.title}
                              </div>
                              <div className="text-sm text-slate-400">
                                {material.type} • {material.duration}
                              </div>
                            </div>
                          </a>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Exercises */}
          {week.exercises && week.exercises.length > 0 && (
            <div className="p-6 border-b border-slate-700">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-3">
                <Code className="w-5 h-5 text-green-400" />
                Practice Exercises
              </h3>
              <div className="space-y-3">
                {week.exercises.map((exercise, idx) => (
                  <div key={idx} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-white">{exercise.title}</h4>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        exercise.difficulty === 'beginner' && "bg-green-500/20 text-green-400",
                        exercise.difficulty === 'intermediate' && "bg-yellow-500/20 text-yellow-400",
                        exercise.difficulty === 'advanced' && "bg-red-500/20 text-red-400"
                      )}>
                        {exercise.difficulty}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm">{exercise.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workshop Schedule */}
          {week.workshopSchedule && week.workshopSchedule.length > 0 && (
            <div className="p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-3">
                <Calendar className="w-5 h-5 text-orange-400" />
                Workshop Schedule
              </h3>
              <div className="space-y-4">
                {week.workshopSchedule.map((day, idx) => (
                  <div key={idx}>
                    <h4 className="font-semibold text-white mb-2">{day.day}</h4>
                    <div className="space-y-1">
                      {day.activities.map((activity, actIdx) => (
                        <div
                          key={actIdx}
                          className="flex gap-3 p-2 bg-white/5 rounded"
                        >
                          <div className="text-slate-400 font-mono text-sm w-28 flex-shrink-0">
                            {activity.time}
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium text-sm">
                              {activity.activity}
                            </div>
                            {activity.description && (
                              <div className="text-slate-400 text-xs">
                                {activity.description}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CoursePage() {
  const { user, loading: authLoading } = useAuth();
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeeks() {
      try {
        const response = await fetch('/api/weeks');
        const data = await response.json();
        setWeeks(data.weeks || []);
      } catch (error) {
        console.error('Error fetching weeks:', error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchWeeks();
    }
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  const totalWeeks = 11;
  const completedWeeks = weeks.filter((w) => w.isUnlocked && !w.isCurrent).length;
  const progressPercent = Math.round((completedWeeks / totalWeeks) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Course Materials
          </h1>
          <p className="text-slate-300 text-lg">
            DevSecOps 2026 • Your Learning Journey
          </p>

          {/* Progress Bar */}
          <div className="mt-6 p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">Overall Progress</span>
              <span className="text-white font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-slate-400">
              {completedWeeks} of {totalWeeks} weeks completed
            </div>
          </div>
        </div>

        {/* Weeks List */}
        <div className="space-y-4">
          {weeks.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No course content available yet.</p>
              <p className="text-sm mt-2">Check back soon!</p>
            </div>
          ) : (
            weeks.map((week) => <WeekCard key={week.weekNumber} week={week} />)
          )}

          {/* Future Weeks Placeholder */}
          {weeks.length < totalWeeks && (
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-500 font-medium">
                Weeks {weeks.length + 1}-{totalWeeks}
              </p>
              <p className="text-slate-600 text-sm mt-1">Coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
