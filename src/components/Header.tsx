import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'checker' | 'generator' | 'lab' | 'algorithm';
  onSelectTab: (tab: 'checker' | 'generator' | 'lab' | 'algorithm') => void;
  onQuickGenerate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onQuickGenerate,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, single line */}
        <button
          onClick={() => onSelectTab('checker')}
          className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/40 transition-colors shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            KeyGuard
          </span>
        </button>

        {/* Zone 2: 4 nav links, 1-2 word labels, single-line */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-400">
          <button
            onClick={() => onSelectTab('checker')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'checker'
                ? 'text-white bg-slate-900 border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            Checker
          </button>
          <button
            onClick={() => onSelectTab('generator')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'generator'
                ? 'text-white bg-slate-900 border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            Generator
          </button>
          <button
            onClick={() => onSelectTab('lab')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'lab'
                ? 'text-white bg-slate-900 border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            Comparison Lab
          </button>
          <button
            onClick={() => onSelectTab('algorithm')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'algorithm'
                ? 'text-white bg-slate-900 border border-slate-800'
                : 'hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            Algorithm Rules
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onQuickGenerate}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm shadow-emerald-500/10 whitespace-nowrap shrink-0 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Secure</span>
          </button>
        </div>
      </div>

      {/* Mobile nav subbar */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-900 bg-slate-950/90 text-xs font-medium text-slate-400">
        <button
          onClick={() => onSelectTab('checker')}
          className={`py-1 px-2.5 rounded ${activeTab === 'checker' ? 'text-white bg-slate-900' : ''}`}
        >
          Checker
        </button>
        <button
          onClick={() => onSelectTab('generator')}
          className={`py-1 px-2.5 rounded ${activeTab === 'generator' ? 'text-white bg-slate-900' : ''}`}
        >
          Generator
        </button>
        <button
          onClick={() => onSelectTab('lab')}
          className={`py-1 px-2.5 rounded ${activeTab === 'lab' ? 'text-white bg-slate-900' : ''}`}
        >
          Lab
        </button>
        <button
          onClick={() => onSelectTab('algorithm')}
          className={`py-1 px-2.5 rounded ${activeTab === 'algorithm' ? 'text-white bg-slate-900' : ''}`}
        >
          Rules
        </button>
      </div>
    </header>
  );
};
