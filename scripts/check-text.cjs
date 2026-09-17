const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { Parser } = require('htmlparser2');
const root = path.resolve('public');
const defects = /\uFFFD|Ã[\u0080-\u00BF]|Â[\u0080-\u00BF]|â€|\bundefined\b|\bNaN\b|\{\{|\{%|&(?:amp|nbsp|auml|ouml|uuml|quot|#\d+);/;
// Red fixtures prove the detector, including escaped entities after HTML parsing.
for (const bad of ['GrÃ¼n', 'Text�', 'â€œTitel', 'undefined', '{{ title }}', '&auml;']) assert.match(bad, defects);
for (const good of ['Grün · Märchen', 'São Paulo', 'Heidis Lehr- und Wanderjahre']) assert.doesNotMatch(good, defects);
const pages = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, e.name);
    if (e.isDirectory()) walk(file);
    else if (e.name.endsWith('.html')) pages.push(file);
  }
}
walk(root);
const findings = [];
let authorPages = 0;
for (const file of pages) {
  const route = '/' + path.relative(root, file).replaceAll(path.sep, '/').replace(/index\.html$/, '');
  let ignored = 0;
  const add = message => findings.push({ route, message });
  const html = fs.readFileSync(file, 'utf8');
  const author = html.includes('/assets/css/author-es.css');
  if (author) authorPages++;
  const parser = new Parser({
    onopentag(tag, attrs) {
      if (tag === 'script' || tag === 'style') ignored++;
      for (const name of ['alt', 'title', 'aria-label', 'placeholder']) if (attrs[name] && defects.test(attrs[name])) add('Broken attribute: ' + attrs[name]);
      if (tag === 'link' && /\/assets\/css\/(author-es|author-preview)\.css/.test(attrs.href || '') && !/\?v=[a-f0-9]{10}$/.test(attrs.href)) add('Unversioned author stylesheet: ' + attrs.href);
      if (tag === 'img' || tag === 'source') {
        const urls = [attrs.src, ...(attrs.srcset || '').split(',').map(s => s.trim().split(/\s+/)[0])].filter(Boolean);
        for (const url of urls) if (url.startsWith('/') && !fs.existsSync(path.join(root, url.split('?')[0]))) add('Missing image: ' + url);
      }
    },
    onclosetag(tag) { if (tag === 'script' || tag === 'style') ignored--; },
    ontext(text) { if (!ignored && defects.test(text)) add('Broken text: ' + text.trim().slice(0, 180)); },
  }, { decodeEntities: true });
  parser.write(html); parser.end();
}
const css = fs.readFileSync('src/assets/css/author-es.css', 'utf8');
const rule = css.match(/\.cover-button\{([^}]+)\}/)?.[1] || '';
assert.match(rule, /text-decoration:\s*none/, 'Book cards must not inherit link underlines');
assert.match(rule, /font:\s*inherit/, 'Button cards must inherit the house typography');
console.log(JSON.stringify({ pages: pages.length, authorPages, findings }, null, 2));
if (findings.length) process.exitCode = 1;
