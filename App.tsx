
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout } from './components/Layout';
import { Terminal } from './components/Terminal';
import { BriefingCard } from './components/BriefingCard';
import { Watchlist } from './components/Watchlist';
import { SMCMonitor } from './components/SMCMonitor';
import { ChartAnalysis } from './components/ChartAnalysis';
import { Briefing, FXPair, SMCConfirmation } from './types';
import { GeminiService, MultiChartInput } from './services/geminiService';
import { SCHEDULES } from './constants';

type Tab = 'OPERATIONS' | 'CHART_VISION';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('OPERATIONS');
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [confirmations, setConfirmations] = useState<SMCConfirmation[]>([]);
  const [selectedPair, setSelectedPair] = useState<FXPair | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  
  const geminiRef = useRef(new GeminiService());
  const checkedAlertsRef = useRef<Set<string>>(new Set());

  const addBriefing = useCallback((newBriefing: Briefing) => {
    setBriefings(prev => [newBriefing, ...prev]);
  }, []);

  const triggerSMCScan = async (pair: FXPair) => {
    setIsScanning(true);
    const conf = await geminiRef.current.analyzeSMC(pair);
    if (conf) {
      setConfirmations(prev => {
        return [conf, ...prev].slice(0, 20);
      });
    }
    setIsScanning(false);
  };

  const handleCommand = async (cmd: string) => {
    setIsThinking(true);
    const result = await geminiRef.current.executeCommand(cmd);
    addBriefing({
      id: crypto.randomUUID(),
      type: 'COMMAND',
      timestamp: new Date(),
      content: result.text,
      sources: result.sources,
    });
    setIsThinking(false);
  };

  const handleMultiChartAnalysis = async (charts: MultiChartInput[]) => {
    setIsAnalyzingImage(true);
    const result = await geminiRef.current.analyzeMultiTimeframeCharts(charts);
    addBriefing({
      id: crypto.randomUUID(),
      type: 'CHART_ANALYSIS',
      timestamp: new Date(),
      content: result.text,
      images: result.images,
    });
    setIsAnalyzingImage(false);
    setActiveTab('OPERATIONS');
  };

  const handlePairSelect = (pair: FXPair) => {
    setSelectedPair(pair);
    triggerSMCScan(pair);
  };

  const runScheduledCheck = useCallback(async () => {
    const now = new Date();
    const nyTimeStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now);
    
    const [h, m] = nyTimeStr.split(':').map(Number);
    const day = now.getUTCDay();

    let triggeredType: 'MORNING' | 'MIDDAY' | 'EOD' | null = null;
    if (h === SCHEDULES.MORNING.hour && m === SCHEDULES.MORNING.minute) triggeredType = 'MORNING';
    if (h === SCHEDULES.MIDDAY.hour && m === SCHEDULES.MIDDAY.minute) triggeredType = 'MIDDAY';
    if (h === SCHEDULES.EOD.hour && m === SCHEDULES.EOD.minute) triggeredType = 'EOD';

    const checkKey = `${triggeredType}-${now.toDateString()}`;
    if (triggeredType && !checkedAlertsRef.current.has(checkKey)) {
      if (day === 6) return;
      checkedAlertsRef.current.add(checkKey);
      setIsThinking(true);
      const res = await geminiRef.current.generateBriefing(day === 0 && triggeredType === 'EOD' ? 'WEEKLY' : triggeredType);
      addBriefing({
        id: crypto.randomUUID(),
        type: triggeredType,
        timestamp: new Date(),
        content: res.text,
        sources: res.sources,
      });
      setIsThinking(false);
    }

    if (m % 5 === 0 && !checkedAlertsRef.current.has(`alert-${h}-${m}`)) {
      checkedAlertsRef.current.add(`alert-${h}-${m}`);
      const alert = await geminiRef.current.checkExtremeAlert();
      if (alert) {
        addBriefing({
          id: crypto.randomUUID(),
          type: 'ALERT',
          timestamp: new Date(),
          content: alert.text,
          sources: alert.sources,
        });
      }
    }
  }, [addBriefing]);

  useEffect(() => {
    addBriefing({
      id: 'system-init',
      type: 'COMMAND',
      timestamp: new Date(),
      content: "Nullu initialized. Operations node online.\nSelect a pair for Tactical Monitoring or use Chart Vision for top-down scans.\n\nNot financial advice."
    });

    const interval = setInterval(runScheduledCheck, 30000);
    return () => clearInterval(interval);
  }, [runScheduledCheck]);

  return (
    <Layout>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em]">Institutional Watchlist</h2>
          <div className="text-[10px] text-slate-600 font-mono flex gap-3">
            <span>SMC STATUS: ACTIVE</span>
            <span>FUNDAMENTALS: SYNCED</span>
          </div>
        </div>
        <Watchlist selectedPair={selectedPair} onSelect={handlePairSelect} />
      </section>

      {selectedPair && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
          <SMCMonitor 
            pair={selectedPair} 
            confirmations={confirmations} 
            isScanning={isScanning} 
          />
        </section>
      )}

      <div className="border-b border-slate-900 flex gap-8">
        <button 
          onClick={() => setActiveTab('OPERATIONS')}
          className={`pb-3 text-[10px] font-mono uppercase tracking-[0.2em] transition-all relative ${
            activeTab === 'OPERATIONS' ? 'text-white' : 'text-slate-600 hover:text-slate-400'
          }`}
        >
          Operations Feed
          {activeTab === 'OPERATIONS' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('CHART_VISION')}
          className={`pb-3 text-[10px] font-mono uppercase tracking-[0.2em] transition-all relative ${
            activeTab === 'CHART_VISION' ? 'text-white' : 'text-slate-600 hover:text-slate-400'
          }`}
        >
          Chart Vision Sub-System
          {activeTab === 'CHART_VISION' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500"></div>}
        </button>
      </div>

      {activeTab === 'OPERATIONS' ? (
        <>
          <section>
            <Terminal onCommand={handleCommand} isThinking={isThinking} />
          </section>

          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h2 className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em]">Operations Feed</h2>
              <button 
                onClick={() => handleCommand("Nullu: Run a full market scan right now across all 4 pairs.")}
                className="text-[10px] text-emerald-500 hover:text-emerald-400 transition-colors font-mono uppercase tracking-widest"
              >
                Force Manual Scan
              </button>
            </div>
            
            {isThinking && briefings.length < 2 && (
              <div className="py-20 flex flex-col items-center justify-center gap-4 border border-slate-800 rounded-lg bg-slate-900/10">
                <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-emerald-500 font-mono text-xs animate-pulse uppercase tracking-widest">Compiling Intelligence...</p>
              </div>
            )}

            <div className="space-y-6">
              {briefings.map(briefing => (
                <BriefingCard key={briefing.id} briefing={briefing} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <ChartAnalysis onAnalyze={handleMultiChartAnalysis} isAnalyzing={isAnalyzingImage} />
        </section>
      )}
    </Layout>
  );
};

export default App;
