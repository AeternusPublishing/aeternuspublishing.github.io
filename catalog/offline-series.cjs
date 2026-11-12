// Reihen, die vorerst nicht auf den Websites erscheinen (DE aeternus-verlag.de und EN aeternuspublishing.com).
// Verlegerwort 12.11.2026: „die beiden linien erstmal offline nehmen“ · „auf ENG und DEU“.
// Die Reihendaten bleiben vollstaendig in i18n.js / programme.cjs stehen und werden nur aus seriesItems gefiltert.
// Rueckweg: Slug hier entfernen (oder den Commit dieses Schritts zuruecknehmen) und neu bauen.
const OFFLINE_SERIES = ['weiss', 'purpur'];

function hideOfflineSeries(programme) {
  const hidden = programme.seriesItems.filter(s => OFFLINE_SERIES.includes(s.slug));
  for (const s of hidden) {
    if ((s.authors || []).some(a => (a.books || []).length)) {
      throw new Error(`Offline-Reihe ${s.slug} traegt Buecher; ausblenden wuerde Verweise ins Leere erzeugen`);
    }
  }
  programme.offlineSeriesItems = hidden;
  programme.seriesItems = programme.seriesItems.filter(s => !OFFLINE_SERIES.includes(s.slug));
  return programme;
}

module.exports = { OFFLINE_SERIES, hideOfflineSeries };
