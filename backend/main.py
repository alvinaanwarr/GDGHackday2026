import ast
import uuid
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="RepoGrill Gauntlet Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeSubmission(BaseModel):
    code: str
    language: str
    source: str

class AstTarget(BaseModel):
    id: str
    lineStart: int
    lineEnd: int
    category: str
    threatLevel: str
    ruleTitle: str
    codeSnippet: str

class InterrogationQuestion(BaseModel):
    id: str
    architectName: str
    threatBadge: str
    question: str
    timestamp: str
    targetLineStart: Optional[int] = None
    targetLineEnd: Optional[int] = None

class GrillResponse(BaseModel):
    threatLevel: str
    astTargets: List[AstTarget]
    openingQuestions: List[InterrogationQuestion]
    systemAnalysis: str

def parse_python_ast(code: str) -> List[AstTarget]:
    targets = []
    lines = code.splitlines()
    try:
        tree = ast.parse(code)
    except Exception:
        return targets

    for node in ast.walk(tree):
        # 1. Nested loops: O(N^2) complexity threat
        if isinstance(node, (ast.For, ast.While)):
            for child in ast.iter_child_nodes(node):
                if isinstance(child, (ast.For, ast.While)):
                    start = node.lineno
                    end = getattr(child, "end_lineno", start + 4)
                    targets.append(AstTarget(
                        id=str(uuid.uuid4())[:8],
                        lineStart=start,
                        lineEnd=end,
                        category="Algorithmic Complexity",
                        threatLevel="CRITICAL",
                        ruleTitle="Nested Loop Iteration O(N²)",
                        codeSnippet="\n".join(lines[start - 1 : end])
                    ))

        # 2. Broad Exception Swallowing
        if isinstance(node, ast.ExceptHandler):
            if node.type is None or (isinstance(node.type, ast.Name) and node.type.id in ["Exception", "BaseException"]):
                start = node.lineno
                end = getattr(node, "end_lineno", start + 2)
                targets.append(AstTarget(
                    id=str(uuid.uuid4())[:8],
                    lineStart=start,
                    lineEnd=end,
                    category="Reliability & Error Handling",
                    threatLevel="HIGH",
                    ruleTitle="Broad Base Exception Swallowing",
                    codeSnippet="\n".join(lines[start - 1 : end])
                ))
    return targets

@app.post("/api/grill", response_model=GrillResponse)
async def conduct_grill_assessment(payload: CodeSubmission):
    code = payload.code.strip()
    if not code:
        raise HTTPException(status_code=400, detail="Empty code buffer submitted.")

    ast_targets = []
    if payload.language.lower() == "python":
        ast_targets = parse_python_ast(code)

    # Heuristic fallback if language is not Python or AST finds no violations
    if not ast_targets:
        lines = code.splitlines()
        ast_targets.append(AstTarget(
            id=str(uuid.uuid4())[:8],
            lineStart=1,
            lineEnd=min(12, len(lines)),
            category="System Topology",
            threatLevel="MEDIUM",
            ruleTitle="Module Initialization & Concurrency Safety",
            codeSnippet="\n".join(lines[:min(12, len(lines))])
        ))

    primary_target = ast_targets[0]

    gemma_ready_prompt = (
        f"Examine lines {primary_target.lineStart}-{primary_target.lineEnd} in {payload.source}. "
        f"Candidate implemented '{primary_target.ruleTitle}'. "
        f"How does this routine behave under 15,000 RPS when memory limits are reached?"
    )

    questions = [
        InterrogationQuestion(
            id=str(uuid.uuid4())[:8],
            architectName="Principal Architect Thorne",
            threatBadge=f"{primary_target.threatLevel} HAZARD DETECTED",
            question=gemma_ready_prompt,
            timestamp="Just now",
            targetLineStart=primary_target.lineStart,
            targetLineEnd=primary_target.lineEnd,
        )
    ]

    return GrillResponse(
        threatLevel=primary_target.threatLevel,
        astTargets=ast_targets,
        openingQuestions=questions,
        systemAnalysis=f"Ingested {len(code.splitlines())} lines from {payload.source}. Flagged {len(ast_targets)} architectural hot-spots."
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)