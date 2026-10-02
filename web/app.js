const questions = [
  { label: 'Behavioral', prompt: 'Tell me about a project where something went wrong. What did you do next?', hint: 'Use situation → decision → action → result.' },
  { label: 'Technical', prompt: 'How would you design a URL shortener for production traffic?', hint: 'State requirements before jumping into components.' },
  { label: 'System Design', prompt: 'Design a notification system that can handle millions of events per day.', hint: 'Start with requirements, scale, failure modes, and trade-offs.' },
  { label: 'Projects', prompt: 'Walk me through the hardest technical decision you made in a project.', hint: 'Explain the constraint, options, decision, and consequence.' },
  { label: 'Behavioral', prompt: 'Tell me about a time you disagreed with a teammate. How did you resolve it?', hint: 'Focus on your reasoning and the outcome, not the drama.' },
  { label: 'Technical', prompt: 'What happens from the moment you enter a URL until a web page appears?', hint: 'Keep the layers in order and call out where latency can hide.' },
  { label: 'Leadership', prompt: 'Tell me about a time you had to move a team forward when you did not have formal authority.', hint: 'Show influence, communication, and the outcome.' },
  { label: 'Debugging', prompt: 'A production endpoint suddenly becomes 10× slower. How do you investigate?', hint: 'Think observability, hypotheses, isolation, and rollback.' },
  { label: 'Projects', prompt: 'Tell me about a feature you shipped that you would redesign today.', hint: 'Be specific about the original constraint and what you learned.' },
  { label: 'Behavioral', prompt: 'Tell me about a time you received difficult feedback. What changed afterward?', hint: 'Show reflection and a concrete behavior change.' }
];

const HOSTED_DEMO = !['localhost', '127.0.0.1'].includes(location.hostname);

const demoFeedback = {
  score: 7,
  summary: 'Clear ownership and a useful outcome. The core story works; the main weakness is that the result is described qualitatively instead of with evidence.',
  strengths: [
    'You took ownership instead of blaming the situation.',
    'The technical cause and the action are easy to follow.'
  ],
  improvements: [
    'State the constraint and impact before explaining the fix.',
    'Close with a concrete result or observable change.'
  ],
  rubric: { structure: 8, specificity: 6, ownership: 8, reasoning: 7, communication: 7 },
  coachPlan: {
    focus: 'Specificity',
    why: 'The answer says the response time dropped, but an interviewer cannot tell how much it changed or why the fix mattered.',
    drill: 'Retry the same answer and include one concrete before/after observation, even if it is approximate.',
  },
  nextQuestion: 'How did you verify that the index fixed the real bottleneck rather than just improving the demo case?',
  retryPrompt: 'Retry this answer in under 90 seconds. Keep the same story, but make the result concrete and measurable.'
};

const demoAnswer = "I was working on a backend service for a college project when our database calls started timing out during a demo. I traced the issue to an inefficient query being executed repeatedly. I changed the query path, added an index, and tested the endpoint again. The response time dropped a lot and we finished the demo. If I did it again, I would add query monitoring earlier so we could catch the regression before the demo.";

const state = {
  index: 0,
  currentQuestion: questions[0].prompt,
  currentKind: questions[0].label,
  answerMode: 'question',
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
  state.currentQuestion = q.prompt;
  state.currentKind = q.label;
  state.answerMode = 'question';
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
  const scores = state.history.map((item) => Number(item.score)).filter(Number.isFinite);
  const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '—';
  const best = scores.length ? Math.max(...scores).toString() : '—';
  const recent = scores.slice(0, 3);
  const older = scores.slice(3, 6);
  const trend = recent.length && older.length
    ? (recent.reduce((a, b) => a + b, 0) / recent.length - older.reduce((a, b) => a + b, 0) / older.length)
    : null;
  $('avgScore').textContent = avg === '—' ? '—' : `${avg}/10`;
  $('bestScore').textContent = best === '—' ? '—' : `${best}/10`;
  $('trendScore').textContent = trend === null ? '—' : `${trend >= 0 ? '+' : ''}${trend.toFixed(1)}`;

  if (!state.history.length) {
    $('history').innerHTML = '<p class="history-empty">No answers yet. Start with one question above.</p>';
    return;
  }

  $('history').innerHTML = state.history.map((item, i) => `
    <article class="history-item">
      <div class="history-index">${String(state.history.length - i).padStart(2, '0')}</div>
      <div class="history-copy">
        <div class="history-top"><strong>${escapeHtml(item.kind)}</strong><span>${escapeHtml(item.score)}/10</span></div>
        <p>${escapeHtml(item.question)}</p>
        ${item.focus ? `<p class="history-focus">Focus: ${escapeHtml(item.focus)}</p>` : ''}
      </div>
    </article>
  `).join('');
}

function updateCharCount() {
  $('charCount').textContent = `${$('answer').value.trim().length} chars`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[ch]));
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

  const plan = data.coachPlan || {
    focus: 'Specificity',
    why: 'Make the next answer easier to verify.',
    drill: 'Add one concrete result to your final sentence.'
  };

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
    <div class="wide next">
      <h3>Your next 10 minutes</h3>
      <p><strong>Focus:</strong> ${escapeHtml(plan.focus)}</p>
      <p><strong>Why:</strong> ${escapeHtml(plan.why)}</p>
      <p><strong>Drill:</strong> ${escapeHtml(plan.drill)}</p>
      <div class="follow-up-actions">
        <button class="primary compact" id="retryButton">Retry this answer</button>
        <button class="ghost compact" id="followUpButton">Ask the follow-up</button>
      </div>
    </div>
  `;

  const retryButton = $('retryButton');
  if (retryButton) {
    retryButton.addEventListener('click', () => {
      state.answerMode = 'retry';
      $('questionKind').textContent = 'Retry';
      $('questionText').textContent = state.currentQuestion;
      $('answerHint').textContent = data.retryPrompt || `Retry this answer using the focus: ${plan.focus}`;
      $('answer').value = '';
      updateCharCount();
      stopTimer(true);
      $('answer').focus();
      window.scrollTo({ top: document.querySelector('.question-card').offsetTop - 20, behavior: 'smooth' });
    }, { once: true });
  }

  const followUpButton = $('followUpButton');
  if (followUpButton) {
    followUpButton.addEventListener('click', () => {
      state.answerMode = 'follow-up';
      state.currentQuestion = data.nextQuestion;
      state.currentKind = 'Follow-up';
      $('questionKind').textContent = 'Follow-up';
      $('questionText').textContent = data.nextQuestion;
      $('answerHint').textContent = 'This question was generated from your previous answer.';
      $('answer').value = '';
      updateCharCount();
      stopTimer(true);
      $('answer').focus();
      window.scrollTo({ top: document.querySelector('.question-card').offsetTop - 20, behavior: 'smooth' });
    }, { once: true });
  }
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job: $('job').value.trim(),
          context: $('context').value.trim(),
          question: state.currentQuestion,
          answer,
          mode: document.body.dataset.mode || 'practice'
        })
      });

      data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Local coach unavailable');
    }

    showFeedback(data);
    state.history.unshift({
      kind: state.currentKind,
      question: state.currentQuestion,
      score: data.score,
      rubric: data.rubric || null,
      focus: data.coachPlan?.focus || null
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

$('exportSession').addEventListener('click', () => {
  const payload = {
    exportedAt: new Date().toISOString(),
    project: 'Local Interview Coach',
    targetRole: $('job').value.trim(),
    goal: $('context').value.trim(),
    mode: document.body.dataset.mode || 'practice',
    attempts: state.history
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'local-interview-coach-session.json';
  link.click();
  URL.revokeObjectURL(url);
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
