import { mountLayout } from '../components/layout.js';
import { signIn, signUp } from '../services/auth.js';
import { isDemoMode } from '../config.js';

mountLayout();

const form = document.querySelector('#auth-form');
const nameWrap = document.querySelector('#name-wrap');
const fullName = document.querySelector('#fullName');
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const confirmPassword = document.querySelector('#confirm-password');
const confirmWrap = document.querySelector('#confirm-wrap');
const submitButton = document.querySelector('#submit-auth');
const message = document.querySelector('#auth-message');
const strength = document.querySelector('#password-strength');
let mode = 'login';

if (!isDemoMode) {
  document.querySelector('.demo-access').classList.add('d-none');
  document.querySelector('.auth-note').classList.add('d-none');
}

function setMode(nextMode) {
  mode = nextMode;
  const signingUp = mode === 'signup';
  document.title = signingUp ? 'Create account · WellSpring' : 'Sign in · WellSpring';
  document.querySelector('#auth-title').textContent = signingUp ? 'Create your account' : 'Welcome back';
  document.querySelector('#auth-subtitle').textContent = signingUp ? 'Begin a healthier rhythm with one small step.' : 'Sign in to continue your healthier rhythm.';
  nameWrap.classList.toggle('d-none', !signingUp);
  fullName.required = signingUp;
  confirmPassword.required = signingUp;
  confirmWrap.classList.toggle('d-none', !signingUp);
  password.autocomplete = signingUp ? 'new-password' : 'current-password';
  strength.classList.toggle('d-none', !signingUp);
  submitButton.querySelector('span').textContent = signingUp ? 'Create account' : 'Sign in';
  form.classList.remove('was-validated');
  hideMessage();
}

function hideMessage() {
  message.classList.add('d-none');
  message.textContent = '';
}

function showMessage(text, type = 'danger') {
  message.textContent = text;
  message.classList.toggle('success', type === 'success');
  message.classList.remove('d-none');
}

function setLoading(loading) {
  submitButton.disabled = loading;
  if (loading) {
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span><span>Just a moment…</span>';
  } else {
    submitButton.innerHTML = `<span>${mode === 'signup' ? 'Create account' : 'Sign in'}</span><i class="bi bi-arrow-right"></i>`;
  }
}

function updateStrength() {
  const value = password.value;
  let score = 0;
  if (value.length >= 6) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d|[^\w]/.test(value)) score++;
  const labels = ['Start typing a password', 'Basic', 'Good', 'Strong'];
  strength.dataset.score = String(score);
  strength.querySelector('small').textContent = labels[value ? score : 0];
}

async function authenticate(authMode = mode) {
  hideMessage();
  confirmPassword.setCustomValidity(mode === 'signup' && confirmPassword.value !== password.value ? 'Passwords do not match' : '');
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  setLoading(true);
  try {
    if (authMode === 'signup') {
      const result = await signUp(fullName.value.trim(), email.value.trim(), password.value);
      if (result.needsConfirmation) {
        setLoading(false);
        form.reset();
        showMessage('Account created. Check your email and confirm your address before signing in.', 'success');
        return;
      }
    } else await signIn(email.value.trim(), password.value);
    location.href = 'profile.html';
  } catch (error) {
    showMessage(error.message || 'We could not complete your request. Please try again.');
    setLoading(false);
  }
}

password.addEventListener('input', updateStrength);
confirmPassword.addEventListener('input', () => {
  confirmPassword.setCustomValidity(confirmPassword.value === password.value ? '' : 'Passwords do not match');
});
document.querySelector('#show-password').addEventListener('click', event => {
  const showing = password.type === 'text';
  password.type = showing ? 'password' : 'text';
  event.currentTarget.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  event.currentTarget.innerHTML = `<i class="bi ${showing ? 'bi-eye' : 'bi-eye-slash'}"></i>`;
});

document.querySelectorAll('[data-demo]').forEach(button => button.addEventListener('click', async () => {
  const admin = button.dataset.demo === 'admin';
  setMode('login');
  email.value = admin ? 'admin@example.com' : 'member@example.com';
  password.value = 'demo123';
  await authenticate('login');
}));

form.addEventListener('submit', event => {
  event.preventDefault();
  authenticate();
});

if (new URLSearchParams(location.search).get('mode') === 'signup') setMode('signup');
