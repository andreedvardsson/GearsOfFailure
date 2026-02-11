'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface AsciiDiagramProps {
  content: string;
  id: string;
}

export default function AsciiDiagram({ content, id }: AsciiDiagramProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id={id}
      className="bg-slate-950 rounded-lg border border-green-500/30 overflow-hidden relative group"
    >
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 bg-slate-800 hover:bg-slate-700 text-green-400 p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Copy to clipboard"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
      <div className="overflow-x-auto p-6">
        <pre
          className="text-green-400 text-sm select-all"
          style={{
            fontFamily: 'Monaco, "Courier New", Courier, monospace',
            lineHeight: '1.4',
            letterSpacing: '0',
            whiteSpace: 'pre',
            tabSize: 4,
          }}
        >
{content.trim()}
        </pre>
      </div>
    </div>
  );
}
