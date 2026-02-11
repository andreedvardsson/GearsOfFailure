'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { teamStyles } from '@/lib/constants/team-styles';

export default function TeamFlagsMini() {
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null);
  const teams = Object.keys(teamStyles);

  return (
    <div className="relative flex items-center justify-center gap-1.5 flex-wrap">
      {teams.map((teamNum) => {
        const style = teamStyles[teamNum];
        const isHovered = hoveredTeam === teamNum;

        return (
          <div
            key={teamNum}
            className="relative"
            onMouseEnter={() => setHoveredTeam(teamNum)}
            onMouseLeave={() => setHoveredTeam(null)}
          >
            {/* The Flag */}
            <div
              className={cn(
                "relative overflow-hidden rounded border border-white/20 transition-all duration-200 cursor-pointer",
                isHovered ? "scale-125 shadow-xl z-10" : "hover:scale-110"
              )}
              style={{ width: '32px', height: '24px' }}
            >
              {/* Flag Background with Gradient */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br",
                style.gradient
              )} />

              {/* Pattern Overlay */}
              <div className={cn(
                "absolute inset-0",
                style.pattern
              )} />

              {/* Icon - shown on hover */}
              <div className={cn(
                "absolute inset-0 flex items-center justify-center transition-opacity duration-200 bg-black/30",
                isHovered ? "opacity-100" : "opacity-0"
              )}>
                <span className="text-xs">{style.icon}</span>
              </div>
            </div>

            {/* Hover Popup Card */}
            {isHovered && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className={cn(
                  "bg-gradient-to-br backdrop-blur-sm border-2 rounded-lg p-3 shadow-2xl min-w-[180px]",
                  style.gradient,
                  "border-white/30"
                )}>
                  {/* Team Name */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{style.icon}</span>
                    <h3 className="text-white font-bold text-sm">
                      {style.name}
                    </h3>
                  </div>

                  {/* Team Motto */}
                  <p className="text-white/90 text-xs leading-relaxed">
                    {style.motto}
                  </p>

                  {/* Little arrow pointing up */}
                  <div className={cn(
                    "absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-gradient-to-br border-t-2 border-l-2 border-white/30",
                    style.gradient
                  )} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
