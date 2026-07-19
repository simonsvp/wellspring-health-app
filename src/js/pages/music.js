import { mountLayout, toast } from '../components/layout.js';
import { list } from '../services/data.js';

mountLayout('Music');

const tracks = await list('tracks');
const grid = document.querySelector('#tracks');
const player = document.querySelector('#player');
const playerTitle = document.querySelector('#player-title');
const playerToggle = document.querySelector('#player-toggle');
const playerClose = document.querySelector('#player-close');
const elapsedLabel = document.querySelector('#player-elapsed');
const durationLabel = document.querySelector('#player-duration');
const progressBar = document.querySelector('#player-progress');
const volume = document.querySelector('#volume');

let activeKind = 'All';
let currentTrack = null;
let audioContext = null;
let source = null;
let gain = null;
let elapsed = 0;
let progressTimer = null;
let playing = false;

const palettes = {
  Nature: ['#9fc7ab', '#d8eadc'],
  Ambient: ['#b9b2dc', '#e6e1f5'],
  Instrumental: ['#e6c986', '#f8edd1']
};

function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function createAmbientSource(track) {
  audioContext ||= new AudioContext();
  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(1, sampleRate * 2, sampleRate);
  const channel = buffer.getChannelData(0);
  let last = 0;
  for (let index = 0; index < channel.length; index += 1) {
    const white = Math.random() * 2 - 1;
    last = last * 0.97 + white * 0.03;
    channel[index] = last * 2.2;
  }
  source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  gain = audioContext.createGain();
  source.buffer = buffer;
  source.loop = true;
  filter.type = 'lowpass';
  filter.frequency.value = track.kind === 'Nature' ? 850 : track.kind === 'Instrumental' ? 520 : 350;
  gain.gain.value = Number(volume.value) / 100 * 0.22;
  source.connect(filter).connect(gain).connect(audioContext.destination);
  source.start();
}

function stopSource() {
  if (source) source.stop();
  source = null;
  playing = false;
  clearInterval(progressTimer);
}

function startProgress() {
  clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    elapsed += 1;
    const duration = currentTrack.minutes * 60;
    elapsedLabel.textContent = formatTime(elapsed);
    progressBar.style.width = `${Math.min(100, elapsed / duration * 100)}%`;
    if (elapsed >= duration) closePlayer();
  }, 1000);
}

function updateButtons() {
  document.querySelectorAll('.play').forEach(button => {
    const isCurrent = currentTrack && String(currentTrack.id) === button.dataset.id;
    button.innerHTML = `<i class="bi ${isCurrent && playing ? 'bi-pause-fill' : 'bi-play-fill'}"></i>`;
    button.setAttribute('aria-label', `${isCurrent && playing ? 'Pause' : 'Play'} ${button.dataset.title}`);
    button.closest('.audio-card').classList.toggle('playing', Boolean(isCurrent && playing));
  });
  playerToggle.innerHTML = `<i class="bi ${playing ? 'bi-pause-fill' : 'bi-play-fill'}"></i>`;
  playerToggle.setAttribute('aria-label', playing ? 'Pause current sound' : 'Resume current sound');
}

function playTrack(track) {
  if (currentTrack && String(currentTrack.id) === String(track.id) && playing) {
    pauseTrack();
    return;
  }
  if (!currentTrack || String(currentTrack.id) !== String(track.id)) {
    stopSource();
    elapsed = 0;
    progressBar.style.width = '0%';
  }
  currentTrack = track;
  createAmbientSource(track);
  playing = true;
  player.hidden = false;
  playerTitle.textContent = track.title;
  durationLabel.textContent = formatTime(track.minutes * 60);
  elapsedLabel.textContent = formatTime(elapsed);
  startProgress();
  updateButtons();
}

function pauseTrack() {
  stopSource();
  updateButtons();
}

function resumeTrack() {
  if (!currentTrack) return;
  createAmbientSource(currentTrack);
  playing = true;
  startProgress();
  updateButtons();
}

function closePlayer() {
  stopSource();
  currentTrack = null;
  elapsed = 0;
  player.hidden = true;
  updateButtons();
}

function draw() {
  const visible = tracks.filter(track => activeKind === 'All' || track.kind === activeKind);
  grid.innerHTML = visible.map((track, index) => {
    const colors = palettes[track.kind] || palettes.Ambient;
    const bars = [35, 60, 85, 48, 72, 40, 65, 30, 52, 78];
    return `
      <div class="col-md-6 col-xl-3">
        <article class="soft-card audio-card" style="--audio-a:${colors[0]};--audio-b:${colors[1]}">
          <div class="audio-visual mb-3"><span class="track-number">0${index + 1}</span>${bars.map(height => `<i style="--h:${height}%"></i>`).join('')}</div>
          <span class="pill">${track.kind}</span>
          <h3 class="h5 mt-2 mb-1">${track.title}</h3>
          <div class="d-flex align-items-center justify-content-between mt-auto pt-3"><small class="text-secondary"><i class="bi bi-clock"></i> ${track.minutes} min</small><button class="btn btn-primary play" data-id="${track.id}" data-title="${track.title}" aria-label="Play ${track.title}"><i class="bi bi-play-fill"></i></button></div>
        </article>
      </div>`;
  }).join('');
  document.querySelectorAll('.play').forEach(button => button.addEventListener('click', () => playTrack(tracks.find(track => String(track.id) === button.dataset.id))));
  updateButtons();
}

document.querySelectorAll('[data-kind]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-kind]').forEach(chip => chip.classList.remove('active'));
  button.classList.add('active');
  activeKind = button.dataset.kind;
  draw();
}));

playerToggle.addEventListener('click', () => playing ? pauseTrack() : resumeTrack());
playerClose.addEventListener('click', closePlayer);
volume.addEventListener('input', () => {
  if (gain) gain.gain.value = Number(volume.value) / 100 * 0.22;
});

draw();
toast('The sound library uses original generated ambient previews.', 'dark');
