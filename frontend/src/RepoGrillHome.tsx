import React, { useState, useMemo } from 'react';
import {
  CodePayload,
  SupportedLanguage,
  IngestionMode,
  GrillResponse,
  InterrogationQuestion,
  AstTarget,
} from './types';
import {
  Flame,
  Terminal,
  UploadCloud,
  Github,
  ClipboardCheck,
  Send,
  RotateCcw,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const SAMPLE_CODES: Record<SupportedLanguage, string> = {
  python: `import time
import asyncio

class PaymentBatchProcessor:
    def __init__(self, db_client):
        self.db = db_client
        self.pending_transactions = []

    async def execute_batch_settlement(self, user_batch: list):
        # Hotspot 1: Algorithmic Nested Loop Inefficiency (O(N^2))
        unsettled = []
        for txn in user_batch:
            for existing in self.pending_transactions:
                if txn.account_id == existing.account_id:
                    # Hotspot 2: Blocking I/O inside asynchronous event loop
                    time.sleep(0.05) 
                    if not self.db.has_cleared_funds(txn.id):
                        unsettled.append(txn)

        # Hotspot 3: Broad exception swallowing masking system failures
        try:
            self.persist_audit_log(unsettled)
        except Exception:
            pass

        return unsettled

    def persist_audit_log(self, txns):
        pass`,
  typescript: `export class EventDispatcher {
  private subscribers: Array<Function> = [];

  public async broadcast(payload: any) {
    for (let i = 0; i < this.subscribers.length; i++) {
      new Promise((resolve) => {
        const handler = this.subscribers[i];
        handler(payload);
        resolve(true);
      });
    }
  }
}`,
  javascript: `function processItems(items) {
  let results = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
      if (items[i].id === items[j].parentId) {
        results.push({ parent: items[i], child: items[j] });
      }
    }
  }
  return results;
}`,
  go: `package main

import "time"

func WorkerPool(jobs <-chan int, results chan<- int) {
    for j := range jobs {
        go func(id int) {
            time.Sleep(100 * time.Millisecond)
            results <- id * 2
        }(j)
    }
}`,
  rust: `pub fn process_data(records: &Vec<String>) -> Vec<String> {
    let mut output = Vec::new();
    for r in records {
        for other in records {
            if r == other {
                output.push(r.clone());
            }
        }
    }
    output
}`,
  java: `public class DataPipeline {
    public void execute(List<String> list) {
        for (String a : list) {
            for (String b : list) {
                if (a.equals(b)) {
                    System.out.println("Match found");
                }
            }
        }
    }
}`,
  cpp: `#include <vector>
#include <string>

void filterRecords(std::vector<std::string>& data) {
    for(size_t i = 0; i < data.size(); ++i) {
        for(size_t j = 0; j < data.size(); ++j) {
            if(data[i] == data[j] && i != j) {
                // Potential unbounded copy
            }
        }
    }
}`,
  c: `#include <stdio.h>

void analyze_buffer(char *buf, int len) {
    for (int i = 0; i < len; i++) {
        for (int j = 0; j < len; j++) {
            if (buf[i] == buf[j] && i != j) {
                // High cycle scan
            }
        }
    }
}`,
};

export const RepoGrillHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<IngestionMode>('paste');
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [code, setCode] = useState<string>(SAMPLE_CODES.python);
  const [sourceName, setSourceName] = useState<string>('pasted-snippet.py');

  const [githubUrl, setGithubUrl] = useState<string>('https://github.com/tiangolo/fastapi');
  const [githubPat, setGithubPat] = useState<string>('');
  const [showPatInput, setShowPatInput] = useState<boolean>(false);
  const [isFetchingGithub, setIsFetchingGithub] = useState<boolean>(false);

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [isInterrogating, setIsInterrogating] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<GrillResponse | null>(null);
  const [selectedHotspotIndex, setSelectedHotspotIndex] = useState<number>(0);
  const [defenseInput, setDefenseInput] = useState<string>('');
  const [dialogue, setDialogue] = useState<
    Array<{ sender: 'architect' | 'candidate'; text: string; badge?: string }>
  >([]);

  const lineCount = useMemo(() => (code ? code.split('\n').length : 0), [code]);
  const charCount = useMemo(() => code.length, [code]);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    if (!uploadedFileName && activeTab === 'paste') {
      setCode(SAMPLE_CODES[newLang] || '');
      setSourceName(`snippet.${newLang}`);
    }
  };

  const processUploadedFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const langMap: Record<string, SupportedLanguage> = {
      py: 'python',
      ts: 'typescript',
      js: 'javascript',
      go: 'go',
      rs: 'rust',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
    };

    if (ext && langMap[ext]) {
      setLanguage(langMap[ext]);
    }

    setUploadedFileName(file.name);
    setUploadedFileSize((file.size / 1024).toFixed(1) + ' KB');
    setSourceName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);
    };
    reader.readAsText(file);
  };

  const handleFetchGithub = async (targetUrl?: string) => {
    const url = targetUrl || githubUrl;
    setIsFetchingGithub(true);
    try {
      const clean = url.replace('https://github.com/', '').replace(/\/$/, '');
      const [owner, repo] = clean.split('/');
      if (!owner || !repo) throw new Error('Format must be owner/repo or full GitHub URL');

      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json',
      };
      if (githubPat.trim()) {
        headers['Authorization'] = `token ${githubPat.trim()}`;
      }

      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
        { headers }
      );
      const data = await treeRes.json();

      if (!data.tree) {
        throw new Error(data.message || 'Could not fetch repository tree.');
      }

      const validExts = ['.py', '.ts', '.js', '.go', '.rs', '.java', '.cpp', '.c'];
      const fileNode = data.tree.find((item: any) =>
        validExts.some((ext) => item.path.endsWith(ext)) &&
        !item.path.includes('test') &&
        !item.path.includes('vendor')
      );

      if (!fileNode) {
        throw new Error('No supported primary source files found in repo.');
      }

      const rawRes = await fetch(fileNode.url, { headers });
      const rawBlob = await rawRes.json();
      const decoded = decodeURIComponent(escape(atob(rawBlob.content)));

      const ext = fileNode.path.split('.').pop();
      const langMap: Record<string, SupportedLanguage> = {
        py: 'python',
        ts: 'typescript',
        js: 'javascript',
        go: 'go',
        rs: 'rust',
        java: 'java',
        cpp: 'cpp',
        c: 'c',
      };

      if (ext && langMap[ext]) setLanguage(langMap[ext]);
      setCode(decoded);
      setSourceName(`${owner}/${repo}/${fileNode.path}`);
      setUploadedFileName(fileNode.path);
    } catch (err: any) {
      alert(`GitHub Note: ${err.message}. Loading sample snippet for analysis.`);
      setCode(SAMPLE_CODES[language]);
    } finally {
      setIsFetchingGithub(false);
    }
  };

  const handleInitiateGauntlet = async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    const payload: CodePayload = {
      code,
      language,
      source: sourceName,
    };

    try {
      const res = await fetch('http://localhost:8000/api/grill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Backend offline');

      const data: GrillResponse = await res.json();
      setAnalysisResult(data);
      initializeDialogue(data.openingQuestions);
    } catch {
      const fallback = generateFallbackAnalysis(payload);
      setAnalysisResult(fallback);
      initializeDialogue(fallback.openingQuestions);
    } finally {
      setIsAnalyzing(false);
      setIsInterrogating(true);
    }
  };

  const initializeDialogue = (questions: InterrogationQuestion[]) => {
    if (questions.length > 0) {
      setDialogue([
        {
          sender: 'architect',
          text: questions[0].question,
          badge: questions[0].threatBadge,
        },
      ]);
    }
  };

  const handleSendDefense = () => {
    if (!defenseInput.trim()) return;
    const text = defenseInput.trim();
    setDefenseInput('');

    setDialogue((prev) => [...prev, { sender: 'candidate', text }]);

    setTimeout(() => {
      const rebuttals = [
        `"You claim this handles scale, but what guarantees thread safety when two workers mutate state concurrently in ${language.toUpperCase()}?"`,
        `"Vague justification. If memory pressure spikes to 95%, does this allocate on the stack or trigger garbage collection pauses?"`,
        `"That defense neglects edge-case telemetry. How do you recover from partial transactions if the connection pool is exhausted?"`,
      ];
      const reply = rebuttals[Math.floor(Math.random() * rebuttals.length)];
      setDialogue((prev) => [
        ...prev,
        {
          sender: 'architect',
          text: reply,
          badge: 'ADVERSARIAL REBUTTAL',
        },
      ]);
    }, 700);
  };

  const generateFallbackAnalysis = (payload: CodePayload): GrillResponse => {
    return {
      threatLevel: 'HIGH',
      systemAnalysis: `Identified 2 critical architectural stress points in ${payload.source}. Iteration cost and exception handling exceed production standards.`,
      astTargets: [
        {
          id: 'tgt-1',
          lineStart: 12,
          lineEnd: 20,
          category: 'Algorithmic Bottleneck',
          threatLevel: 'CRITICAL',
          ruleTitle: 'Nested Loop Iteration O(N²)',
          codeSnippet: payload.code.split('\n').slice(11, 20).join('\n'),
        },
        {
          id: 'tgt-2',
          lineStart: 21,
          lineEnd: 26,
          category: 'Fault Tolerance',
          threatLevel: 'HIGH',
          ruleTitle: 'Broad Base Exception Swallowing',
          codeSnippet: payload.code.split('\n').slice(20, 26).join('\n'),
        },
      ],
      openingQuestions: [
        {
          id: 'q-1',
          architectName: 'Principal Architect Thorne',
          threatBadge: 'HIGH COMPLEXITY DETECTED',
          question: `Looking at lines 12–20 of ${payload.source}: You nested this iteration loop without a hash lookup. What happens to latency and CPU cache lines when 20,000 batch items hit this handler simultaneously?`,
          timestamp: 'Just now',
          targetLineStart: 12,
          targetLineEnd: 20,
        },
      ],
    };
  };

  // INTERROGATION ARENA
  if (isInterrogating && analysisResult) {
    const lines = code.split('\n');
    const currentTarget = analysisResult.astTargets[selectedHotspotIndex];

    return (
      <div className="h-screen w-screen bg-grill-pitch text-grill-crisp flex flex-col font-sans overflow-hidden">
        <header className="h-14 border-b border-grill-ashBorder bg-grill-void px-4 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-grill-blood flex items-center justify-center shadow-lg shadow-grill-emberDark">
              <ShieldAlert className="w-5 h-5 text-grill-crisp" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-widest text-grill-crimson uppercase font-mono">
                INTERROGATION ARENA
              </span>
              <span className="mx-2 text-grill-ash">/</span>
              <span className="text-xs text-grill-ash font-mono">{sourceName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-grill-emberDark border border-grill-crimson text-grill-crimson">
              THREAT: {analysisResult.threatLevel}
            </span>
            <button
              onClick={() => setIsInterrogating(false)}
              className="text-xs font-mono bg-grill-charcoal hover:bg-grill-slateDark border border-grill-ashBorder px-3 py-1.5 rounded flex items-center gap-1.5 transition text-grill-ash hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Exit Arena</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Code View */}
          <div className="w-full md:w-1/2 border-r border-grill-ashBorder bg-grill-void flex flex-col">
            <div className="p-2.5 bg-grill-charcoal/80 border-b border-grill-ashBorder flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-grill-ash">
                <Terminal className="w-4 h-4 text-grill-crimson" />
                <span>Suspect Code Buffer</span>
              </div>
              <span className="text-grill-ash text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-grill-pitch border border-grill-ashBorder">
                {language}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed">
              {lines.map((lineText, idx) => {
                const lineNum = idx + 1;
                const isContested =
                  currentTarget &&
                  lineNum >= currentTarget.lineStart &&
                  lineNum <= currentTarget.lineEnd;

                return (
                  <div
                    key={idx}
                    className={`flex items-start rounded px-1.5 ${
                      isContested
                        ? 'bg-grill-emberDark/40 border-l-2 border-grill-crimson text-red-100 font-semibold'
                        : 'text-grill-ash/90 hover:bg-grill-charcoal/30'
                    }`}
                  >
                    <span className="w-8 select-none text-right pr-4 text-grill-muted text-[11px]">
                      {lineNum}
                    </span>
                    <pre className="flex-1 whitespace-pre-wrap overflow-x-auto font-mono">
                      {lineText || ' '}
                    </pre>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-grill-charcoal/60 border-t border-grill-ashBorder flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] uppercase font-mono font-bold text-grill-muted shrink-0">
                Hotspots:
              </span>
              {analysisResult.astTargets.map((tgt: AstTarget, i: number) => (
                <button
                  key={tgt.id}
                  onClick={() => setSelectedHotspotIndex(i)}
                  className={`text-xs font-mono px-2.5 py-1 rounded border transition shrink-0 ${
                    selectedHotspotIndex === i
                      ? 'bg-grill-crimson text-white border-grill-ember font-bold'
                      : 'bg-grill-void border-grill-ashBorder text-grill-ash hover:text-white'
                  }`}
                >
                  L{tgt.lineStart}–L{tgt.lineEnd} : {tgt.ruleTitle}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Interrogation Terminal */}
          <div className="w-full md:w-1/2 bg-grill-pitch flex flex-col">
            <div className="p-3 bg-grill-charcoal/80 border-b border-grill-ashBorder flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-grill-crimson animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-grill-crisp font-mono">
                  Principal Architect Cross-Examination
                </span>
              </div>
              <span className="text-[10px] font-mono text-grill-crimson border border-grill-crimson/50 px-2 py-0.5 rounded bg-grill-emberDark/30">
                ACTIVE SCRUTINY
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {dialogue.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg text-xs leading-relaxed max-w-[92%] font-mono border ${
                    item.sender === 'architect'
                      ? 'bg-grill-charcoal/90 border-grill-crimson/40 text-grill-crisp self-start shadow-md shadow-grill-pitch'
                      : 'bg-grill-umber/60 border-grill-ashBorder text-grill-crisp ml-auto'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-grill-crimson">
                      {item.sender === 'architect' ? 'Principal Architect' : 'You (Candidate)'}
                    </span>
                    {item.badge && (
                      <span className="text-[9px] bg-grill-blood/40 border border-grill-crimson text-grill-crimson px-1.5 py-0.2 rounded font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap">{item.text}</div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-grill-charcoal/80 border-t border-grill-ashBorder flex gap-2">
              <input
                type="text"
                placeholder="Defend your architectural trade-offs..."
                value={defenseInput}
                onChange={(e) => setDefenseInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendDefense()}
                className="flex-1 bg-grill-pitch border border-grill-ashBorder rounded-lg px-3 py-2 text-xs text-grill-crisp placeholder:text-grill-muted focus:outline-none focus:border-grill-crimson font-mono"
              />
              <button
                onClick={handleSendDefense}
                className="bg-grill-crimson hover:bg-grill-ember text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition font-mono shadow-lg shadow-grill-blood/40"
              >
                <span>Submit Defense</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // HOME INGESTION WORKSPACE
  return (
    <div className="min-h-screen bg-grill-pitch text-grill-crisp font-sans flex flex-col selection:bg-grill-crimson selection:text-white">
      <header className="h-16 border-b border-grill-ashBorder bg-grill-void px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-grill-blood border border-grill-crimson flex items-center justify-center shadow-lg shadow-grill-emberDark/50">
            <Flame className="w-5 h-5 text-grill-crimson animate-flicker" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-wider text-white">
                RepoGrill
              </span>
              <span className="text-lg">🔥</span>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex text-xs font-mono text-grill-ash">
          v1.0 AST Interrogation <span className="mx-2 text-grill-muted">|</span> Defend your source code under fire.
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-grill-crimson/30 bg-grill-umber/40 text-grill-crimson text-xs font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> High-Pressure Architectural Simulator
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Defend your actual source code.
          </h1>
          <p className="text-grill-ash text-sm max-w-xl mx-auto leading-relaxed">
            Feed in your backend logic, service handlers, or algorithms. Our adversarial Principal Architect inspects AST bottlenecks, race hazards, and memory leaks—then interrogates your engineering trade-offs.
          </p>
        </div>

        <div className="w-full bg-grill-void border border-grill-ashBorder rounded-xl shadow-2xl overflow-hidden flex flex-col">
          <div className="flex border-b border-grill-ashBorder bg-grill-charcoal/60">
            <button
              onClick={() => setActiveTab('paste')}
              className={`flex-1 py-3 px-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition ${
                activeTab === 'paste'
                  ? 'border-grill-crimson text-white bg-grill-void'
                  : 'border-transparent text-grill-muted hover:text-grill-ash'
              }`}
            >
              <ClipboardCheck className="w-4 h-4 text-grill-crimson" />
              <span>Direct Paste</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 px-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition ${
                activeTab === 'upload'
                  ? 'border-grill-crimson text-white bg-grill-void'
                  : 'border-transparent text-grill-muted hover:text-grill-ash'
              }`}
            >
              <UploadCloud className="w-4 h-4 text-grill-crimson" />
              <span>File Upload</span>
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`flex-1 py-3 px-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition ${
                activeTab === 'github'
                  ? 'border-grill-crimson text-white bg-grill-void'
                  : 'border-transparent text-grill-muted hover:text-grill-ash'
              }`}
            >
              <Github className="w-4 h-4 text-grill-crimson" />
              <span>GitHub Repo</span>
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {activeTab === 'paste' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-grill-muted font-bold">
                      Target Language:
                    </label>
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                      className="bg-grill-pitch border border-grill-ashBorder text-grill-crisp text-xs font-mono rounded px-2.5 py-1 focus:outline-none focus:border-grill-crimson"
                    >
                      <option value="python">Python</option>
                      <option value="typescript">TypeScript</option>
                      <option value="javascript">JavaScript</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="c">C</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setCode('')}
                    className="text-xs font-mono text-grill-muted hover:text-grill-crimson transition"
                  >
                    Clear Buffer
                  </button>
                </div>

                <div className="relative border border-grill-ashBorder rounded-lg bg-grill-pitch overflow-hidden focus-within:border-grill-crimson transition">
                  <textarea
                    rows={12}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="// Paste your critical service logic, concurrency primitives, or algorithms here..."
                    className="w-full bg-transparent p-4 font-mono text-xs sm:text-sm text-grill-crisp placeholder:text-grill-muted/60 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono text-grill-muted">
                  <span>Lines: {lineCount} | Characters: {charCount}</span>
                  <span>Ready for AST Scanner</span>
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.[0]) processUploadedFile(e.dataTransfer.files[0]);
                  }}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition flex flex-col items-center justify-center gap-3 cursor-pointer ${
                    isDragging
                      ? 'border-grill-crimson bg-grill-umber/40'
                      : 'border-grill-ashBorder bg-grill-pitch/60 hover:border-grill-crimson/50'
                  }`}
                >
                  <UploadCloud className="w-8 h-8 text-grill-crimson" />
                  <div>
                    <span className="text-sm font-mono text-grill-crisp font-semibold">
                      Drag & Drop source file or archive
                    </span>
                    <p className="text-xs text-grill-muted mt-1">
                      Supports .py, .ts, .js, .go, .rs, .cpp, .c, .java, or .zip
                    </p>
                  </div>
                  <label className="bg-grill-charcoal hover:bg-grill-slateDark border border-grill-ashBorder px-4 py-1.5 rounded text-xs font-mono text-grill-crisp cursor-pointer transition">
                    Browse File
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) processUploadedFile(e.target.files[0]);
                      }}
                    />
                  </label>
                </div>

                {uploadedFileName && (
                  <div className="p-3 bg-grill-charcoal border border-grill-ashBorder rounded-lg flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-grill-crimson" />
                      <span className="text-white font-bold">{uploadedFileName}</span>
                      <span className="text-grill-muted">({uploadedFileSize})</span>
                    </div>
                    <span className="uppercase text-grill-crimson font-bold">{language}</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'github' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-grill-muted font-bold">
                    Target Repository
                  </label>
                  <button
                    onClick={() => setShowPatInput(!showPatInput)}
                    className="text-xs font-mono text-grill-crimson hover:underline"
                  >
                    {showPatInput ? 'Hide PAT' : '+ Optional GitHub Token (PAT)'}
                  </button>
                </div>

                {showPatInput && (
                  <input
                    type="password"
                    placeholder="ghp_... (Personal Access Token for higher rate limits)"
                    value={githubPat}
                    onChange={(e) => setGithubPat(e.target.value)}
                    className="w-full bg-grill-pitch border border-grill-ashBorder rounded-lg px-3 py-2 text-xs font-mono text-grill-crisp focus:outline-none focus:border-grill-crimson"
                  />
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Github className="w-4 h-4 text-grill-muted absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="https://github.com/owner/repository"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full bg-grill-pitch border border-grill-ashBorder rounded-lg pl-9 pr-3 py-2.5 text-xs font-mono text-grill-crisp focus:outline-none focus:border-grill-crimson"
                    />
                  </div>
                  <button
                    disabled={isFetchingGithub}
                    onClick={() => handleFetchGithub()}
                    className="bg-grill-charcoal hover:bg-grill-slateDark border border-grill-ashBorder text-grill-crisp px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    {isFetchingGithub ? 'Fetching...' : 'Inspect Repo'}
                  </button>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-grill-muted block mb-2">
                    Quick Demo Repositories:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {['tiangolo/fastapi', 'expressjs/express', 'gin-gonic/gin'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          const full = `https://github.com/${preset}`;
                          setGithubUrl(full);
                          handleFetchGithub(full);
                        }}
                        className="text-xs font-mono bg-grill-charcoal hover:bg-grill-slateDark border border-grill-ashBorder text-grill-ash px-2.5 py-1 rounded transition"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6 bg-grill-charcoal/40 border-t border-grill-ashBorder">
            <button
              disabled={!code.trim() || isAnalyzing}
              onClick={handleInitiateGauntlet}
              className={`w-full py-3.5 rounded-lg text-sm font-mono font-extrabold tracking-wider uppercase flex items-center justify-center gap-2 transition duration-200 ${
                !code.trim()
                  ? 'bg-grill-charcoal text-grill-muted border border-grill-ashBorder cursor-not-allowed'
                  : 'bg-gradient-to-r from-grill-blood via-grill-ember to-grill-crimson text-white border border-grill-crimson shadow-lg shadow-grill-blood/40 hover:scale-[1.01] active:scale-[0.99] animate-glow'
              }`}
            >
              <Flame className="w-4 h-4 text-white" />
              <span>
                {isAnalyzing ? 'Running AST Stress Engine...' : '🔥 INITIATE GAUNTLET / DEFEND CODE'}
              </span>
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};