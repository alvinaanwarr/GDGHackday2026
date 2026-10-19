import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import {
  PasswordAnalysis,
  checkPassword,
  SAMPLE_PASSWORDS,
} from '../utils/passwordChecker';

interface PasswordCheckerProps {
  initialPassword?: string;
  onNavigateToGenerator: () => void;
}

export const PasswordChecker: React.FC<PasswordCheckerProps> = ({
  initialPassword = '',
  onNavigateToGenerator,
}) => {
  const [password, setPassword] = useState(initialPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const analysis: PasswordAnalysis = checkPassword(password);

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleClear = () => {
    setPassword('');
  };

  const getScoreColor = (score: number) => {
    switch (score) {
      case 1:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 2:
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 3:
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 4:
        return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
      case 5:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getSegmentColor = (score: number, index: number) => {
    if (index >= score) return 'bg-slate-800';
    if (score <= 1) return 'bg-rose-500';
    if (score === 2) return 'bg-amber-500';
    if (score === 3) return 'bg-yellow-400';
    if (score === 4) return 'bg-teal-400';
    return 'bg-emerald-400';
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Password Strength Inspector
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Heuristic scoring based on length thresholds, character diversity, and detection of repeated characters, sequences, or common password patterns.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Client-Side Privacy</span>
          </span>
        </div>
      </div>

      {/* Main Interactive Input Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="password-input"
            className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            Password to Check
          </label>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="font-mono tabular-nums">
              {password.length} {password.length === 1 ? 'char' : 'chars'}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono tabular-nums">
              {analysis.entropyBits} bits entropy
            </span>
          </div>
        </div>

        {/* Password Input Field with Controls */}
        <div className="relative flex items-center">
          <input
            id="password-input"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type or paste a password to analyze..."
            autoComplete="off"
            spellCheck="false"
            className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-4 py-3.5 pr-28 text-white font-mono text-base tracking-wider placeholder:text-slate-600 placeholder:font-sans placeholder:tracking-normal transition-all"
          />

          <div className="absolute right-2 flex items-center gap-1">
            {password && (
              <button
                type="button"
                onClick={handleClear}
                title="Clear input"
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                aria-label="Clear password input"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? 'Hide password' : 'Show password'}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-slate-300" />
              ) : (
                <Eye className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {password && (
              <button
                type="button"
                onClick={handleCopy}
                title="Copy password"
                className="p-1.5 text-slate-400 hover:text-emerald-400 rounded hover:bg-slate-800 transition-colors relative"
                aria-label="Copy password to clipboard"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-400">
          <span className="text-slate-500">Quick tests:</span>
          {SAMPLE_PASSWORDS.slice(0, 4).map((sample) => (
            <button
              key={sample.label}
              onClick={() => setPassword(sample.password)}
              className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors font-mono cursor-pointer"
            >
              {sample.password}
            </button>
          ))}
          <button
            onClick={onNavigateToGenerator}
            className="ml-auto inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <span>Need a strong one?</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Primary Score & Status Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Heuristic Score
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getScoreColor(
                  analysis.score
                )}`}
              >
                {password ? analysis.scoreLabel : 'Awaiting Input'}
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold font-mono tracking-tight text-white tabular-nums">
                {password ? analysis.score : 0}
              </span>
              <span className="text-xl font-medium text-slate-500 font-mono">
                / 5
              </span>
            </div>
          </div>

          {/* 5-segment Score Meter */}
          <div className="w-full sm:w-64 space-y-2">
            <div className="grid grid-cols-5 gap-1.5 h-3">
              {[0, 1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className={`rounded-sm transition-all duration-300 ${
                    password ? getSegmentColor(analysis.score, index) : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>1: Very Weak</span>
              <span>3: Fair</span>
              <span>5: Strong</span>
            </div>
          </div>
        </div>

        {/* Scoring Breakdown Math Formula */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Length Points</span>
              <span className="font-mono text-white font-semibold tabular-nums">
                +{analysis.pointsBreakdown.lengthPoints} / 3
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              +1 each for 8+, 12+, 16+ chars
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Variety Points</span>
              <span className="font-mono text-white font-semibold tabular-nums">
                +{analysis.pointsBreakdown.varietyPoints} / 2
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              +1 for 2+ types, +1 for 3+ types
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Pattern Penalty</span>
              <span
                className={`font-mono font-semibold tabular-nums ${
                  analysis.pointsBreakdown.patternPenalty < 0
                    ? 'text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                {analysis.pointsBreakdown.patternPenalty} pt
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              -1 if repeat, sequence, or word found
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Suggestions & Character Variety */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Suggestions & Action Items */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              Checker Feedback & Suggestions
            </h2>
            <span className="text-xs text-slate-500">
              {analysis.suggestions.length}{' '}
              {analysis.suggestions.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <ul className="space-y-2.5">
            {analysis.suggestions.map((suggestion, idx) => {
              const isWarning =
                suggestion.startsWith('Avoid') ||
                suggestion.startsWith('Enter');
              const isSuccess = suggestion.startsWith('No obvious issues');

              return (
                <li
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg text-xs leading-relaxed border ${
                    isSuccess
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                      : isWarning
                      ? 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300'
                  }`}
                >
                  {isSuccess ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  )}
                  <span>{suggestion}</span>
                </li>
              );
            })}
          </ul>

          {/* Warnings Section if patterns are found */}
          {analysis.warnings.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 mb-2">
                <ShieldAlert className="w-4 h-4" />
                Detected Vulnerability Warnings
              </div>
              <div className="space-y-1.5 text-xs text-slate-400">
                {analysis.warnings.map((warning, wIdx) => (
                  <div
                    key={wIdx}
                    className="flex items-center gap-2 font-mono text-[11px] text-rose-300 bg-rose-950/30 px-2.5 py-1.5 rounded border border-rose-900/40"
                  >
                    <span>⚠</span>
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Character Variety Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Character Variety ({analysis.charTypes.distinctTypesCount}/4 types)
            </h2>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {analysis.pointsBreakdown.varietyPoints} pts
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Lowercase */}
            <div
              className={`p-3 rounded-lg border transition-all ${
                analysis.charTypes.hasLowercase
                  ? 'bg-slate-950/80 border-emerald-500/30'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">
                  Lowercase (a-z)
                </span>
                {analysis.charTypes.hasLowercase ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600" />
                )}
              </div>
              <div className="mt-2 text-xs font-mono text-slate-400 tabular-nums">
                {analysis.charTypes.countLowercase} characters
              </div>
            </div>

            {/* Uppercase */}
            <div
              className={`p-3 rounded-lg border transition-all ${
                analysis.charTypes.hasUppercase
                  ? 'bg-slate-950/80 border-emerald-500/30'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">
                  Uppercase (A-Z)
                </span>
                {analysis.charTypes.hasUppercase ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600" />
                )}
              </div>
              <div className="mt-2 text-xs font-mono text-slate-400 tabular-nums">
                {analysis.charTypes.countUppercase} characters
              </div>
            </div>

            {/* Numbers */}
            <div
              className={`p-3 rounded-lg border transition-all ${
                analysis.charTypes.hasNumbers
                  ? 'bg-slate-950/80 border-emerald-500/30'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">
                  Numbers (0-9)
                </span>
                {analysis.charTypes.hasNumbers ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600" />
                )}
              </div>
              <div className="mt-2 text-xs font-mono text-slate-400 tabular-nums">
                {analysis.charTypes.countNumbers} characters
              </div>
            </div>

            {/* Symbols */}
            <div
              className={`p-3 rounded-lg border transition-all ${
                analysis.charTypes.hasSymbols
                  ? 'bg-slate-950/80 border-emerald-500/30'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">
                  Symbols (!@#$)
                </span>
                {analysis.charTypes.hasSymbols ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600" />
                )}
              </div>
              <div className="mt-2 text-xs font-mono text-slate-400 tabular-nums">
                {analysis.charTypes.countSymbols} characters
              </div>
            </div>
          </div>

          {/* Length Threshold Progress */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Length Thresholds</span>
              <span className="font-mono text-slate-300 tabular-nums">
                {password.length} / 16 recommended
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden flex">
              <div
                className={`transition-all duration-300 ${
                  password.length >= 16
                    ? 'bg-emerald-400'
                    : password.length >= 12
                    ? 'bg-teal-400'
                    : password.length >= 8
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, (password.length / 16) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>0</span>
              <span className={password.length >= 8 ? 'text-emerald-400' : ''}>8 (min)</span>
              <span className={password.length >= 12 ? 'text-emerald-400' : ''}>12 (good)</span>
              <span className={password.length >= 16 ? 'text-emerald-400' : ''}>16+ (ideal)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Telemetry & Brute-Force Estimates */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Theoretical Brute-Force Resistance
          </h2>
          <span className="text-xs text-slate-500">NIST SP 800-63B Grounding</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-4">
            <div className="text-xs text-slate-400">Online Guessing (100 / sec)</div>
            <div className="mt-1 text-lg font-mono font-semibold text-white tabular-nums">
              {password ? analysis.estimatedCrackTime : '—'}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Web login rate-limited with CAPTCHA or lockout protection.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-4">
            <div className="text-xs text-slate-400">Offline GPU Rig (100B / sec)</div>
            <div className="mt-1 text-lg font-mono font-semibold text-white tabular-nums">
              {password ? analysis.crackTimeOfflineGPU : '—'}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Attacker has stolen hashed database and cracks offline.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-4">
            <div className="text-xs text-slate-400">Entropy Measure</div>
            <div className="mt-1 text-lg font-mono font-semibold text-emerald-400 tabular-nums">
              {password ? `${analysis.entropyBits} bits` : '0 bits'}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {analysis.entropyBits >= 64
                ? 'High security resistance against mass dictionary searches.'
                : 'Consider increasing length to exceed 64 bits of entropy.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
