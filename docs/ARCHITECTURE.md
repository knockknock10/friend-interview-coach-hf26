# Architecture

## Goal

Keep the user-facing workflow simple while making the AI boundary explicit and local.

```text
┌───────────────────────────────┐
│ Browser                        │
│ question · answer · history   │
└───────────────┬───────────────┘
                │ POST /api/review
                ▼
┌───────────────────────────────┐
│ Node.js local API             │
│ validation · prompt contract  │
└───────────────┬───────────────┘
                │ localhost
                ▼
┌───────────────────────────────┐
│ Ollama                        │
│ Gemma 3 (default: 4B)         │
└───────────────────────────────┘
```

## Adaptive interview loop

The first model response is not the end of the interaction. Its `nextQuestion` becomes the next interview prompt, so the model can probe a weak claim or ask for the missing trade-off. This keeps the agentic behavior inside the same local boundary.

## Why this boundary exists

The browser should not need to know how the model is hosted. The local API owns the prompt contract, validation, and model selection. This also gives the project a clean place to add evaluations later.

## Hosted demo

Render hosts the static UI only. It is a demonstration surface, not a replacement for the local AI runtime. The hosted build uses clearly labeled sample feedback so users are never misled about where their answers are going.
