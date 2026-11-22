const button = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-navigation');
if (button && nav) {
  button.hidden = false;
  document.documentElement.classList.add('js');
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      button.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      button.focus();
    }
  });
}

// No Meta connection until the visitor explicitly requests a live post.
document.querySelectorAll('[data-load-instagram]').forEach(button => {
 button.addEventListener('click', () => {
  const container = button.closest('[data-instagram-url]');
  const url = new URL(container.dataset.instagramUrl);
  if (url.origin !== 'https://www.instagram.com' || !/^\/p\/[A-Za-z0-9_-]+\/$/.test(url.pathname)) return;
  const frame = document.createElement('iframe');
  frame.src = url.href + 'embed/';
  frame.title = 'AETERNUS Publishing Instagram post';
  frame.loading = 'lazy'; frame.referrerPolicy = 'no-referrer';
  frame.setAttribute('allowfullscreen', '');
  container.replaceChildren(frame);
 });
});

// Amazon marketplace switch on book pages (US/UK/CA/AU), remembered per visitor.
const market = document.querySelector('[data-amazon-market]');
if (market) {
  const markets = ['com', 'co.uk', 'ca', 'com.au'];
  const setMarket = value => {
    document.querySelectorAll('[data-amazon]').forEach(link => {
      const asin = link.dataset.asin;
      link.href = value === 'com' && asin ? `https://www.amazon.com/dp/${asin}` : `https://www.amazon.${value}/s?k=${link.dataset.isbn}&i=stripbooks`;
      const label = link.querySelector('[data-amazon-domain]');
      if (label) label.textContent = '.' + value;
    });
  };
  try { const saved = localStorage.getItem('aeternus-amazon-market'); if (markets.includes(saved)) market.value = saved; } catch (e) {}
  setMarket(market.value);
  market.addEventListener('change', () => {
    try { localStorage.setItem('aeternus-amazon-market', market.value); } catch (e) {}
    setMarket(market.value);
  });
}
