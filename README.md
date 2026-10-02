# Local Interview Coach

![CI](https://github.com/knockknock10/friend-interview-coach-hf26/actions/workflows/ci.yml/badge.svg)

**A local-first interview practice partner built around one simple loop:**

**question → answer → critique → focus → retry → follow-up**

Built for the **Hacktoberfest 2026 Weekend Challenge: Build for a Friend**.

## The problem

Mock interviews work because another person creates pressure, asks follow-up questions, and notices where an answer is weak.

The problem is repetition.

A friend has to be available. The candidate has to explain the same project again. Feedback quality varies. And the answer may contain private project details that the candidate does not want to send to a closed AI service.

Local Interview Coach turns that friction into a short, repeatable practice loop.

It is deliberately **not a generic chatbot**.

The product is built around the interview task itself:

1. Pick a target role and practice goal.
2. Answer a real interview question.
3. Get a structured review.
4. See the five signals that matter.
5. Get one priority to improve next.
6. Retry the same answer using a concrete drill.
7. Take an adaptive follow-up question generated from the answer.
8. Keep lightweight session history locally and export it when needed.

## What the coach evaluates

Every answer is reviewed across five signals:

- **Structure** — is the answer easy to follow?
- **Specificity** — does it contain concrete evidence?
- **Ownership** — is it clear what the candidate actually did?
- **Reasoning** — are the decisions and trade-offs explained?
- **Communication** — is the explanation concise and understandable?

The model also returns:

- a 1–10 score
- strengths
- improvements
- one focused coaching priority
- a why-this-matters explanation
- an immediate drill
- a retry instruction
- an adaptive follow-up question

That makes the AI part of a practice workflow instead of another chat box.

## Open-source AI is part of the product requirement

The real application runs:

```text
Browser
  │
  │ answer
  ▼
Local Node API
  │
  │ localhost
  ▼
Ollama
  │
  ▼
Gemma 3
  │
  ▼
structured coaching JSON
```

The candidate's answer can stay on the same machine as the model.

Gemma 3 is the default model, but the Ollama endpoint and model name are configurable. That keeps the architecture replaceable instead of coupling the product to a single closed provider.

The privacy boundary is intentional:

```text
real AI mode
candidate answer
      ↓
localhost
      ↓
Ollama + Gemma
      ↓
feedback

hosted demo
judge's browser
      ↓
Render
      ↓
sample feedback
```

The hosted site explicitly says it is using sample feedback. It does not pretend that a private local model is running inside a public static deployment.

## Product features

### Adaptive interview loop

The follow-up question is generated from the candidate's actual answer. It is meant to probe the weakest or least-supported part of that answer rather than simply advancing through a static list.

### Coaching plan

A score alone is not very useful.

The coach chooses one skill to improve next and turns it into a small action:

**focus → why → drill → retry**

This makes every review actionable.

### Practice and pressure modes

Practice gives 90 seconds.

Pressure gives 60 seconds.

The UI keeps the timing visible so the candidate can rehearse under a little more constraint.

### Local session memory

Recent attempts, scores, and coaching focus are stored in browser storage.

No account is required.

### Export

The session can be exported as JSON, including the selected role, practice goal, mode, scores, rubric signals, and coaching focus.

### Honest hosted demo

The public Render deployment is a judge-friendly demo surface. It shows the interaction without exposing a cloud endpoint for a private local model.

## Demo

**Live:** https://friend-interview-coach-hf26.onrender.com

**Code:** https://github.com/knockknock10/friend-interview-coach-hf26

For real local inference, install Ollama and run:

```bash
ollama pull gemma3:4b
npm run server
```

In another terminal:

```bash
npm run web
```

Then open:

```text
http://localhost:5173
```

## Why this project is a good fit for the challenge

The project was built specifically around the prompt of making something useful for a friend.

The friend problem is not "I need an AI chatbot."

It is:

> "I need realistic interview practice often enough to actually improve."

That changed the product decisions.

A generic assistant would optimize for conversation length. This one optimizes for the next answer.

A cloud-first assistant would make privacy an afterthought. This one makes local inference the real application path.

A score-only evaluator would create a number and stop. This one creates a concrete improvement loop.

## Engineering details

The server is intentionally small:

- Node.js built-in HTTP server
- no runtime dependency required for the API
- explicit input limits
- Ollama request timeout
- structured JSON response contract
- model-output validation
- clear local-vs-hosted behavior

The test suite covers:

- prompt construction
- required input validation
- complete coaching responses
- rubric boundaries
- coach-plan completeness

GitHub Actions runs syntax checks, contract tests, and required asset checks on every push and pull request.

## Repository map

```text
web/
  index.html
  styles.css
  app.js

server/
  server.js
  coaching.js
  coaching.test.js

docs/
  ARCHITECTURE.md
  architecture.svg
  privacy-boundary.svg

.github/
  workflows/ci.yml
```

## Model configuration

The default runtime is:

```text
OLLAMA_URL=http://127.0.0.1:11434/api/chat
OLLAMA_MODEL=gemma3:4b
```

You can point the API at another compatible local Ollama chat model without changing the frontend.

## Limitations

This is a focused weekend build, not a replacement for a human interviewer.

The coach can only judge the evidence present in the answer. It should not be used to invent accomplishments or rewrite an answer into something the candidate did not actually do.

The hosted demo uses sample feedback by design. Real model inference is local.

## Prize categories

### Best Use of Gemma

Gemma 3 is the core reasoning model for answer evaluation, the five-part rubric, focused coaching plan, and adaptive follow-up generation.

### Best Use of Render

Render hosts the public frontend/demo so judges can use the project without installing the local stack first.

