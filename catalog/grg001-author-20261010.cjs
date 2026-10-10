// Publisher-approved GRG_001 author copy, copied unchanged from PARATEXT_V3.
// The S12 portrait is withheld: its image ledger marks commercial use HOLD.
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'editorial', 'grg001-author-20261010.md'), 'utf8');
const body = source.split(/^---\s*$/m)[1]?.split(/^### Soldier · Clergyman · Military Historian\s*$/m)[1];
if (!body) throw new Error('GRG_001 author copy structure changed');
const paragraphs = body.trim().split(/\r?\n\s*\r?\n/);
const escapeHtml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const html = paragraphs.map(value => `<p>${escapeHtml(value).replace(/\*([^*]+)\*/g, '<em>$1</em>')}</p>`).join('');

module.exports = {
  slug: 'george-robert-gleig',
  name: 'George Robert Gleig',
  dates: '1796–1888',
  eyebrow: 'GREEN SERIES · AETERNUS',
  tagline: 'Soldier · Clergyman · Military Historian',
  intro: 'The Reverend George Robert Gleig · Chaplain-General to the Forces',
  metaDescription: 'George Robert Gleig, soldier, clergyman and military historian; author of Sale’s Brigade in Afghanistan (1846).',
  portrait: { modern: false },
  brandOnly: true,
  hideEditions: true,
  publisherAuthorHTML: html,
  publisherAuthorSource: 'GRG_001/04_PARATEXT/PARATEXT_V3/05_AUTHOR_PAGE.md'
};
