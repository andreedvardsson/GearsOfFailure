'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ndt7 from '@m-lab/ndt7';

interface LeaderboardEntry {
  _id?: string;
  name: string;
  speedMbps: number;
  createdAt: string;
}

const MLAB_PRIVACY_URL = 'https://www.measurementlab.net/privacy-v3/';
const DEFAULT_GAUGE_MAX = 5000;

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function normalizeElapsedSeconds(elapsed: number) {
  if (!Number.isFinite(elapsed) || elapsed <= 0) return null;
  if (elapsed > 1_000_000) return elapsed / 1_000_000;
  if (elapsed > 1_000) return elapsed / 1_000;
  return elapsed;
}

function estimateMbps(measurement: any) {
  if (Number.isFinite(measurement?.MeanClientMbps)) {
    return measurement.MeanClientMbps;
  }
  if (Number.isFinite(measurement?.NumBytes) && Number.isFinite(measurement?.ElapsedTime)) {
    const seconds = normalizeElapsedSeconds(measurement.ElapsedTime);
    if (!seconds) return null;
    return (measurement.NumBytes * 8) / seconds / 1_000_000;
  }
  const appInfo = measurement?.AppInfo || measurement?.AppInfo?.AppInfo;
  const numBytes = appInfo?.NumBytes;
  const elapsed = appInfo?.ElapsedTime;
  if (!Number.isFinite(numBytes) || !Number.isFinite(elapsed)) return null;
  const seconds = normalizeElapsedSeconds(elapsed);
  if (!seconds) return null;
  return (numBytes * 8) / seconds / 1_000_000;
}

function estimatePingMs(measurement: any) {
  const tcpInfo = measurement?.TCPInfo || measurement?.TCPInfo?.TCPInfo;
  const minRtt =
    tcpInfo?.MinRTT ??
    tcpInfo?.MinRtt ??
    tcpInfo?.MinRTTUs ??
    tcpInfo?.MinRttUs ??
    tcpInfo?.MinRTTusec ??
    tcpInfo?.MinRttUsec;
  if (!Number.isFinite(minRtt) || minRtt <= 0) return null;
  // NDT7 typically reports RTT in microseconds.
  return minRtt / 1000;
}

function parseServerMeasurement(message: any) {
  if (typeof message === 'string') {
    try {
      return JSON.parse(message);
    } catch {
      return null;
    }
  }
  return message || null;
}

function SpeedGauge({
  value,
  label,
  pingMs,
  max = DEFAULT_GAUGE_MAX,
}: {
  value: number | null;
  label: string;
  pingMs?: number | null;
  max?: number;
}) {
  const safeValue = Math.max(0, value ?? 0);
  const cappedMax = Math.max(max, 100);
  const progress = Math.min(safeValue / cappedMax, 1);
  const circumference = 314; // approx for r=50
  const dash = circumference * progress;
  const needleAngle = -90 + 180 * progress;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/80 p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <div className="mt-3 flex items-center justify-center">
        <svg viewBox="0 0 200 120" className="h-28 w-full max-w-[220px]">
          <path
            d="M20 100 A80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(148,163,184,0.25)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M20 100 A80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(59,130,246,0.9)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
          />
          <circle cx="100" cy="100" r="6" fill="rgba(59,130,246,0.9)" />
          <line
            x1="100"
            y1="100"
            x2={100 + 70 * Math.cos((needleAngle * Math.PI) / 180)}
            y2={100 + 70 * Math.sin((needleAngle * Math.PI) / 180)}
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="mt-2 text-center">
        <p className="text-2xl font-semibold text-white">
          {value !== null ? `${value.toFixed(2)} Mbps` : '–'}
        </p>
        <p className="text-xs text-slate-400">
          Ping {pingMs !== null ? `${pingMs.toFixed(1)} ms` : '–'}
        </p>
        <p className="text-xs text-slate-500">Max {cappedMax} Mbps</p>
      </div>
    </div>
  );
}

export default function SpeedtestPage() {
  const [name, setName] = useState('');
  const [downloadMbps, setDownloadMbps] = useState<number | null>(null);
  const [uploadMbps, setUploadMbps] = useState<number | null>(null);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testPhase, setTestPhase] = useState<'idle' | 'download' | 'upload' | 'complete'>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stopCallbacksRef = useRef<(() => void)[]>([]);
  const stopRequestedRef = useRef(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataPolicyAccepted, setDataPolicyAccepted] = useState(false);

  const canSave = useMemo(() => {
    return !!name.trim() && downloadMbps !== null && !isSaving;
  }, [name, downloadMbps, isSaving]);

  async function fetchLeaderboard() {
    try {
      const response = await fetch('/api/speedtest/leaderboard?limit=20', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Kunde inte hämta leaderboard.');
      }
      const data = await response.json();
      setLeaderboard(data.results || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError('Leaderboard är inte tillgänglig just nu.');
    }
  }

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  function registerStop(callback: () => void) {
    stopCallbacksRef.current.push(callback);
    return () => {
      stopCallbacksRef.current = stopCallbacksRef.current.filter((cb) => cb !== callback);
    };
  }

  function stopActiveTests() {
    stopRequestedRef.current = true;
    stopCallbacksRef.current.forEach((cb) => cb());
    stopCallbacksRef.current = [];
  }

  async function runWorkerTest(
    workerFile: string,
    urls: Record<string, string>,
    callbacks: {
      onStart?: (data: any) => void;
      onMeasurement?: (payload: { Source: string; Data: any }) => void;
      onComplete?: (payload: { LastClientMeasurement: any; LastServerMeasurement: any }) => void;
      onError?: (message: string) => void;
    }
  ) {
    if (typeof Worker === 'undefined') {
      throw new Error('Web Workers stöds inte i denna webbläsare.');
    }

    return new Promise<number>((resolve, reject) => {
      const worker = new Worker(workerFile);
      let lastClientMeasurement: any = null;
      let lastServerMeasurement: any = null;
      let done = false;

      const cleanup = () => {
        if (done) return;
        done = true;
        worker.terminate();
        clearTimeout(timeoutId);
        unregisterStop();
      };

      const stopHandler = () => {
        cleanup();
        reject(new Error('Testet avbröts.'));
      };

      const unregisterStop = registerStop(stopHandler);

      const timeoutId = setTimeout(() => {
        cleanup();
        if (callbacks.onComplete) {
          callbacks.onComplete({
            LastClientMeasurement: lastClientMeasurement,
            LastServerMeasurement: lastServerMeasurement,
          });
        }
        resolve(0);
      }, 12000);

      worker.onmessage = (event: MessageEvent) => {
        const data = event.data;
        if (!data || !data.MsgType || data.MsgType === 'error') {
          const message = data?.Error || 'Worker error';
          if (callbacks.onError) callbacks.onError(message);
          cleanup();
          reject(new Error(message));
          return;
        }

        if (data.MsgType === 'start') {
          if (callbacks.onStart) callbacks.onStart(data.Data);
          return;
        }

        if (data.MsgType === 'measurement') {
          if (data.Source === 'server') {
            lastServerMeasurement = parseServerMeasurement(data.ServerMessage);
            if (lastServerMeasurement && callbacks.onMeasurement) {
              callbacks.onMeasurement({ Source: 'server', Data: lastServerMeasurement });
            }
          } else {
            lastClientMeasurement = data.ClientData;
            if (callbacks.onMeasurement) {
              callbacks.onMeasurement({ Source: 'client', Data: data.ClientData });
            }
          }
          return;
        }

        if (data.MsgType === 'complete') {
          cleanup();
          if (callbacks.onComplete) {
            callbacks.onComplete({
              LastClientMeasurement: lastClientMeasurement,
              LastServerMeasurement: lastServerMeasurement,
            });
          }
          resolve(0);
        }
      };

      worker.onerror = () => {
        if (callbacks.onError) callbacks.onError('Worker error');
        cleanup();
        reject(new Error('Worker error'));
      };

      worker.postMessage(urls);
    });
  }

  async function runNdt7Once() {
    let bestDownload = 0;
    let bestUpload = 0;
    let bestPing: number | null = null;

    const config = {
      userAcceptedDataPolicy: dataPolicyAccepted,
      metadata: {
        client_name: 'lillteamet-speedtest',
        client_version: '1.0.0',
      },
      downloadworkerfile: '/ndt7-download-worker.js',
      uploadworkerfile: '/ndt7-upload-worker.js',
    };

    const urls = await ndt7.discoverServerURLs(config, {
      error: () => {},
    });

    if (stopRequestedRef.current) {
      throw new Error('Testet avbröts.');
    }

    const downloadCode = await runWorkerTest('/ndt7-download-worker.js', urls, {
      onStart: () => {
        setTestPhase('download');
      },
      onMeasurement: ({ Source, Data }) => {
        if (Source === 'client') {
          const speed = estimateMbps(Data);
          if (speed === null || !Number.isFinite(speed)) return;
          if (speed > bestDownload) {
            bestDownload = speed;
            setDownloadMbps(speed);
          }
        } else {
          const ping = estimatePingMs(Data);
          if (ping !== null && Number.isFinite(ping)) {
            bestPing = bestPing === null ? ping : Math.min(bestPing, ping);
            setPingMs(bestPing);
          }
        }
      },
      onComplete: ({ LastClientMeasurement }) => {
        const speed = estimateMbps(LastClientMeasurement);
        if (speed !== null && Number.isFinite(speed) && speed > bestDownload) {
          bestDownload = speed;
          setDownloadMbps(speed);
        }
      },
      onError: () => {},
    });

    if (stopRequestedRef.current) {
      throw new Error('Testet avbröts.');
    }

    const uploadCode = await runWorkerTest('/ndt7-upload-worker.js', urls, {
      onStart: () => {
        setTestPhase('upload');
      },
      onMeasurement: ({ Source, Data }) => {
        if (Source === 'client') {
          const speed = estimateMbps(Data);
          if (speed === null || !Number.isFinite(speed)) return;
          if (speed > bestUpload) {
            bestUpload = speed;
            setUploadMbps(speed);
          }
        } else {
          const ping = estimatePingMs(Data);
          if (ping !== null && Number.isFinite(ping)) {
            bestPing = bestPing === null ? ping : Math.min(bestPing, ping);
            setPingMs(bestPing);
          }
        }
      },
      onComplete: ({ LastClientMeasurement }) => {
        const speed = estimateMbps(LastClientMeasurement);
        if (speed !== null && Number.isFinite(speed) && speed > bestUpload) {
          bestUpload = speed;
          setUploadMbps(speed);
        }
      },
      onError: () => {},
    });

    if (downloadCode !== 0 || uploadCode !== 0) {
      throw new Error(`Testet misslyckades (code ${downloadCode}/${uploadCode}).`);
    }

    setTestPhase('complete');
    return { download: bestDownload, upload: bestUpload, ping: bestPing };
  }

  async function handleTest() {
    if (!dataPolicyAccepted) {
      setError('Du måste godkänna M-Lab data policy innan testet kan köras.');
      return;
    }

    setError(null);
    setIsTesting(true);
    setTestPhase('idle');
    setDownloadMbps(null);
    setUploadMbps(null);
    setPingMs(null);
    stopRequestedRef.current = false;
    stopCallbacksRef.current = [];
    try {
      const result = await runNdt7Once();
      setDownloadMbps(result.download ?? null);
      setUploadMbps(result.upload ?? null);
      setPingMs(result.ping ?? null);
    } catch (err) {
      console.error(err);
      if (err instanceof Error && err.message === 'Testet avbröts.') {
        setError('Testet avbröts.');
      } else {
        setError('Testet misslyckades. Försök igen.');
      }
    } finally {
      setIsTesting(false);
    }
  }

  function handleStop() {
    stopActiveTests();
    setIsTesting(false);
    setTestPhase('idle');
    setError('Testet avbröts.');
  }

  async function handleSave() {
    if (!canSave) return;
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/speedtest/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          speedMbps: downloadMbps,
        }),
      });

      if (!response.ok) {
        throw new Error('Kunde inte spara resultat.');
      }

      await fetchLeaderboard();
    } catch (err) {
      console.error(err);
      setError('Kunde inte spara resultatet.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Global Speedtest</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-white">Lillteamet Leaderboard</h1>
          <p className="text-slate-300 max-w-2xl">
            Kör ett speedtest mot M-Lab-servrar, spara ditt namn och jämför med resten av gruppen. Resultatet
            som sparas är nedladdningshastigheten.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Namn</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Skriv ditt namn"
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={dataPolicyAccepted}
                  onChange={(event) => setDataPolicyAccepted(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-900 text-blue-500"
                />
                <span>
                  Jag godkänner att M-Lab sparar och publicerar testdata enligt deras{' '}
                  <a href={MLAB_PRIVACY_URL} target="_blank" rel="noreferrer" className="text-blue-300 underline">
                    privacy policy
                  </a>
                  .
                </span>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleTest}
                disabled={isTesting}
                className="rounded-lg bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-blue-800"
              >
                {isTesting ? 'Testar…' : 'Kör test'}
              </button>
              <button
                onClick={handleStop}
                disabled={!isTesting}
                className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Stoppa
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? 'Sparar…' : 'Spara resultat'}
              </button>
              <button
                onClick={fetchLeaderboard}
                className="rounded-lg border border-white/10 px-4 py-3 text-sm text-slate-200 hover:border-white/30"
              >
                Uppdatera
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SpeedGauge
                value={downloadMbps}
                label={testPhase === 'download' ? 'Nedladdning (pågår)' : 'Nedladdning'}
                pingMs={pingMs}
              />
              <SpeedGauge
                value={uploadMbps}
                label={testPhase === 'upload' ? 'Uppladdning (pågår)' : 'Uppladdning'}
                pingMs={pingMs}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-slate-950/70 p-3 text-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Ping</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {pingMs !== null ? `${pingMs.toFixed(1)} ms` : '–'}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-950/70 p-3 text-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Ned</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {downloadMbps !== null ? `${downloadMbps.toFixed(2)} Mbps` : '–'}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-950/70 p-3 text-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Upp</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {uploadMbps !== null ? `${uploadMbps.toFixed(2)} Mbps` : '–'}
                </p>
              </div>
            </div>

            {error && <p className="text-sm text-rose-300">{error}</p>}
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Topp 20</h2>
              {lastUpdated && (
                <p className="text-xs text-slate-400">Uppdaterad {lastUpdated.toLocaleTimeString('sv-SE')}</p>
              )}
            </div>
            <ol className="mt-4 space-y-3">
              {leaderboard.length === 0 && (
                <li className="text-sm text-slate-400">Inga resultat ännu.</li>
              )}
              {leaderboard.map((entry, index) => (
                <li
                  key={`${entry._id || entry.name}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-950/60 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {index + 1}. {entry.name}
                    </p>
                    <p className="text-xs text-slate-400">{formatDate(entry.createdAt)}</p>
                  </div>
                  <span className="text-sm font-semibold text-blue-300">
                    {entry.speedMbps.toFixed(2)} Mbps
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

      </div>
    </div>
  );
}
