// Stable work routes reuse the public catalogue; no new edition metadata.
const { books } = require('./catalogue');
const definitions = [
  ['ets001', ['cover-wilde-tiere']],
  ['ets002', ['cover-wahb']],
  ['ets003', ['cover-leben-der-gejagten-r3']],
  ['ets004', ['cover-tierhelden']],
  ['ets005', ['cover-rolf-in-der-wildnis']],
  ['ets006', ['cover-die-arktischen-praerien-r1']],
  ['ets007', ['cover-monarch']],
  ['ets008', ['cover-zwei-kleine-wilde']],
  ['ets011', ['cover-waldhandwerk-band-i', 'cover-waldhandwerk-band-ii']],
];
const works = definitions.map(([id, covers]) => {
  const editions = covers.map(cover => {
    const found = books.filter(b => b.cover === cover && b.language === 'de');
    if (found.length !== 1) throw new Error(`Seton work ${id}: catalogue identity is not unique (${cover})`);
    return found[0];
  });
  return {
    id, editions,
    title: id === 'ets011' ? 'Das Buch des Waldhandwerks und der Indianerweisheit' : editions[0].title,
    target: id === 'ets011' ? '/buecher/waldhandwerk-und-indianerweisheit/' : editions[0].url,
  };
});
module.exports = { works, waldhandwerk: works.find(work => work.id === 'ets011') };
