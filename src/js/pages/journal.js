import { mountLayout, toast } from '../components/layout.js';
import { list, save, update, remove } from '../services/data.js';

mountLayout('Journal');

const form = document.querySelector('#journal-form');
const reflection = document.querySelector('#reflection');
const entriesBox = document.querySelector('#entries');
const moodButtons = [...document.querySelectorAll('.mood-button')];
const cancelButton = document.querySelector('#cancel-edit');
const saveButton = document.querySelector('#save-entry');
let mood = '🙂';
let editingId = null;
let entries = [];

function chooseMood(value) {
  mood = value;
  moodButtons.forEach(button => {
    const selected = button.dataset.mood === value;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-checked', String(selected));
  });
}

function updateCharacterCount() {
  document.querySelector('#character-count').textContent = `${reflection.value.length} / 800`;
}

function resetForm() {
  editingId = null;
  form.reset();
  chooseMood('🙂');
  document.querySelector('#form-title').textContent = "Today's reflection";
  saveButton.innerHTML = '<i class="bi bi-journal-check me-2"></i>Save reflection';
  cancelButton.classList.add('d-none');
  updateCharacterCount();
}

function renderSummary() {
  const words = entries.reduce((total, entry) => total + entry.content.trim().split(/\s+/).filter(Boolean).length, 0);
  document.querySelector('#entry-count').textContent = entries.length;
  document.querySelector('#mood-summary').textContent = entries[0]?.mood || '—';
  document.querySelector('#word-count').textContent = words;
  document.querySelector('#entry-status').textContent = entries.length === 1 ? '1 note' : `${entries.length} notes`;
}

function createEntryCard(entry) {
  const article = document.createElement('article');
  article.className = 'journal-entry';
  article.dataset.id = entry.id;
  const header = document.createElement('div');
  header.className = 'd-flex justify-content-between align-items-start gap-3';
  const identity = document.createElement('div');
  identity.className = 'd-flex align-items-center gap-3';
  const moodBadge = document.createElement('span');
  moodBadge.className = 'journal-mood';
  moodBadge.textContent = entry.mood;
  const date = document.createElement('div');
  const dateTitle = document.createElement('strong');
  dateTitle.textContent = new Date(entry.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  const time = document.createElement('small');
  time.className = 'd-block text-muted';
  time.textContent = new Date(entry.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  date.append(dateTitle, time);
  identity.append(moodBadge, date);
  const actions = document.createElement('div');
  actions.className = 'journal-actions';
  actions.innerHTML = '<button class="btn btn-sm edit" type="button" aria-label="Edit reflection"><i class="bi bi-pencil"></i></button><button class="btn btn-sm text-danger delete" type="button" aria-label="Delete reflection"><i class="bi bi-trash"></i></button>';
  header.append(identity, actions);
  const content = document.createElement('p');
  content.className = 'mt-3 mb-0 journal-copy';
  content.textContent = entry.content;
  article.append(header, content);
  article.querySelector('.edit').addEventListener('click', () => startEdit(entry));
  article.querySelector('.delete').addEventListener('click', () => deleteEntry(entry));
  return article;
}

async function draw() {
  entries = await list('journal_entries');
  entriesBox.replaceChildren();
  renderSummary();
  if (!entries.length) {
    entriesBox.innerHTML = '<div class="empty journal-empty"><i class="bi bi-journal-heart"></i><h3 class="h5 mt-3">Your story starts here</h3><p>Save a reflection and it will appear in this private timeline.</p></div>';
    return;
  }
  entries.forEach(entry => entriesBox.append(createEntryCard(entry)));
}

function startEdit(entry) {
  editingId = entry.id;
  reflection.value = entry.content;
  chooseMood(entry.mood);
  document.querySelector('#form-title').textContent = 'Edit reflection';
  saveButton.innerHTML = '<i class="bi bi-check2 me-2"></i>Update reflection';
  cancelButton.classList.remove('d-none');
  updateCharacterCount();
  reflection.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteEntry(entry) {
  if (!window.confirm('Delete this reflection? This action cannot be undone.')) return;
  await remove('journal_entries', entry.id);
  if (editingId === entry.id) resetForm();
  toast('Reflection deleted');
  await draw();
}

moodButtons.forEach(button => button.addEventListener('click', () => chooseMood(button.dataset.mood)));
reflection.addEventListener('input', updateCharacterCount);
cancelButton.addEventListener('click', resetForm);
form.addEventListener('submit', async event => {
  event.preventDefault();
  const content = reflection.value.trim();
  if (!content) return;
  if (editingId) {
    await update('journal_entries', editingId, { mood, content });
    toast('Reflection updated');
  } else {
    await save('journal_entries', { mood, content });
    toast('Reflection saved');
  }
  resetForm();
  await draw();
});

draw().catch(() => toast('We could not load your reflections. Please try again.'));
