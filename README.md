#RepoGrill 
Defending source code under fire.

An automated technical interview prep bot that sets engineering and CS students up for success for their technical interviews by quizzing them on their own code.

Summary
Traditional technical interviews rely on contrived LeetCode puzzles that fail to assess real-world software engineering competency. RepoGrill bridges this gap by turning candidate repositories into high-pressure architectural defenses.
The system ingests production source code, executes an Abstract Syntax Tree (AST) static analysis pipeline to identify anti-patterns, concurrency hazards, and algorithmic bottlenecks, and unleashes an adversarial Principal Architect AI to cross-examine the candidate on line-level implementation decisions.

Core Features and Languages
1. Multi-Vector Code Ingestion
Direct Copy & Paste (Primary): Built-in dark monospace editor with multi-language syntax targeting (Python, TypeScript, JavaScript, Go, Rust, Java, C++, C). Real-time line and character counters.
Direct File Upload: Drag-and-drop zone with instant in-browser FileReader parsing for single source files (.py, .ts, .go, etc.) or .zip archives.
GitHub Integration: Fetches remote trees directly via the GitHub REST API without requiring local git binaries or OAuth setup. Includes quick-test presets for prominent production libraries (tiangolo/fastapi, expressjs/express, gin-gonic/gin).
2. Static AST & Heuristic Threat Engine
The backend static analysis engine inspects raw syntax trees to flag:
Algorithmic Complexity: O(n^2)
Identifies nested for and while loops iterating over unbounded collections.
Concurrency Hazards: Detects synchronous blocking system calls (time.sleep(), synchronous file I/O) running inside asynchronous coroutines (async def).
Silent Failure / Reliability Risks: Flags broad exception handlers (except Exception: or empty catch blocks) that mask memory or connection crashes.
Unbounded Spawning: Flags unthrottled thread, Goroutine, or Promise allocations lacking semaphore backpressure.
3. Split-Screen Interrogation Arena
Contested Line Scrutiny: Programmatically highlights suspect lines with crimson threat indicators and line-number indexing.
Adversarial Interrogator Persona: Challenges candidates on latency spikes at 20k RPS, cache line thrashing, garbage collector pauses, thread contention, and connection pool exhaustion.
Candidate Defense Submission: Interactive terminal where the engineer justifies their architectural choices against counter-rebuttals.

Technology Stack
Layer	Technology	Rationale
Frontend Framework	React 18 + Vite	Fast HMR, minimal bundling overhead, strict TypeScript safety.
Styling & Theme	Tailwind CSS + PostCSS	Custom dark terminal aesthetic using pitch blacks (#050505), charcoal (#141416), crimson embers (#e63946), and smoky umber (#2c1810).
Icons	Lucide React	Featherweight SVG iconography.
API Server	FastAPI (Python 3.10+)	Native async route handling, high throughput, and seamless Pydantic payload serialization.
Static Analysis	Python ast Module	Native Abstract Syntax Tree traversal without external binary dependencies.
Dev Environment	GitHub Codespaces / Linux	Zero-configuration cloud development container.


Repository File Structure
code
Text
GDGHackday2026/
├── backend/
│   ├── requirements.txt       # Python dependencies (FastAPI, Uvicorn, Pydantic)
│   └── main.py                # FastAPI server, AST parser, and /api/grill route
│
├── frontend/
│   ├── package.json           # Node configuration and Vite scripts
│   ├── postcss.config.js      # PostCSS Tailwind plugin configuration
│   ├── tailwind.config.js     # Custom crimson/charcoal color extensions
│   ├── vite.config.ts         # Vite configuration with 0.0.0.0 host binding
│   ├── index.html             # HTML mounting root
│   └── src/
│       ├── App.tsx            # Root React component
│       ├── RepoGrillHome.tsx  # Ingestion dashboard and split-screen arena
│       ├── types.ts           # Strict TypeScript interfaces
│       ├── index.css          # Tailwind base directives and custom scrollbars
│       ├── main.tsx           # React DOM bootstrapping
│       └── vite-env.d.ts      # Vite client type definitions
│
├── venv/                      # Python virtual environment
└── README.md                  # System documentation

COMPILE GUIDE**
Prerequisites
Python 3.10+
Node.js 18+ & npm
Step 1: Backend Setup
Open a terminal in your project root:
code
Bash
# 1. Move into the backend directory
cd backend

# 2. Activate the virtual environment
source ../venv/bin/activate    # On Windows: ..\venv\Scripts\activate

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. Start the FastAPI engine
python main.py
The backend starts at http://0.0.0.0:8000.
Interactive Swagger API documentation is available at http://localhost:8000/docs.
Step 2: Frontend Setup
Open a second terminal:
code
Bash
# 1. Move into the frontend directory
cd frontend

# 2. Install node dependencies
npm install

# 3. Launch Vite dev server
npm run dev
Vite will start at http://localhost:5173 (or the forwarded port URL in GitHub Codespaces).
📡 API Reference
POST /api/grill
Analyzes a code snippet, executes AST static analysis, and produces adversarial defense challenges.
Request Body
code
JSON
{
  "code": "async def process(batch):\n    for x in batch:\n        for y in batch:\n            time.sleep(0.01)\n",
  "language": "python",
  "source": "payment_service.py"
}
Response Body (200 OK)
code
JSON
{
  "threatLevel": "CRITICAL",
  "systemAnalysis": "Ingested 4 lines from payment_service.py. Flagged 2 architectural hot-spots.",
  "astTargets": [
    {
      "id": "a91b2c3d",
      "lineStart": 2,
      "lineEnd": 4,
      "category": "Algorithmic Complexity",
      "threatLevel": "CRITICAL",
      "ruleTitle": "Nested Loop Iteration O(N²)",
      "codeSnippet": "for x in batch:\n    for y in batch:\n        time.sleep(0.01)"
    }
  ],
  "openingQuestions": [
    {
      "id": "e4f5a6b7",
      "architectName": "Principal Architect Thorne",
      "threatBadge": "CRITICAL HAZARD DETECTED",
      "question": "Examine lines 2-4 in payment_service.py. Candidate implemented 'Nested Loop Iteration O(N²)'. How does this routine behave under 15,000 RPS when memory limits are reached?",
      "timestamp": "Just now",
      "targetLineStart": 2,
      "targetLineEnd": 4
    }
  ]
}
🔍 How the AST Engine Works
Rather than passing raw code directly to an LLM without context, RepoGrill uses deterministic static analysis first:
code
Python
# Extract from backend/main.py
for node in ast.walk(tree):
    # Detect polynomial nested loop bottlenecks
    if isinstance(node, (ast.For, ast.While)):
        for child in ast.iter_child_nodes(node):
            if isinstance(child, (ast.For, ast.While)):
                targets.append(AstTarget(
                    lineStart=node.lineno,
                    lineEnd=getattr(child, "end_lineno", node.lineno + 4),
                    threatLevel="CRITICAL",
                    ruleTitle="Nested Loop Iteration O(N²)"
                ))
This deterministic pipeline ensures that the AI interviewer's questions are grounded in actual syntax facts, eliminating hallucinations and forcing the candidate to defend concrete engineering decisions.
