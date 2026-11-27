// Reihen, die auf der Website erscheinen. Offline-Reihen (decision_website_reihe_weiss_ganz_ausblenden_sechs_reihen_20261127)
// bekommen keine Seite und keinen Eintrag; ihre Adressen leiten per src/reihen-offline.njk um.
module.exports = require('./i18n').seriesItems.filter(s => !s.offline);
