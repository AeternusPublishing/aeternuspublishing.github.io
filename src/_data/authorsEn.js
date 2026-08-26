// English author landing pages. One record per author; src/en/authors.njk paginates
// over this array and emits /en/authors/<slug>/.
//
// Provenance: the Seton and Bird copy is the English text that previously lived on the
// external draft site and was reached through the ?lang=en iframe. Pulling those pages
// in-house broke that route, so the same copy now lives here. Ford, Sale, and
// Baden-Powell are new and mirror their German pages.
//
// books: [] means nothing is in print yet — the page then shows the preview banner and
// no retailer button.

module.exports = [
  {
    slug: "ernest-thompson-seton",
    name: "Ernest Thompson Seton",
    monogram: "ETS",
    dates: "1860&ndash;1946",
    seriesClass: "",
    preview: false,
    portrait: { file: "portrait-seton", alt: "Historical portrait of Ernest Thompson Seton", modern: true },
    schema: { birthDate: "1860-08-14", deathDate: "1946-10-23", description: "Naturalist, animal artist, writer, and pioneer of outdoor education." },
    eyebrow: "Amber &middot; Nature writing &amp; character",
    tagline: "The wild as a school of close attention.",
    intro: "Naturalist, animal artist, and storyteller, Seton joined field observation to an ethic of responsibility and helped shape modern outdoor education.",
    metaDescription: "Ernest Thompson Seton: biography, works, and the Aeternus Verlag editions of his animal stories in the Amber series.",
    bioKicker: "Author &amp; context",
    bioTitle: "Observe,<br>narrate,<br>preserve",
    bioLede: "A writer at the threshold of Victorian natural history, modern ethology, and popular storytelling.",
    blocks: [
      { h: "Life &amp; period", p: ["Born in England in 1860 and raised in Canada, Seton found his earliest field laboratory in the landscapes of Manitoba and Ontario.", "As artist and naturalist, he published richly illustrated animal stories, expedition narratives, and field manuals."] },
      { h: "Philosophy", p: ["Seton treated animals as individuals with memory, strategy, and social bonds. His stories dramatize without abandoning behavioral observation.", "For him, woodcraft meant independence built through attention, practice, and restraint."] },
      { h: "Legacy", p: ["The Woodcraft Indians and his role in the early Scout movement gave Seton's ideas international reach.", "Today his work is read at once as literature, natural history, and testimony from a contradictory era."] }
    ],
    worksKicker: "Selected works",
    worksTitle: "Books that teach you to look",
    worksIntro: "Historic texts, carefully reopened. Select a title for context, a reading sample, and its available Amazon route.",
    gridClass: "count-5",
    books: [
      { cover: { img: "cover-wilde-tiere" }, meta: "Animal stories &middot; 1898", title: "Wild Animals I Have Known", subtitle: "Eight true animal histories from the North American wild",
        modal: { metadata: "Aeternus Verlag · Hardcover & Kindle", summary: "From Lobo the wolf to Silverspot the crow, Seton's landmark collection joins close field observation with dramatic storytelling.", sample: "Lobo rules the Currumpaw range through experience, caution, and an attachment to his pack that ultimately determines his fate.", amazon: "https://www.amazon.com/s?k=Wild%20Animals%20I%20Have%20Known%20Ernest%20Thompson%20Seton" } },
      { cover: { img: "cover-wahb" }, meta: "Animal biography &middot; 1900", title: "The Biography of a Grizzly", subtitle: "A grizzly's life told without sentimentality",
        modal: { metadata: "Aeternus Verlag · Hardcover & Kindle", summary: "The life of Wahb from cubhood to old age, rendered with unsparing precision and an unusual intimacy with the wild.", sample: "Wahb's world is made of scent, memory, and terrain. Every track alters the invisible map by which he survives.", amazon: "https://www.amazon.com/s?k=Biography%20of%20a%20Grizzly%20Ernest%20Thompson%20Seton" } },
      { cover: { img: "cover-tierhelden" }, meta: "Animal stories &middot; 1905", title: "Animal Heroes", subtitle: "Eight lives from Seton's later work",
        modal: { metadata: "Aeternus Verlag · Volume IV of the Amber series", summary: "Eight animal portraits from Seton's later work — from the slum cat to the Winnipeg wolf. Newly translated and edited.", sample: "Seton looks for the heroic not in the extraordinary but in the tenacity with which an animal holds its ground.", amazon: "https://www.amazon.com/s?k=Animal%20Heroes%20Ernest%20Thompson%20Seton" } },
      { cover: { gen: "arctic", title: "The Arctic<br>Prairies" }, meta: "Expedition narrative &middot; Northern Canada &middot; 1911", title: "The Arctic Prairies", subtitle: "A 2,000-mile canoe journey in search of the caribou",
        modal: { metadata: "Expedition narrative · Northern Canada · 1911", summary: "Seton's six-month journey into northern Canada combines field diary, animal observation, mapping, and encounters along the trading routes.", sample: "Beyond the last trading posts, distance is measured again in weeks, changes of weather, and bends of the river.", amazon: "https://www.amazon.com/s?k=The%20Arctic%20Prairies%20Ernest%20Thompson%20Seton" } },
      { cover: { gen: "woodcraft", title: "The Book of<br>Woodcraft" }, meta: "Field manual &middot; More than 500 drawings &middot; 1912", title: "The Book of Woodcraft and Indian Lore", subtitle: "Fieldcraft, camp life, and character formation",
        modal: { metadata: "Field manual · More than 500 drawings · 1912", summary: "An encyclopedic guide to tracking, campcraft, navigation, natural history, and cooperative education outdoors.", sample: "For Seton, woodcraft begins not with equipment but with attention: learning to see before choosing how to act.", amazon: "https://www.amazon.com/s?k=The%20Book%20of%20Woodcraft%20Ernest%20Thompson%20Seton" } }
    ]
  },
  {
    slug: "robert-montgomery-bird",
    name: "Robert Montgomery Bird",
    monogram: "RMB",
    dates: "1806&ndash;1854",
    seriesClass: "series-anthracite",
    preview: false,
    nameClass: "bird-name",
    portrait: { file: "portrait-bird", alt: "Historical portrait of Robert Montgomery Bird", modern: true },
    schema: { birthDate: "1806-02-05", deathDate: "1854-01-23", description: "American physician, dramatist, novelist, and artist." },
    eyebrow: "Anthracite &middot; Frontier literature &amp; primal conflict",
    tagline: "Where civilization becomes a fragile line.",
    intro: "Physician, dramatist, novelist, and artist, Bird wrote about identity, violence, and social order on the borders of early America.",
    metaDescription: "Robert Montgomery Bird: biography and frontier novels in the Anthracite series of Aeternus Verlag.",
    bioKicker: "Author &amp; context",
    bioTitle: "The dark anatomy of the frontier",
    bioLede: "Bird's work joins historical romance, political satire, and stage drama to an unusually sharp view of power and transformation.",
    blocks: [
      { h: "Life &amp; period", p: ["Born in Delaware in 1806, Bird studied medicine in Philadelphia and soon left practice for literature.", "His most productive years yielded plays and novels before he turned toward medicine, politics, and journalism."] },
      { h: "Form &amp; conflict", p: ["Bird uses the frontier as a moral pressure chamber. Disguise, double identity, and rumor propel his figures through unstable orders.", "Even his historical novels retain a dramatist's instinct, tightening decisions around their consequences."] },
      { h: "Rediscovery", p: ["<i>Nick of the Woods</i> made Bird internationally known in the nineteenth century. <i>Sheppard Lee</i> is now read anew as early experimental satire.", "The Aeternus edition opens Bird's frontier novel to German readers in a complete new translation."] }
    ],
    worksKicker: "Selected works",
    worksTitle: "The frontier under pressure",
    worksIntro: "Historic texts, carefully reopened. Select a title for context, a reading sample, and its available Amazon route.",
    gridClass: "single-row",
    books: [
      { cover: { img: "cover-waldteufel" }, meta: "Frontier novel &middot; Kentucky &middot; 1837", title: "Nick of the Woods", subtitle: "A tale of the Kentucky frontier",
        modal: { metadata: "Aeternus Verlag · Hardcover & Kindle", summary: "Bird's best-known frontier novel follows a party through Kentucky in 1782, where identity, violence, and legend continually change shape.", sample: "In the border forest nothing is stable, neither the marks on the ground nor the names under which people meet one another.", amazon: "https://www.amazon.com/s?k=Nick%20of%20the%20Woods%20Robert%20Montgomery%20Bird" } },
      { cover: { gen: "hawks", title: "The Hawks of<br>Hawk-Hollow" }, meta: "Historical novel &middot; Pennsylvania &middot; 1835", title: "The Hawks of Hawk-Hollow", subtitle: "A tradition of Pennsylvania",
        modal: { metadata: "Historical novel · Pennsylvania · 1835", summary: "Family inheritance, political loyalty, and old violence converge in a landscape unwilling to surrender its history.", sample: "Hawk-Hollow keeps its past not in archives but in glances, rumors, and the roads people avoid after dark.", amazon: "https://www.amazon.com/s?k=The%20Hawks%20of%20Hawk-Hollow%20Robert%20Montgomery%20Bird" } }
    ]
  },
  {
    slug: "henry-ford",
    name: "Henry Ford",
    monogram: "HF",
    dates: "1863&ndash;1947",
    seriesClass: "series-blue",
    preview: false,
    nameClass: "bird-name",
    portrait: { file: "portrait-ford", alt: "Henry Ford at his desk, photographic portrait", modern: true },
    schema: { birthDate: "1863-07-30", deathDate: "1947-04-07", description: "American industrialist, founder of the Ford Motor Company, and author of industrial self-accounts." },
    eyebrow: "Blue &middot; Economy, industry, and the titans of progress",
    tagline: "The factory as an argument.",
    intro: "Mechanic, manufacturer, world-changer, and point of contention: in his own books Ford set out how work, machine, and wage should interlock &mdash; terse, unwavering, and in a language that wastes no words.",
    metaDescription: "Henry Ford: life, work, and the new German Aeternus Verlag edition of My Life and Work in the Blue series — submitted to Amazon as paperback and Kindle eBook.",
    bioKicker: "Author &amp; context",
    bioTitle: "A mechanic who<br>reordered work",
    bioLede: "Between workbench and world market: the story of a man whose ideas shaped the working life of the twentieth century &mdash; for better and for worse.",
    blocks: [
      { h: "Life &amp; period", p: ["Ford was born on a Michigan farm in 1863 and came to automobile building by way of the machine shop. He founded the Ford Motor Company in 1903.", "With the Model T of 1908, the moving assembly line of 1913, and the five-dollar day of 1914, he changed manufacturing, wages, and daily life alike."] },
      { h: "Method", p: ["Ford's prose does not narrate; it argues. He reasons with unit counts, wages, prices, and hand movements, and the figures are the argument rather than its decoration.", "His sentences are strikingly short and aphoristic &mdash; a manner of writing that mirrors his own doctrine of efficiency."] },
      { h: "Influence", p: ["Ford's manufacturing idea was copied worldwide and still bears his name.", "Aeternus presents the source text unaltered; any contextualization is kept visibly separate, in the publisher's apparatus."] }
    ],
    facts: [["Series", "Blue line &middot; Pillar IV"], ["First edition", "New York, 1922"], ["Formats", "Paperback &middot; Kindle eBook"], ["Status", "Submitted to Amazon"]],
    worksKicker: "New from Aeternus",
    worksTitle: "The work behind the works",
    worksIntro: "An industrial self-account that is at once autobiography, manufacturing doctrine, and economic polemic &mdash; translated close to the source and historically contextualized.",
    gridClass: "single-item",
    books: [
      { cover: { img: "cover-ford" }, meta: "Industrial autobiography &middot; 1922", title: "Mein Leben und Werk", subtitle: "Die Autobiographie",
        modal: { metadata: "Aeternus Verlag · Blue series · Paperback €15.99 · Kindle €11.99", summary: "Ford recounts his path from the workshop to a global corporation and lays bare a complete system: how a product comes into being, what labour may cost, and why a low price is to him not a concession but a calculation.", sample: "The German edition follows the wording of the 1922 first edition. Figures, prices, wages, and measures stand unchanged; conversions and historical context belong in the publisher's apparatus, not in the work text.", amazon: "https://www.amazon.de/s?k=Mein+Leben+und+Werk+Henry+Ford+AETERNUS" } }
    ]
  },
  {
    slug: "lady-florentia-sale",
    name: "Lady Florentia Sale",
    monogram: "FS",
    dates: "1790&ndash;1853",
    seriesClass: "series-green",
    preview: true,
    nameClass: "bird-name",
    portrait: { file: "portrait-sale", alt: "Portrait of Lady Florentia Sale", modern: true },
    schema: { birthDate: "1790", deathDate: "1853", description: "British diarist and eyewitness of the retreat from Kabul in 1842." },
    eyebrow: "Green &middot; Military, expeditions, frontier regions",
    tagline: "A diary written inside the collapse.",
    intro: "She kept writing in the middle of the catastrophe: day after day Florentia Sale records how a British army in Afghanistan falls apart &mdash; soberly, precisely, and without the shelter of later explanation.",
    metaDescription: "Lady Florentia Sale: life, journal, and the forthcoming Aeternus Verlag edition of her Afghanistan diary in the Green series.",
    bioKicker: "Author &amp; context",
    bioTitle: "The witness<br>of the collapse",
    bioLede: "A woman at the headquarters of a failing campaign &mdash; and the only voice that wrote it down day by day, without knowing how it would end.",
    blocks: [
      { h: "Life &amp; period", p: ["Born Florentia Wynch in 1790, she followed her husband, the British general Sir Robert Sale, to the garrisons of India and finally to Kabul.", "She spent the winter of 1841&ndash;42 in the besieged cantonment, endured the retreat from Kabul as a wounded woman, and the months that followed in Afghan captivity."] },
      { h: "The voice", p: ["Her text is a true diary, not a retrospective report: first person, often in the present tense of the writing, with dates, marching figures, and names.", "She judges her own command sharply and describes cold, hunger, and violence without heroic inflation. Preserving that voice is the central editorial task of the edition."] },
      { h: "Afterlife", p: ["The journal appeared in 1843 from John Murray in London and made her known overnight; the press called her the <i>Grenadier in Petticoats</i>.", "Her diary still counts among the most important eyewitness sources for the First Anglo-Afghan War."] }
    ],
    facts: [["Series", "Green line &middot; Pillar II"], ["First edition", "John Murray, London 1843"], ["Source language", "English"], ["Status", "In preparation"]],
    worksKicker: "In preparation",
    worksTitle: "The Kabul winter",
    worksIntro: "A dated eyewitness diary from the First Anglo-Afghan War, with the appendices and documents of the first edition &mdash; translated close to the source and historically contextualized.",
    gridClass: "single-item",
    books: [
      { cover: { gen: "sale", title: "A Journal of<br>the Disasters in<br>Affghanistan" }, meta: "Journal &middot; Kabul &middot; 1843", title: "A Journal of the Disasters in Affghanistan, 1841&ndash;2", subtitle: "German edition in preparation",
        modal: { metadata: "Aeternus Verlag · Green line · in preparation", summary: "Kabul, winter 1841: a British army of occupation loses control, negotiates, withdraws, and is destroyed on the march through the passes. Florentia Sale writes it all down as it happens — date by date, into captivity itself.", sample: "The German edition follows the London first edition of 1843, including the introduction, notes, addenda, and appendix. The diary voice is preserved; recasting it as detached chronicle prose would be a loss of substance." } }
    ]
  },
  {
    slug: "robert-baden-powell",
    name: "Robert Baden-Powell",
    monogram: "BP",
    dates: "1857&ndash;1941",
    seriesClass: "",
    preview: true,
    nameClass: "bird-name",
    portrait: { file: "portrait-baden-powell", alt: "Robert Baden-Powell in profile, wearing the Scout hat", modern: true },
    schema: { birthDate: "1857-02-22", deathDate: "1941-01-08", description: "British army officer, author, and founder of the Scout movement." },
    eyebrow: "Amber &middot; Youth, adventure, character",
    tagline: "A handbook that set off a world movement.",
    intro: "Officer, scout, draughtsman, and storyteller: in 1908 Baden-Powell wrote a book of instruction for boys &mdash; and unintentionally founded one of the largest youth movements in the world.",
    metaDescription: "Robert Baden-Powell: life, work, and the forthcoming Aeternus Verlag edition of Scouting for Boys in the Amber series.",
    bioKicker: "Author &amp; context",
    bioTitle: "From the scouting<br>patrol to a movement",
    bioLede: "A military handbook for scouts, rewritten for fourteen-year-olds &mdash; and out of that detour came a worldwide youth movement.",
    blocks: [
      { h: "Life &amp; period", p: ["Born in London in 1857, Baden-Powell served as a British army officer in India and southern Africa. The siege of Mafeking in 1899&ndash;1900 made him famous across the Empire.", "In 1907 he tested his idea at a camp on Brownsea Island; the book that set off the movement followed in 1908. He died in Nyeri, Kenya, in 1941."] },
      { h: "The form", p: ["<i>Scouting for Boys</i> is not a treatise but a handbook: campfire yarns, games, tests, maxims, and drawings alternate in short, practical units.", "The tone speaks directly to young readers &mdash; vivid, demanding, often dryly funny. A translation has to hold exactly that register."] },
      { h: "Reach and context", p: ["Within a few years Scout troops had formed on every continent; the book ranks among the most widely circulated books for young readers of the twentieth century.", "It is at the same time a document of the British Empire and carries its worldview plainly. Aeternus preserves the historical wording and makes that context visible rather than smoothing it away."] }
    ],
    facts: [["Series", "Amber line &middot; Pillar V"], ["First edition", "London, 1908"], ["Source language", "English"], ["Status", "In preparation"]],
    worksKicker: "In preparation",
    worksTitle: "The founding text",
    worksIntro: "The 1908 handbook in full: campcraft, tracking, tests, and yarns &mdash; translated close to the source, with the drawings of the first edition and historical context.",
    gridClass: "single-item",
    books: [
      { cover: { gen: "scouting", title: "Scouting<br>for Boys" }, meta: "Handbook &middot; London &middot; 1908", title: "Scouting for Boys", subtitle: "A handbook for instruction in good citizenship",
        modal: { metadata: "Aeternus Verlag · Amber line · in preparation", summary: "London 1908: an officer rewrites his military handbook for scouts into a book for boys. Campcraft, tracking, first aid, tests of nerve, and campfire yarns stand side by side — and became the founding text of the Scout movement.", sample: "The German edition follows the wording of the 1908 first edition, including the author's drawings. The historical wording is preserved; the terms and worldview of its time are made visible in the publisher's apparatus, not corrected in the work text." } }
    ]
  }
];
