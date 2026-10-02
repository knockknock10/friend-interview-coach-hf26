---
title: I Built a Private AI Interview Coach for a Friend
published: false
tags: devchallenge, weekendchallenge, hf26challenge
---

*This is a submission for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01)*

## What I Built

I built **Local Interview Coach**, a focused mock-interview tool for a friend preparing for software interviews.

The problem is not that interview questions are hard to find. The problem is repetition. A mock interview is useful, but it usually means asking another person to stop what they are doing, remember the role, ask a question, listen carefully, and then give useful feedback. That makes practice hard to repeat.

So I built a smaller loop:

**question → answer → critique → follow-up → repeat**

The coach lets the user choose a target role, choose between practice and pressure mode, answer a behavioral or technical question, run a timer, and receive structured feedback. Recent attempts stay in browser storage.

### The real design constraint

I wanted the interview answer itself to stay private. A candidate may paste project details, failed answers, trade-offs, or notes about previous interviews. For the real application, the model runs locally through Ollama instead of sending that material to a closed AI API.

> **Personalize this paragraph before publishing:** add the real friend situation in one or two sentences and, after they try it, add what actually changed for them.

## Demo

**Live:** https://friend-interview-coach-hf26.onrender.com

The hosted demo is intentionally labeled **sample feedback**. It lets a judge experience the UI and the complete interaction without pretending that a private local model is running inside a public static site.

For the real AI path:

NaN

NaN

## Code

https://github.com/knockknock10/friend-interview-coach-hf26

## How I Built It

NaN

NaN

NaN

NaN

NaN

NaN

## Why Does Open Innovation Matter?

NaN

NaN

NaN

## My Agent Session

NaN

## Prize Categories

NaN