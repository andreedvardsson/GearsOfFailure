'use client';

import TeamBanner from '../components/TeamBanner';
import Navigation from '../components/Navigation';
import ProtectedRoute from '../components/ProtectedRoute';

interface TeamMember {
  name: string;
  email: string;
}

interface Team {
  name: string;
  location: string;
  members: TeamMember[];
  warning?: string;
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
    ]
  },
  "2": {
    "name": "Container Crew ⚡",
    "location": "Malmö",
    "members": [
      {"name": "Fiona Foster", "email": "fiona@example.com"},
      {"name": "George Green", "email": "george@example.com"},
      {"name": "Hannah Hill", "email": "hannah@example.com"},
      {"name": "Ian Ibrahim", "email": "ian@example.com"}
    ]
  },
  "3": {
    "name": "Kubernetes Knights ⚔️",
    "location": "Malmö",
    "members": [
      {"name": "Julia Jackson", "email": "julia@example.com"},
      {"name": "Kevin Kim", "email": "kevin@example.com"},
      {"name": "Luna López", "email": "luna@example.com"}
    ],
    "warning": "Only 3 members - should have 4-5"
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  }
};

export default function TeamsPage() {
  const malmoTeams = Object.entries(teams).filter(([, team]) => team.location === 'Malmö');
  const jonkopingTeams = Object.entries(teams).filter(([, team]) => team.location === 'Jönköping');

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
