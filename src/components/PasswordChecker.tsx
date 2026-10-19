import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  CheckCircle2,
  Sliders,
  ArrowRight,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import {
  generatePassword,
  checkPassword,
  PasswordAnalysis,
} from '../utils/passwordChecker';

interface PasswordGeneratorProps {
  onSendToChecker: (password: string) => void;
}

export const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({
  onSendToChecker,
}) => {
  const [length, setLength] = useState<number>(16);
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [numbers, setNumbers] = useState<boolean>(true);
  const [symbols, setSymbols] = useState<boolean>(true);

  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [batchPasswords, setBatchPasswords] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Compute minimum length required
  const minRequiredLength = 1 + (uppercase ? 1 : 0) + (numbers ? 1 : 0) + (symbols ? 1 : 0);

  const generateNew = useCallback(() => {
    try {
      const effectiveLength = Math.max(minRequiredLength, length);
      const newPwd = generatePassword({
        length: effectiveLength,
        uppercase,
        numbers,
        symbols,
      });
      setGeneratedPassword(newPwd);

      // Also generate 4 batch variations
      const batch: string[] = [];
      for (let i = 0; i < 4; i++) {
        batch.push(
          generatePassword({
            length: effectiveLength,
            uppercase,
            numbers,
            symbols,
          })
        );
      }
      setBatchPasswords(batch);
    } catch (e) {
      console.error('Generation error:', e);
    }
  }, [length, uppercase, numbers, symbols, minRequiredLength]);

  useEffect(() => {
    generateNew();
  }, [generateNew]);

  const handleCopyMain = async () => {
    if (!generatedPassword) return;
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyBatch = async (pwd: string, index: number) => {
    try {
      await navigator.clipboard.writeText(pwd);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Fallback
    }
  };

  // Inspect the generated password through the heuristic checker
  const analysis: PasswordAnalysis = checkPassword(generatedPassword);

  // Helper to colorize characters by type
  const renderColorizedPassword = (pwd: string) => {
    return (
      <span className="font-mono tracking-wider break-all text-lg sm:text-xl selection:bg-emerald-500/30">
        {pwd.split('').map((char, i) => {
          if (char >= '0' && char <= '9') {
            return (
              <span key={i} className="text-amber-400 font-medium">
                {char}
              </span>
            );
          }
          if (char >= 'A' && char <= 'Z') {
            return (
              <span key={i} className="text-sky-300 font-medium">
                {char}
              </span>
            );
          }
          if (char >= 'a' && char <= 'z') {
            return (
              <span key={i} className="text-slate-200">
                {char}
              </span>
            );
          }
          // Symbols
          return (
            <span key={i} className="text-emerald-400 font-bold">
              {char}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Secure Password Generator
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Cryptographically secure random generation via Web Crypto API (<code className="font-mono text-emerald-400 text-xs">secrets.SystemRandom</code> equivalent). Guaranteed character set coverage and unbiased Fisher-Yates shuffle.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Guaranteed Set Invariant</span>
          </span>
        </div>
      </div>

      {/* Main Showcase Generated Output */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="uppercase tracking-wider font-semibold text-slate-300">
              Primary Generated Password
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono tabular-nums">{generatedPassword.length} characters</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-emerald-400 font-mono font-medium">
              Score: {analysis.score}/5 ({analysis.scoreLabel})
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-300" /> a-z
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-300" /> A-Z
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> 0-9
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Special
            </span>
          </div>
        </div>

        {/* Highlighted Password Container */}
        <div className="p-4 sm:p-5 rounded-lg bg-slate-950/90 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            {renderColorizedPassword(generatedPassword)}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={generateNew}
              title="Generate new password"
              className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
              aria-label="Regenerate password"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopyMain}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={() => onSendToChecker(generatedPassword)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
            >
              <span>Test in Checker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Generator Controls Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 backdrop-blur-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            Generation Parameters
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Min allowed: {minRequiredLength}
          </span>
        </div>

        {/* Length Slider & Presets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="length-slider"
              className="text-xs font-medium text-slate-300 flex items-center gap-2"
            >
              <span>Password Length</span>
              <span className="text-slate-500 font-normal">
                (Python script recommends 16 or more)
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={minRequiredLength}
                max={64}
                value={length}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setLength(Math.max(minRequiredLength, Math.min(64, val)));
                }}
                className="w-16 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-center text-sm font-mono text-white focus:border-emerald-500 focus:outline-none tabular-nums"
              />
              <span className="text-xs text-slate-500 font-mono">chars</span>
            </div>
          </div>

          <input
            id="length-slider"
            type="range"
            min={minRequiredLength}
            max={64}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />

          {/* Quick Length Preset Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-slate-500">Presets:</span>
            {[12, 16, 20, 24, 32].map((preset) => (
              <button
                key={preset}
                onClick={() => setLength(preset)}
                className={`px-2.5 py-1 text-xs rounded font-mono transition-colors cursor-pointer ${
                  length === preset
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Character Sets Toggles */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-medium text-slate-300">
            Selected Character Sets
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Lowercase (Always required by Python script) */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-slate-200">
                  Lowercase (a-z)
                </div>
                <div className="text-[11px] text-slate-500">
                  Always included per algorithm
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded">
                Required
              </span>
            </div>

            {/* Uppercase */}
            <label
              className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                uppercase
                  ? 'bg-slate-950/80 border-emerald-500/40'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div>
                <div className="text-xs font-medium text-slate-200">
                  Uppercase (A-Z)
                </div>
                <div className="text-[11px] text-slate-500">
                  Include capital letters
                </div>
              </div>
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </label>

            {/* Numbers */}
            <label
              className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                numbers
                  ? 'bg-slate-950/80 border-emerald-500/40'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div>
                <div className="text-xs font-medium text-slate-200">
                  Numbers (0-9)
                </div>
                <div className="text-[11px] text-slate-500">
                  Include digits
                </div>
              </div>
              <input
                type="checkbox"
                checked={numbers}
                onChange={(e) => setNumbers(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </label>

            {/* Symbols */}
            <label
              className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                symbols
                  ? 'bg-slate-950/80 border-emerald-500/40'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div>
                <div className="text-xs font-medium text-slate-200">
                  Symbols (!@#$)
                </div>
                <div className="text-[11px] text-slate-500">
                  Include punctuation
                </div>
              </div>
              <input
                type="checkbox"
                checked={symbols}
                onChange={(e) => setSymbols(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Alternative Batch Variations */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Alternative Candidates
          </h2>
          <span className="text-xs text-slate-500">
            Generated with identical criteria
          </span>
        </div>

        <div className="space-y-2.5">
          {batchPasswords.map((candidate, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="font-mono text-sm tracking-wide text-slate-300 truncate">
                {candidate}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCopyBatch(candidate, idx)}
                  className="px-2.5 py-1 text-xs rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onSendToChecker(candidate)}
                  title="Check this variation"
                  className="p-1.5 text-slate-400 hover:text-emerald-400 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
                  aria-label="Inspect candidate in checker"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
