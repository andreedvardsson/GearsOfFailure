'use client';

import { useState } from 'react';
import { Users, MapPin, Trophy, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { teamStyles } from '@/lib/constants/team-styles';
import { Team } from '@/lib/types';

interface TeamBannerProps {
  teamNumber: string;
  team: Team;
}

export default function TeamBanner({ teamNumber, team }: TeamBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const style = teamStyles[teamNumber];

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={cn(
        "relative overflow-hidden rounded-2xl border-4 transition-all duration-300 cursor-pointer group",
        "hover:scale-[1.02] hover:shadow-2xl",
        style.borderColor,
        isExpanded ? "shadow-2xl scale-[1.01]" : "shadow-lg"
      )}
    >
      {/* Flag Background with Pattern */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br",
        style.gradient,
        style.pattern
      )} />

      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      <div className="relative">
        {/* Banner Header - Always Visible */}
        <div className="p-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Team Number Badge */}
              <div className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4",
                "bg-black/30 backdrop-blur-sm border border-white/20"
              )}>
                <span className="text-3xl">{style.icon}</span>
                <span className={cn("font-black text-2xl", style.textColor)}>
                  TEAM {teamNumber}
                </span>
              </div>

              {/* Team Name - HUGE */}
              <h2 className={cn(
                "text-6xl md:text-7xl font-black mb-4 tracking-tight",
                style.textColor,
                "drop-shadow-lg"
              )}>
                {team.name}
              </h2>

              {/* Location, Member Count & Score */}
              <div className="flex flex-wrap gap-4 text-lg mb-4">
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full",
                  "bg-black/20 backdrop-blur-sm"
                )}>
                  <MapPin className="w-5 h-5" />
                  <span className={cn("font-semibold", style.textColor)}>
                    {team.location}
                  </span>
                </div>
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full",
                  "bg-black/20 backdrop-blur-sm"
                )}>
                  <Users className="w-5 h-5" />
                  <span className={cn("font-semibold", style.textColor)}>
                    {team.members.length} members
                  </span>
                </div>
                {team.score && (
                  <>
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full",
                      "bg-black/30 backdrop-blur-sm border-2",
                      team.score.rank === 1 ? "border-yellow-400" :
                      team.score.rank === 2 ? "border-gray-300" :
                      team.score.rank === 3 ? "border-orange-400" : "border-white/20"
                    )}>
                      <Trophy className="w-5 h-5" />
                      <span className={cn("font-black text-xl", style.textColor)}>
                        {team.score.total} pts
                      </span>
                    </div>
                    {team.score.rank && team.score.rank <= 3 && (
                      <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full font-black",
                        team.score.rank === 1 && "bg-yellow-400/90 text-yellow-950",
                        team.score.rank === 2 && "bg-gray-300/90 text-gray-900",
                        team.score.rank === 3 && "bg-orange-400/90 text-orange-950"
                      )}>
                        {team.score.rank === 1 && "🥇 #1"}
                        {team.score.rank === 2 && "🥈 #2"}
                        {team.score.rank === 3 && "🥉 #3"}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Progress Bar */}
              {team.score && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className={cn("text-sm font-semibold", style.textColor)}>
                      Tournament Progress
                    </span>
                    <span className={cn("text-sm font-bold", style.textColor)}>
                      {team.score.total} / 1000 pts
                    </span>
                  </div>
                  <div className="w-full bg-black/30 rounded-full h-4 overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-500 rounded-full",
                        "bg-gradient-to-r from-green-400 via-blue-400 to-purple-400"
                      )}
                      style={{ width: `${Math.min((team.score.total / 1000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Achievement Badges */}
              {team.score && team.score.achievements.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {team.score.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 backdrop-blur-sm"
                      title={`${achievement.name} - ${achievement.points} pts`}
                    >
                      <span className="text-xl">{achievement.icon}</span>
                      <span className={cn("text-sm font-semibold", style.textColor)}>
                        +{achievement.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Warning Badge */}
              {team.warning && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/80 text-yellow-950 font-semibold">
                  ⚠️ {team.warning}
                </div>
              )}
            </div>

            {/* Expand/Collapse Button */}
            <button
              className={cn(
                "p-3 rounded-full transition-all",
                "bg-black/20 backdrop-blur-sm hover:bg-black/40",
                style.textColor
              )}
            >
              {isExpanded ? (
                <ChevronUp className="w-8 h-8" />
              ) : (
                <ChevronDown className="w-8 h-8" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className={cn(
            "border-t-4 bg-gradient-to-br p-8",
            style.borderColor,
            style.accentGradient
          )}>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Members List */}
              <div>
                <h3 className={cn("text-2xl font-bold mb-4 flex items-center gap-2", style.textColor)}>
                  <Users className="w-6 h-6" />
                  Team Members
                </h3>
                <div className="space-y-2">
                  {team.members.map((member, idx) => (
                    <div
                      key={idx}
                      className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10"
                    >
                      <div className={cn("font-semibold", style.textColor)}>
                        {member.name}
                      </div>
                      <div className={cn("text-sm opacity-80", style.textColor)}>
                        {member.email}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Awards */}
              <div className="space-y-6">
                {/* Latest Boiler Room Update */}
                {team.latestUpdate && (
                  <div>
                    <h3 className={cn("text-2xl font-bold mb-4 flex items-center gap-2", style.textColor)}>
                      🔥 Latest Boiler Room (Week {team.latestUpdate.week})
                    </h3>
                    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10 space-y-3">
                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-3 py-1 rounded-full font-semibold text-sm",
                          team.latestUpdate.status === 'green' && "bg-green-500/80 text-green-950",
                          team.latestUpdate.status === 'yellow' && "bg-yellow-500/80 text-yellow-950",
                          team.latestUpdate.status === 'red' && "bg-red-500/80 text-red-950"
                        )}>
                          {team.latestUpdate.status === 'green' && '🟢 På spår'}
                          {team.latestUpdate.status === 'yellow' && '🟡 Lite efter'}
                          {team.latestUpdate.status === 'red' && '🔴 Behöver hjälp'}
                        </span>
                        <span className={cn("text-sm opacity-75", style.textColor)}>
                          {team.latestUpdate.date}
                        </span>
                      </div>

                      {/* Work Done */}
                      <div>
                        <p className={cn("font-semibold mb-1", style.textColor)}>
                          ✅ Vad vi jobbade med:
                        </p>
                        <ul className={cn("text-sm space-y-1 opacity-90", style.textColor)}>
                          {team.latestUpdate.workDone.map((work, idx) => (
                            <li key={idx}>• {work}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Blockers */}
                      {team.latestUpdate.blockers.length > 0 && (
                        <div>
                          <p className={cn("font-semibold mb-1", style.textColor)}>
                            🚧 Hinder:
                          </p>
                          <ul className={cn("text-sm space-y-1 opacity-90", style.textColor)}>
                            {team.latestUpdate.blockers.map((blocker, idx) => (
                              <li key={idx}>• {blocker}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Next Steps */}
                      {team.latestUpdate.nextSteps && team.latestUpdate.nextSteps.length > 0 && (
                        <div>
                          <p className={cn("font-semibold mb-1", style.textColor)}>
                            ➡️ Nästa steg:
                          </p>
                          <ul className={cn("text-sm space-y-1 opacity-90", style.textColor)}>
                            {team.latestUpdate.nextSteps.map((step, idx) => (
                              <li key={idx}>• {step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Point Breakdown */}
                {team.score && (
                  <div>
                    <h3 className={cn("text-2xl font-bold mb-4 flex items-center gap-2", style.textColor)}>
                      <Trophy className="w-6 h-6" />
                      Point Breakdown
                    </h3>
                    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={cn("font-semibold", style.textColor)}>
                          📝 Boiler Room Submissions
                        </span>
                        <span className={cn("font-bold", style.textColor)}>
                          {team.score.breakdown.boilerRoomSubmissions} pts
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={cn("font-semibold", style.textColor)}>
                          🧪 Lab Completions
                        </span>
                        <span className={cn("font-bold", style.textColor)}>
                          {team.score.breakdown.labCompletions} pts
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={cn("font-semibold", style.textColor)}>
                          👥 Participation
                        </span>
                        <span className={cn("font-bold", style.textColor)}>
                          {team.score.breakdown.participation} pts
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={cn("font-semibold", style.textColor)}>
                          🤝 Helping Others
                        </span>
                        <span className={cn("font-bold", style.textColor)}>
                          {team.score.breakdown.helpingOthers} pts
                        </span>
                      </div>
                      <div className="h-px bg-white/20 my-2"></div>
                      <div className="flex justify-between items-center">
                        <span className={cn("font-semibold", style.textColor)}>
                          🏆 Achievement Bonuses
                        </span>
                        <span className={cn("font-bold", style.textColor)}>
                          {team.score.achievements.reduce((sum, a) => sum + a.points, 0)} pts
                        </span>
                      </div>
                      <div className="h-px bg-white/20 my-2"></div>
                      <div className="flex justify-between items-center text-lg">
                        <span className={cn("font-black", style.textColor)}>
                          TOTAL
                        </span>
                        <span className={cn("font-black text-2xl", style.textColor)}>
                          {team.score.total} pts
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Team Strengths */}
                <div>
                  <h3 className={cn("text-2xl font-bold mb-4 flex items-center gap-2", style.textColor)}>
                    <Sparkles className="w-6 h-6" />
                    Team Strengths
                  </h3>
                  <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <p className={cn("italic opacity-90", style.textColor)}>
                      To be discovered... 🔍
                    </p>
                  </div>
                </div>

                {/* Awards & Achievements */}
                <div>
                  <h3 className={cn("text-2xl font-bold mb-4 flex items-center gap-2", style.textColor)}>
                    <Trophy className="w-6 h-6" />
                    Awards & Achievements
                  </h3>
                  <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <p className={cn("italic opacity-90", style.textColor)}>
                      The journey begins... 🚀
                    </p>
                  </div>
                </div>

                {/* Fun Fact */}
                <div>
                  <h3 className={cn("text-2xl font-bold mb-4", style.textColor)}>
                    💡 Team Fun Fact
                  </h3>
                  <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <p className={cn("italic opacity-90", style.textColor)}>
                      Coming soon...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
