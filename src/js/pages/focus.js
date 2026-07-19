import {mountLayout,toast} from '../components/layout.js';
import {list,save} from '../services/data.js';

mountLayout('Focus');

const presetButtons = [...document.querySelectorAll('.filter-chip')];
const display = document.querySelector('#timer');
const ring = document.querySelector('.focus-ring');
const startButton = document.querySelector('#start');
const resetButton = document.querySelector('#reset');
const noteInput = document.querySelector('#focus-note');
const currentIntent = document.querySelector('#current-intent');
const statusPill = document.querySelector('#status-pill');
const remainingLabel = document.querySelector('#remaining-label');
const sessionList = document.querySelector('#session-list');
const focusCount = document.querySelector('#focus-count');
const focusMinutes = document.querySelector('#focus-minutes');
const focusBest = document.querySelector('#focus-best');
const intentCount = document.querySelector('#intent-count');

const savedNote = localStorage.getItem('wellspring-focus-note') || '';
noteInput.value = savedNote;
currentIntent.textContent = savedNote.trim() || 'Write one intention before starting';
intentCount.textContent = String(savedNote.length);

let total = 25 * 60;
let left = total;
let timer = null;
let sessions = [];

function formatTime(seconds) {
	const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
	const secs = String(seconds % 60).padStart(2, '0');
	return `${minutes}:${secs}`;
}

function setStatus(text) {
	statusPill.innerHTML = `<i class="bi bi-dot"></i> ${text}`;
}

function setActivePreset(minutes) {
	presetButtons.forEach(button => button.classList.toggle('active', Number(button.dataset.duration) === minutes));
}

function paint() {
	display.textContent = formatTime(left);
	ring.style.setProperty('--progress', `${100 - (left / total * 100)}%`);
	remainingLabel.textContent = left === 1 ? 'minute remaining' : 'minutes remaining';
	document.title = timer ? `${formatTime(left)} | Focus | WellSpring` : 'Focus | WellSpring';
}

function setStartButton(label, icon = 'bi-play-fill') {
	startButton.innerHTML = `<i class="bi ${icon} me-1"></i><span>${label}</span>`;
}

function updateStats() {
	const completed = sessions.filter(session => session.completed);
	const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
	const weeklyMinutes = completed
		.filter(session => new Date(session.created_at).getTime() >= weekStart)
		.reduce((sum, session) => sum + Number(session.duration_minutes || 0), 0);
	const bestSession = completed.reduce((best, session) => Math.max(best, Number(session.duration_minutes || 0)), 0);

	focusCount.textContent = String(completed.length);
	focusMinutes.textContent = String(weeklyMinutes);
	focusBest.textContent = String(bestSession);
}

function renderSessions() {
	if (!sessions.length) {
		sessionList.innerHTML = '<div class="empty"><i class="bi bi-hourglass-split fs-1"></i><p class="mb-0 mt-2">Completed sessions will appear here.</p></div>';
		return;
	}

	sessionList.innerHTML = sessions.slice(0, 6).map(session => {
		const when = new Date(session.created_at);
		return `
			<article class="d-flex justify-content-between align-items-center gap-3 py-3 border-bottom">
				<div>
					<strong>${Number(session.duration_minutes || 0)} min focus</strong>
					<small class="d-block text-secondary">${when.toLocaleDateString([], {month: 'short', day: 'numeric'})} · ${when.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'})}</small>
				</div>
				<span class="pill"><i class="bi bi-check2"></i> Done</span>
			</article>
		`;
	}).join('');
}

async function refreshSessions() {
	sessions = (await list('focus_sessions')).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
	updateStats();
	renderSessions();
}

function resetTimer(message = 'Ready') {
	clearInterval(timer);
	timer = null;
	left = total;
	setStartButton('Start focus');
	setStatus(message);
	paint();
}

function chooseDuration(minutes, announce = true) {
	clearInterval(timer);
	timer = null;
	total = left = minutes * 60;
	setStartButton('Start focus');
	setActivePreset(minutes);
	setStatus('Ready');
	paint();
	if (announce) {
		toast(`Set to ${minutes} minutes`, 'dark');
	}
}

async function finishSession() {
	clearInterval(timer);
	timer = null;
	left = 0;
	paint();
	setStartButton('Start again', 'bi-arrow-repeat');
	setStatus('Session saved');
	await save('focus_sessions', {duration_minutes: total / 60, completed: true});
	toast('Focus session complete!');
	await refreshSessions();
	left = total;
	paint();
}

presetButtons.forEach(button => {
	button.addEventListener('click', () => chooseDuration(Number(button.dataset.duration)));
});

noteInput.addEventListener('input', () => {
	const note = noteInput.value.trim();
	localStorage.setItem('wellspring-focus-note', noteInput.value);
	currentIntent.textContent = note || 'Write one intention before starting';
	intentCount.textContent = String(noteInput.value.length);
});

function toggleTimer() {
	if (timer) {
		clearInterval(timer);
		timer = null;
		setStartButton('Resume');
		setStatus('Paused');
		paint();
		return;
	}

	setStartButton('Pause', 'bi-pause-fill');
	setStatus(left === total ? 'In progress' : 'Resumed');
	timer = setInterval(() => {
		left -= 1;
		paint();
		if (left <= 0) {
			finishSession();
		}
	}, 1000);
}

startButton.addEventListener('click', toggleTimer);

document.addEventListener('keydown', event => {
	if (event.code === 'Space' && document.activeElement !== noteInput) {
		event.preventDefault();
		toggleTimer();
	}
});

resetButton.addEventListener('click', () => {
	resetTimer('Ready');
});

setActivePreset(25);
paint();
refreshSessions();
