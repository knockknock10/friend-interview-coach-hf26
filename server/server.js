import http from 'node:http';

const PORT = 8787;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api/chat';
const MODEL = process.env.OLLAMA_MODEL || 'gemma3:4b';

const headers = {
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

function send(res, status, body) {
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

function promptFor({ job, context, question, answer }) {
  return `You are a rigorous but kind interview coach. Review one candidate answer for the target role below.\n\nTarget role: ${job}\nCandidate goal: ${context}\nQuestion: ${question}\nAnswer: ${answer}\n\nReturn ONLY valid JSON with this schema:\n{"score":number,"summary":string,"strengths":string[],"improvements":string[],"rubric":{"structure":number,"specificity":number,"ownership":number,"reasoning":number,"communication":number},"nextQuestion":string}\nScore 1-10. Be specific. Reward clarity, structure, technical correctness, ownership, trade-off awareness, and measurable results. Do not invent achievements.`;
}

async function review(payload) {
  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      format: 'json',
      messages: [
        { role: 'system', content: 'You evaluate interview answers and produce concise actionable feedback.' },
        { role: 'user', content: promptFor(payload) }
      ],
      options: { temperature: 0.2 }
    })
  });
  if (!response.ok) throw new Error(`Ollama responded ${response.status}`);
  const data = await response.json();
  return JSON.parse(data.message.content);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method === 'GET' && req.url === '/api/health') return send(res, 200, { ok: true, model: MODEL });
  if (req.method !== 'POST' || req.url !== '/api/review') return send(res, 404, { error: 'Not found' });
  try {
    const payload = JSON.parse(await readBody(req));
    if (!payload.answer || payload.answer.length > 12000) return send(res, 400, { error: 'Answer is required and must be <= 12k characters.' });
    const feedback = await review(payload);
    return send(res, 200, feedback);
  } catch (error) {
    return send(res, 502, { error: error.message || 'Local model request failed.' });
  }
});

server.listen(PORT, () => {
  console.log(`Local Interview Coach server listening on http://localhost:${PORT}`);
  console.log(`Using ${MODEL} through Ollama at ${OLLAMA_URL}`);
});
