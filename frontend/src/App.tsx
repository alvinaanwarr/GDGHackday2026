import React, { useState } from "react";
import { GitBranch, Shield, Zap, Terminal } from "lucide-react";
import { DefenseStudio, Target } from "./components/DefenseStudio";

export default function App() {
  const [repoUrl, setRepoUrl] = useState("https://github.com/tiangolo/fastapi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sessionData, setSessionData] = useState<{
    sessionId: string;
    repoName: string;
    targets: Target[];
    activeFileContent: string;
    currentTargetIndex: number;
  } | null>(null);

  const startGrillSession = async (urlToAnalyze: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: urlToAnalyze }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Analysis failed");
      }
      const data = await res.json();
      setSessionData({
        sessionId: data.session_id,
        repoName: data.repo_name,
        targets: data.targets,
        activeFileContent: data.active_file_content,
        currentTargetIndex: 0,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTarget = (index: number) => {
    if (!sessionData) return;
    setSessionData({
      ...sessionData,
      currentTargetIndex: index,
      activeFileContent: sessionData.targets[index].code_snippet, // Displays context snippet in editor
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Global Navigation */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center font-black">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <span className="font-black text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-amber-500">
            RepoGrill
          </span>
          <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            v1.0 AST Interrogation
          </span>
        </div>

        {sessionData && (
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-400">
              Active Target: <span className="text-red-400 font-bold">{sessionData.repoName}</span>
            </span>
            <button
              onClick={() => setSessionData(null)}
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded transition"
            >
              Analyze Another Repo
            </button>
          </div>
        )}
      </header>

      {/* Main Container */}
      {!sessionData ? (
        <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
          <div className="text-center space-y-4 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-950/20 text-red-400 text-xs font-medium">
              <Shield className="h-3.5 w-3.5" /> High-Pressure Technical Interview Defense Simulator
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Defend your actual source code.
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              We clone your repository, run AST static analysis to find concurrency bottlenecks, 
              nested loops, and exception swallowing, and assign an adversarial Principal Architect to interrogate your decisions.
            </p>
          </div>

          <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <GitBranch className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="https://github.com/owner/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-red-500 text-slate-100 placeholder:text-slate-500"
                />
              </div>
              <button
                disabled={loading}
                onClick={() => startGrillSession(repoUrl)}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition"
              >
                {loading ? (
                  <>
                    <Zap className="h-4 w-4 animate-spin" /> Ingesting AST...
                  </>
                ) : (
                  "Initiate Gauntlet"
                )}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-red-200 text-xs rounded-lg">
                {error}
              </div>
            )}

            <div className="pt-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-2">
                Quick Test Repositories:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  "https://github.com/tiangolo/fastapi",
                  "https://github.com/expressjs/express",
                  "https://github.com/gin-gonic/gin",
                ].map((sample) => (
                  <button
                    key={sample}
                    onClick={() => {
                      setRepoUrl(sample);
                      startGrillSession(sample);
                    }}
                    className="text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded border border-slate-700 transition"
                  >
                    {sample.replace("https://github.com/", "")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      ) : (
        <DefenseStudio
          sessionId={sessionData.sessionId}
          activeFileContent={sessionData.activeFileContent}
          targets={sessionData.targets}
          currentTargetIndex={sessionData.currentTargetIndex}
          onSelectTarget={handleSelectTarget}
        />
      )}
    </div>
  );
}