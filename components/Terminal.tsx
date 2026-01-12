
import React, { useState } from 'react';

interface TerminalProps {
  onCommand: (cmd: string) => void;
  isThinking: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({ onCommand, isThinking }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isThinking) {
      onCommand(input.trim());
      setInput('');
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 font-mono">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-red-500"></div>
        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
        <span className="ml-2 text-xs text-slate-500 uppercase">Command Interface</span>
      </div>
      <form onSubmit={handleSubmit} className="relative group">
        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-emerald-500 font-bold select-none">
          {isThinking ? '...' : '>'}
        </span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isThinking}
          placeholder={isThinking ? "Intelligence node processing..." : "Nullu: [request]"}
          className="w-full bg-transparent border-none outline-none pl-6 text-emerald-400 text-sm placeholder:text-slate-700 disabled:opacity-50"
          autoFocus
        />
      </form>
    </div>
  );
};
