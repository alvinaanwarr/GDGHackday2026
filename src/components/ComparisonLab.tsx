import React, { useState } from 'react';
import {
  GitCompare,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  Copy,
  Check
} from 'lucide-react';
import {
  checkPassword,
  PasswordAnalysis,
  SAMPLE_PASSWORDS,
} from '../utils/passwordChecker';

interface ComparisonLabProps {
  onLoadIntoChecker: (password: string) => void;
}

export const ComparisonLab: React.FC<ComparisonLabProps> = ({
  onLoadIntoChecker,
}) => {
  const [passwordA, setPasswordA] = useState('welcome2026!');
  const [passwordB, setPasswordB] = useState('wK9#mP2$vL7!xQ4&');

  const [copiedA, setCopiedA] = useState(false);
  const [copiedB, setCopiedB] = useState(false);

  const analysisA: PasswordAnalysis = checkPassword(passwordA);
  const analysisB: PasswordAnalysis = checkPassword(passwordB);

  const handleCopy = async (pwd: string, setCopied: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(pwd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 4) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score === 3) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Comparison & Heuristic Lab
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Test and contrast two passwords side-by-side to understand how length additions, character variety, and pattern avoidance impact the net score.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-md">
            <GitCompare className="w-3.5 h-3.5" />
            <span>Differential Scoring</span>
          </span>
        </div>
      </div>

      {/* Preset Comparison Pairs */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 backdrop-blur-sm">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Test Benchmark Scenarios
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => {
              setPasswordA('admin123');
              setPasswordB('aB3#xK9$mQ2!vL7&');
            }}
            className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 text-left transition-colors cursor-pointer"
          >
            <div className="text-xs font-medium text-slate-200">
              Dictionary vs Complex 16
            </div>
            <div className="mt-1 text-[11px] font-mono text-slate-400 truncate">
              admin123 (1/5) vs aB3#... (5/5)
            </div>
          </button>

          <button
            onClick={() => {
              setPasswordA('qwer111zzz');
              setPasswordB('qwerX911#zZz!');
            }}
            className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 text-left transition-colors cursor-pointer"
          >
            <div className="text-xs font-medium text-slate-200">
              Pattern Penalized vs Disrupted
            </div>
            <div className="mt-1 text-[11px] font-mono text-slate-400 truncate">
              Repeats & sequences trigger -1 pt
            </div>
          </button>

          <button
            onClick={() => {
              setPasswordA('correct-horse-battery-staple');
              setPasswordB('Tr0ub4dor&3');
            }}
            className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 text-left transition-colors cursor-pointer"
          >
            <div className="text-xs font-medium text-slate-200">
              Diceware Passphrase vs Short Leet
            </div>
            <div className="mt-1 text-[11px] font-mono text-slate-400 truncate">
              28 chars length vs 11 chars
            </div>
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password A Column */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 backdrop-blur-sm space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Subject A
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getScoreBadge(
                analysisA.score
              )}`}
            >
              {analysisA.score}/5 · {analysisA.scoreLabel}
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={passwordA}
              onChange={(e) => setPasswordA(e.target.value)}
              placeholder="Enter first password..."
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-emerald-500 rounded-lg px-3.5 py-2.5 pr-20 text-white font-mono text-sm tracking-wide"
            />
            <div className="absolute right-2 top-2 flex items-center gap-1">
              <button
                onClick={() => handleCopy(passwordA, setCopiedA)}
                className="p-1.5 text-slate-400 hover:text-white rounded"
                title="Copy password"
              >
                {copiedA ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-lg">
              <div className="text-[11px] text-slate-400">Length</div>
              <div className="mt-0.5 text-sm font-mono font-semibold text-white tabular-nums">
                {passwordA.length} chars
              </div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-lg">
              <div className="text-[11px] text-slate-400">Variety</div>
              <div className="mt-0.5 text-sm font-mono font-semibold text-white tabular-nums">
                {analysisA.charTypes.distinctTypesCount}/4 types
              </div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-lg">
              <div className="text-[11px] text-slate-400">Penalty</div>
              <div
                className={`mt-0.5 text-sm font-mono font-semibold tabular-nums ${
                  analysisA.pointsBreakdown.patternPenalty < 0
                    ? 'text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                {analysisA.pointsBreakdown.patternPenalty} pt
              </div>
            </div>
          </div>

          {/* Points Breakdown */}
          <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-lg text-xs space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Length Points (&ge;8, 12, 16):</span>
              <span className="font-mono text-white">+{analysisA.pointsBreakdown.lengthPoints}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Variety Points (&ge;2, 3 types):</span>
              <span className="font-mono text-white">+{analysisA.pointsBreakdown.varietyPoints}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Obvious Pattern Penalty:</span>
              <span className="font-mono text-rose-400">
                {analysisA.pointsBreakdown.patternPenalty}
              </span>
            </div>
            <div className="pt-1 border-t border-slate-800 flex justify-between font-semibold text-slate-200">
              <span>Net Score (clamped 1-5):</span>
              <span className="font-mono text-emerald-400">{analysisA.score} / 5</span>
            </div>
          </div>

          {/* Warnings List */}
          {analysisA.warnings.length > 0 ? (
            <div className="space-y-1 text-xs">
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Patterns Detected:
              </span>
              {analysisA.warnings.map((w, i) => (
                <div
                  key={i}
                  className="font-mono text-[11px] text-rose-300 bg-rose-950/20 border border-rose-900/30 p-2 rounded"
                >
                  - {w}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-emerald-400 flex items-center gap-1.5 p-2 bg-emerald-950/20 border border-emerald-900/30 rounded">
              <ShieldCheck className="w-4 h-4" />
              <span>No obvious patterns detected</span>
            </div>
          )}

          <button
            onClick={() => onLoadIntoChecker(passwordA)}
            className="w-full py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Load into Detailed Checker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Password B Column */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 backdrop-blur-sm space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Subject B
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getScoreBadge(
                analysisB.score
              )}`}
            >
              {analysisB.score}/5 · {analysisB.scoreLabel}
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={passwordB}
              onChange={(e) => setPasswordB(e.target.value)}
              placeholder="Enter second password..."
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-emerald-500 rounded-lg px-3.5 py-2.5 pr-20 text-white font-mono text-sm tracking-wide"
            />
            <div className="absolute right-2 top-2 flex items-center gap-1">
              <button
                onClick={() => handleCopy(passwordB, setCopiedB)}
                className="p-1.5 text-slate-400 hover:text-white rounded"
                title="Copy password"
              >
                {copiedB ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-lg">
              <div className="text-[11px] text-slate-400">Length</div>
              <div className="mt-0.5 text-sm font-mono font-semibold text-white tabular-nums">
                {passwordB.length} chars
              </div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-lg">
              <div className="text-[11px] text-slate-400">Variety</div>
              <div className="mt-0.5 text-sm font-mono font-semibold text-white tabular-nums">
                {analysisB.charTypes.distinctTypesCount}/4 types
              </div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-lg">
              <div className="text-[11px] text-slate-400">Penalty</div>
              <div
                className={`mt-0.5 text-sm font-mono font-semibold tabular-nums ${
                  analysisB.pointsBreakdown.patternPenalty < 0
                    ? 'text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                {analysisB.pointsBreakdown.patternPenalty} pt
              </div>
            </div>
          </div>

          {/* Points Breakdown */}
          <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-lg text-xs space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Length Points (&ge;8, 12, 16):</span>
              <span className="font-mono text-white">+{analysisB.pointsBreakdown.lengthPoints}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Variety Points (&ge;2, 3 types):</span>
              <span className="font-mono text-white">+{analysisB.pointsBreakdown.varietyPoints}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Obvious Pattern Penalty:</span>
              <span className="font-mono text-rose-400">
                {analysisB.pointsBreakdown.patternPenalty}
              </span>
            </div>
            <div className="pt-1 border-t border-slate-800 flex justify-between font-semibold text-slate-200">
              <span>Net Score (clamped 1-5):</span>
              <span className="font-mono text-emerald-400">{analysisB.score} / 5</span>
            </div>
          </div>

          {/* Warnings List */}
          {analysisB.warnings.length > 0 ? (
            <div className="space-y-1 text-xs">
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Patterns Detected:
              </span>
              {analysisB.warnings.map((w, i) => (
                <div
                  key={i}
                  className="font-mono text-[11px] text-rose-300 bg-rose-950/20 border border-rose-900/30 p-2 rounded"
                >
                  - {w}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-emerald-400 flex items-center gap-1.5 p-2 bg-emerald-950/20 border border-emerald-900/30 rounded">
              <ShieldCheck className="w-4 h-4" />
              <span>No obvious patterns detected</span>
            </div>
          )}

          <button
            onClick={() => onLoadIntoChecker(passwordB)}
            className="w-full py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Load into Detailed Checker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
