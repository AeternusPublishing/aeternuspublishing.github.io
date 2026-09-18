const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const selection = require('./kosmosSelection.json');
const authorsDe = require('./authorsDe');
const authorsEn = require('./authorsEn');
const catalogue = require('./catalogue');
const plain = value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&middot;/g, '·').replace(/\s+/g, ' ').trim();
const coverKey = node => path.basename(new URL(node.coverImageUrl, 'https://aeternus-verlag.de').pathname, '.webp');
const authorBooks = [...authorsDe, ...authorsEn.filter(author => !authorsDe.some(de => de.slug === author.slug))].flatMap(author => author.books.map(book => ({ author, book })));
const selectedCovers = new Set(selection.nodes.map(coverKey));
for (const { book } of authorBooks) {
  if (!book.cover?.img || !selectedCovers.has(book.cover.img)) throw new Error(`[kosmos] Add geographical placement and an existing cover for: ${book.title}`);
}
const nodes = selection.nodes.map(selected => {
  const cover = coverKey(selected);
  const authorRecord = authorBooks.find(item => item.book.cover?.img === cover);
  const record = catalogue.books.find(item => item.cover === cover);
  if (!authorRecord && selected.id !== 'grimm') throw new Error(`[kosmos] Stale catalogue entry: ${selected.title}`);
  if (!fs.existsSync(path.join(__dirname, '../assets/images', `${cover}.webp`))) throw new Error(`[kosmos] Missing cover: ${cover}`);
  const { book, author } = authorRecord || {};
  const pending = record ? record.pending : book ? Boolean(author.preview || /vorbereitung|ausstehend|folgen nach|in progress|ordering links to follow/i.test([book.meta, book.modal?.status, book.modal?.metadata].join(' '))) : false;
  const amazon = record?.amazon || book?.modal?.amazon || '';
  const node = {
    ...selected,
    title: plain(record?.title || book?.title || selected.title), author: author?.name || selected.author,
    subtitle: plain(record?.subtitle || book?.subtitle || selected.subtitle), summary: plain(record?.summary || book?.modal?.summary || selected.summary),
    coverImageUrl: `/assets/images/${cover}.webp`,
    landingUrl: record?.url || selected.landingUrl.replace('https://aeternus-verlag.de', ''),
    status: pending ? 'In Vorbereitung' : 'Im Programm',
    amazonUrl: !pending && /^https:\/\/www\.amazon\./.test(amazon) ? amazon : '',
  };
  if (node.language === 'Englisch') { node.summary = selected.summary; node.subtitle = selected.subtitle; }
  if (!node.summary || !node.landingUrl.startsWith('/')) throw new Error(`[kosmos] Incomplete book: ${node.title}`);
  return node;
});
const ids = new Set(nodes.map(node => node.id));
if (ids.size !== nodes.length) throw new Error('[kosmos] Duplicate book IDs');
const seen = new Set();
for (const link of selection.links) {
  const key = [link.source, link.target].sort().join(':');
  if (!ids.has(link.source) || !ids.has(link.target) || link.source === link.target || seen.has(key) || !link.reason) throw new Error(`[kosmos] Invalid connection: ${key}`);
  seen.add(key);
}
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '../assets', file))).digest('hex').slice(0, 10);
module.exports = { nodes, links: selection.links, count: nodes.length,
  payload: JSON.stringify({ nodes, links: selection.links }).replace(/</g, '\\u003c'),
  cssVersion: hash('css/kosmos.css'), jsVersion: hash('js/kosmos.js') };
