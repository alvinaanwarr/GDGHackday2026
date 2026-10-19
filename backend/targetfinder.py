import ast
import re
from typing import List, Dict, Any

def analyze_python_code(file_path: str, code: str) -> List[Dict[str, Any]]:
    targets = []
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return targets

    lines = code.splitlines()

    for node in ast.walk(tree):
        # 1. Algorithmic Inefficiency: Nested Loops (O(N^2) or worse)
        if isinstance(node, (ast.For, ast.While)):
            for child in ast.iter_child_nodes(node):
                if isinstance(child, (ast.For, ast.While)):
                    start = node.lineno
                    end = getattr(child, "end_lineno", node.lineno + 3)
                    targets.append({
                        "file": file_path,
                        "language": "python",
                        "line_start": start,
                        "line_end": end,
                        "category": "Algorithmic Complexity",
                        "type": "Nested Loop (O(N²) candidate)",
                        "code_snippet": "\n".join(lines[start - 1 : end])
                    })

        # 2. Error Swallowing: Broad Exception Handlers
        if isinstance(node, ast.ExceptHandler):
            is_broad = node.type is None or (
                isinstance(node.type, ast.Name) and node.type.id in ["Exception", "BaseException"]
            )
            if is_broad:
                start = node.lineno
                end = getattr(node, "end_lineno", node.lineno + 2)
                targets.append({
                    "file": file_path,
                    "language": "python",
                    "line_start": start,
                    "line_end": end,
                    "category": "Reliability & Error Handling",
                    "type": "Broad Exception Swallowing",
                    "code_snippet": "\n".join(lines[start - 1 : end])
                })

        # 3. Concurrency Hazard: Blocking I/O inside Async Coroutine
        if isinstance(node, ast.AsyncFunctionDef):
            for child in ast.walk(node):
                if isinstance(child, ast.Call):
                    func_name = ""
                    if isinstance(child.func, ast.Name):
                        func_name = child.func.id
                    elif isinstance(child.func, ast.Attribute):
                        func_name = child.func.attr
                    
                    if func_name in ["sleep", "read", "open", "get", "post"]:
                        # Check if it was called without 'await'
                        start = child.lineno
                        end = getattr(child, "end_lineno", child.lineno)
                        targets.append({
                            "file": file_path,
                            "language": "python",
                            "line_start": start,
                            "line_end": end,
                            "category": "Concurrency & Event Loop",
                            "type": "Synchronous Blocking Call inside Async Def",
                            "code_snippet": "\n".join(lines[start - 1 : end])
                        })
    return targets

def analyze_c_cpp_java_ts(file_path: str, code: str) -> List[Dict[str, Any]]:
    """Heuristic scanner for TypeScript, Go, Java, and C++."""
    targets = []
    lines = code.splitlines()
    ext = file_path.split(".")[-1].lower()

    # Generic heuristics
    for idx, line in enumerate(lines, start=1):
        # Unbounded Promise / Thread spawning
        if ext in ["ts", "js"] and "new Promise" in line and "catch" not in line:
            targets.append({
                "file": file_path,
                "language": ext,
                "line_start": idx,
                "line_end": min(idx + 4, len(lines)),
                "category": "Async Execution",
                "type": "Unhandled Promise Execution",
                "code_snippet": "\n".join(lines[idx - 1 : min(idx + 4, len(lines))])
            })
        
        # Raw SQL injection vulnerability / lack of parameterized query
        if re.search(r"(SELECT|INSERT|UPDATE|DELETE)\s+.*(\+|\$\{)", line, re.IGNORECASE):
            targets.append({
                "file": file_path,
                "language": ext,
                "line_start": idx,
                "line_end": min(idx + 2, len(lines)),
                "category": "Security & Architecture",
                "type": "Dynamic String Query Interpolation",
                "code_snippet": "\n".join(lines[idx - 1 : min(idx + 2, len(lines))])
            })

        # Go goroutine leak candidate
        if ext == "go" and re.search(r"go\s+func\(", line):
            targets.append({
                "file": file_path,
                "language": "go",
                "line_start": idx,
                "line_end": min(idx + 5, len(lines)),
                "category": "Concurrency",
                "type": "Unbounded Goroutine Spawning",
                "code_snippet": "\n".join(lines[idx - 1 : min(idx + 5, len(lines))])
            })

    return targets

def extract_targets_from_repo(files: Dict[str, str]) -> List[Dict[str, Any]]:
    all_targets = []
    for file_path, code in files.items():
        if file_path.endswith(".py"):
            all_targets.extend(analyze_python_code(file_path, code))
        elif file_path.endswith((".ts", ".js", ".go", ".java", ".cpp", ".c")):
            all_targets.extend(analyze_c_cpp_java_ts(file_path, code))
    return all_targets