import httpx
import base64
from typing import Dict, Tuple

IGNORED_DIRS = {".git", "node_modules", "dist", "build", "venv", ".venv", "__pycache__", ".github"}
SUPPORTED_EXTS = {".py", ".ts", ".js", ".go", ".java", ".c", ".cpp"}

async def fetch_github_repo_files(repo_url: str) -> Tuple[Dict[str, str], str]:
    """
    Parses 'https://github.com/owner/repo' and retrieves high-value logic files.
    """
    clean_url = repo_url.strip().rstrip("/")
    parts = clean_url.split("/")
    if len(parts) < 2:
        raise ValueError("Invalid GitHub URL format. Use https://github.com/owner/repo")

    owner, repo = parts[-2], parts[-1]
    api_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/main?recursive=1"

    headers = {"User-Agent": "RepoGrill-Architect-Agent"}

    async with httpx.AsyncClient(timeout=20.0) as client:
        res = await client.get(api_url, headers=headers)
        if res.status_code == 404:
            # Fallback to 'master' branch
            api_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/master?recursive=1"
            res = await client.get(api_url, headers=headers)

        if res.status_code != 200:
            raise Exception(f"Failed to access repository: {res.json().get('message', res.text)}")

        tree_data = res.json().get("tree", [])
        files: Dict[str, str] = {}

        for item in tree_data:
            if item.get("type") == "blob":
                path = item.get("path", "")
                if any(ignored in path.split("/") for ignored in IGNORED_DIRS):
                    continue
                if any(path.endswith(ext) for ext in SUPPORTED_EXTS):
                    # Fetch blob content
                    blob_res = await client.get(item["url"], headers=headers)
                    if blob_res.status_code == 200:
                        content_b64 = blob_res.json().get("content", "")
                        try:
                            decoded = base64.b64decode(content_b64).decode("utf-8")
                            files[path] = decoded
                        except UnicodeDecodeError:
                            continue
                    if len(files) >= 30:  # Top 30 core files cap for performance
                        break

        return files, f"{owner}/{repo}"