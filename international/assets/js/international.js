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
