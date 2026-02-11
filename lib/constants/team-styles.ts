export interface TeamStyle {
  name: string;
  motto: string;
  gradient: string;
  pattern: string;
  icon: string;
  // Additional properties for TeamBanner
  accentGradient?: string;
  textColor?: string;
  borderColor?: string;
}

export const teamStyles: Record<string, TeamStyle> = {
  "1": {
    name: "Lillteamet",
    motto: "Small but mighty • Purple hearts prevail",
    gradient: "from-purple-600 via-pink-500 to-purple-600",
    accentGradient: "from-purple-700 to-pink-600",
    textColor: "text-white",
    borderColor: "border-purple-400/50",
    pattern: "bg-[radial-gradient(circle_at_30%_50%,rgba(168,85,247,0.4)_0%,transparent_50%)]",
    icon: "💜"
  },
  "2": {
    name: "Chas FF",
    motto: "Game on • Every sprint counts",
    gradient: "from-green-600 via-emerald-500 to-blue-600",
    accentGradient: "from-green-700 to-blue-700",
    textColor: "text-white",
    borderColor: "border-green-400/50",
    pattern: "bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(255,255,255,0.1)_20px,rgba(255,255,255,0.1)_40px)]",
    icon: "⚽"
  },
  "3": {
    name: "Girly pops",
    motto: "Sparkle & code • Unstoppable energy",
    gradient: "from-pink-500 via-fuchsia-500 to-pink-600",
    accentGradient: "from-pink-600 to-fuchsia-700",
    textColor: "text-white",
    borderColor: "border-pink-400/50",
    pattern: "bg-[radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.3)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(217,70,239,0.3)_0%,transparent_50%)]",
    icon: "💕"
  },
  "4": {
    name: "M4K Gang",
    motto: "Built different • We ship it",
    gradient: "from-red-700 via-orange-600 to-red-800",
    accentGradient: "from-red-800 to-orange-700",
    textColor: "text-white",
    borderColor: "border-red-500/50",
    pattern: "bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.2)_25%,rgba(0,0,0,0.2)_75%,transparent_75%)]",
    icon: "🔥"
  },
  "5": {
    name: "FridhemFighters",
    motto: "Warriors of the cloud • Victory awaits",
    gradient: "from-red-600 via-amber-500 to-yellow-600",
    accentGradient: "from-red-700 to-yellow-600",
    textColor: "text-white",
    borderColor: "border-amber-400/50",
    pattern: "bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.3)_0%,transparent_70%)]",
    icon: "⚔️"
  },
  "6": {
    name: "The hole?",
    motto: "Deep dive • Mysterious depths",
    gradient: "from-indigo-900 via-purple-800 to-slate-900",
    accentGradient: "from-indigo-950 to-slate-950",
    textColor: "text-purple-200",
    borderColor: "border-purple-700/50",
    pattern: "bg-[radial-gradient(ellipse_at_center,rgba(88,28,135,0.4)_0%,transparent_70%)]",
    icon: "🕳️"
  },
  "7": {
    name: "Sidestep Error",
    motto: "No bugs survive • Terminal velocity",
    gradient: "from-cyan-600 via-green-500 to-teal-600",
    accentGradient: "from-cyan-700 to-green-700",
    textColor: "text-green-50",
    borderColor: "border-cyan-400/50",
    pattern: "bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(34,211,238,0.1)_2px,rgba(34,211,238,0.1)_4px)]",
    icon: "⚡"
  },
  "8": {
    name: "Nissastigen",
    motto: "Nature's path to excellence",
    gradient: "from-emerald-700 via-green-600 to-lime-700",
    accentGradient: "from-emerald-800 to-lime-800",
    textColor: "text-green-50",
    borderColor: "border-green-500/50",
    pattern: "bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.1)_50%)]",
    icon: "🌲"
  }
};
