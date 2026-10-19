from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import uuid

from github_service import fetch_github_repo_files
from target_finder import extract_targets_from_repo
from llm_grill import (
    generate_adversarial_question,
    evaluate_candidate_defense,
    explain_language_internals
)

app = FastAPI(title="RepoGrill API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for active sessions
SESSIONS = {}

class AnalyzeRepoRequest(BaseModel):
    repo_url: str

@app.post("/api/analyze")
async def analyze_repo(req: AnalyzeRepoRequest):
    try:
        files, repo_name = await fetch_github_repo_files(req.repo_url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    targets = extract_targets_from_repo(files)
    if not targets:
        # Fallback target if repo is clean
        first_file = next(iter(files.keys()))
        first_lines = files[first_file].splitlines()
        targets.append({
            "file": first_file,
            "language": first_file.split(".")[-1],
            "line_start": 1,
            "line_end": min(15, len(first_lines)),
            "category": "Architecture Structure",
            "type": "Module Initialization & Architecture Strategy",
            "code_snippet": "\n".join(first_lines[:15])
        })

    session_id = str(uuid.uuid4())
    SESSIONS[session_id] = {
        "repo_name": repo_name,
        "files": files,
        "targets": targets,
        "current_target_index": 0,
        "history": []
    }

    return {
        "session_id": session_id,
        "repo_name": repo_name,
        "targets_count": len(targets),
        "targets": targets,
        "active_file_content": files[targets[0]["file"]],
        "active_target": targets[0]
    }

@app.post("/api/deep-dive/{session_id}")
async def get_deep_dive(session_id: str, target_index: int = 0):
    session = SESSIONS.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    target = session["targets"][target_index]
    explanation = await explain_language_internals(target)
    return {"explanation": explanation}

@app.websocket("/ws/defense/{session_id}")
async def defense_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()
    session = SESSIONS.get(session_id)
    if not session:
        await websocket.send_json({"error": "Session expired or invalid."})
        await websocket.close()
        return

    # Trigger opening question for the current target
    current_target = session["targets"][session["current_target_index"]]
    opening_q = await generate_adversarial_question(current_target)
    
    session["history"].append({"role": "assistant", "content": opening_q})
    await websocket.send_json({
        "sender": "Interviewer",
        "text": opening_q,
        "target": current_target
    })

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            action = payload.get("action")

            if action == "defend":
                candidate_text = payload.get("text", "")
                session["history"].append({"role": "user", "content": candidate_text})

                interviewer_rebuttal = await evaluate_candidate_defense(
                    session["history"], candidate_text, current_target
                )
                session["history"].append({"role": "assistant", "content": interviewer_rebuttal})

                await websocket.send_json({
                    "sender": "Interviewer",
                    "text": interviewer_rebuttal
                })

            elif action == "switch_target":
                new_idx = payload.get("target_index", 0)
                session["current_target_index"] = new_idx
                session["history"] = []
                current_target = session["targets"][new_idx]
                
                opening_q = await generate_adversarial_question(current_target)
                session["history"].append({"role": "assistant", "content": opening_q})
                
                await websocket.send_json({
                    "sender": "Interviewer",
                    "text": opening_q,
                    "target": current_target,
                    "file_content": session["files"][current_target["file"]]
                })

    except WebSocketDisconnect:
        pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)