import http from 'node:http';
import { reviewWithOllama, validateInput, MODEL, OLLAMA_URL } from './coaching.js';

const PORT = Number(process.env.PORT || 8787);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});

  if (req.method === 'GET' && req.url === '/api/health') {
    return send(res, 200, {
      ok: true,
      runtime: 'local',
      model: MODEL,
      endpoint: OLLAMA_URL
    });
  }

  if (req.method !== 'POST' || req.url !== '/api/review') {
    return send(res, 404, { error: 'Not found' });
  }

  try {
    const payload = JSON.parse(await readBody(req));
    validateInput(payload);
    const feedback = await reviewWithOllama(payload);
    return send(res, 200, feedback);
  } catch (error) {
    const message = error?.message || 'Local model request failed.';
    const status = error instanceof SyntaxError || /required|must be <=/.test(message) ? 400 : 502;
    return send(res, status, { error: message });
  }
});

server.listen(PORT, () => {
  console.log(`Local Interview Coach server listening on http://localhost:${PORT}`);
  console.log(`Using ${MODEL} through Ollama at ${OLLAMA_URL}`);
});
