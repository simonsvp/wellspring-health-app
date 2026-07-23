import { mountLayout, toast } from '../components/layout.js';
import { list } from '../services/data.js';

mountLayout('Herbs');

const herbs = await list('herbs');
const grid = document.querySelector('#herb-grid');
const search = document.querySelector('#herb-search');
const favoritesOnly = document.querySelector('#favorites-only');
const count = document.querySelector('#herb-count');

const guide = {
  Chamomile: {
    icon: 'bi-flower2', steep: '5-7 min', temperature: 'Just-boiled water', taste: 'Soft and floral',
    safety: 'Avoid if you have an allergy to ragweed, chrysanthemums, marigolds, or daisies. Chamomile may interact with warfarin and possibly sedatives.',
    source: 'https://www.nccih.nih.gov/health/chamomile'
  },
  Peppermint: {
    icon: 'bi-snow2', steep: '5 min', temperature: 'Just-boiled water', taste: 'Cool and fresh',
    safety: 'Peppermint leaf tea appears generally safe, but the long-term safety of large amounts is unknown. Peppermint oil is concentrated and has different safety considerations.',
    source: 'https://www.nccih.nih.gov/health/peppermint-oil'
  },
  Ginger: {
    icon: 'bi-brightness-high', steep: '10 min', temperature: 'Gently simmer', taste: 'Warm and spicy',
    safety: 'Food-like amounts and concentrated supplements are not the same. Ask a healthcare professional about ginger products if you are pregnant or take medicines.',
    source: 'https://www.nccih.nih.gov/health/know-science/how-medications-and-supplements-can-interact/learn-more'
  },
  Rooibos: {
    icon: 'bi-sunset', steep: '5-7 min', temperature: 'Just-boiled water', taste: 'Smooth and earthy',
    safety: 'Research on concentrated rooibos products and specific health conditions is limited. Choose a reputable tea product and discuss regular herbal use with your clinician.',
    source: 'https://www.nccih.nih.gov/health/using-dietary-supplements-wisely'
  }
};

const customHerbGuide = {
  icon: 'bi-cup-hot',
  steep: 'See directions',
  temperature: 'Follow package',
  taste: 'Herbal ritual',
  safety: 'Herbs and supplements may cause allergies, side effects, or medicine interactions. Check the product label and ask a qualified healthcare professional when appropriate.',
  source: 'https://www.nccih.nih.gov/health/using-dietary-supplements-wisely'
};

let favorites = new Set(JSON.parse(localStorage.getItem('wellspring-herb-favorites') || '[]').map(String));
let query = '';

function saveFavorites() {
  localStorage.setItem('wellspring-herb-favorites', JSON.stringify([...favorites]));
}

function visibleHerbs() {
  return herbs.filter(herb => {
    const info = guide[herb.name] || customHerbGuide;
    const matchesSearch = `${herb.name} ${herb.benefit} ${info?.taste || ''}`.toLowerCase().includes(query);
    const matchesFavorite = !favoritesOnly.checked || favorites.has(String(herb.id));
    return matchesSearch && matchesFavorite;
  });
}

function draw() {
  const visible = visibleHerbs();
  count.textContent = String(visible.length);
  if (!visible.length) {
    grid.innerHTML = '<div class="col-12"><div class="soft-card empty"><i class="bi bi-cup fs-1"></i><h3 class="h5 mt-3">Your tea shelf is empty</h3><p class="mb-0">Try a different search or show all herbs.</p></div></div>';
    return;
  }

  grid.innerHTML = visible.map(herb => {
    const info = guide[herb.name] || customHerbGuide;
    const favorite = favorites.has(String(herb.id));
    return `
      <div class="col-md-6 col-xl-3">
        <article class="soft-card herb-card">
          <div class="herb-swatch" style="--swatch:${herb.color}"><i class="bi ${info.icon}"></i><button class="favorite-button ${favorite ? 'active' : ''}" data-id="${herb.id}" aria-label="${favorite ? 'Remove' : 'Add'} ${herb.name} ${favorite ? 'from' : 'to'} favorites"><i class="bi ${favorite ? 'bi-heart-fill' : 'bi-heart'}"></i></button></div>
          <div class="d-flex flex-wrap gap-2 mt-3"><span class="pill">Caffeine-free</span><span class="pill herb-taste">${info.taste}</span></div>
          <h3 class="h4 mt-3">${herb.name}</h3>
          <p class="text-secondary">${herb.benefit}</p>
          <div class="brew-facts"><span><i class="bi bi-hourglass-split"></i><strong>${info.steep}</strong> steep</span><span><i class="bi bi-thermometer-half"></i>${info.temperature}</span></div>
          <details class="herb-details"><summary>Preparation and safety <i class="bi bi-chevron-down"></i></summary><p><strong>Preparation:</strong> ${herb.use}</p><p class="safety-copy"><strong>Keep in mind:</strong> ${info.safety}</p><a href="${info.source}" target="_blank" rel="noopener">Official safety source <i class="bi bi-box-arrow-up-right"></i></a></details>
        </article>
      </div>`;
  }).join('');

  document.querySelectorAll('.favorite-button').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.id;
    if (favorites.has(id)) favorites.delete(id); else favorites.add(id);
    saveFavorites();
    draw();
    toast(favorites.has(id) ? 'Added to your tea shelf' : 'Removed from favorites', 'dark');
  }));
}

search.addEventListener('input', () => {
  query = search.value.trim().toLowerCase();
  draw();
});
favoritesOnly.addEventListener('change', draw);

draw();
