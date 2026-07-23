import { mountLayout, toast } from '../components/layout.js';
import { currentUser } from '../services/auth.js';
import { isDemoMode } from '../config.js';
import { supabase } from '../services/supabase.js';

mountLayout();

const user = await currentUser();
const gate = document.querySelector('#admin-content');
let allowed = false;
let editingId = null;
let activities = [];
let herbEditingId = null;
let herbs = [];

if (!isDemoMode && user) {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();
  allowed = Boolean(data);
}

if (!allowed) {
  gate.innerHTML = `
    <div class="soft-card empty">
      <i class="bi bi-shield-lock fs-1"></i>
      <h2 class="h4 mt-3">Admin access required</h2>
      <p>${isDemoMode
        ? 'Connect to Supabase and sign in with an administrator account to manage activities.'
        : 'Sign in with an administrator account to manage activities.'}</p>
    </div>`;
} else {
  gate.innerHTML = `
    <div class="row g-4 mb-4" id="admin-metrics">
      <div class="col-md-4"><div class="soft-card"><div class="eyebrow">Activities</div><div id="activity-metric" class="metric">0</div></div></div>
      <div class="col-md-4"><div class="soft-card"><div class="eyebrow">Tracks</div><div id="track-metric" class="metric">0</div></div></div>
      <div class="col-md-4"><div class="soft-card"><div class="eyebrow">Herbs</div><div id="herb-metric" class="metric">0</div></div></div>
    </div>

    <div class="soft-card mb-4">
      <div class="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
        <div>
          <div class="eyebrow">Movement catalogue</div>
          <h2 id="form-title" class="h4 mt-2 mb-1">Add an activity</h2>
          <p class="text-secondary mb-0">Changes appear on the Move page after it is refreshed.</p>
        </div>
        <button id="cancel-edit" class="btn btn-outline-primary align-self-md-start d-none" type="button">Cancel edit</button>
      </div>
      <form id="activity-form" class="row g-3">
        <div class="col-lg-5">
          <label for="activity-title" class="form-label">Activity name</label>
          <input id="activity-title" name="title" class="form-control" maxlength="80" required>
        </div>
        <div class="col-sm-6 col-lg-3">
          <label for="activity-category" class="form-label">Category</label>
          <select id="activity-category" name="category" class="form-select">
            <option>Mobility</option><option>Cardio</option><option>Strength</option><option>Mindful</option>
          </select>
        </div>
        <div class="col-sm-6 col-lg-2">
          <label for="activity-minutes" class="form-label">Minutes</label>
          <input id="activity-minutes" name="minutes" class="form-control" type="number" min="1" max="240" value="10" required>
        </div>
        <div class="col-sm-6 col-lg-2">
          <label for="activity-level" class="form-label">Level</label>
          <select id="activity-level" name="level" class="form-select">
            <option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
        </div>
        <div class="col-sm-6 col-lg-4">
          <label for="activity-icon" class="form-label">Icon</label>
          <select id="activity-icon" name="icon" class="form-select">
            <option value="bi-person-walking">Walking</option>
            <option value="bi-bicycle">Cycling</option>
            <option value="bi-heart-pulse">Mindful movement</option>
            <option value="bi-lightning-charge">Strength</option>
            <option value="bi-person-arms-up">Mobility</option>
            <option value="bi-universal-access">Accessible movement</option>
          </select>
        </div>
        <div class="col-lg-8 d-flex align-items-end">
          <button id="save-activity" class="btn btn-primary w-100" type="submit">
            <i class="bi bi-plus-circle me-2"></i>Add activity
          </button>
        </div>
      </form>
    </div>

    <div class="soft-card mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div><div class="eyebrow">Current content</div><h2 class="h4 mt-2 mb-0">Move activities</h2></div>
        <span id="activity-count" class="pill">0 activities</span>
      </div>
      <div id="admin-activity-list" class="row g-3"></div>
    </div>

    <div class="soft-card mb-4">
      <div class="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
        <div>
          <div class="eyebrow">Herbs and tea guide</div>
          <h2 id="herb-form-title" class="h4 mt-2 mb-1">Add an herb</h2>
          <p class="text-secondary mb-0">Use cautious educational wording and avoid medical claims.</p>
        </div>
        <button id="cancel-herb-edit" class="btn btn-outline-primary align-self-md-start d-none" type="button">Cancel edit</button>
      </div>
      <form id="herb-form" class="row g-3">
        <div class="col-md-6">
          <label for="herb-name" class="form-label">Herb or tea name</label>
          <input id="herb-name" name="name" class="form-control" maxlength="80" required>
        </div>
        <div class="col-md-6">
          <label for="herb-benefit" class="form-label">Short description</label>
          <input id="herb-benefit" name="benefit" class="form-control" maxlength="120" placeholder="A gentle caffeine-free ritual" required>
        </div>
        <div class="col-lg-9">
          <label for="herb-use" class="form-label">Preparation guidance</label>
          <input id="herb-use" name="use" class="form-control" maxlength="180" placeholder="Follow the package directions." required>
        </div>
        <div class="col-sm-4 col-lg-3">
          <label for="herb-color" class="form-label">Card color</label>
          <input id="herb-color" name="color" class="form-control form-control-color w-100" type="color" value="#9ac9a6" title="Choose card color">
        </div>
        <div class="col-12">
          <button id="save-herb" class="btn btn-primary w-100" type="submit">
            <i class="bi bi-plus-circle me-2"></i>Add herb
          </button>
        </div>
      </form>
    </div>

    <div class="soft-card">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div><div class="eyebrow">Current content</div><h2 class="h4 mt-2 mb-0">Herbs and teas</h2></div>
        <span id="herb-count" class="pill">0 herbs</span>
      </div>
      <div id="admin-herb-list" class="row g-3"></div>
    </div>`;

  document.querySelector('#activity-form').addEventListener('submit', saveActivity);
  document.querySelector('#cancel-edit').addEventListener('click', resetForm);
  document.querySelector('#herb-form').addEventListener('submit', saveHerb);
  document.querySelector('#cancel-herb-edit').addEventListener('click', resetHerbForm);
  await Promise.all([loadActivities(), loadHerbs(), loadMetrics()]);
}

async function loadActivities() {
  const { data, error } = await supabase.from('activities').select('*').order('id');
  if (error) {
    toast(error.message, 'danger');
    return;
  }
  activities = data;
  drawActivities();
}

async function loadMetrics() {
  const [activityResult, trackResult, herbResult] = await Promise.all([
    supabase.from('activities').select('*', { count: 'exact', head: true }),
    supabase.from('tracks').select('*', { count: 'exact', head: true }),
    supabase.from('herbs').select('*', { count: 'exact', head: true })
  ]);
  document.querySelector('#activity-metric').textContent = activityResult.count ?? 0;
  document.querySelector('#track-metric').textContent = trackResult.count ?? 0;
  document.querySelector('#herb-metric').textContent = herbResult.count ?? 0;
}

function drawActivities() {
  const list = document.querySelector('#admin-activity-list');
  document.querySelector('#activity-count').textContent =
    `${activities.length} activit${activities.length === 1 ? 'y' : 'ies'}`;

  list.innerHTML = activities.map(activity => `
    <div class="col-lg-6">
      <article class="border rounded-4 p-3 h-100 d-flex justify-content-between gap-3">
        <div>
          <span class="pill">${escapeHtml(activity.category)}</span>
          <h3 class="h5 mt-2 mb-1"><i class="bi ${escapeHtml(activity.icon || 'bi-person-walking')} me-2"></i>${escapeHtml(activity.title)}</h3>
          <p class="text-secondary mb-0">${Number(activity.minutes)} min · ${escapeHtml(activity.level)}</p>
        </div>
        <div class="d-flex flex-column gap-2">
          <button class="btn btn-sm btn-outline-primary edit-activity" data-id="${activity.id}" type="button" aria-label="Edit ${escapeHtml(activity.title)}">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-activity" data-id="${activity.id}" type="button" aria-label="Delete ${escapeHtml(activity.title)}">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </article>
    </div>`).join('');

  document.querySelectorAll('.edit-activity').forEach(button =>
    button.addEventListener('click', () => beginEdit(Number(button.dataset.id))));
  document.querySelectorAll('.delete-activity').forEach(button =>
    button.addEventListener('click', () => deleteActivity(Number(button.dataset.id))));
}

async function saveActivity(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const record = {
    title: form.get('title').trim(),
    category: form.get('category'),
    minutes: Number(form.get('minutes')),
    level: form.get('level'),
    icon: form.get('icon')
  };

  const query = editingId
    ? supabase.from('activities').update(record).eq('id', editingId)
    : supabase.from('activities').insert(record);
  const { error } = await query;
  if (error) {
    toast(error.message, 'danger');
    return;
  }

  toast(editingId ? 'Activity updated' : 'Activity added');
  resetForm();
  await Promise.all([loadActivities(), loadMetrics()]);
}

function beginEdit(id) {
  const activity = activities.find(item => item.id === id);
  if (!activity) return;
  editingId = id;
  const form = document.querySelector('#activity-form');
  form.elements.title.value = activity.title;
  form.elements.category.value = activity.category;
  form.elements.minutes.value = activity.minutes;
  form.elements.level.value = activity.level;
  form.elements.icon.value = activity.icon || 'bi-person-walking';
  document.querySelector('#form-title').textContent = 'Edit activity';
  document.querySelector('#save-activity').innerHTML = '<i class="bi bi-check2-circle me-2"></i>Save changes';
  document.querySelector('#cancel-edit').classList.remove('d-none');
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetForm() {
  editingId = null;
  const form = document.querySelector('#activity-form');
  form.reset();
  form.elements.minutes.value = 10;
  document.querySelector('#form-title').textContent = 'Add an activity';
  document.querySelector('#save-activity').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Add activity';
  document.querySelector('#cancel-edit').classList.add('d-none');
}

async function deleteActivity(id) {
  const activity = activities.find(item => item.id === id);
  if (!activity || !confirm(`Delete "${activity.title}"?`)) return;
  const { error } = await supabase.from('activities').delete().eq('id', id);
  if (error) {
    toast(error.message, 'danger');
    return;
  }
  toast('Activity deleted');
  if (editingId === id) resetForm();
  await Promise.all([loadActivities(), loadMetrics()]);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function loadHerbs() {
  const { data, error } = await supabase.from('herbs').select('*').order('id');
  if (error) {
    toast(error.message, 'danger');
    return;
  }
  herbs = data;
  drawHerbs();
}

function drawHerbs() {
  const list = document.querySelector('#admin-herb-list');
  document.querySelector('#herb-count').textContent =
    `${herbs.length} herb${herbs.length === 1 ? '' : 's'}`;

  list.innerHTML = herbs.map(herb => `
    <div class="col-lg-6">
      <article class="border rounded-4 p-3 h-100 d-flex justify-content-between gap-3">
        <div class="d-flex gap-3">
          <span class="rounded-circle flex-shrink-0" style="width:2rem;height:2rem;background:${safeColor(herb.color)}"></span>
          <div>
            <h3 class="h5 mb-1">${escapeHtml(herb.name)}</h3>
            <p class="text-secondary mb-1">${escapeHtml(herb.benefit)}</p>
            <small>${escapeHtml(herb.use)}</small>
          </div>
        </div>
        <div class="d-flex flex-column gap-2">
          <button class="btn btn-sm btn-outline-primary edit-herb" data-id="${herb.id}" type="button" aria-label="Edit ${escapeHtml(herb.name)}">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-herb" data-id="${herb.id}" type="button" aria-label="Delete ${escapeHtml(herb.name)}">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </article>
    </div>`).join('');

  document.querySelectorAll('.edit-herb').forEach(button =>
    button.addEventListener('click', () => beginHerbEdit(Number(button.dataset.id))));
  document.querySelectorAll('.delete-herb').forEach(button =>
    button.addEventListener('click', () => deleteHerb(Number(button.dataset.id))));
}

async function saveHerb(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const record = {
    name: form.get('name').trim(),
    benefit: form.get('benefit').trim(),
    use: form.get('use').trim(),
    color: form.get('color')
  };

  const query = herbEditingId
    ? supabase.from('herbs').update(record).eq('id', herbEditingId)
    : supabase.from('herbs').insert(record);
  const { error } = await query;
  if (error) {
    toast(error.message, 'danger');
    return;
  }

  toast(herbEditingId ? 'Herb updated' : 'Herb added');
  resetHerbForm();
  await Promise.all([loadHerbs(), loadMetrics()]);
}

function beginHerbEdit(id) {
  const herb = herbs.find(item => item.id === id);
  if (!herb) return;
  herbEditingId = id;
  const form = document.querySelector('#herb-form');
  form.elements.name.value = herb.name;
  form.elements.benefit.value = herb.benefit;
  form.elements.use.value = herb.use;
  form.elements.color.value = safeColor(herb.color);
  document.querySelector('#herb-form-title').textContent = 'Edit herb';
  document.querySelector('#save-herb').innerHTML = '<i class="bi bi-check2-circle me-2"></i>Save changes';
  document.querySelector('#cancel-herb-edit').classList.remove('d-none');
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetHerbForm() {
  herbEditingId = null;
  const form = document.querySelector('#herb-form');
  form.reset();
  form.elements.color.value = '#9ac9a6';
  document.querySelector('#herb-form-title').textContent = 'Add an herb';
  document.querySelector('#save-herb').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Add herb';
  document.querySelector('#cancel-herb-edit').classList.add('d-none');
}

async function deleteHerb(id) {
  const herb = herbs.find(item => item.id === id);
  if (!herb || !confirm(`Delete "${herb.name}"?`)) return;
  const { error } = await supabase.from('herbs').delete().eq('id', id);
  if (error) {
    toast(error.message, 'danger');
    return;
  }
  toast('Herb deleted');
  if (herbEditingId === id) resetHerbForm();
  await Promise.all([loadHerbs(), loadMetrics()]);
}

function safeColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value || '') ? value : '#9ac9a6';
}
