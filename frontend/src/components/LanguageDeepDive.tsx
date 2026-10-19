import React from "react";
import { X, BookOpen, Cpu } from "lucide-react";

interface Props {
  explanation: string | null;
  onClose: () => void;
  language: string;
}

export const LanguageDeepDive: React.FC<Props> = ({ explanation, onClose, language }) => {
  if (!explanation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-xl border border-blue-500/30 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-blue-400 mb-4">
          <BookOpen className="h-6 w-6" />
          <h2 className="text-xl font-bold tracking-wide">
            Language Engine Masterclass: <span className="uppercase text-amber-400">{language}</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 p-3 bg-blue-950/40 border border-blue-800/40 rounded-lg text-xs font-mono text-blue-200 mb-4">
          <Cpu className="h-4 w-4" />
          Analyzing runtime memory semantics, stack allocation & execution cycle.
        </div>

        <div className="max-h-[60vh] overflow-y-auto space-y-3 text-sm text-slate-300 leading-relaxed pr-2 font-sans whitespace-pre-wrap">
          {explanation}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            Return to Defense
          </button>
        </div>
      </div>
    </div>
  );
};