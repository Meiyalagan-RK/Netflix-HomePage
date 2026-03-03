const rowsContainer = document.getElementById('rowsContainer');
const rowTemplate = document.getElementById('rowTemplate');
const hero = document.getElementById('hero');
const heroTitle = document.getElementById('heroTitle');
const heroDescription = document.getElementById('heroDescription');
const searchInput = document.getElementById('searchInput');
const subscribeForm = document.getElementById('subscribeForm');
const subscriptionMessage = document.getElementById('subscriptionMessage');

let allRows = [];

const createCard = (item) => {
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.movieId = item.id;
  card.innerHTML = `
    <h4>${item.name}</h4>
    <p>${item.year} • ${item.rating}</p>
    <p>${item.genre}</p>
  `;
  return card;
};

const renderRows = (rows) => {
  rowsContainer.innerHTML = '';

  rows.forEach((row) => {
    const clone = rowTemplate.content.cloneNode(true);
    clone.querySelector('.row-title').textContent = row.title;
    const cardsEl = clone.querySelector('.cards');

    row.items.forEach((item) => cardsEl.appendChild(createCard(item)));
    rowsContainer.appendChild(clone);
  });
};

const loadHomePage = async () => {
  const response = await fetch('/api/content');
  const data = await response.json();

  hero.style.backgroundImage = `url('${data.hero.backgroundImage}')`;
  heroTitle.textContent = data.hero.title;
  heroDescription.textContent = data.hero.description;

  allRows = data.rows;
  renderRows(allRows);
};

searchInput.addEventListener('input', async (event) => {
  const value = event.target.value.trim();

  if (!value) {
    renderRows(allRows);
    return;
  }

  const response = await fetch(`/api/search?q=${encodeURIComponent(value)}`);

  if (!response.ok) {
    return;
  }

  const data = await response.json();
  renderRows([
    {
      id: 'search-results',
      title: `Search results (${data.count})`,
      items: data.results
    }
  ]);
});

subscribeForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const plan = document.getElementById('plan').value;

  const response = await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, plan })
  });

  const data = await response.json();

  if (!response.ok) {
    subscriptionMessage.textContent = data.error;
    return;
  }

  subscriptionMessage.textContent = `${data.message}: ${data.email} (${data.plan})`;
  subscribeForm.reset();
});

loadHomePage();
