import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPrompt, validateInput, validateFeedback } from './coaching.js';

test('buildPrompt includes the interview context', () => {
  const prompt = buildPrompt({
    job: 'Backend intern',
    context: 'practice concise project explanations',
    question: 'Tell me about a failure',
    answer: 'A query timed out and I fixed the index.',
    mode: 'pressure'
  });

  assert.match(prompt, /Backend intern/);
  assert.match(prompt, /pressure/);
  assert.match(prompt, /A query timed out/);
});

test('validateInput rejects an empty answer', () => {
  assert.throws(
    () => validateInput({
      job: 'Backend intern',
      context: 'practice',
      question: 'Question',
      answer: ''
    }),
    /answer is required/
  );
});

test('validateFeedback accepts a complete rubric response', () => {
  const feedback = validateFeedback({
    score: 8,
    summary: 'Good answer.',
    strengths: ['Clear ownership.'],
    improvements: ['Add a metric.'],
    rubric: {
      structure: 8,
      specificity: 7,
      ownership: 9,
      reasoning: 8,
      communication: 8
    },
    nextQuestion: 'What trade-off did you make?'
  });

  assert.equal(feedback.score, 8);
});

test('validateFeedback rejects invalid rubric values', () => {
  assert.throws(
    () => validateFeedback({
      score: 8,
      summary: 'Good answer.',
      strengths: ['Clear ownership.'],
      improvements: ['Add a metric.'],
      rubric: {
        structure: 11,
        specificity: 7,
        ownership: 9,
        reasoning: 8,
        communication: 8
      },
      nextQuestion: 'What trade-off did you make?'
    }),
    /invalid structure rubric score/
  );
});
