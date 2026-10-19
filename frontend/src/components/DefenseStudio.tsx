import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Mic, MicOff, Send, HelpCircle, ShieldAlert, Layers } from "lucide-react";
import { LanguageDeepDive } from "./LanguageDeepDive";

export interface Target {
  file: string;
  language: string;
  line_start: number;
  line_end: number;
  category: string;
  type: string;
  code_snippet: string;
}

interface DefenseStudioProps {
  sessionId: string;
  activeFileContent: string;
  targets: Target[];
  currentTargetIndex: number;
  onSelectTarget: (index: number) => void;
}

interface Message {
  sender: "Interviewer" | "Candidate";
  text: string;
}

export const DefenseStudio: React.FC<DefenseStudioProps> = ({
  sessionId,
  activeFileContent,
  targets,
  currentTargetIndex,
  onSelectTarget,
}) => {
  const currentTarget = targets[currentTargetIndex];
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [deepDiveContent, setDeepDiveContent] = useState<string | null>(null);
  const [editorRef, setEditorRef] = useState<any>(null);
  const [monacoRef, setMonacoRef] = useState<any>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Initialize WebSocket Session
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/defense/${sessionId}`);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.sender && data.text) {
        setMessages((prev) => [...prev, { sender: data.sender, text: data.text }]);
      }
    };

    return () => {
      ws.close();
    };
  }, [sessionId]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Apply Monaco highlight decorations when current target shifts
  useEffect(() => {
    if (editorRef && monacoRef && currentTarget) {
      const decorations = editorRef.deltaDecorations(
        [],
        [
          {
            range: new monacoRef.Range(
              currentTarget.line_start,
              1,
              currentTarget.line_end,
              1
            ),
            options: {
              isWholeLine: true,
              className: "line-highlight-danger",
              glyphMarginClassName: "glyph-target-icon",
            },
          },
        ]
      );
      editorRef.revealLineInCenter(currentTarget.line_start);
      return () => editorRef.deltaDecorations(decorations, []);
    }
  }, [editorRef, monacoRef, currentTarget]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    setEditorRef(editor);
    setMonacoRef(monaco);
  };

  const handleSendDefense = () => {
    if (!inputText.trim() || !socketRef.current) return;
    const defense = inputText.trim();
    setMessages((prev) => [...prev, { sender: "Candidate", text: defense }]);
    socketRef.current.send(JSON.stringify({ action: "defend", text: defense }));
    setInputText("");
  };

  const handleFetchDeepDive = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/deep-dive/${sessionId}?target_index=${currentTargetIndex}`,
        { method: "POST" }
      );
      const data = await res.json();
      setDeepDiveContent(data.explanation);
    } catch {
      setDeepDiveContent("Failed to retrieve language internals report.");
    }
  };

  // Browser Speech-To-Text API integration
  const toggleSpeechToText = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not natively supported in this browser.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText((prev) => `${prev} ${transcript}`.trim());
    };
    recognition.start();
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-slate-950 font-sans text-slate-100 overflow-hidden">
      {/* Target Drawer Sidebar */}
      <div className="w-64 border-r border-slate-800 bg-slate-900/60 p-3 flex flex-col">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Layers className="h-4 w-4 text-red-500" />
          Detected Hotspots ({targets.length})
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {targets.map((tgt, i) => (
            <button
              key={i}
              onClick={() => onSelectTarget(i)}
              className={`w-full text-left p-2.5 rounded text-xs transition border ${
                i === currentTargetIndex
                  ? "bg-red-950/60 border-red-600 text-white shadow-sm"
                  : "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <div className="font-semibold truncate">{tgt.type}</div>
              <div className="text-[10px] text-slate-400 truncate mt-1">
                {tgt.file} (L{tgt.line_start}-{tgt.line_end})
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="w-1/2 border-r border-slate-800 flex flex-col">
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <span>{currentTarget?.file}</span>
            <span className="text-amber-400">
              (Lines {currentTarget?.line_start} - {currentTarget?.line_end})
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700 uppercase">
            {currentTarget?.language}
          </span>
        </div>
        <div className="flex-1">
          <Editor
            theme="vs-dark"
            language={currentTarget?.language === "py" ? "python" : currentTarget?.language}
            value={activeFileContent}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              glyphMargin: true,
              lineNumbersMinChars: 3,
              fontSize: 13,
            }}
            onMount={handleEditorDidMount}
          />
        </div>
      </div>

      {/* Interrogation Terminal */}
      <div className="flex-1 flex flex-col bg-slate-950">
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            Live Interrogation Terminal
          </div>
          <button
            onClick={handleFetchDeepDive}
            className="flex items-center gap-1.5 text-xs bg-blue-900/40 hover:bg-blue-800/60 border border-blue-600/50 px-2.5 py-1 rounded text-blue-200 transition"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Language Engine Masterclass
          </button>
        </div>

        {/* Message Log */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-lg text-sm max-w-[88%] ${
                m.sender === "Interviewer"
                  ? "bg-red-950/30 border border-red-900/40 text-red-100 self-start"
                  : "bg-blue-950/30 border border-blue-900/40 text-blue-100 ml-auto"
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {m.sender}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
            </div>
          ))}
        </div>

        {/* Input Controls */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50 flex gap-2 items-center">
          <button
            type="button"
            onClick={toggleSpeechToText}
            className={`p-2 rounded-lg border transition ${
              isRecording
                ? "bg-red-600 text-white border-red-400 animate-pulse"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
            title="Speech to text defense"
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          <input
            className="flex-1 bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-red-500 text-slate-100 placeholder:text-slate-500"
            placeholder="Defend your architectural trade-offs..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendDefense()}
          />
          <button
            onClick={handleSendDefense}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition"
          >
            <span>Defend</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <LanguageDeepDive
        explanation={deepDiveContent}
        onClose={() => setDeepDiveContent(null)}
        language={currentTarget?.language || "Engine"}
      />
    </div>
  );
};