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

// Author pages (wave 2): the panels become tabs. Without JavaScript every panel stays visible
// and the tab bar remains an in-page navigation.
const tabBar = document.querySelector('[data-aw-tabs]');
if (tabBar) {
  const tabs = [...tabBar.querySelectorAll('.aw-tab')];
  const panels = tabs.map(tab => document.getElementById(tab.hash.slice(1)));
  const wrap = panels[0].parentElement;
  const page = tabBar.closest('.aw-page');
  tabBar.querySelector('.aw-tablist').setAttribute('role', 'tablist');
  tabs.forEach((tab, i) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[i].id);
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', tab.id);
  });
  const panelOf = hash => {
    const target = hash.length > 1 && document.getElementById(decodeURIComponent(hash.slice(1)));
    return target ? panels.findIndex(panel => panel.contains(target)) : -1;
  };
  const keepInView = () => {
    const top = wrap.getBoundingClientRect().top + window.scrollY - tabBar.offsetHeight;
    if (window.scrollY > top) window.scrollTo(0, top);
  };
  const select = i => {
    tabs.forEach((tab, j) => {
      tab.setAttribute('aria-selected', String(i === j));
      tab.tabIndex = i === j ? 0 : -1;
      panels[j].hidden = i !== j;
    });
    // On narrow screens keep the selected tab visible in the scrolling tab bar.
    const list = tabBar.querySelector('.aw-tablist');
    const t = tabs[i].getBoundingClientRect(), l = list.getBoundingClientRect();
    if (t.left < l.left || t.right > l.right) list.scrollLeft += t.left - l.left - 16;
  };
  const fromLocation = () => {
    const i = panelOf(location.hash);
    select(i < 0 ? 0 : i);
    if (i >= 0) document.getElementById(decodeURIComponent(location.hash.slice(1))).scrollIntoView();
  };
  page.classList.add('aw-tabs-ready');
  select(Math.max(0, panelOf(location.hash)));
  tabs.forEach((tab, i) => tab.addEventListener('click', event => {
    event.preventDefault();
    select(i);
    history.pushState(null, '', tab.hash);
    keepInView();
  }));
  tabBar.addEventListener('keydown', event => {
    const now = tabs.indexOf(document.activeElement);
    if (now < 0) return;
    const next = { ArrowRight: now + 1, ArrowLeft: now - 1, Home: 0, End: tabs.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const i = (next + tabs.length) % tabs.length;
    tabs[i].focus();
    select(i);
    history.replaceState(null, '', tabs[i].hash);
  });
  window.addEventListener('hashchange', fromLocation);
  window.addEventListener('popstate', () => { const i = panelOf(location.hash); select(i < 0 ? 0 : i); });
}

// Authors index (wave 2): series filter, search and sort over the portrait grid.
const authorGrid = document.querySelector('[data-aw-grid]');
const authorFilters = document.querySelector('[data-aw-filters]');
if (authorGrid && authorFilters) {
  const items = [...authorGrid.children];
  const chips = authorFilters.querySelector('.aw-filter-chips');
  const search = authorFilters.querySelector('#aw-search');
  const sort = authorFilters.querySelector('#aw-sort');
  const empty = document.querySelector('[data-aw-empty]');
  const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const surname = name => fold(name.replace(/\s*\(.*\)\s*$/, '').trim().split(/\s+/).pop());
  const born = item => Number((item.dataset.dates.match(/\d{4}/) || ['9999'])[0]);
  const series = new Map();
  items.forEach(item => {
    const s = item.dataset.series;
    if (!s) return;
    if (!series.has(s)) series.set(s, { color: item.dataset.color, count: 0 });
    series.get(s).count++;
  });
  for (const [name, { color, count }] of series) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'aw-fchip';
    button.dataset.series = name;
    button.setAttribute('aria-pressed', 'false');
    const dot = document.createElement('span');
    dot.className = 'series-dot';
    dot.style.setProperty('--series-color', color);
    const small = document.createElement('small');
    small.textContent = String(count);
    button.append(dot, name.charAt(0).toUpperCase() + name.slice(1) + ' ', small);
    chips.append(button);
  }
  let active = '';
  const apply = () => {
    const q = fold(search.value.trim());
    let shown = 0;
    items.forEach(item => {
      const visible = (!active || item.dataset.series === active) && (!q || fold(item.dataset.name).includes(q));
      item.hidden = !visible;
      if (visible) shown++;
    });
    empty.hidden = shown > 0;
  };
  const order = () => {
    const by = sort.value;
    const sorted = [...items].sort((a, b) => by === 'name' ? surname(a.dataset.name).localeCompare(surname(b.dataset.name))
      : by === 'born' ? born(a) - born(b) : a.dataset.order - b.dataset.order);
    authorGrid.append(...sorted);
  };
  chips.addEventListener('click', event => {
    const button = event.target.closest('.aw-fchip');
    if (!button) return;
    active = button.dataset.series;
    chips.querySelectorAll('.aw-fchip').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    apply();
  });
  search.addEventListener('input', apply);
  sort.addEventListener('change', order);
  authorFilters.hidden = false;
}
