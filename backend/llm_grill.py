import os
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", "mock-key"))

ADVERSARIAL_SYSTEM_PROMPT = """
You are a Principal Systems Architect conducting a technical interview at an elite firm.
You are actively grilling the candidate on source code they authored in their GitHub repo.

Rules:
1. Be polite, direct, uncompromising, and technically rigorous.
2. Interrogate them on algorithmic complexity, thread-safety, memory pressure, edge cases, and production reliability.
3. Keep responses concise (2 to 4 sentences). Ask a targeted question that requires a deep architectural answer.
4. If their defense is shallow, point out the exact flaw in their reasoning.
"""

PEDAGOGICAL_SYSTEM_PROMPT = """
You are a Staff Language Compiler & Runtime Specialist.
The student has surrendered this snippet or requested deep understanding.
Explain exactly how the underlying language engine (e.g., Python GIL/Bytecode, V8 JIT/Event Loop, JVM JIT/GC, or Go Goroutine M:N scheduler) handles this construct.
Detail the exact failure mode under heavy concurrency/scale, and provide the optimal refactored version.
"""

async def generate_adversarial_question(snippet_target: dict) -> str:
    if os.getenv("OPENAI_API_KEY") in (None, "", "mock-key"):
        cat = snippet_target.get("type", "Architectural Pattern")
        return (
            f"Looking at your implementation of '{cat}' in {snippet_target['file']} "
            f"(lines {snippet_target['line_start']}-{snippet_target['line_end']}): "
            f"How does this code behave when handling 10,000 requests per second with high memory pressure? "
            f"What specific trade-off led you to write this instead of a decoupled or thread-safe pattern?"
        )

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": ADVERSARIAL_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Candidate file: {snippet_target['file']}\n"
                           f"Lines: {snippet_target['line_start']}-{snippet_target['line_end']}\n"
                           f"Anti-Pattern Detected: {snippet_target['type']}\n"
                           f"Code:\n```\n{snippet_target['code_snippet']}\n```\n"
                           f"Generate the opening technical grill question."
            }
        ],
        temperature=0.7,
        max_tokens=200
    )
    return response.choices[0].message.content

async def evaluate_candidate_defense(history: list, candidate_response: str, snippet_target: dict) -> str:
    if os.getenv("OPENAI_API_KEY") in (None, "", "mock-key"):
        return (
            f"You argued: '{candidate_response}'. While that partially handles the baseline case, "
            f"consider what occurs if an unhandled context cancellation or socket hang-up takes place. "
            f"How would you ensure resource reclamation without memory leaks in {snippet_target['language']}?"
        )

    messages = [{"role": "system", "content": ADVERSARIAL_SYSTEM_PROMPT}]
    messages.extend(history)
    messages.append({
        "role": "user",
        "content": f"Candidate defense: {candidate_response}\nCode Context:\n{snippet_target['code_snippet']}"
    })

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.6,
        max_tokens=250
    )
    return response.choices[0].message.content

async def explain_language_internals(snippet_target: dict) -> str:
    """Provides the pedagogical deep-dive into runtime, memory, and engine specifics."""
    if os.getenv("OPENAI_API_KEY") in (None, "", "mock-key"):
        return (
            f"### Language Engine Deep-Dive ({snippet_target.get('language', 'Universal').upper()})\n\n"
            f"**Runtime Mechanics:** In this environment, operations of type `{snippet_target.get('type')}` "
            f"directly strain stack allocation and garbage collection sweeps. For instance, nested loops or synchronous blocking "
            f"monopolize thread execution or the single-threaded event loop tick.\n\n"
            f"**Production Impact:** Under sustained concurrency, connection pools drain and heap fragmentation spikes.\n\n"
            f"**Recommended Architecture:** Replace iterative lookups with constant-time O(1) hash maps, or use asynchronous worker pools with non-blocking I/O streams."
        )

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": PEDAGOGICAL_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Language: {snippet_target['language']}\nTarget: {snippet_target['type']}\nSnippet:\n{snippet_target['code_snippet']}"
            }
        ],
        temperature=0.4,
        max_tokens=600
    )
    return response.choices[0].message.content