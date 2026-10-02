const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api/chat';
const MODEL = process.env.OLLAMA_MODEL || 'gemma3:4b';

export function buildPrompt({ job, context, question, answer, mode = 'practice' }) {
  return [
    'You are a rigorous but kind software interview coach.',
    'Your job is to improve the candidate\'s next answer, not to impress them with generic advice.',
    `Mode: ${mode}. In pressure mode, be more concise and probe weak claims.`,
    `Target role: ${job}`,
    `Candidate goal: ${context}`,
    `Question: ${question}`,
    `Answer: ${answer}`,
    '',
    'Judge only what the candidate actually said. Do not invent metrics, technologies, ownership, or outcomes.',
    'Reward clear structure, specificity, ownership, technical correctness, reasoning, trade-off awareness and communication.',
    'Prefer concrete advice that can be applied on the next answer.',
    '',
    'Return ONLY valid JSON matching this schema:',
    '{"score":number,"summary":string,"strengths":string[],"improvements":string[],"rubric":{"structure":number,"specificity":number,"ownership":number,"reasoning":number,"communication":number},"coachPlan":{"focus":string,"why":string,"drill":string},"nextQuestion":string,"retryPrompt":string}',
    '',
    'score and every rubric value must be an integer from 1 to 10.',
    'coachPlan.focus must name exactly one skill to improve next.',
    'coachPlan.drill must be a short exercise the candidate can do immediately.',
    'nextQuestion should probe the weakest or least-supported part of the answer and move the interview forward.',
    'retryPrompt should tell the candidate how to retry the same answer using the focus skill.',
  ].join('\\n');
}

export function validateInput(payload) {
  const limits = { job: 300, context: 2000, question: 1000, answer: 12000 };
  for (const [key, limit] of Object.entries(limits)) {
    if (typeof payload[key] !== 'string' || payload[key].trim().length === 0) {
      throw new Error(`${key} is required`);
    }
    if (payload[key].length > limit) {
      throw new Error(`${key} must be <= ${limit} characters`);
    }
  }
}

export function validateFeedback(data) {
  const rubricKeys = ['structure', 'specificity', 'ownership', 'reasoning', 'communication'];
  if (!Number.isFinite(data.score) || data.score < 1 || data.score > 10) throw new Error('Model returned an invalid score');
  if (!data.summary || !Array.isArray(data.strengths) || !Array.isArray(data.improvements) || !data.nextQuestion || !data.retryPrompt) {
    throw new Error('Model returned incomplete feedback');
  }
  for (const key of rubricKeys) {
    if (!Number.isFinite(data.rubric?.[key]) || data.rubric[key] < 1 || data.rubric[key] > 10) {
      throw new Error(`Model returned an invalid ${key} rubric score`);
    }
  }

  const plan = data.coachPlan;
  if (!plan || !plan.focus || !plan.why || !plan.drill) {
    throw new Error('Model returned an incomplete coach plan');
  }

  return data;
}

export async function reviewWithOllama(payload) {
  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      format: 'json',
      messages: [
        {
          role: 'system',
          content: 'You evaluate interview answers and produce concise, evidence-based, actionable feedback.'
        },
        { role: 'user', content: buildPrompt(payload) }
      ],
      options: { temperature: 0.2 }
    })
  });

  if (!response.ok) throw new Error(`Ollama responded ${response.status}`);

  const data = await response.json();
  let parsed;
  try {
    parsed = JSON.parse(data?.message?.content || '');
  } catch {
    throw new Error('Ollama returned malformed JSON');
  }
  return validateFeedback(parsed);
}

export { MODEL, OLLAMA_URL };
