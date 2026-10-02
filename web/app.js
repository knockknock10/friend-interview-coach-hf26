const questions = [
  { label: 'Behavioral', prompt: 'Tell me about a project where something went wrong. What did you do next?' },
  { label: 'Technical', prompt: 'How would you design a URL shortener for production traffic?' },
  { label: 'Follow-up', prompt: 'What trade-off did you make in that design, and what would you change at 10× scale?' },
  { label: 'Behavioral', prompt: 'Tell me about a time you disagreed with a teammate. How did you resolve it?' }
];

const HOSTED_DEMO = !['localhost', '127.0.0.1'].includes(location.hostname);

const demoFeedback = {
  score: 7,
  summary: 'Clear ownership and a useful outcome. The answer would be stronger with a sharper structure and one measurable result.',
  strengths: ['You took ownership instead of blaming the situation.', 'The decision you described is easy to follow.'],
  improvements: ['State the situation and constraint in one sentence first.', 'End with a concrete result or metric.'],
  nextQuestion: 'What was the biggest trade-off in your decision, and what would you do differently now?'
};

const state = {
  index: 0,
  history: JSON.parse(localStorage.getItem('local-interview-coach-history') || '[]')
};

const $ = (id) => document.getElementById(id);

function renderQuestion() {
  $('questionKind').textContent = questions[state.index].label;
  $('questionText').textContent = questions[state.index].prompt;
  $('answer').value = '';
  $('feedback').className = 'empty-state';
  $('feedback').innerHTML = '<div class="empty-icon">◎</div><p>Your feedback appears here after you submit an answer.</p><span>Tip: strong answers usually show situation → decision → action → result.</span>';
  $('score').textContent = '';
}

function renderHistory() {
  if (!state.history.length) {
    $('history').innerHTML = '<p class="history-empty">No answers yet. Start with one question above.</p>';
    return;
  }
  $('history').innerHTML = state.history.map((item, i) => `
    <article class="history-item">
      <div class="history-index">${String(state.history.length - i).padStart(2, '0')}</div>
      <div><strong>${escapeHtml(item.kind)}</strong><p>${escapeHtml(item.question)}</p><span>${item.score}/10</span></div>
    </article>
  `).join('');
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[ch]));
}

function showFeedback(data) {
  $('score').innerHTML = `<span>${data.score}</span>/10`;
  $('feedback').className = 'feedback-grid';
  $('feedback').innerHTML = `
    <div class="summary"><h3>Readout</h3><p>${escapeHtml(data.summary)}</p></div>
    <div><h3>What worked</h3>${data.strengths.map(x => `<p class="feedback-item positive">+ ${escapeHtml(x)}</p>`).join('')}</div>
    <div><h3>What to sharpen</h3>${data.improvements.map(x => `<p class="feedback-item">→ ${escapeHtml(x)}</p>`).join('')}</div>
    <div class="next"><h3>Next follow-up</h3><p>${escapeHtml(data.nextQuestion)}</p></div>
  `;
}

async function checkHealth() {
  if (HOSTED_DEMO) {
    $('runtimeStatus').textContent = 'hosted demo · sample feedback';
    return;
  }
  try {
    const r = await fetch('http://localhost:8787/api/health');
    const data = await r.json();
    $('runtimeStatus').textContent = data.model ? `${data.model} · local` : 'local runtime';
  } catch {
    $('runtimeStatus').textContent = 'start local runtime';
  }
}

$('nextQuestion').addEventListener('click', () => {
  state.index = (state.index + 1) % questions.length;
  renderQuestion();
});

$('reviewAnswer').addEventListener('click', async () => {
  const answer = $('answer').value.trim();
  if (!answer) return;
  const button = $('reviewAnswer');
  button.disabled = true;
  button.textContent = 'Thinking locally…';
  try {
    let data;
    if (HOSTED_DEMO) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      data = demoFeedback;
    } else {
      const response = await fetch('http://localhost:8787/api/review', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        job: $('job').value.trim(), context: $('context').value.trim(),
        question: questions[state.index].prompt, answer
      })
      });
      data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Local coach unavailable');
    }
    showFeedback(data);
    state.history.unshift({ kind: questions[state.index].label, question: questions[state.index].prompt, score: data.score });
    state.history = state.history.slice(0, 8);
    localStorage.setItem('local-interview-coach-history', JSON.stringify(state.history));
    renderHistory();
  } catch (error) {
    $('score').textContent = 'offline';
    $('feedback').className = 'empty-state';
    $('feedback').innerHTML = `<div class="empty-icon">!</div><p>${escapeHtml(error.message)}</p><span>Run Ollama, pull Gemma 3, then start the local Node server.</span>`;
  } finally {
    button.disabled = false;
    button.textContent = 'Review my answer';
  }
});

document.querySelectorAll('.mode').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.mode').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    document.body.dataset.mode = button.dataset.mode;
  });
});

renderHistory();
checkHealth();
