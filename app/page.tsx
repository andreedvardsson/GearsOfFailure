'use client';

import { useEffect, useState } from 'react';
import TeamBanner from './components/TeamBanner';
import TournamentStandings from './components/TournamentStandings';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import { Loader2 } from 'lucide-react';

interface TeamMember {
  name: string;
  email: string;
}

interface BoilerRoomUpdate {
  date: string;
  week: number;
  participants: string[];
  workDone: string[];
  blockers: string[];
  status: 'green' | 'yellow' | 'red';
  nextSteps?: string[];
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
    codeQuality: number;
    helpingOthers: number;
  };
  achievements: Achievement[];
  rank?: number;
}

interface Team {
  name: string;
  location: string;
  members: TeamMember[];
  warning?: string;
  latestUpdate?: BoilerRoomUpdate;
  score?: TeamScore;
}

// Demo team data - Educational example only
// In a real application, this would be fetched from a database
const teams: Record<string, Team> = {
  "1": {
    "name": "The Docker Dolphins 🐬",
    "location": "Malmö",
    "members": [
      {"name": "Alice Anderson", "email": "alice@example.com"},
      {"name": "Bob Builder", "email": "bob@example.com"},
      {"name": "Charlie Chen", "email": "charlie@example.com"},
      {"name": "Diana Davis", "email": "diana@example.com"},
      {"name": "Erik Eriksson", "email": "erik@example.com"}
    ],
    "latestUpdate": {
      "date": "2026-01-22",
      "week": 1,
      "participants": ["Alice A", "Bob B", "Charlie C", "Diana D", "Erik E"],
      "workDone": [
        "Set up git repository",
        "Granted collaborator rights to all team members",
        "Made initial commits"
      ],
      "blockers": [
        "Member had issues installing Docker Desktop",
        "Unclear whether to use cloud environment or local PC"
      ],
      "status": "green",
      "nextSteps": [
        "Planning and execution of Week 2"
      ]
    },
    "score": {
      "total": 50,
      "breakdown": {
        "boilerRoomSubmissions": 50,
        "labCompletions": 0,
        "participation": 0,
        "codeQuality": 0,
        "helpingOthers": 0
      },
      "achievements": []
    }
  },
  "2": {
    "name": "Container Crew ⚡",
    "location": "Malmö",
    "members": [
      {"name": "Fiona Foster", "email": "fiona@example.com"},
      {"name": "George Green", "email": "george@example.com"},
      {"name": "Hannah Hill", "email": "hannah@example.com"},
      {"name": "Ian Ibrahim", "email": "ian@example.com"}
    ],
    "latestUpdate": {
      "date": "2026-01-21",
      "week": 1,
      "participants": ["Fiona", "George", "Hannah"],
      "workDone": [
        "Set up GitHub accounts"
      ],
      "blockers": [
        "Had to generate personal access tokens to push",
        "Solution: Generated tokens through GitHub settings"
      ],
      "status": "green",
      "nextSteps": [
        "Continue with assignments"
      ]
    },
    "score": {
      "total": 50,
      "breakdown": {
        "boilerRoomSubmissions": 50,
        "labCompletions": 0,
        "participation": 0,
        "codeQuality": 0,
        "helpingOthers": 0
      },
      "achievements": []
    }
  },
  "3": {
    "name": "Kubernetes Knights ⚔️",
    "location": "Malmö",
    "members": [
      {"name": "Julia Jackson", "email": "julia@example.com"},
      {"name": "Kevin Kim", "email": "kevin@example.com"},
      {"name": "Luna López", "email": "luna@example.com"}
    ],
    "warning": "Only 3 members - should have 4-5",
    "latestUpdate": {
      "date": "2026-01-21",
      "week": 1,
      "participants": ["Julia Jackson", "Kevin Kim", "Luna López"],
      "workDone": [
        "Set up GitHub accounts and created shared repository",
        "Reviewed how GitHub works and watched crash course video",
        "Created separate branches under main"
      ],
      "blockers": [
        "Password authentication not allowed",
        "Could not push through terminal",
        "Solution: Created access tokens through GitHub",
        "Solution: Used SSH keys instead"
      ],
      "status": "green",
      "nextSteps": [
        "Start working on pipeline",
        "Begin working with Docker"
      ]
    },
    "score": {
      "total": 100,
      "breakdown": {
        "boilerRoomSubmissions": 50,
        "labCompletions": 0,
        "participation": 0,
        "codeQuality": 0,
        "helpingOthers": 0
      },
      "achievements": [
        {
          "id": "problem-solver-w1",
          "name": "Problem Solver",
          "points": 50,
          "earnedDate": "2026-01-21",
          "icon": "🔧"
        }
      ]
    }
  },
  "4": {
    "name": "DevOps Dragons 🐉",
    "location": "Malmö",
    "members": [
      {"name": "Maria Martinez", "email": "maria@example.com"},
      {"name": "Noah Nielsen", "email": "noah@example.com"},
      {"name": "Olivia Olsson", "email": "olivia@example.com"},
      {"name": "Peter Petrov", "email": "peter@example.com"},
      {"name": "Quinn Quinn", "email": "quinn@example.com"}
    ],
    "latestUpdate": {
      "date": "2026-01-20",
      "week": 1,
      "participants": ["Maria", "Noah", "Olivia", "Peter", "Quinn"],
      "workDone": [
        "Set up GitHub accounts and created organization with proper permissions and rules",
        "Created example app where everyone tested committing and pushing",
        "Tested both GitHub Desktop and Git Bash (commands)",
        "Reviewed how GitHub works (workflow, branches, teamwork)",
        "Everyone got their own branch separated from main",
        "Deployed the app to GitHub Pages"
      ],
      "blockers": [
        "Choice of structure: repo under personal profile or organization → Chose organization",
        "Unclear work division: difficult to assign roles"
      ],
      "status": "green",
      "nextSteps": [
        "Determine clear roles and responsibilities in the team",
        "Continue planning and developing the app",
        "Continue practicing GitHub and Git commands",
        "Build upon Dockerfile and CI pipeline",
        "Create/update .gitignore"
      ]
    },
    "score": {
      "total": 175,
      "breakdown": {
        "boilerRoomSubmissions": 50,
        "labCompletions": 0,
        "participation": 50,
        "codeQuality": 0,
        "helpingOthers": 0
      },
      "achievements": [
        {
          "id": "overachiever-w1",
          "name": "Overachiever",
          "points": 75,
          "earnedDate": "2026-01-20",
          "icon": "⭐"
        },
        {
          "id": "team-player-w1",
          "name": "Team Player",
          "points": 50,
          "earnedDate": "2026-01-20",
          "icon": "🤝"
        }
      ]
    }
  },
  "5": {
    "name": "Security Squad 🔒",
    "location": "Malmö",
    "members": [
      {"name": "Rosa Rodriguez", "email": "rosa@example.com"},
      {"name": "Sam Schmidt", "email": "sam@example.com"},
      {"name": "Tara Thompson", "email": "tara@example.com"},
      {"name": "Uma Usman", "email": "uma@example.com"},
      {"name": "Victor Vega", "email": "victor@example.com"}
    ],
    "latestUpdate": {
      "date": "2026-01-20",
      "week": 1,
      "participants": ["Rosa", "Sam", "Tara", "Uma", "Victor"],
      "workDone": [
        "Set up and secured a repository (organization)",
        "Dockerfile started"
      ],
      "blockers": [
        "GitHub removed git password authorization",
        "Solution: Used SSH keys instead"
      ],
      "status": "green",
      "nextSteps": [
        "Continue with Dockerfile",
        "Research best practices"
      ]
    },
    "score": {
      "total": 150,
      "breakdown": {
        "boilerRoomSubmissions": 50,
        "labCompletions": 0,
        "participation": 0,
        "codeQuality": 0,
        "helpingOthers": 0
      },
      "achievements": [
        {
          "id": "first-submission-w1",
          "name": "First Submission (Week 1)",
          "points": 50,
          "earnedDate": "2026-01-20",
          "icon": "🥇"
        },
        {
          "id": "problem-solver-w1",
          "name": "Problem Solver",
          "points": 50,
          "earnedDate": "2026-01-20",
          "icon": "🔧"
        }
      ],
      "rank": 1
    }
  },
  "6": {
    "name": "Cloud Commanders ☁️",
    "location": "Jönköping",
    "members": [
      {"name": "Wendy Walsh", "email": "wendy@example.com"},
      {"name": "Xander Xavier", "email": "xander@example.com"},
      {"name": "Yuki Yamamoto", "email": "yuki@example.com"},
      {"name": "Zara Ziegler", "email": "zara@example.com"},
      {"name": "Adam Andersson", "email": "adam@example.com"}
    ],
    "latestUpdate": {
      "date": "2026-01-22",
      "week": 1,
      "participants": ["Wendy", "Xander", "Yuki", "Zara", "Adam"],
      "workDone": [
        "Created a GitHub organization",
        "Tested adding and pushing files",
        "Set up branch protection"
      ],
      "blockers": [
        "No particular issues, went smoothly"
      ],
      "status": "green",
      "nextSteps": [
        "Everyone should have their own branch to push commits",
        "Start with Docker"
      ]
    },
    "score": {
      "total": 75,
      "breakdown": {
        "boilerRoomSubmissions": 50,
        "labCompletions": 0,
        "participation": 0,
        "codeQuality": 0,
        "helpingOthers": 0
      },
      "achievements": [
        {
          "id": "good-practices-w1",
          "name": "Good Practices",
          "points": 25,
          "earnedDate": "2026-01-22",
          "icon": "🛡️"
        }
      ]
    }
  },
  "7": {
    "name": "CI/CD Champions 🏆",
    "location": "Jönköping",
    "members": [
      {"name": "Bella Bergström", "email": "bella@example.com"},
      {"name": "Carlos Carlsson", "email": "carlos@example.com"},
      {"name": "Dina Daniels", "email": "dina@example.com"},
      {"name": "Emil Engström", "email": "emil@example.com"},
      {"name": "Freya Fredriksson", "email": "freya@example.com"}
    ],
    "latestUpdate": {
      "date": "2026-01-20",
      "week": 1,
      "participants": ["Bella", "Carlos", "Dina", "Emil", "Freya"],
      "workDone": [
        "Created a git account for the group",
        "Created a repo for the group",
        "Discussed and tried to figure out what we want to do"
      ],
      "blockers": [
        "Could not set security in free version",
        "Solution: Changed to public"
      ],
      "status": "green"
    },
    "score": {
      "total": 75,
      "breakdown": {
        "boilerRoomSubmissions": 50,
        "labCompletions": 0,
        "participation": 0,
        "codeQuality": 0,
        "helpingOthers": 0
      },
      "achievements": [
        {
          "id": "early-bird-w1",
          "name": "Early Bird (Week 1)",
          "points": 25,
          "earnedDate": "2026-01-20",
          "icon": "🐦"
        }
      ],
      "rank": 2
    }
  },
  "8": {
    "name": "Terraform Tigers 🐯",
    "location": "Jönköping",
    "members": [
      {"name": "Gabriel Gustafsson", "email": "gabriel@example.com"},
      {"name": "Helena Håkansson", "email": "helena@example.com"},
      {"name": "Isak Isaksson", "email": "isak@example.com"},
      {"name": "Jasmine Johansson", "email": "jasmine@example.com"},
      {"name": "Kai Karlsson", "email": "kai@example.com"}
    ],
    "latestUpdate": {
      "date": "2026-01-20",
      "week": 1,
      "participants": ["Gabriel", "Helena", "Isak", "Jasmine", "Kai"],
      "workDone": [
        "Set up basic application and defined project dependencies",
        "Containerized the application with Docker",
        "Configured container to run as non-root user for increased security",
        "Wrote unit tests to verify application responds correctly",
        "Implemented CI pipeline in GitHub Actions that automatically runs tests and builds Docker image"
      ],
      "blockers": [
        "Initial issues with personal Git account already connected from before"
      ],
      "status": "green",
      "nextSteps": [
        "Start work on Phase 2"
      ]
    },
    "score": {
      "total": 200,
      "breakdown": {
        "boilerRoomSubmissions": 50,
        "labCompletions": 0,
        "participation": 0,
        "codeQuality": 0,
        "helpingOthers": 0
      },
      "achievements": [
        {
          "id": "technical-excellence-w1",
          "name": "Technical Excellence",
          "points": 100,
          "earnedDate": "2026-01-20",
          "icon": "🏗️"
        },
        {
          "id": "security-conscious-w1",
          "name": "Security Conscious",
          "points": 50,
          "earnedDate": "2026-01-20",
          "icon": "🔒"
        }
      ]
    }
  }
};

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const malmoTeams = Object.entries(teams).filter(([, team]) => team.location === 'Malmö');
  const jonkopingTeams = Object.entries(teams).filter(([, team]) => team.location === 'Jönköping');

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent SSR of protected content
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-7xl font-black text-white mb-4 tracking-tight">
            TEAM FLAGS
          </h1>
          <p className="text-slate-300 text-xl">
            IT- och Cybersäkerhetstekniker 2026
          </p>
          <div className="flex gap-6 justify-center mt-6 text-sm text-slate-400">
            <div>
              <span className="font-bold text-blue-400">{malmoTeams.length}</span> teams in Malmö
            </div>
            <div>
              <span className="font-bold text-purple-400">{jonkopingTeams.length}</span> teams in Jönköping
            </div>
            <div>
              <span className="font-bold text-green-400">{Object.keys(teams).length}</span> teams total
            </div>
          </div>
        </div>

        {/* Tournament Standings */}
        <TournamentStandings teams={teams} />

        {/* Malmö Teams */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-blue-400 mb-8 flex items-center gap-3">
            <span className="text-5xl">📍</span>
            Malmö Teams
          </h2>
          <div className="grid gap-8">
            {malmoTeams.map(([teamNumber, team]) => (
              <TeamBanner
                key={teamNumber}
                teamNumber={teamNumber}
                team={team}
              />
            ))}
          </div>
        </div>

        {/* Jönköping Teams */}
        <div>
          <h2 className="text-4xl font-bold text-purple-400 mb-8 flex items-center gap-3">
            <span className="text-5xl">📍</span>
            Jönköping Teams
          </h2>
          <div className="grid gap-8">
            {jonkopingTeams.map(([teamNumber, team]) => (
              <TeamBanner
                key={teamNumber}
                teamNumber={teamNumber}
                team={team}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
