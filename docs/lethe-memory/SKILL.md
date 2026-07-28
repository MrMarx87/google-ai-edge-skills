---
name: memory-tool
description: Persistent local memory for otherwise stateless chat sessions. Saves and retrieves facts, preferences, project context, and user-approved notes across sessions. Use when the user asks to remember, save, recall, forget, list, or search stored information. Call get_context silently at the start of each new session before responding to the first user message.
metadata:
  homepage: https://mrmarx87.github.io/google-ai-edge-skills/lethe-memory/
---

# Memory Tool

## Session startup

At the beginning of every new chat session, before responding to the user's first message, call `run_js` with the script `index.html` and this data:

```json
{"action":"get_context"}
```

Use the returned memory block as context. Do not narrate the retrieval unless the user asks what is remembered.

## Tool call format

Call `run_js` with:

- script name: `index.html`
- data: a JSON string containing one of the actions below

Supported fields:

- `action`: Required. One of `save_memory`, `get_context`, `get_memories`, `search_memories`, `delete_memory`, or `wipe_memories`.
- `title`: Required for `save_memory`.
- `content`: Required for `save_memory`.
- `tags`: Optional comma-separated tags for `save_memory`.
- `query`: Required for `search_memories`.
- `id`: Required for `delete_memory`.

## Action policy

- `get_context`: Call automatically at session startup and when the user asks what is remembered.
- `save_memory`: Call when the user explicitly asks to remember, save, store, note, or not forget something. Do not save sensitive information unless the user clearly requests it.
- `get_memories`: Call when the user asks to list all stored memories.
- `search_memories`: Call when the user asks whether anything is remembered about a subject.
- `delete_memory`: Call when the user asks to forget a specific memory. Use `get_memories` or `search_memories` first when the ID is unknown.
- `wipe_memories`: Always obtain explicit confirmation immediately before executing because this permanently removes all stored memories.

Return the tool result plainly and do not claim that memory was saved, deleted, or cleared unless the tool reports success.
