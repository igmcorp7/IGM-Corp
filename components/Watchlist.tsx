
import React from 'react';
import { FXPair } from '../types';

interface PairCardProps {
  pair: FXPair;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  volatility: 'LOW' | 'MED' | 'HIGH';
  isSelected: boolean;
  onClick: () => void;
}

const PairCard: React.FC<PairCardProps> = ({ pair, bias, volatility, isSelected, onClick }) => {
  const biasColors = {
    BULLISH: 'text-emerald-500',
    BEARISH: 'text-red-500',
    NEUTRAL: 'text-slate-500'
  };

  return (
    <button 
      onClick={onClick}
      className={`text-left transition-all duration-200 bg-slate-900/30 border p-4 rounded-lg flex flex-col gap-1 group hover:bg-slate-900/50 ${
        isSelected ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-slate-800'
      }`}
    >
      <div className="flex justify-between items-start w-full">
        <span className={`text-sm font-bold transition-colors ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
          {pair}
        </span>
        <div className={`text-[9px] px-1.5 py-0.5 rounded-sm border transition-colors ${
          isSelected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
          volatility === 'HIGH' ? 'border-amber-900/50 text-amber-500/70' : 'border-slate-800 text-slate-600'
        }`}>
          {volatility} VOL
        </div>
      </div>
      <div className={`text-xl font-mono font-medium tracking-tighter ${biasColors[bias]}`}>
        {bias}
      </div>
      <div className="mt-2 h-1 w-full bg-slate-800/50 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${bias === 'BULLISH' ? 'bg-emerald-500' : bias === 'BEARISH' ? 'bg-red-500' : 'bg-slate-600'}`} 
          style={{ width: bias === 'NEUTRAL' ? '50%' : '85%' }}
        ></div>
      </div>
      <div className="flex justify-between text-[9px] text-slate-600 mt-1 font-mono uppercase tracking-widest">
        <span>Bias Score</span>
        <span className={isSelected ? 'text-emerald-500' : ''}>{bias === 'NEUTRAL' ? '50%' : '85%'}</span>
      </div>
    </button>
  );
};

interface WatchlistProps {
  selectedPair: FXPair | null;
  onSelect: (pair: FXPair) => void;
}

export const Watchlist: React.FC<WatchlistProps> = ({ selectedPair, onSelect }) => {
  const pairs: Array<{pair: FXPair, bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL', volatility: 'LOW' | 'MED' | 'HIGH'}> = [
    { pair: "EUR/USD", bias: "BEARISH", volatility: "MED" },
    { pair: "USD/JPY", bias: "BULLISH", volatility: "HIGH" },
    { pair: "GBP/JPY", bias: "BULLISH", volatility: "HIGH" },
    { pair: "AUD/USD", bias: "NEUTRAL", volatility: "LOW" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {pairs.map(p => (
        <PairCard 
          key={p.pair} 
          {...p} 
          isSelected={selectedPair === p.pair}
          onClick={() => onSelect(p.pair)}
        />
      ))}
    </div>
  );
};
