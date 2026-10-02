import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPrompt, validateInput, validateFeedback } from './coaching.js';

test('buildPrompt includes the interview context and coaching contract', () => {
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
  assert.match(prompt, /coachPlan/);
  assert.match(prompt, /Do not invent metrics/);
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

test('validateFeedback accepts a complete coaching response', () => {
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
    coachPlan: {
      focus: 'Specificity',
      why: 'The answer explains the fix but not the measurable effect.',
      drill: 'Say the result in one sentence with a number or concrete observation.'
    },
    nextQuestion: 'What trade-off did you make?',
    retryPrompt: 'Retry the answer and finish with the measurable result.'
  });

  assert.equal(feedback.score, 8);
  assert.equal(feedback.coachPlan.focus, 'Specificity');
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
      coachPlan: {
        focus: 'Specificity',
        why: 'The answer needs stronger evidence.',
        drill: 'Add one concrete result.'
      },
      nextQuestion: 'What trade-off did you make?',
      retryPrompt: 'Retry with a measurable result.'
    }),
    /invalid structure rubric score/
  );
});

test('validateFeedback rejects an incomplete coach plan', () => {
  assert.throws(
    () => validateFeedback({
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
      coachPlan: {
        focus: 'Specificity',
        why: 'The answer needs stronger evidence.'
      },
      nextQuestion: 'What trade-off did you make?',
      retryPrompt: 'Retry with a measurable result.'
    }),
    /incomplete coach plan/
  );
});
