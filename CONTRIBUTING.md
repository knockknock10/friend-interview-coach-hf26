# Contributing

Thanks for helping improve Local Interview Coach.

## Development

The project has two small surfaces:

- `web/` — static browser UI
- `server/` — Node.js API that talks to Ollama

Run the local stack:

```bash
ollama pull gemma3:4b
npm run server
npm run web
```

Open `http://localhost:5173`.

## Pull requests

Keep changes focused. Include a short explanation of the user problem, the behavior changed, and how you tested it.

For UI changes, include before/after screenshots when practical. For model/prompt changes, explain what behavior the change is intended to improve.
