// One public catalogue, derived from the existing programme and author records.
// ISBNs, prices and availability are never inferred from cover art or an ASIN.
const programme = require("./i18n");
const authors = require("./authorsDe");
const clean = value => String(value || "").replace(/<[^>]*>/g, "").trim();
const slug = value => clean(value).toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const formatNames = { ebook: "E-Book", paperback: "Taschenbuch", hardcover: "Hardcover" };
const books = programme.seriesItems.flatMap(series => series.authors.flatMap(author => author.books.map(book => {
  const authorData = authors.find(a => author.landingUrl.de === `/autoren/${a.slug}/`);
  const detail = authorData?.books.find(b => b.cover.img === book.cover) || authorData?.books.find(b => clean(b.title) === book.title.de);
  const id = slug(book.title.de);
  const pending = /eingereicht|ausstehend|vorbereitung|folgen nach/i.test([book.status?.de, book.desc.de, detail?.modal?.status].join(" "));
  const amazon = !pending ? book.amazonUrl || "" : "";
  const description = book.desc.de.replace(/\s*Bei KDP eingereicht; Veröffentlichung ausstehend\.?/g, "").trim();
  const formats = detail?.formats?.map(f => ({ name: f.name, isbn: f.isbn, price: f.price, url: !pending ? f.links?.[0]?.url : "" })) ||
    Object.entries(book.isbns || {}).filter(([, isbn]) => isbn).map(([key, isbn]) => ({
      name: formatNames[key], isbn, price: book.pricesEur?.[key] ? book.pricesEur[key] + " €" : "",
      url: !pending && book.asin?.[key] ? `https://www.amazon.de/dp/${book.asin[key]}` : ""
    }));
  // An ISBN-specific search can belong to a different binding than the cover.
  const linkedFormat = formats.find(f => amazon.includes(f.isbn?.replace(/-/g, "")));
  return {
    id, url: `/buecher/${id}/`, title: book.title.de, author: author.name,
    authorUrl: author.landingUrl.de, authorSlug: authorData?.slug,
    portrait: authorData?.portrait, authorIntro: clean(authorData?.intro),
    cover: book.cover, description, summary: clean(detail?.modal?.summary) || description,
    subtitle: clean(detail?.subtitle), original: book.originalTitle || "",
    series: series.slug, seriesName: series.colorName.de, seriesColor: series.colorHex,
    isbn: book.isbn, searchIsbns: [book.isbn, ...formats.map(f => f.isbn)].join(" "), pages: book.pages, formats, amazon,
    amazonLabel: linkedFormat ? `${linkedFormat.name} bei Amazon suchen` : amazon.includes("/s?") ? "Bei Amazon suchen" : "Bei Amazon ansehen",
    pending, status: pending ? "Demnächst erhältlich" : "Im Programm",
    metadata: pending ? "" : clean(detail?.modal?.metadata),
    schema: {
      "@context": "https://schema.org", "@type": "Book", name: book.title.de,
      url: `https://aeternus-verlag.de/buecher/${id}/`,
      author: { "@type": "Person", name: author.name },
      publisher: { "@type": "Organization", name: "AETERNUS Verlag" },
      inLanguage: "de", description,
      image: `https://aeternus-verlag.de/assets/images/${book.cover}.webp`
    }
  };
})));
if (new Set(books.map(b => b.id)).size !== books.length) throw new Error("Duplicate book URL");
module.exports = {
  books,
  featured: ["cover-wilde-tiere", "cover-waldteufel", "cover-sale", "cover-koenig-salomos-schatzkammer"].map(cover => books.find(b => b.cover === cover)),
  spotlight: books.find(b => b.cover === "cover-wilde-tiere"),
  series: programme.seriesItems.map(s => ({ slug: s.slug, name: s.colorName.de, label: s.label.de, color: s.colorHex, count: books.filter(b => b.series === s.slug).length }))
};
