
import React from 'react';
import { SMCConfirmation } from '../types';

interface SMCMonitorProps {
  confirmations: SMCConfirmation[];
  pair: string;
  isScanning: boolean;
}

export const SMCMonitor: React.FC<SMCMonitorProps> = ({ confirmations, pair, isScanning }) => {
  const filtered = confirmations.filter(c => c.pair === pair);

  return (
    <div className="bg-slate-900/20 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <h3 className="text-xs font-mono text-emerald-500 uppercase tracking-[0.2em]">Tactical Confirmations: {pair}</h3>
        </div>
        {isScanning && (
          <span className="text-[10px] text-slate-500 font-mono animate-pulse uppercase">Scanning Flow...</span>
        )}
      </div>

      <div className="p-4 space-y-3 min-h-[200px] max-h-[300px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-slate-700">
            <svg className="w-8 h-8 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-[10px] uppercase tracking-widest font-mono">No valid SMC signals detected</p>
          </div>
        ) : (
          filtered.map((conf, idx) => (
            <div key={idx} className="bg-slate-950/50 border border-slate-800/50 p-3 rounded flex flex-col gap-2 transition-all hover:border-emerald-500/30">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                  {conf.type.replace('_', ' ')}
                </span>
                <span className="text-[9px] text-slate-600 font-mono">
                  {new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(conf.timestamp)}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                {conf.details}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-0.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${conf.confidence}%` }}></div>
                </div>
                <span className="text-[9px] text-emerald-500/70 font-mono">{conf.confidence}% CONF</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-2 bg-slate-900/20 border-t border-slate-800/50 text-[9px] text-slate-600 font-mono uppercase tracking-[0.1em] flex justify-between">
        <span>Path of Least Resistance: Identified</span>
        <span>SMC Node: Active</span>
      </div>
    </div>
  );
};
