
import React, { useState, useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nyTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(time);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-sm flex items-center justify-center font-mono font-bold text-slate-950">
            N
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white uppercase">Nullu <span className="text-slate-500 font-light">FX Ops</span></h1>
            <div className="flex items-center gap-2 text-[10px] text-emerald-500/80 font-mono tracking-widest uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Agent Active • Institutional Feed
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">New York Time</div>
            <div className="text-xl font-mono text-white tracking-tighter">{nyTime}</div>
          </div>
          <div className="hidden md:block">
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Operations Node</div>
            <div className="text-sm font-mono text-slate-300">SEC-ALPHA-9</div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col gap-6">
        {children}
      </main>

      {/* Footer / Footer Alert Bar */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-3 flex justify-between items-center text-[10px] text-slate-600 uppercase tracking-widest">
        <div>Proprietary Intelligence System &copy; 2024</div>
        <div className="flex gap-4">
          <span className="text-slate-400">USD/JPY</span>
          <span className="text-slate-400">GBP/JPY</span>
          <span className="text-slate-400">EUR/USD</span>
          <span className="text-slate-400">AUD/USD</span>
        </div>
        <div className="text-emerald-500/50">Connectivity: Stable</div>
      </footer>
    </div>
  );
};
