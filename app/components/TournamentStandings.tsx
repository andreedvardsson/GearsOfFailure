'use client';

import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

interface TeamMember {
  name: string;
  email: string;
}

interface Achievement {
  id: string;
  name: string;
  points: number;
  earnedDate: string;
  icon: string;
}

interface TeamScore {
  total: number;
  breakdown: {
    boilerRoomSubmissions: number;
    labCompletions: number;
    participation: number;
    helpingOthers: number;
  };
  achievements: Achievement[];
  rank?: number;
}

interface Team {
  name: string;
  location: string;
  members: TeamMember[];
  score?: TeamScore;
}

interface TournamentStandingsProps {
  teams: Record<string, Team>;
}

export default function TournamentStandings({ teams }: TournamentStandingsProps) {
  // Get all teams with scores
  const allTeamsWithScores = Object.entries(teams)
    .filter(([, team]) => team.score)
    .sort((a, b) => (b[1].score?.total || 0) - (a[1].score?.total || 0));

  // Top 5 for display
  const rankedTeams = allTeamsWithScores.slice(0, 5);

  const totalTeams = Object.keys(teams).length;
  const teamsWithScores = allTeamsWithScores.length; // Count ALL teams with scores
  const avgScore = allTeamsWithScores.length > 0
    ? Math.round(allTeamsWithScores.reduce((sum, [, team]) => sum + (team.score?.total || 0), 0) / allTeamsWithScores.length)
    : 0;

  return (
    <div className="bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
            <Trophy className="w-7 h-7 text-yellow-950" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">Tournament Leaderboard</h2>
            <p className="text-slate-400 text-sm">Week 1 - DevSecOps Championship</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="hidden md:flex gap-6">
          <div className="text-center">
            <div className="text-3xl font-black text-blue-400">{teamsWithScores}</div>
            <div className="text-xs text-slate-400">Teams Active</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-green-400">{avgScore}</div>
            <div className="text-xs text-slate-400">Avg Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-purple-400">{totalTeams}</div>
            <div className="text-xs text-slate-400">Total Teams</div>
          </div>
        </div>
      </div>

      {/* Standings Grid */}
      <div className="grid md:grid-cols-5 gap-3">
        {rankedTeams.map(([teamNumber, team], index) => {
          const rank = index + 1;
          const maxScore = rankedTeams[0][1].score?.total || 100;
          const percentage = ((team.score?.total || 0) / maxScore) * 100;

          return (
            <div
              key={teamNumber}
              className={cn(
                "relative overflow-hidden rounded-xl p-4 transition-all hover:scale-105",
                rank === 1 && "bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-2 border-yellow-400/50",
                rank === 2 && "bg-gradient-to-br from-gray-300/20 to-gray-400/20 border-2 border-gray-300/50",
                rank === 3 && "bg-gradient-to-br from-orange-400/20 to-orange-600/20 border-2 border-orange-400/50",
                rank > 3 && "bg-white/5 border border-white/10"
              )}
            >
              {/* Rank Badge */}
              <div className="absolute top-2 right-2">
                {rank === 1 && <span className="text-3xl">🥇</span>}
                {rank === 2 && <span className="text-3xl">🥈</span>}
                {rank === 3 && <span className="text-3xl">🥉</span>}
                {rank > 3 && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">#{rank}</span>
                  </div>
                )}
              </div>

              {/* Team Info */}
              <div className="mb-3">
                <div className="text-xs text-slate-400 mb-1">Team {teamNumber}</div>
                <div className="text-lg font-bold text-white truncate pr-10">
                  {team.name}
                </div>
                <div className="text-xs text-slate-400">{team.location}</div>
              </div>

              {/* Score */}
              <div className="mb-2">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-black text-white">
                    {team.score?.total}
                  </span>
                  <span className="text-xs text-slate-400">pts</span>
                </div>

                {/* Mini Progress Bar */}
                <div className="w-full bg-black/30 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      rank === 1 && "bg-gradient-to-r from-yellow-400 to-orange-500",
                      rank === 2 && "bg-gradient-to-r from-gray-300 to-gray-400",
                      rank === 3 && "bg-gradient-to-r from-orange-400 to-orange-600",
                      rank > 3 && "bg-gradient-to-r from-blue-400 to-purple-400"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Achievement Icons */}
              {team.score && team.score.achievements.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {team.score.achievements.slice(0, 3).map((achievement) => (
                    <span key={achievement.id} className="text-lg" title={achievement.name}>
                      {achievement.icon}
                    </span>
                  ))}
                  {team.score.achievements.length > 3 && (
                    <span className="text-xs text-slate-400">+{team.score.achievements.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      {allTeamsWithScores.length === totalTeams && (
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-400">
            Everyone has made a submission - amazing work teams! 🎉🚀
          </p>
        </div>
      )}
    </div>
  );
}
