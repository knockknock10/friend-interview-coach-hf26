# Local Interview Coach

A local-first interview practice partner built for a friend who wants honest rehearsal without sending interview answers to a closed AI service.

> Hacktoberfest 2026 — Weekend Challenge: Build for a Friend

## The problem

Interview practice is awkward when the alternative is repeatedly asking another person to play interviewer. Local Interview Coach makes the loop private: pick a role, answer a hard question, get a critique, then face a follow-up.

It is intentionally small. The goal is not another generic chatbot. The goal is repeated rehearsal that a friend can use alone.

## Open-source AI at the core

The coach runs an open-weight model locally through [Ollama](https://ollama.com/). The default model is `gemma3:4b`, and the model can be swapped without changing the UI or review API.

That choice matters because the interview transcript stays on the laptop. The user can practice with real project details and rough answers without handing that material to a proprietary cloud model.

## Stack

- HTML/CSS/vanilla JavaScript frontend
- Node.js local API (no runtime dependency)
- Ollama
- Gemma 3 (default)
- Browser localStorage for session memory

## Run it locally

### 1. Install Ollama and the model

```bash
ollama pull gemma3:4b
```

### 2. Start the local review server

```bash
npm run server
```

### 3. Start the web UI

In a second terminal:

```bash
npm run web
```

Open `http://localhost:5173`.

No npm package installation is required.

## Swap the model

```bash
OLLAMA_MODEL=qwen3:4b npm run server
```

## Architecture

```text
Browser UI
   |
   | POST /api/review
   v
Local Node API
   |
   | Ollama HTTP API
   v
Open-weight model (Gemma 3)
   |
   v
Structured coaching JSON
```

No third-party AI API is required.

## Hacktoberfest build notes

The submission repository must be created and developed during the challenge window. Keep the commit history, demo, and any borrowed references honest and attributable.

## License

MIT
