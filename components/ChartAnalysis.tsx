
import React, { useState, useRef } from 'react';

interface ChartInput {
  base64: string;
  mimeType: string;
  label: string;
}

interface ChartAnalysisProps {
  onAnalyze: (charts: ChartInput[]) => Promise<void>;
  isAnalyzing: boolean;
}

export const ChartAnalysis: React.FC<ChartAnalysisProps> = ({ onAnalyze, isAnalyzing }) => {
  const [charts, setCharts] = useState<Record<string, ChartInput | null>>({
    '4 Hour Chart': null,
    '1 Hour Chart': null,
    '15 Minute Chart': null
  });

  const fileInputRefs = {
    '4 Hour Chart': useRef<HTMLInputElement>(null),
    '1 Hour Chart': useRef<HTMLInputElement>(null),
    '15 Minute Chart': useRef<HTMLInputElement>(null)
  };

  const handleFileChange = (label: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fullBase64 = reader.result as string;
        setCharts(prev => ({
          ...prev,
          [label]: {
            base64: fullBase64.split(',')[1],
            mimeType: file.type,
            label: label
          }
        }));
      };
      reader.readAsDataURL(file);
    }
    // Reset the input value so the same file can be re-selected if needed
    e.target.value = '';
  };

  const removeChart = (label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCharts(prev => ({
      ...prev,
      [label]: null
    }));
  };

  const handleAnalyze = async () => {
    const chartList = Object.values(charts).filter((c): c is ChartInput => c !== null);
    if (chartList.length > 0) {
      await onAnalyze(chartList);
      setCharts({
        '4 Hour Chart': null,
        '1 Hour Chart': null,
        '15 Minute Chart': null
      });
    }
  };

  const isAnyUploaded = Object.values(charts).some(c => c !== null);
  const isReady = Object.values(charts).every(c => c !== null);

  return (
    <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-xs font-mono text-emerald-500 uppercase tracking-[0.2em] mb-2">Top-Down Multi-Timeframe Vision</h3>
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest leading-relaxed">
          Upload charts for HTF Bias (4H), Structural Analysis (1H), and Entry Confirmation (15M). Click any frame to change it.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.keys(charts).map((label) => (
          <div key={label} className="flex flex-col gap-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{label}</span>
              {charts[label] && (
                <button 
                  onClick={(e) => removeChart(label, e)}
                  className="text-[10px] text-red-500/70 hover:text-red-500 font-mono uppercase transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            <div 
              onClick={() => fileInputRefs[label as keyof typeof fileInputRefs].current?.click()}
              className={`group relative aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                charts[label] ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRefs[label as keyof typeof fileInputRefs]} 
                onChange={(e) => handleFileChange(label, e)} 
                accept="image/*" 
                className="hidden" 
              />
              
              {charts[label] ? (
                <>
                  <img 
                    src={`data:${charts[label]!.mimeType};base64,${charts[label]!.base64}`} 
                    alt={label} 
                    className="w-full h-full object-cover transition-opacity group-hover:opacity-40" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-widest bg-slate-950/80 px-3 py-1.5 rounded-sm border border-emerald-500/30">
                      Change Image
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <svg className="w-6 h-6 text-slate-700 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">Select Frame</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 border-t border-slate-800 pt-6">
        <div className="flex-1 space-y-2 w-full">
          <div className="flex justify-between text-[10px] text-slate-500 font-mono uppercase">
            <span>Scan Depth</span>
            <span>Multi-Timeframe</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono uppercase">
            <span>Projection Engine</span>
            <span>Risk-Optimized</span>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!isAnyUploaded || isAnalyzing}
          className={`w-full md:w-64 py-3 rounded-sm font-mono text-[10px] uppercase tracking-[0.2em] transition-all ${
            !isAnyUploaded || isAnalyzing 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
              : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20'
          }`}
        >
          {isAnalyzing ? 'Processing Nodes...' : `Analyze ${isReady ? 'Full Matrix' : 'Available Charts'}`}
        </button>
      </div>
    </div>
  );
};
