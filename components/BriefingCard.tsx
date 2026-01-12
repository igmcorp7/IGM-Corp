
import React from 'react';
import { Briefing } from '../types';

interface BriefingCardProps {
  briefing: Briefing;
}

export const BriefingCard: React.FC<BriefingCardProps> = ({ briefing }) => {
  const isAlert = briefing.type === 'ALERT';
  const isVision = briefing.type === 'CHART_ANALYSIS';

  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('#') || line.match(/^[0-9]\)/)) {
        return <h3 key={i} className="text-emerald-400 font-bold mt-4 mb-2 uppercase text-xs tracking-wider">{line}</h3>;
      }
      if (line.startsWith('-') || line.startsWith('*')) {
        return <div key={i} className="flex gap-2 pl-2 mb-1"><span className="text-slate-600">•</span><p className="text-slate-300 text-sm leading-relaxed">{line.replace(/^[-*]\s*/, '')}</p></div>;
      }
      if (line.trim() === "Not financial advice.") {
        return <p key={i} className="text-[10px] text-slate-500 font-mono mt-6 border-t border-slate-800 pt-4 uppercase tracking-widest">{line}</p>;
      }
      return line.trim() ? <p key={i} className="text-slate-400 text-sm leading-relaxed mb-3">{line}</p> : <br key={i} />;
    });
  };

  return (
    <div className={`border ${isAlert ? 'border-red-900/50 bg-red-950/5' : isVision ? 'border-emerald-900/30 bg-emerald-950/5' : 'border-slate-800 bg-slate-900/20'} rounded-lg overflow-hidden transition-all hover:border-slate-700`}>
      <div className={`px-5 py-3 border-b ${isAlert ? 'border-red-900/30' : isVision ? 'border-emerald-900/20' : 'border-slate-800'} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-widest ${
            isAlert ? 'bg-red-500 text-white' : isVision ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
          }`}>
            {briefing.type}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            ID-{briefing.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
        <div className="text-xs text-slate-500 font-mono uppercase">
          {new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }).format(briefing.timestamp)}
        </div>
      </div>
      <div className="p-6">
        {briefing.images && briefing.images.length > 0 && (
          <div className="mb-6 space-y-4">
            {briefing.images.map((img, idx) => (
              <div key={idx} className="rounded-md overflow-hidden border border-slate-800 bg-slate-950 p-1">
                <div className="text-[9px] text-slate-600 font-mono uppercase tracking-widest mb-1 px-1 flex justify-between">
                  <span>Annotated Frame {idx + 1}</span>
                  <span className="text-emerald-500">SMC Marked</span>
                </div>
                <img src={img} alt={`Annotated Chart ${idx}`} className="w-full h-auto object-contain bg-slate-900" />
              </div>
            ))}
          </div>
        )}
        
        <div className="prose prose-invert max-w-none">
          {formatContent(briefing.content)}
        </div>

        {briefing.sources && briefing.sources.length > 0 && (
          <div className="mt-8 pt-4 border-t border-slate-800/50">
            <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Grounding Sources</h4>
            <div className="flex flex-wrap gap-2">
              {briefing.sources.map((source, idx) => (
                <a 
                  key={idx}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] bg-slate-800/50 hover:bg-slate-800 text-slate-400 px-3 py-1.5 rounded-sm flex items-center gap-2 border border-slate-800 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
