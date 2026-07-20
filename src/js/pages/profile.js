import { mountLayout, toast } from '../components/layout.js';
import { currentUser, updateAccount } from '../services/auth.js';
import { list } from '../services/data.js';
import { isDemoMode } from '../config.js';
import { supabase } from '../services/supabase.js';

mountLayout();

const user = await currentUser();
if (!user) {
  location.href = 'auth.html';
} else {
  const nameInput = document.querySelector('#display-name');
  const intentionInput = document.querySelector('#wellness-intention');
  const avatar = document.querySelector('#avatar');
  const name = user.user_metadata?.full_name || 'WellSpring member';
  let isAdmin = user.role === 'admin';
  if (!isDemoMode) {
    const { data: adminRole } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
    isAdmin = Boolean(adminRole);
  }

  document.querySelector('#profile-name').textContent = name;
  document.querySelector('#profile-email').textContent = user.email;
  document.querySelector('#account-role').textContent = isAdmin ? 'Administrator' : 'Member account';
  document.querySelector('#member-badge').innerHTML = `<i class="bi bi-patch-check-fill"></i> ${isAdmin ? 'WellSpring admin' : 'WellSpring member'}`;
  document.querySelector('#admin-link').classList.toggle('d-none', !isAdmin);
  nameInput.value = name;
  intentionInput.value = user.user_metadata?.intention || '';
  showAvatar(user.user_metadata?.avatar_data);
  if (!isDemoMode) loadRemoteAvatar(user.id);

  document.querySelector('#profile-form').addEventListener('submit', async event => {
    event.preventDefault();
    const fullName = nameInput.value.trim();
    if (!fullName) return;
    await updateAccount({ full_name: fullName, intention: intentionInput.value.trim() });
    document.querySelector('#profile-name').textContent = fullName;
    toast('Profile updated');
  });

  document.querySelector('#photo').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast('Please choose an image smaller than 2 MB.', 'danger');
      event.target.value = '';
      return;
    }

    if (isDemoMode) {
      const avatarData = await readFile(file);
      await updateAccount({ avatar_data: avatarData });
      showAvatar(avatarData);
      toast('Profile photo saved');
      return;
    }

    const extension = file.name.split('.').pop().toLowerCase();
    const path = `${user.id}/avatar-${Date.now()}.${extension}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) {
      toast(error.message, 'danger');
      return;
    }
    await supabase.from('profiles').update({ avatar_path: path }).eq('id', user.id);
    const { data } = await supabase.storage.from('avatars').createSignedUrl(path, 60 * 60);
    showAvatar(data?.signedUrl);
    toast('Profile photo uploaded');
  });

  loadProgress();
}

async function loadRemoteAvatar(userId) {
  const { data: profile } = await supabase.from('profiles').select('avatar_path').eq('id', userId).maybeSingle();
  if (!profile?.avatar_path) return;
  const { data, error } = await supabase.storage.from('avatars').createSignedUrl(profile.avatar_path, 60 * 60);
  if (!error) showAvatar(data.signedUrl);
}

function showAvatar(source) {
  const avatar = document.querySelector('#avatar');
  if (!source) return;
  const image = document.createElement('img');
  image.src = source;
  image.alt = 'Profile photo';
  avatar.replaceChildren(image);
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function thisWeek(items) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return items.filter(item => new Date(item.created_at) >= start);
}

async function loadProgress() {
  try {
    const [focusRows, activityRows, journalRows] = await Promise.all([
      list('focus_sessions'), list('activity_logs'), list('journal_entries')
    ]);
    const focus = thisWeek(focusRows).filter(row => row.completed);
    const activities = thisWeek(activityRows);
    const journal = thisWeek(journalRows);
    const focusMinutes = Math.round(focus.reduce((sum, row) => sum + Number(row.duration_minutes || 0), 0));
    const moveMinutes = activities.reduce((sum, row) => sum + Number(row.duration_minutes || 0), 0);
    const activeDates = new Set([...focus, ...activities, ...journal].map(row => new Date(row.created_at).toDateString()));
    const completedGoals = [focusMinutes >= 25, moveMinutes >= 30, journal.length >= 1].filter(Boolean).length;
    const score = Math.round((completedGoals / 3) * 100);

    document.querySelector('#focus-total').textContent = `${focusMinutes} min`;
    document.querySelector('#focus-detail').textContent = focus.length ? `${focus.length} completed session${focus.length === 1 ? '' : 's'}` : 'No sessions yet';
    document.querySelector('#move-total').textContent = `${moveMinutes} min`;
    document.querySelector('#move-detail').textContent = activities.length ? `${activities.length} completed activit${activities.length === 1 ? 'y' : 'ies'}` : 'No activities yet';
    document.querySelector('#journal-total').textContent = `${journal.length} note${journal.length === 1 ? '' : 's'}`;
    document.querySelector('#journal-detail').textContent = journal.length ? `Latest mood ${journal[0].mood}` : 'Start your journal';
    document.querySelector('#active-days').textContent = `${activeDates.size} active day${activeDates.size === 1 ? '' : 's'}`;
    document.querySelector('#rhythm-score').textContent = `${score}%`;
    document.querySelector('#rhythm-ring').style.setProperty('--score', `${score * 3.6}deg`);

    const suggestion = focusMinutes < 25
      ? ['A short focus session is a simple place to begin.', 'focus.html', 'Start focus']
      : moveMinutes < 30
        ? ['A few gentle minutes of movement can refresh your day.', 'activities.html', 'Choose movement']
        : journal.length < 1
          ? ['Pause for a moment and write down what you noticed.', 'journal.html', 'Write reflection']
          : ['You met all three weekly goals. Keep following your own pace.', 'music.html', 'Unwind now'];
    document.querySelector('#next-suggestion').textContent = suggestion[0];
    document.querySelector('#next-action').href = suggestion[1];
    document.querySelector('#next-action').innerHTML = `${suggestion[2]} <i class="bi bi-arrow-right ms-2"></i>`;
    document.querySelector('#welcome-message').textContent = score === 100 ? 'A beautifully balanced week.' : score > 0 ? 'Your rhythm is taking shape.' : 'One small step is enough.';
  } catch {
    toast('Progress could not be loaded right now.', 'danger');
  }
}
