---
title: Local Interview Coach — private interview rehearsal with open AI
published: false
tags: devchallenge, weekendchallenge, hf26challenge
---

*This is a submission for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01)*

## What I Built

I built **Local Interview Coach**, a small local-first interview practice partner for a friend who is preparing for software interviews.

The problem was simple: practicing alone is uncomfortable, but repeatedly asking another person to act as an interviewer gets tiring. This tool turns practice into a repeatable private loop: answer a question, get specific feedback, then face a follow-up.

The important part is that the interview answer stays on the laptop.

## Demo

**Demo:** https://friend-interview-coach-hf26.onrender.com

The main flow is:

1. Choose the target role and the skill to practice.
2. Answer a behavioral or technical question.
3. Send the answer to the local coach.
4. Get a score, strengths, weaknesses, and the next follow-up question.
5. Keep the session history in the browser.

## Code

**GitHub:** https://github.com/knockknock10/friend-interview-coach-hf26

## How I Built It

The UI is plain HTML/CSS/JavaScript so the project stays tiny and easy to hand to someone else. A small Node.js server provides one review endpoint.

The AI layer is **Gemma 3 running locally through Ollama**. The server sends the role, practice goal, interview question, and answer to the local model and asks for structured JSON feedback.

```text
Browser UI
   |
   | POST /api/review
   v
Local Node API
   |
   | Ollama HTTP API
   v
Gemma 3 (local)
   |
   v
Structured coaching feedback
```

There is no required cloud AI API and no account system.

## Why Does Open Innovation Matter?

For this particular problem, local open-weight AI changes the product, not just the implementation.

A friend preparing for interviews may type private project details, failed answers, salary questions, or notes about past interviews. Keeping the model on the same machine means those transcripts do not need to be sent to a closed AI provider just to get feedback.

It also keeps the coach replaceable. The default model is Gemma 3, but the runtime can point at another local Ollama model without changing the interface.

That flexibility directly supports the person's need for repeated, private rehearsal.

## My Agent Session

Optional: add a DevRelay session link if you choose to include one.

## Prize Categories

- **Best Use of Gemma** — Gemma is the open-weight model that performs the core answer-review task.

Remove this section if the final project does not enter the category.

---

### Before publishing

Replace the demo and optional DevRelay placeholders and add one honest sentence about what the friend said after using the tool. Do not invent feedback, a demo URL, or an agent-session link.
