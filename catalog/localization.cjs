const config = require('../international/locales.json');
function localePath(language, route = '') {
  const locale = config.languages[language];
  if (!locale || !locale.enabled || !locale.content_ready) return null;
  if (/\.\.|[?#]|:/.test(route)) throw new Error('Expected a local route');
  return locale.prefix + route.replace(/^\/+/, '');
}
// Page equivalence must be editorially explicit, never inferred from slugs.
function alternatives(equivalents = {}) {
  return Object.entries(equivalents).flatMap(([language, route]) => {
    const path = localePath(language, route);
    return path ? [{ language, path }] : [];
  });
}
module.exports = { config, localePath, alternatives };
