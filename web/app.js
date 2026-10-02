const questions = [
  { label: 'Behavioral', prompt: 'Tell me about a project where something went wrong. What did you do next?', hint: 'Use situation → decision → action → result.' },
  { label: 'Technical', prompt: 'How would you design a URL shortener for production traffic?', hint: 'State requirements before jumping into components.' },
  { label: 'Follow-up', prompt: 'What trade-off did you make in that design, and what would you change at 10× scale?', hint: 'A good follow-up exposes what you chose not to optimize.' },
  { label: 'Behavioral', prompt: 'Tell me about a time you disagreed with a teammate. How did you resolve it?', hint: 'Focus on your reasoning and the outcome, not the drama.' }
];

const HOSTED_DEMO = !['localhost', '127.0.0.1'].includes(location.hostname);

const demoFeedback = {
  score: 7,
  summary: 'Clear ownership and a useful outcome. The answer has a good core story; the next step is making the evidence easier to trust.',
  strengths: [
    'You took ownership instead of blaming the situation.',
    'The decision you described is easy to follow.'
  ],
  improvements: [
    'State the situation and constraint in one sentence first.',
    'End with one concrete result or metric.'
  ],
  rubric: { structure: 8, specificity: 6, ownership: 8, reasoning: 7, communication: 7 },
  nextQuestion: 'What was the biggest trade-off in your decision, and what would you do differently now?'
};

const demoAnswer = "I was working on a backend service for a college project when our database calls started timing out during a demo. I traced the issue to an inefficient query being executed repeatedly. I changed the query path, added an index, and tested the endpoint again. The response time dropped a lot and we finished the demo. If I did it again, I would add query monitoring earlier so we could catch the regression before the demo.";

const state = {
  index: 0,
  timer: 90,
  timerId: null,
  history: JSON.parse(localStorage.getItem('local-interview-coach-history') || '[]')
};

const $ = (id) => document.getElementById(id);

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function stopTimer(reset = true) {
  if (state.timerId) clearInterval(state.timerId);
  state.timerId = null;
  if (reset) state.timer = document.body.dataset.mode === 'pressure' ? 60 : 90;
  $('timer').textContent = formatTime(state.timer);
  $('timerButton').textContent = 'Start timer';
  $('timerButton').classList.remove('timer-live');
}

function startTimer() {
  if (state.timerId) return;
  if (state.timer <= 0) state.timer = document.body.dataset.mode === 'pressure' ? 60 : 90;
  $('timerButton').textContent = 'Pause timer';
  $('timerButton').classList.add('timer-live');
  state.timerId = setInterval(() => {
    state.timer -= 1;
    $('timer').textContent = formatTime(state.timer);
    if (state.timer <= 0) {
      stopTimer(false);
      $('timerButton').textContent = 'Time done';
    }
  }, 1000);
}

function renderQuestion() {
  const q = questions[state.index];
  $('questionKind').textContent = q.label;
  $('questionText').textContent = q.prompt;
  $('answerHint').textContent = q.hint;
  stopTimer(true);
  $('answer').value = '';
  updateCharCount();
  resetFeedback();
}

function resetFeedback() {
  $('feedback').className = 'empty-state';
  $('feedback').innerHTML = '<div class="empty-icon">◎</div><p>Your feedback appears here after you submit an answer.</p><span>Strong answers usually show situation → decision → action → result.</span>';
  $('score').textContent = '';
}

function renderHistory() {
  $('sessionCount').textContent = `${state.history.length} ${state.history.length === 1 ? 'attempt' : 'attempts'}`;
  if (!state.history.length) {
    $('history').innerHTML = '<p class="history-empty">No answers yet. Start with one question above.</p>';
    return;
  }

  $('history').innerHTML = state.history.map((item, i) => `
    <article class="history-item">
      <div class="history-index">${String(state.history.length - i).padStart(2, '0')}</div>
      <div class="history-copy">
        <div class="history-top"><strong>${escapeHtml(item.kind)}</strong><span>${item.score}/10</span></div>
        <p>${escapeHtml(item.question)}</p>
      </div>
    </article>
  `).join('');
}

function updateCharCount() {
  $('charCount').textContent = `${$('answer').value.trim().length} chars`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[ch]));
}

function showFeedback(data) {
  const rubric = data.rubric || {};
  const rubricCards = [
    ['Structure', rubric.structure],
    ['Specificity', rubric.specificity],
    ['Ownership', rubric.ownership],
    ['Reasoning', rubric.reasoning],
    ['Communication', rubric.communication]
  ].filter(([, score]) => Number.isFinite(score));

  $('score').innerHTML = `<span>${escapeHtml(data.score)}</span>/10`;
  $('feedback').className = 'feedback-grid';
  $('feedback').innerHTML = `
    <div class="summary wide">
      <h3>Readout</h3>
      <p>${escapeHtml(data.summary)}</p>
    </div>
    <div>
      <h3>What worked</h3>
      ${(data.strengths || []).map(x => `<p class="feedback-item positive">+ ${escapeHtml(x)}</p>`).join('')}
    </div>
    <div>
      <h3>What to sharpen</h3>
      ${(data.improvements || []).map(x => `<p class="feedback-item">→ ${escapeHtml(x)}</p>`).join('')}
    </div>
    <div class="rubric wide">
      <h3>Signal check</h3>
      <div class="rubric-grid">
        ${rubricCards.map(([label, value]) => `
          <div class="rubric-card"><span>${label}</span><strong>${value}/10</strong><div class="bar"><i style="width:${Math.min(Number(value) * 10, 100)}%"></i></div></div>
        `).join('')}
      </div>
    </div>
    <div class="next wide">
      <h3>Next follow-up</h3>
      <p>${escapeHtml(data.nextQuestion)}</p>
    </div>
  `;
}

async function checkHealth() {
  if (HOSTED_DEMO) {
    $('runtimeStatus').textContent = 'hosted demo · sample feedback';
    return;
  }

  try {
    const response = await fetch('http://localhost:8787/api/health');
    const data = await response.json();
    $('runtimeStatus').textContent = data.model ? `${data.model} · local` : 'local runtime';
  } catch {
    $('runtimeStatus').textContent = 'start local runtime';
  }
}

async function reviewAnswer() {
  const answer = $('answer').value.trim();
  if (!answer) {
    $('answer').focus();
    return;
  }

  const button = $('reviewAnswer');
  button.disabled = true;
  button.textContent = HOSTED_DEMO ? 'Loading demo…' : 'Thinking locally…';

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
          job: $('job').value.trim(),
          context: $('context').value.trim(),
          question: questions[state.index].prompt,
          answer,
          mode: document.body.dataset.mode || 'practice'
        })
      });

      data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Local coach unavailable');
    }

    showFeedback(data);
    state.history.unshift({
      kind: questions[state.index].label,
      question: questions[state.index].prompt,
      score: data.score,
      rubric: data.rubric || null
    });
    state.history = state.history.slice(0, 8);
    localStorage.setItem('local-interview-coach-history', JSON.stringify(state.history));
    renderHistory();

    document.querySelector('.feedback-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    $('score').textContent = 'offline';
    $('feedback').className = 'empty-state';
    $('feedback').innerHTML = `<div class="empty-icon">!</div><p>${escapeHtml(error.message)}</p><span>Run Ollama, pull Gemma 3, then start the local Node server.</span>`;
  } finally {
    button.disabled = false;
    button.textContent = 'Review my answer';
  }
}

$('timerButton').addEventListener('click', () => {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
    $('timerButton').textContent = 'Resume timer';
    $('timerButton').classList.remove('timer-live');
  } else {
    startTimer();
  }
});

$('nextQuestion').addEventListener('click', () => {
  state.index = (state.index + 1) % questions.length;
  renderQuestion();
});

$('reviewAnswer').addEventListener('click', reviewAnswer);

$('answer').addEventListener('input', updateCharCount);

$('loadDemo').addEventListener('click', () => {
  $('answer').value = demoAnswer;
  updateCharCount();
  $('answer').focus();
});

$('clearHistory').addEventListener('click', () => {
  state.history = [];
  localStorage.removeItem('local-interview-coach-history');
  renderHistory();
});

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') reviewAnswer();
});

document.querySelectorAll('.mode').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.mode').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    document.body.dataset.mode = button.dataset.mode;
    stopTimer(true);
  });
});

renderQuestion();
renderHistory();
checkHealth();
