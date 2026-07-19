import { mountLayout, toast } from '../components/layout.js';
import { list, save } from '../services/data.js';

mountLayout('Move');

const descriptions = {
  1: 'Loosen shoulders, hips, and spine before the day gets busy.',
  2: 'Lift your energy with a comfortable outdoor pace.',
  3: 'Build everyday strength using only your body weight.',
  4: 'Close the day with slow stretches and steady breathing.',
  5: 'Choose a familiar route and enjoy a longer cardio session.',
  6: 'Release neck and wrist tension without leaving your desk.'
};

const rows = await list('activities');
let logs = await list('activity_logs');
let activeFilter = 'All';
let searchTerm = '';

const grid = document.querySelector('#activity-grid');
const searchInput = document.querySelector('#activity-search');
const count = document.querySelector('#activity-count');
const goalMinutes = document.querySelector('#goal-minutes');
const goalProgress = document.querySelector('#goal-progress');
const goalMessage = document.querySelector('#goal-message');

function isToday(value) {
  const date = new Date(value);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function completedToday(activityId) {
  return logs.some(log => String(log.activity_id) === String(activityId) && isToday(log.created_at));
}

function updateGoal() {
  const minutes = logs.filter(log => isToday(log.created_at)).reduce((sum, log) => sum + Number(log.duration_minutes || 0), 0);
  const percentage = Math.min(100, Math.round(minutes / 30 * 100));
  goalMinutes.textContent = String(minutes);
  goalProgress.style.width = `${percentage}%`;
  goalMessage.textContent = minutes >= 30 ? 'Daily movement goal complete. Nicely done!' : `${Math.max(0, 30 - minutes)} gentle minutes to reach today's goal.`;
}

function visibleActivities() {
  return rows.filter(activity => {
    const matchesCategory = activeFilter === 'All' || activity.category === activeFilter;
    const searchText = `${activity.title} ${activity.category} ${activity.level}`.toLowerCase();
    return matchesCategory && searchText.includes(searchTerm);
  });
}

function draw() {
  const visible = visibleActivities();
  count.textContent = String(visible.length);

  if (!visible.length) {
    grid.innerHTML = '<div class="col-12"><div class="soft-card empty"><i class="bi bi-search fs-1"></i><h3 class="h5 mt-3">No activities found</h3><p class="mb-0">Try another search or category.</p></div></div>';
    return;
  }

  grid.innerHTML = visible.map(activity => {
    const completed = completedToday(activity.id);
    return `
      <div class="col-md-6 col-xl-4">
        <article class="soft-card activity-card ${completed ? 'activity-complete' : ''}">
          <div class="activity-card-top">
            <div class="icon-tile"><i class="bi ${activity.icon}"></i></div>
            <span class="level-badge level-${activity.level.toLowerCase()}">${activity.level}</span>
          </div>
          <span class="pill mt-3">${activity.category}</span>
          <h3 class="h4 mt-2">${activity.title}</h3>
          <p class="text-secondary activity-description">${descriptions[activity.id] || 'A practical activity for your daily wellbeing.'}</p>
          <div class="activity-meta"><span><i class="bi bi-clock"></i> ${activity.minutes} min</span><span><i class="bi bi-lightning-charge"></i> ${activity.level}</span></div>
          <button class="btn ${completed ? 'btn-success' : 'btn-outline-primary'} complete w-100 mt-3" data-id="${activity.id}" ${completed ? 'disabled' : ''}>
            <i class="bi ${completed ? 'bi-check-circle-fill' : 'bi-check2'}"></i> ${completed ? 'Completed today' : 'Mark complete'}
          </button>
        </article>
      </div>`;
  }).join('');

  document.querySelectorAll('.complete:not(:disabled)').forEach(button => {
    button.addEventListener('click', async () => {
      const activity = rows.find(row => String(row.id) === button.dataset.id);
      const record = await save('activity_logs', { activity_id: activity.id, duration_minutes: activity.minutes });
      logs.unshift(record);
      updateGoal();
      draw();
      toast(`${activity.minutes} active minutes added to your day`);
    });
  });
}

document.querySelectorAll('.filter-chip').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
    button.classList.add('active');
    activeFilter = button.dataset.filter;
    draw();
  });
});

searchInput.addEventListener('input', () => {
  searchTerm = searchInput.value.trim().toLowerCase();
  draw();
});

updateGoal();
draw();
