import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../../css/styles.css';
import { currentUser, signOut } from '../services/auth.js';
import { isDemoMode } from '../config.js';

const links = [
  ['index.html', 'Home', 'bi-house'],
  ['focus.html', 'Focus', 'bi-bullseye'],
  ['music.html', 'Music', 'bi-headphones'],
  ['activities.html', 'Move', 'bi-person-walking'],
  ['herbs.html', 'Herbs', 'bi-cup-hot'],
  ['journal.html', 'Journal', 'bi-journal-heart']
];

export async function mountLayout(active = '') {
  const user = await currentUser();
  const navigation = document.querySelector('#app-nav');

  navigation.innerHTML = `
    <nav class="navbar navbar-expand-lg sticky-top" aria-label="Main navigation">
      <div class="container">
        <a class="navbar-brand" href="index.html" aria-label="WellSpring homepage">
          <span class="brand-mark"><i class="bi bi-flower1"></i></span>WellSpring
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu"
          aria-controls="navMenu" aria-expanded="false" aria-label="Open navigation menu">
          <span class="menu-line"></span><span class="menu-line"></span><span class="menu-line"></span>
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
          <div class="mobile-menu-heading d-lg-none">
            <span>Explore WellSpring</span>
            ${isDemoMode ? '<span class="pill"><i class="bi bi-wifi-off"></i> Demo</span>' : ''}
          </div>
          <ul class="navbar-nav mx-auto">
            ${links.map(([href, label, icon]) => `
              <li class="nav-item">
                <a class="nav-link ${active === label ? 'active' : ''}" href="${href}">
                  <i class="bi ${icon} nav-icon"></i><span>${label}</span>
                </a>
              </li>`).join('')}
          </ul>
          <div class="nav-account d-flex align-items-center gap-2">
            ${isDemoMode ? '<span class="pill d-none d-lg-inline-flex"><i class="bi bi-wifi-off"></i> Demo mode</span>' : ''}
            ${user
              ? `<a class="btn btn-outline-primary btn-sm" href="profile.html"><i class="bi bi-person"></i> ${user.user_metadata?.full_name?.split(' ')[0] || 'Profile'}</a><button id="logout" class="btn btn-primary btn-sm">Log out</button>`
              : '<a class="btn btn-primary btn-sm" href="auth.html"><i class="bi bi-person me-1"></i>Sign in</a>'}
          </div>
        </div>
      </div>
    </nav>`;

  document.querySelector('#app-footer').innerHTML = `
    <footer><div class="container d-flex flex-column flex-md-row justify-content-between gap-2">
      <div><strong>WellSpring</strong> | small steps, steadier days</div>
      <div>Educational wellness support - not medical advice.</div>
    </div></footer>`;

  if (user) {
    document.querySelector('#logout')?.addEventListener('click', async () => {
      await signOut();
      location.href = 'index.html';
    });
  }

  import('bootstrap');
}

export function toast(message, type = 'success') {
  const box = document.querySelector('#toast-area') || document.body.appendChild(
    Object.assign(document.createElement('div'), {
      id: 'toast-area',
      className: 'toast-container position-fixed bottom-0 end-0 p-3'
    })
  );
  const el = document.createElement('div');
  el.className = `toast show text-bg-${type} border-0`;
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  box.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}
