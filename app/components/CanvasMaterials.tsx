'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { apiCall } from '@/lib/api-client';
import { BookOpen, FileText, ExternalLink, Loader2, File, Folder } from 'lucide-react';

interface MaterialItem {
  id: number;
  title: string;
  type: string;
  url?: string;
  week?: number | null;
}

interface CanvasMaterialsData {
  week: number;
  currentWeek: {
    pages: MaterialItem[];
    files: MaterialItem[];
    other: MaterialItem[];
  };
  allWeeks: MaterialItem[];
  generalFiles: MaterialItem[];
  configured: boolean;
}

export default function CanvasMaterials() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<CanvasMaterialsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllWeeks, setShowAllWeeks] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        const data = await apiCall('/api/canvas/materials', {}, user);
        setMaterials(data);
      } catch (err: any) {
        console.error('Error fetching Canvas materials:', err);
        setError(err.message || 'Failed to load materials');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !materials?.configured) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Canvas Materials</h2>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-300 text-sm">
            {error || 'Canvas integration not configured. Contact your instructor.'}
          </p>
        </div>
      </div>
    );
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'Page':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'File':
        return <File className="w-4 h-4 text-purple-400" />;
      case 'ExternalUrl':
        return <ExternalLink className="w-4 h-4 text-green-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-slate-400" />;
    }
  };

  const hasCurrentWeekContent =
    materials.currentWeek.pages.length > 0 ||
    materials.currentWeek.files.length > 0 ||
    materials.currentWeek.other.length > 0;

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Vecka {materials.week} Materials</h2>
        </div>
        <div className="text-xs text-slate-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
          From Canvas LMS
        </div>
      </div>

      <div className="space-y-6">
        {/* Current Week Materials */}
        {hasCurrentWeekContent ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Folder className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-white">This Week's Content</h3>
            </div>
            <div className="space-y-2">
              {/* Pages */}
              {materials.currentWeek.pages.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors group"
                >
                  {getItemIcon(item.type)}
                  <span className="flex-1 text-slate-300 group-hover:text-white">{item.title}</span>
                  <ExternalLink className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}

              {/* Files */}
              {materials.currentWeek.files.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-colors group"
                >
                  {getItemIcon(item.type)}
                  <span className="flex-1 text-slate-300 group-hover:text-white">{item.title}</span>
                  <ExternalLink className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}

              {/* Other items */}
              {materials.currentWeek.other.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-500/10 border border-slate-500/30 rounded-lg hover:bg-slate-500/20 transition-colors group"
                >
                  {getItemIcon(item.type)}
                  <span className="flex-1 text-slate-300 group-hover:text-white">{item.title}</span>
                  <ExternalLink className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No materials published for Vecka {materials.week} yet.</p>
            <p className="text-slate-500 text-sm mt-1">Check back soon or browse other weeks below.</p>
          </div>
        )}

        {/* All Weeks */}
        {materials.allWeeks.length > 0 && (
          <div>
            <button
              onClick={() => setShowAllWeeks(!showAllWeeks)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors mb-3"
            >
              <Folder className="w-4 h-4" />
              {showAllWeeks ? '▼' : '▶'} All Weeks ({materials.allWeeks.length} items)
            </button>

            {showAllWeeks && (
              <div className="space-y-2 pl-6">
                {materials.allWeeks.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 bg-slate-500/5 border border-slate-500/20 rounded hover:bg-slate-500/10 transition-colors group text-sm"
                  >
                    {getItemIcon(item.type)}
                    <span className="flex-1 text-slate-400 group-hover:text-white">{item.title}</span>
                    {item.week && (
                      <span className="text-xs text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded">
                        V{item.week}
                      </span>
                    )}
                    <ExternalLink className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* General Files */}
        {materials.generalFiles.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <File className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white text-sm">Course Files</h3>
            </div>
            <div className="space-y-2">
              {materials.generalFiles.slice(0, 5).map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 bg-purple-500/10 border border-purple-500/30 rounded hover:bg-purple-500/20 transition-colors group text-sm"
                >
                  <File className="w-4 h-4 text-purple-400" />
                  <span className="flex-1 text-slate-300 group-hover:text-white">{item.title}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
