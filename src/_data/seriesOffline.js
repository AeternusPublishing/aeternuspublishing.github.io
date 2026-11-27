// Offline-Reihen: alte Adressen /reihen/<slug>/ und /en/series/<slug>/ leiten auf die Uebersicht um.
module.exports = require('./i18n').seriesItems.filter(s => s.offline).flatMap(s => [
  { from: '/reihen/' + s.slug + '/', to: '/reihen/', lang: 'de' },
  { from: '/en/series/' + s.slug + '/', to: '/en/series/', lang: 'en' }
]);
