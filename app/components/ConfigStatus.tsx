'use client';

import { CheckCircle2, AlertCircle, Info, Server, Database, Shield, Container } from 'lucide-react';

interface ConfigStatusProps {
  firebaseConfigured: boolean;
  mongoConfigured: boolean;
  dockerComposeMode?: boolean;
  nginxConfigured?: boolean;
}

export default function ConfigStatus({
  firebaseConfigured,
  mongoConfigured,
  dockerComposeMode = false,
  nginxConfigured = false,
}: ConfigStatusProps) {
  // Determine which week/phase based on configuration
  const isWeek3Complete = dockerComposeMode && mongoConfigured;
  const isWeek2Complete = !dockerComposeMode && mongoConfigured;
  const allConfigured = firebaseConfigured && mongoConfigured;

  // Calculate completion percentage
  const completedItems = [
    true, // Docker running
    mongoConfigured,
    dockerComposeMode,
    nginxConfigured,
    firebaseConfigured,
  ].filter(Boolean).length;
  const totalItems = 5;
  const completionPercent = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            isWeek3Complete ? 'bg-green-500/20' : 'bg-blue-500/20'
          }`}>
            {isWeek3Complete ? (
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            ) : (
              <Container className="w-10 h-10 text-blue-400" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isWeek3Complete
              ? 'Docker Compose Running! 🚀'
              : dockerComposeMode
                ? 'Docker Compose Active 🐳'
                : 'Docker Container Running! 🐳'
            }
          </h1>
          <p className="text-slate-300">
            {isWeek3Complete
              ? 'All 3 services are healthy and connected'
              : 'Your application is running in Docker'
            }
          </p>

          {/* Progress Bar */}
          <div className="mt-4 max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Configuration Progress</span>
              <span>{completionPercent}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Service Status Grid */}
        <div className="grid gap-3 mb-8">
          {/* Docker/Container */}
          <StatusCard
            icon={<Container className="w-5 h-5" />}
            title="Docker Container"
            status="running"
            detail="Next.js app on port 3000"
          />

          {/* Nginx (Week 3) */}
          <StatusCard
            icon={<Server className="w-5 h-5" />}
            title="Nginx Reverse Proxy"
            status={nginxConfigured ? 'running' : dockerComposeMode ? 'running' : 'not_configured'}
            detail={nginxConfigured || dockerComposeMode
              ? 'Proxying on port 80 with security headers'
              : 'Add with Docker Compose (Week 3)'
            }
          />

          {/* MongoDB */}
          <StatusCard
            icon={<Database className="w-5 h-5" />}
            title="MongoDB Database"
            status={mongoConfigured ? 'connected' : 'not_configured'}
            detail={mongoConfigured
              ? dockerComposeMode
                ? 'Local container on port 27017'
                : 'Connected via Atlas or local'
              : 'Set MONGODB_URI in .env'
            }
          />

          {/* Firebase */}
          <StatusCard
            icon={<Shield className="w-5 h-5" />}
            title="Firebase Authentication"
            status={firebaseConfigured ? 'configured' : 'optional'}
            detail={firebaseConfigured
              ? 'Auth ready'
              : 'Optional - Add in Week 5-6'
            }
          />
        </div>

        {/* Week Info Box */}
        <div className={`rounded-lg p-4 mb-6 ${
          isWeek3Complete
            ? 'bg-green-500/10 border border-green-500/30'
            : 'bg-blue-500/10 border border-blue-500/30'
        }`}>
          <div className="flex items-start gap-3">
            <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              isWeek3Complete ? 'text-green-400' : 'text-blue-400'
            }`} />
            <div>
              <h4 className={`font-semibold mb-1 ${
                isWeek3Complete ? 'text-green-300' : 'text-blue-300'
              }`}>
                {isWeek3Complete
                  ? 'Week 3: Docker Compose Complete!'
                  : dockerComposeMode
                    ? 'Week 3: Docker Compose'
                    : 'Week 2: Docker Basics'
                }
              </h4>
              <p className={`text-sm ${
                isWeek3Complete ? 'text-green-200' : 'text-blue-200'
              }`}>
                {isWeek3Complete
                  ? 'Your 3-service architecture is fully operational. Nginx routes traffic to Next.js, which connects to MongoDB. All health checks passing!'
                  : dockerComposeMode
                    ? 'Docker Compose is orchestrating your services. Check the logs with: docker compose logs -f'
                    : 'You\'re learning Docker basics. The app runs in a single container. Week 3 adds multi-container orchestration.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Architecture Diagram */}
        <div className="border-t border-slate-700 pt-6">
          <h3 className="font-semibold text-white mb-3">
            {dockerComposeMode ? 'Docker Compose Architecture:' : 'Your Docker Journey:'}
          </h3>

          {dockerComposeMode ? (
            // Week 3: Docker Compose Architecture
            <pre className={`bg-slate-900/50 p-4 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed ${isWeek3Complete ? 'text-green-400' : 'text-blue-400'}`}>
{`                    +----------------+
                    |    Browser     |
                    |   :80 / :443   |
                    +-------+--------+
                            |
  +-------------------------+-------------------------+
  |                         v                         |
  |   +-----------------------------------------------+
  |   |         NGINX - Reverse Proxy           [${nginxConfigured || dockerComposeMode ? 'x' : 'o'}]  |
  |   +------------------------+----------------------+
  |                            |
  |                     frontend-net
  |                            |
  |                            v
  |   +-----------------------------------------------+
  |   |         NEXT.JS APP - Port 3000         [x]  |
  |   +------------------------+----------------------+
  |                            |
  |                      backend-net
  |                            |
  |                            v
  |   +-----------------------------------------------+
  |   |         MONGODB - Port 27017            [${mongoConfigured ? 'x' : 'o'}]  |
  |   +-----------------------------------------------+
  |                                                   |
  +---------------------------------------------------+
                    docker-compose.yml

${isWeek3Complete
  ? '  [x] Week 3 Complete: All 3 services healthy!'
  : '  [...] Week 3 In Progress: Check status above'}`}
            </pre>
          ) : (
            // Week 2: Single Container
            <pre className="bg-slate-900/50 p-4 rounded-lg text-xs text-green-400 font-mono overflow-x-auto leading-relaxed">
{`┌──────────────────────────────────────────────────────────────┐
│           Multi-Stage Docker Build Process                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [STAGE 1] deps (Dependencies)                   [✓] DONE   │
│  ┌────────────────────────────────────────────┐             │
│  │  FROM node:20-alpine                       │             │
│  │  COPY package*.json → RUN npm ci           │             │
│  └────────────────────────────────────────────┘             │
│                                                              │
│  [STAGE 2] builder (Build)                       [✓] DONE   │
│  ┌────────────────────────────────────────────┐             │
│  │  COPY source code → RUN npm run build      │             │
│  │  Creates optimized production build        │             │
│  └────────────────────────────────────────────┘             │
│                                                              │
│  [STAGE 3] runner (Production)                   [✓] DONE   │
│  ┌────────────────────────────────────────────┐             │
│  │  Non-root user (nextjs:nodejs)             │             │
│  │  Standalone build (~150MB vs 1GB)          │             │
│  │  Health check configured                   │             │
│  └────────────────────────────────────────────┘             │
│                                                              │
└──────────────────────────────────────────────────────────────┘

[✓] Week 2 Complete! Ready for Week 3: Docker Compose`}
            </pre>
          )}
        </div>

        {/* Achievements / What's Configured */}
        <div className="mt-6 border-t border-slate-700 pt-6">
          <h3 className="font-semibold text-white mb-3">
            {isWeek3Complete ? 'Week 3 Achievements:' : 'What\'s Configured:'}
          </h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <Achievement done={true} text="Docker container running with health checks" />
            <Achievement done={true} text="Multi-stage Dockerfile (optimized image size)" />
            <Achievement done={true} text="Non-root user for security" />
            <Achievement done={mongoConfigured} text="MongoDB database connected" />
            <Achievement done={dockerComposeMode} text="Docker Compose orchestration (3 services)" />
            <Achievement done={nginxConfigured || dockerComposeMode} text="Nginx reverse proxy with security headers" />
            <Achievement done={dockerComposeMode} text="Network isolation (frontend-net, backend-net)" />
            <Achievement done={dockerComposeMode} text="Persistent volumes for database" />
            <Achievement done={firebaseConfigured} text="Firebase authentication configured" />
          </ul>
        </div>

        {/* Commands Helper */}
        {dockerComposeMode && (
          <div className="mt-6 border-t border-slate-700 pt-6">
            <h3 className="font-semibold text-white mb-3">Useful Commands:</h3>
            <div className="bg-slate-900/50 rounded-lg p-4 space-y-2 text-xs font-mono">
              <code className="block text-slate-300">
                <span className="text-slate-500"># View all services</span>
              </code>
              <code className="block text-green-400">docker compose ps</code>
              <code className="block text-slate-300 mt-3">
                <span className="text-slate-500"># View logs</span>
              </code>
              <code className="block text-green-400">docker compose logs -f</code>
              <code className="block text-slate-300 mt-3">
                <span className="text-slate-500"># Check health</span>
              </code>
              <code className="block text-green-400">curl http://localhost/api/health</code>
              <code className="block text-slate-300 mt-3">
                <span className="text-slate-500"># Seed database</span>
              </code>
              <code className="block text-green-400">docker compose exec db mongosh team-flags-edu /tmp/seed-db.js</code>
            </div>
          </div>
        )}

        {/* Next Steps */}
        {!allConfigured && (
          <div className="mt-6 border-t border-slate-700 pt-6">
            <h3 className="font-semibold text-white mb-3">Coming Next:</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              {!dockerComposeMode && (
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">→</span>
                  <span><strong>Week 3:</strong> Docker Compose (nginx + app + mongodb)</span>
                </li>
              )}
              {!mongoConfigured && dockerComposeMode && (
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">!</span>
                  <span>MongoDB not connected - check MONGODB_URI in .env</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-slate-500">→</span>
                <span><strong>Week 4:</strong> CI/CD Pipeline with GitHub Actions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-500">→</span>
                <span><strong>Week 5-6:</strong> Security (Trivy scanning, Firebase auth)</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function StatusCard({
  icon,
  title,
  status,
  detail
}: {
  icon: React.ReactNode;
  title: string;
  status: 'running' | 'connected' | 'configured' | 'not_configured' | 'optional';
  detail: string;
}) {
  const statusConfig = {
    running: { bg: 'bg-green-500/10 border-green-500/30', icon: 'text-green-400', badge: 'Running' },
    connected: { bg: 'bg-green-500/10 border-green-500/30', icon: 'text-green-400', badge: 'Connected' },
    configured: { bg: 'bg-green-500/10 border-green-500/30', icon: 'text-green-400', badge: 'Configured' },
    not_configured: { bg: 'bg-yellow-500/10 border-yellow-500/30', icon: 'text-yellow-400', badge: 'Not Set' },
    optional: { bg: 'bg-slate-700/50 border-slate-600', icon: 'text-slate-400', badge: 'Optional' },
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${config.bg}`}>
      <div className={config.icon}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-white text-sm">{title}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            status === 'not_configured'
              ? 'bg-yellow-500/20 text-yellow-300'
              : status === 'optional'
                ? 'bg-slate-600 text-slate-300'
                : 'bg-green-500/20 text-green-300'
          }`}>
            {config.badge}
          </span>
        </div>
        <p className="text-xs text-slate-400 truncate">{detail}</p>
      </div>
      {status !== 'not_configured' && status !== 'optional' && (
        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
      )}
    </div>
  );
}

function Achievement({ done, text }: { done: boolean; text: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className={done ? 'text-green-400' : 'text-slate-600'}>
        {done ? '✓' : '○'}
      </span>
      <span className={done ? 'text-slate-300' : 'text-slate-500'}>{text}</span>
    </li>
  );
}
