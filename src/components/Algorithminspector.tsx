import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Terminal,
  ShieldCheck
} from 'lucide-react';

const PYTHON_SOURCE_CODE = `import getpass
import re
import secrets
import string


def generate_password(length=16, uppercase=True, numbers=True, symbols=True):
    """Generate a password that includes each selected character type."""
    lowercase_chars = string.ascii_lowercase
    char_sets = [lowercase_chars]  # Always include lowercase letters.

    if uppercase:
        char_sets.append(string.ascii_uppercase)
    if numbers:
        char_sets.append(string.digits)
    if symbols:
        char_sets.append(string.punctuation)

    if length < len(char_sets):
        raise ValueError(
            f"Length must be at least {len(char_sets)} "
            "to include all selected character types."
        )

    all_chars = "".join(char_sets)

    # Include at least one character from every selected type.
    password_chars = [secrets.choice(chars) for chars in char_sets]

    # Fill the remaining length, then securely shuffle the result.
    password_chars.extend(
        secrets.choice(all_chars) for _ in range(length - len(password_chars))
    )
    secrets.SystemRandom().shuffle(password_chars)

    return "".join(password_chars)


def find_obvious_patterns(password):
    """Return simple warning messages for patterns a person may guess."""
    warnings = []
    lowered = password.lower()

    if re.search(r"(.)\\1{2,}", password):
        warnings.append("a character repeats three or more times")

    sequences = ("abcdefghijklmnopqrstuvwxyz", "0123456789", "qwertyuiop")
    for sequence in sequences:
        if any(sequence[i:i + 4] in lowered for i in range(len(sequence) - 3)):
            warnings.append("an obvious sequence appears (such as 1234, abcd, or qwer)")
            break

    common_examples = ("password", "letmein", "welcome", "admin", "123456")
    if any(example in lowered for example in common_examples):
        warnings.append("a very common password pattern appears")

    return warnings


def check_password(password):
    """Return a heuristic score from 1 to 5 and suggestions."""
    if not password:
        return 1, ["Enter a password to check."]

    points = 0
    suggestions = []

    # Length points: up to 3.
    if len(password) >= 8:
        points += 1
    if len(password) >= 12:
        points += 1
    if len(password) >= 16:
        points += 1

    if len(password) < 12:
        suggestions.append("Use at least 12 characters; aim for 16 or more.")
    elif len(password) < 16:
        suggestions.append("Consider using 16 or more characters.")

    # Variety points: up to 2.
    character_types = sum([
        any(char.islower() for char in password),
        any(char.isupper() for char in password),
        any(char.isdigit() for char in password),
        any(not char.isalnum() for char in password),
    ])

    if character_types >= 2:
        points += 1
    if character_types >= 3:
        points += 1
    if character_types < 3:
        suggestions.append(
            "Consider using more character types: lowercase, uppercase, "
            "numbers, and symbols."
        )

    warnings = find_obvious_patterns(password)
    if warnings:
        points -= 1
        suggestions.extend(f"Avoid {warning}." for warning in warnings)

    score = max(1, min(5, points))

    if not suggestions:
        suggestions.append("No obvious issues found by this simple checker.")

    return score, suggestions
`;

export const AlgorithmInspector: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(PYTHON_SOURCE_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Algorithm Specification & Logic
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Detailed breakdown of the Python heuristic scoring model, cryptographic generator invariants, and regex-based pattern detection.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-md">
            <Terminal className="w-3.5 h-3.5" />
            <span>Python 3.10+ Spec</span>
          </span>
        </div>
      </div>

      {/* 3 Pillars of the Heuristic Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            Pillar 1: Length (0 - 3 pts)
          </div>
          <h3 className="text-base font-bold text-white mb-2">
            Nonlinear Length Rewards
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Each threshold provides +1 point:
          </p>
          <ul className="text-xs text-slate-300 space-y-1 font-mono">
            <li>• len &ge; 8 chars: +1 pt</li>
            <li>• len &ge; 12 chars: +1 pt</li>
            <li>• len &ge; 16 chars: +1 pt</li>
          </ul>
          <p className="mt-3 text-[11px] text-slate-500">
            Suggests 12+ chars minimum and recommends 16+ chars.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
            Pillar 2: Variety (0 - 2 pts)
          </div>
          <h3 className="text-base font-bold text-white mb-2">
            Character Diversity
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Evaluates 4 distinct sets (a-z, A-Z, 0-9, symbols):
          </p>
          <ul className="text-xs text-slate-300 space-y-1 font-mono">
            <li>• &ge; 2 sets: +1 pt</li>
            <li>• &ge; 3 sets: +1 pt</li>
            <li>• &lt; 3 sets: suggests adding more character sets</li>
          </ul>
          <p className="mt-3 text-[11px] text-slate-500">
            Encourages mixing numbers and punctuation into letters.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            Pillar 3: Penalty (-1 pt)
          </div>
          <h3 className="text-base font-bold text-white mb-2">
            Pattern Detection
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Deducts -1 point if any predictable pattern appears:
          </p>
          <ul className="text-xs text-slate-300 space-y-1 font-mono">
            <li>• Repetition: r"(.)\1&#123;2,&#125;"</li>
            <li>• 4+ Sequence in abc, 012, or qwerty</li>
            <li>• Common words: password, admin, etc.</li>
          </ul>
          <p className="mt-3 text-[11px] text-slate-500">
            Final score is clamped: max(1, min(5, points)).
          </p>
        </div>
      </div>

      {/* Code Display Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-medium text-slate-300">
              password_tool.py (Original Reference Script)
            </span>
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied Python Code</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Source</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-x-auto bg-slate-950 text-slate-300 font-mono text-xs sm:text-sm leading-relaxed">
          <pre>
            <code>{PYTHON_SOURCE_CODE}</code>
          </pre>
        </div>
      </div>

      {/* Hackathon Note / Footer Message */}
      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/30 flex items-center gap-3 text-xs text-emerald-300">
        <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <span className="font-semibold text-emerald-200">
            Hackathon & Production Note:
          </span>{' '}
          In addition to the console interactive mode in the original Python script (&ldquo;Good luck with the hackathon!&rdquo;), KeyGuard provides zero-latency client-side Web Crypto guarantees, transparent entropy mathematics, and live visual guidance.
        </div>
      </div>
    </div>
  );
};
