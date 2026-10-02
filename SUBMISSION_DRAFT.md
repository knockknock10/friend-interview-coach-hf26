---
title: I Built a Private AI Interview Coach for a Friend
published: false
tags: devchallenge, weekendchallenge, hf26challenge
---

*This is a submission for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01).*

## What I Built

I built **Local Interview Coach**, a local-first interview practice partner designed around a friend's software-interview preparation problem.

The problem isn't finding interview questions.

It's getting enough realistic practice.

A mock interview is useful, but every session normally depends on another person having the time to ask questions, listen to the answer, and give useful feedback. That makes repetition surprisingly difficult.

So I built a smaller loop:

**question → answer → critique → focus → retry → follow-up**

The user chooses a target role and practice goal, answers a technical or behavioral question, and gets a structured review instead of another wall of AI-generated text.

The coach looks at:

- structure
- specificity
- ownership
- reasoning
- communication

Then it chooses **one priority** to improve next, explains why that priority matters, gives a short drill, lets the candidate retry the same answer, and generates a follow-up question based on what they actually said.

That means the system isn't just saying, "Here is a score."

It can actually continue the interview and coach the next attempt.

## The friend problem

**Replace this paragraph with the real friend's situation before publishing. Do not invent this part.**

Write 2–4 sentences about the actual person this was built for:

- what they were trying to prepare for
- what made practice difficult to repeat
- what they specifically needed help with
- why a private/local coach was useful for them

Then, after they try it, add one sentence with their real reaction.

That real-world detail is important because the challenge is explicitly about building for a friend.

## Demo

**Live:** https://friend-interview-coach-hf26.onrender.com

The public demo is intentionally labeled **sample-feedback mode**.

It demonstrates the complete interface and interaction without pretending that a private local model is running inside a public static deployment.

For the real AI experience:

```bash
ollama pull gemma3:4b
npm run server
npm run web
```

Then open:

```text
http://localhost:5173
```

## Code

https://github.com/knockknock10/friend-interview-coach-hf26

## How I Built It

The browser is deliberately lightweight: HTML, CSS and JavaScript.

The local API owns the model boundary, input validation and structured response contract.

```text
Browser
  │
  │ POST /api/review
  ▼
Local Node API
  │
  ▼
Ollama
  │
  ▼
Gemma 3
  │
  ▼
coaching JSON
```

The model returns a stable contract containing:

- score
- summary
- strengths
- improvements
- five rubric signals
- one coaching focus
- why the focus matters
- an immediate drill
- a retry instruction
- an adaptive follow-up

That contract is what lets the model drive a product workflow instead of becoming a generic chat window.

The project also includes:

- practice and pressure modes
- interview timers
- a ten-question starter bank
- adaptive follow-up questions
- retry-after-feedback
- browser session memory
- average, best and trend signals
- private session export
- input and model-output validation
- timeout and error handling
- executable contract tests
- GitHub Actions CI
- architecture and privacy documentation

## Why Does Open Innovation Matter?

For this project, open AI isn't just an implementation detail.

It changes the privacy boundary.

A candidate may paste project details, failed answers, trade-offs, weaknesses, and notes about previous interviews. In the real application, those answers go from the browser to a local Node API and then to Ollama running Gemma 3 on the same machine.

That means the core practice loop does not require sending the answer to a closed AI API.

Open-weight inference also keeps the model replaceable. Gemma 3 is the default, but the application can point to another compatible local Ollama model without rewriting the rest of the product.

So privacy, model choice, and experimentation remain part of the user's control.

## What I wanted the AI to do differently

The interesting part of the project was not asking a model to "grade an interview answer."

The useful part was designing what should happen **after** the grade.

The coaching loop is:

```text
answer
  ↓
structured review
  ↓
identify the weakest signal
  ↓
one concrete drill
  ↓
retry the answer
  ↓
adaptive follow-up
  ↓
repeat
```

That is a much smaller and more opinionated product than a chatbot, but it is closer to the real behavior I wanted for my friend.

## My Agent Session

Optional: add a DevRelay session link here if one is available.

## Prize Categories

### Best Use of Gemma

Gemma 3 is the core reasoning model used to evaluate answers, produce the five-part rubric, create the focused coaching plan, and generate the adaptive follow-up that drives the next interview turn.

### Best Use of Render

Render hosts the public frontend/demo so judges can experience the product without installing the local stack first.

## Links

- **Live demo:** https://friend-interview-coach-hf26.onrender.com
- **GitHub:** https://github.com/knockknock10/friend-interview-coach-hf26
- **Cover image:** upload the generated Hacktoberfest cover image with the DEV composer

