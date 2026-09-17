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
    "slug": "robert-montgomery-bird",
    "name": "Robert Montgomery Bird",
    "monogram": "RMB",
    "dates": "1806&ndash;1854",
    "seriesClass": "series-anthracite",
    "preview": false,
    "nameClass": "bird-name",
    "portrait": {
      "file": "portrait-bird",
      "alt": "Historical portrait of Robert Montgomery Bird",
      "modern": true
    },
    "schema": {
      "birthDate": "1806-02-05",
      "deathDate": "1854-01-23",
      "description": "American physician, dramatist, novelist, and artist."
    },
    "eyebrow": "Anthracite &middot; Frontier literature &amp; primal conflict",
    "tagline": "Where civilization becomes a fragile line.",
    "intro": "Physician, dramatist, novelist, and artist, Bird wrote about identity, violence, and social order on the borders of early America.",
    "metaDescription": "Robert Montgomery Bird at AETERNUS: illustrated English editions of Nick of the Woods and The Hawks of Hawk-Hollow, with formats and international Amazon links.",
    "bioKicker": "Author &amp; context",
    "bioTitle": "The dark anatomy of the frontier",
    "bioLede": "Bird's work joins historical romance, political satire, and stage drama to an unusually sharp view of power and transformation.",
    "blocks": [
      {
        "h": "Life &amp; period",
        "p": [
          "Born in Delaware in 1806, Bird studied medicine in Philadelphia and soon left practice for literature.",
          "His most productive years yielded plays and novels before he turned toward medicine, politics, and journalism."
        ]
      },
      {
        "h": "Form &amp; conflict",
        "p": [
          "Bird uses the frontier as a moral pressure chamber. Disguise, double identity, and rumor propel his figures through unstable orders.",
          "Even his historical novels retain a dramatist's instinct, tightening decisions around their consequences."
        ]
      },
      {
        "h": "Rediscovery",
        "p": [
          "<i>Nick of the Woods</i> made Bird internationally known in the nineteenth century. <i>Sheppard Lee</i> is now read anew as early experimental satire.",
          "AETERNUS brings these novels back to English-language readers in illustrated editions. New editorial material gives readers a way into their historical world without smoothing away its conflicts."
        ]
      }
    ],
    "worksKicker": "Selected works",
    "worksTitle": "The frontier under pressure",
    "worksIntro": "Two illustrated English editions: Kentucky frontier suspense and a Pennsylvania romance of divided loyalties. Explore each book, then choose a format and your Amazon store.",
    "gridClass": "single-row",
    "books": [
      {
        "cover": {
          "img": "cover-nick-en"
        },
        "meta": "Frontier novel &middot; Kentucky &middot; 1837",
        "title": "Nick of the Woods",
        "subtitle": "A tale of the Kentucky frontier",
        "modal": {
          "metadata": "AETERNUS · English · Illustrated · Kindle, paperback & hardcover",
          "summary": "Kentucky, 1782. A party of travelers enters a forest haunted by the name Jibbenainosay. Their guide, Nathan Slaughter, is a Quaker who appears to reject violence; the dangers around him make that conviction increasingly difficult to read. Bird turns a frontier adventure into a story of hidden identity and vengeance.",
          "sample": "An illustrated English edition with a glossary, an afterword and a note on the edition. Bird’s portrayal of frontier warfare, including its hostility toward Indigenous people, belongs to the novel’s historical perspective; the editorial material helps readers place it in context.",
          "amazon": "#edition-nick"
        },
        "id": "edition-nick",
        "status": "Available now",
        "formats": [
          {
            "name": "Kindle",
            "isbn": "978-3-912883-14-5",
            "price": "US list price $6.99",
            "links": [
              {
                "label": "United States",
                "url": "https://www.amazon.com/dp/B0HFG6QCY5"
              },
              {
                "label": "United Kingdom",
                "url": "https://www.amazon.co.uk/dp/B0HFG6QCY5"
              },
              {
                "label": "Australia",
                "url": "https://www.amazon.com.au/dp/B0HFG6QCY5"
              },
              {
                "label": "Canada",
                "url": "https://www.amazon.ca/dp/B0HFG6QCY5"
              }
            ]
          },
          {
            "name": "Paperback",
            "isbn": "978-3-912883-25-1",
            "price": "US list price $14.99",
            "links": [
              {
                "label": "United States",
                "url": "https://www.amazon.com/dp/3912883254"
              },
              {
                "label": "United Kingdom",
                "url": "https://www.amazon.co.uk/dp/3912883254"
              },
              {
                "label": "Australia",
                "url": "https://www.amazon.com.au/dp/3912883254"
              },
              {
                "label": "Canada",
                "url": "https://www.amazon.ca/dp/3912883254"
              }
            ]
          },
          {
            "name": "Hardcover",
            "isbn": "978-3-912883-11-4",
            "price": "US list price $24.99",
            "links": [
              {
                "label": "United States",
                "url": "https://www.amazon.com/dp/3912883114"
              },
              {
                "label": "United Kingdom",
                "url": "https://www.amazon.co.uk/dp/3912883114"
              },
              {
                "label": "Canada",
                "url": "https://www.amazon.ca/dp/3912883114"
              }
            ]
          }
        ]
      },
      {
        "cover": {
          "img": "cover-hawks-en"
        },
        "meta": "Historical novel &middot; Pennsylvania &middot; 1835",
        "title": "The Hawks of Hawk-Hollow",
        "subtitle": "A tradition of Pennsylvania",
        "modal": {
          "metadata": "AETERNUS · English · 468 print pages · 15 illustrations",
          "summary": "In Pennsylvania, the Revolution has left loyalties divided and old injuries unsettled. The return of a dispossessed family draws love, inheritance and revenge into the same conflict. A mysterious stranger and the outlaw reputation of the Hawks turn a quiet valley into a place where every allegiance has a price.",
          "sample": "The complete novel, with both original volumes in one edition, 15 new illustrations, a new foreword, historical context and a selective glossary. Spelling has been lightly modernized for readability; Bird’s narrative voice and the characters’ dialects are preserved.",
          "amazon": "#edition-hawks"
        },
        "id": "edition-hawks",
        "status": "Forthcoming · Amazon release in progress",
        "formats": [
          {
            "name": "Kindle",
            "isbn": "978-3-912883-90-9",
            "price": "German list price €10.99 incl. VAT · In review",
            "links": []
          },
          {
            "name": "Paperback",
            "isbn": "978-3-912883-88-6",
            "price": "German list price €17.99 incl. VAT · Release in progress",
            "links": []
          },
          {
            "name": "Hardcover",
            "isbn": "978-3-912883-89-3",
            "price": "German list price €27.99 incl. VAT · Release in progress",
            "links": []
          }
        ],
        "availabilityNote": "Submitted to Amazon on 7 September 2026. Purchase links will be added once the editions are live. Local-currency prices will appear in each supported store."
      }
    ],
    "brand": "AETERNUS",
    "sampleLabel": "About this edition",
    "editionSection": true,
    "editionsTitle": "Choose your edition",
    "modalActionLabel": "Formats & availability",
    "ogDescription": "Where civilization becomes a fragile line.",
    "editionsNote": "Prices and delivery depend on your Amazon store; the applicable local taxes are handled by Amazon. US prices may have sales tax added at checkout. Hardcover is offered in the US, UK and Canada; Amazon.com.au supports the Kindle and paperback editions. Availability checked 7 September 2026.",
    "sisterUrl": "/autoren/robert-montgomery-bird/",
    "sisterLabel": "Looking for the German editions?"
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
    preview: false,
    nameClass: "bird-name",
    portrait: { file: "portrait-sale", alt: "Portrait of Lady Florentia Sale", modern: true },
    schema: { birthDate: "1790", deathDate: "1853", description: "British diarist and eyewitness of the retreat from Kabul in 1842." },
    eyebrow: "Green &middot; Military, expeditions, frontier regions",
    tagline: "A diary written inside the collapse.",
    intro: "She kept writing in the middle of the catastrophe: day after day Florentia Sale records how a British army in Afghanistan falls apart &mdash; soberly, precisely, and without the shelter of later explanation.",
    metaDescription: "Lady Florentia Sale: life, journal, and the Aeternus Verlag edition Tagebuch der Katastrophe, available from Amazon in the Green series.",
    bioKicker: "Author &amp; context",
    bioTitle: "The witness<br>of the collapse",
    bioLede: "A woman at the headquarters of a failing campaign &mdash; and the only voice that wrote it down day by day, without knowing how it would end.",
    blocks: [
      { h: "Life &amp; period", p: ["Born Florentia Wynch in 1790, she followed her husband, the British general Sir Robert Sale, to the garrisons of India and finally to Kabul.", "She spent the winter of 1841&ndash;42 in the besieged cantonment, endured the retreat from Kabul as a wounded woman, and the months that followed in Afghan captivity."] },
      { h: "The voice", p: ["Her text is a true diary, not a retrospective report: first person, often in the present tense of the writing, with dates, marching figures, and names.", "She judges her own command sharply and describes cold, hunger, and violence without heroic inflation. Preserving that voice is the central editorial task of the edition."] },
      { h: "Afterlife", p: ["The journal appeared in 1843 from John Murray in London and made her known overnight; the press called her the <i>Grenadier in Petticoats</i>.", "Her diary still counts among the most important eyewitness sources for the First Anglo-Afghan War."] }
    ],
    facts: [["Series", "Green line &middot; Pillar II"], ["First edition", "John Murray, London 1843"], ["Formats", "Paperback &middot; Kindle eBook"], ["Status", "Available from Amazon"]],
    worksKicker: "Available from Amazon",
    worksTitle: "Tagebuch der Katastrophe",
    worksIntro: "A dated eyewitness diary from the First Anglo-Afghan War, with the appendices and documents of the first edition &mdash; translated close to the source and historically contextualized.",
    gridClass: "single-item",
    books: [
      { cover: { img: "cover-sale" }, meta: "Journal &middot; Paperback €19.99 &middot; Kindle €11.99", title: "Tagebuch der Katastrophe", subtitle: "Afghanistan 1841&ndash;1842",
        modal: { metadata: "Aeternus Verlag · Green line · Paperback €19.99 · Kindle €11.99", summary: "Kabul, winter 1841: a British army of occupation loses control, negotiates, withdraws, and is destroyed on the march through the passes. Florentia Sale writes it all down as it happens — date by date, into captivity itself.", sample: "The German edition follows the London first edition of 1843, including the introduction, notes, addenda, and appendix. The diary voice is preserved; recasting it as detached chronicle prose would be a loss of substance.", amazon: "https://www.amazon.de/dp/3912883424" } }
    ]
  },
  {
    slug: "robert-baden-powell",
    name: "Robert Baden-Powell",
    monogram: "BP",
    dates: "1857&ndash;1941",
    seriesClass: "",
    preview: false,
    nameClass: "bird-name",
    portrait: { file: "portrait-baden-powell", alt: "Robert Baden-Powell in profile, wearing the Scout hat", modern: true },
    schema: { birthDate: "1857-02-22", deathDate: "1941-01-08", description: "British army officer, author, and founder of the Scout movement." },
    eyebrow: "Green Series &middot; Volume 1",
    tagline: "A handbook that set off a world movement.",
    intro: "Officer, scout, draughtsman, and storyteller: in 1908 Baden-Powell wrote a book of instruction for boys &mdash; and unintentionally founded one of the largest youth movements in the world.",
    metaDescription: "Robert Baden-Powell at AETERNUS: Scouting for Boys in a complete German translation, submitted to KDP as paperback and hardcover.",
    bioKicker: "Author &amp; context",
    bioTitle: "From the scouting<br>patrol to a movement",
    bioLede: "A military handbook for scouts, rewritten for fourteen-year-olds &mdash; and out of that detour came a worldwide youth movement.",
    blocks: [
      { h: "Life &amp; period", p: ["Born in London in 1857, Baden-Powell served as a British army officer in India and southern Africa. The siege of Mafeking in 1899&ndash;1900 made him famous across the Empire.", "In 1907 he tested his idea at a camp on Brownsea Island; the book that set off the movement followed in 1908. He died in Nyeri, Kenya, in 1941."] },
      { h: "The form", p: ["<i>Scouting for Boys</i> is not a treatise but a handbook: campfire yarns, games, tests, maxims, and drawings alternate in short, practical units.", "The tone speaks directly to young readers &mdash; vivid, demanding, often dryly funny. A translation has to hold exactly that register."] },
      { h: "Reach and context", p: ["Within a few years Scout troops had formed on every continent; the book ranks among the most widely circulated books for young readers of the twentieth century.", "It is at the same time a document of the British Empire and carries its worldview plainly. Aeternus preserves the historical wording and makes that context visible rather than smoothing it away."] }
    ],
    facts: [["Series", "Green Series &middot; Volume 1"], ["First edition", "London, 1908"], ["Source language", "English"], ["Status", "Submitted to KDP"]],
    worksKicker: "New edition",
    worksTitle: "The founding text",
    worksIntro: "The 1908 handbook in full: campcraft, tracking, tests, and yarns &mdash; completely translated into German, with the first-edition drawings, 41 new plates, and editorial context. Paperback and hardcover have been submitted to KDP; order links will follow after approval.",
    gridClass: "single-item",
    books: [
      { cover: { img: "cover-scouting-for-boys" }, meta: "Green Series &middot; Volume 1 &middot; London 1908", title: "Scouting for Boys (Translated)", subtitle: "The Original Handbook of the Scout Movement",
        modal: { metadata: "504 pages · Paperback €19.99 · Hardcover €34.99", summary: "London 1908: an officer rewrites his military handbook for scouts into a book for boys. Campcraft, tracking, first aid, tests of nerve, and campfire yarns stand side by side — and became the founding text of the Scout movement.", sample: "Complete German translation of the 1908 first edition with the author's drawings, 41 new plates, 29 editorial notes, glossary, author portrait, publisher's foreword, and editorial afterword. Paperback ISBN 978-3-67605-007-4. Hardcover ISBN 978-3-67605-008-1.", status: "Submitted to KDP · Order links will follow after approval" } }
    ]
  },
  {
    // George Washington Sears, "Nessmuk" (GWS_001). The English edition gives Sears' own text
    // of 1884 — no translation. Amber line. In preparation: preview banner, no retailer button.
    slug: "george-washington-sears",
    name: "George Washington Sears",
    monogram: "GWS",
    dates: "1821&ndash;1890",
    seriesClass: "",
    preview: true,
    nameClass: "bird-name",
    portrait: { file: "portrait-sears", alt: "George Washington Sears, “Nessmuk,” wood engraving after a photograph, about 1887", modern: true },
    schema: { birthDate: "1821-12-02", deathDate: "1890-05-01", description: "American shoemaker, canoeist, and writer; as Nessmuk the founder of going light in the woods and by canoe." },
    eyebrow: "Amber &middot; Youth, adventure, character",
    tagline: "Go light; the lighter the better.",
    intro: "Shoemaker, canoeist, and woodsman: in 1884, under the name “Nessmuk,” Sears wrote the first book to teach not abundance in the woods but going light &mdash; a small kit, an open camp, and a fire built as it should be.",
    metaDescription: "George Washington Sears (Nessmuk): life, work, and the forthcoming Aeternus edition of Woodcraft (1884) in the Amber series — the complete first-edition text, fully illustrated.",
    bioKicker: "Author &amp; context",
    bioTitle: "Through the woods<br>with little",
    bioLede: "A small, frail shoemaker from Pennsylvania became the best-loved voice of American outdoor life &mdash; because he could not carry much, and so had to carry wisely.",
    blocks: [
      { h: "Life &amp; period", p: ["Born in Massachusetts in 1821, Sears grew up in modest circumstances, learned the shoemaker’s trade, and as a young man sailed on a New Bedford whaler to the South Pacific. He took the name Nessmuk from a Narragansett who had taken him into the woods as a boy.", "He settled in Wellsboro in northern Pennsylvania and made his forest journeys from there for decades. Between 1880 and 1883 he cruised the Adirondack lakes in ever lighter canoes that J. Henry Rushton built to his specifications; the lightest, the <i>Sairy Gamp</i>, weighed ten and a half pounds."] },
      { h: "The stance", p: ["Sears wrote for the “outers”: artisans, clerks, and small merchants who need one real rest a year and cannot buy it with guides, pack baskets, and forest hotels. His advice is plain: go light, build an open camp with a fire in front of it, cook simply, and shoot no more than you can eat.", "He saw the plunder of his day and condemned it in bitter words &mdash; in a book that otherwise sparkles with dry humor and long experience."] },
      { h: "The legacy", p: ["<i>Woodcraft</i> was published in 1884 by the Forest and Stream Publishing Company and has been reprinted countless times since. His trio of a light hatchet, a sturdy sheath knife, and a two-blade pocket knife is still copied as the “Nessmuk trio.”", "Sears died in Wellsboro in 1890. A mountain and a lake in Pennsylvania bear his name; the <i>Sairy Gamp</i> is preserved at the Adirondack Experience museum."] }
    ],
    facts: [["Series", "Amber line &middot; Pillar V"], ["First edition", "New York, 1884"], ["Text", "The author’s own English, first edition"], ["Status", "In preparation"]],
    worksKicker: "In preparation",
    worksTitle: "The book of going light",
    worksIntro: "The Aeternus edition gives the complete text of the 1884 first edition &mdash; kit, camp building, fire, fishing, camp cookery, a wilderness tramp, and the light canoe &mdash; with all ten original illustrations recreated as photorealistic reconstructions, Sears’ own chapter summaries in the table of contents, a glossary of the terms of his day, and an afterword on his legacy.",
    gridClass: "single-item",
    books: [
      { cover: { img: "cover-woodcraft" }, meta: "Outdoor classic &middot; New York &middot; 1884", title: "Woodcraft", subtitle: "The 1884 Classic of Going Light, Fully Illustrated",
        modal: { metadata: "Aeternus Publisher · Amber series · Paperback & Kindle · in preparation", summary: "New York, 1884: a Pennsylvania shoemaker who weighs little more than a hundred pounds writes down how to travel for weeks through the wilderness with twenty-six pounds of duffle. Knapsack, hatchet and knives, the shanty-tent, the camp-fire built as it should be, frogging and camp cookery, a ten days’ tramp alone across Michigan, and the ten-and-a-half-pound cedar canoe — Sears’ book is instruction and story in one.", sample: "The edition follows the first edition of 1884 word for word; later reprints revised Sears’ wording and dropped passages, and none of those changes are adopted. The ten woodcuts of the original are recreated as photorealistic reconstructions, and further plates after Sears’ own measurements are in preparation.", amazon: "/en/" } }
    ]
  }
];

module.exports.push({
  "slug": "francis-parkman",
  "name": "Francis Parkman",
  "brand": "AETERNUS",
  "monogram": "FP",
  "dates": "1823–1893",
  "seriesClass": "series-anthracite",
  "preview": false,
  "sampleLabel": "About this edition",
  "portrait": {
    "file": "portrait-parkman",
    "alt": "Historical portrait of Francis Parkman",
    "modern": true
  },
  "schema": {
    "birthDate": "1823-09-16",
    "deathDate": "1893-11-08",
    "description": "American historian and author of The Oregon Trail."
  },
  "eyebrow": "Anthracite · The American frontier",
  "tagline": "The West before it became a legend.",
  "intro": "In 1846, aged twenty-two, Francis Parkman rode west from Missouri, followed the Platte towards Fort Laramie, and spent weeks in an Oglala camp. The journey became his first book.",
  "metaDescription": "The Oregon Trail by Francis Parkman: freshly typeset from the 1849 English text, with 13 illustrations created for this edition and a carefully composed print layout.",
  "bioKicker": "Author & context",
  "bioTitle": "First the journey,<br>then the history",
  "bioLede": "Parkman went to see the country for himself: its trails, trading posts, hunting grounds, and camps.",
  "blocks": [
    {
      "h": "A historian in the making",
      "p": [
        "Born in Boston in 1823, Parkman studied at Harvard and began planning a history of the struggle for North America. His later work would follow the contest between France and England across the continent."
      ]
    },
    {
      "h": "The journey of 1846",
      "p": [
        "With his cousin Quincy Adams Shaw, Parkman travelled from St. Louis into the Great Plains. Emigrant wagons, buffalo hunts, Fort Laramie, and life among the Oglala form the substance of his account.",
        "The return journey took him by Bent’s Fort and the Arkansas. He wrote as a young traveller, close to the encounters and hardships he described."
      ]
    },
    {
      "h": "The book and its text",
      "p": [
        "The narrative appeared in the <i>Knickerbocker Magazine</i> before its publication as <i>The California and Oregon Trail</i> in 1849. Parkman later became known for <i>The Conspiracy of Pontiac</i> and <i>France and England in North America</i>.",
        "This AETERNUS edition returns to the English text of the first edition, with its chapter epigraphs and concluding note on Henry Chatillon. Thirteen newly created plates accompany the narrative."
      ]
    }
  ],
  "facts": [
    [
      "Series",
      "Anthracite"
    ],
    [
      "Text",
      "English · first edition, 1849"
    ],
    [
      "Print edition",
      "478 pages · 13 plates"
    ],
    [
      "Formats",
      "Hardcover · Paperback · Kindle"
    ]
  ],
  "worksKicker": "The AETERNUS edition",
  "worksTitle": "The Oregon Trail",
  "worksIntro": "A classic given a carefully composed new form. Fresh typesetting brings clear, readable text to every page; balanced margins, chapter openings, and thoughtfully placed illustrations give the book a coherent rhythm. Thirteen plates were created specifically for this edition. The English text of 1849 retains its chapter epigraphs and concluding note on Henry Chatillon. Hardcover, paperback, and Kindle editions are in preparation; ordering links will follow when available.",
  "gridClass": "single-item",
  "books": [
    {
      "cover": {
        "img": "cover-oregon-trail-en"
      },
      "meta": "Travel narrative · 1849",
      "title": "The Oregon Trail (Illustrated)",
      "subtitle": "Sketches of Prairie and Rocky Mountain Life",
      "modal": {
        "metadata": "AETERNUS · Anthracite Series · 478 print pages",
        "summary": "The Great Plains in 1846: emigrant trains, buffalo hunts, trading posts, and weeks in an Oglala camp. Parkman’s first book records a journey into a West still being travelled and contested.",
        "sample": "Freshly typeset throughout, with clear typography, balanced page proportions, and 13 illustrations created specifically for this edition. Text and plates have been arranged together across 478 print pages, with the layout checked for print. The English text follows the first edition of 1849, including its chapter epigraphs and concluding note on Henry Chatillon. Paperback ISBN 978-3-67605-030-2; hardcover ISBN 978-3-67605-031-9; e-book ISBN 978-3-67605-029-6.",
        "status": "Publication in progress · ordering links to follow"
      }
    }
  ]
});

// James Hall (JH_001-EN, The Harpe's Head). Copy follows the English publisher's
// apparatus of the English edition (PARATEXT_EN, claims register BEHAUPTUNGSREGISTER_EN).
// The edition is being typeset; no ISBN, no retailer link yet — preview page.
module.exports.push({
  "slug": "james-hall",
  "name": "James Hall",
  "brand": "AETERNUS",
  "monogram": "JH",
  "dates": "1793–1868",
  "seriesClass": "series-anthracite",
  "preview": true,
  "sampleLabel": "About this edition",
  "portrait": {
    "file": "portrait-hall",
    "alt": "James Hall, steel engraving by J. C. Buttre after a painting by J. O. Eaton",
    "modern": true
  },
  "schema": {
    "birthDate": "1793-08-19",
    "deathDate": "1868-07-05",
    "description": "American soldier, frontier judge, editor, and author of The Harpe's Head (1833)."
  },
  "eyebrow": "Anthracite · The American frontier",
  "tagline": "Soldier, frontier judge, chronicler of the West.",
  "intro": "On his circuit rounds through Illinois, James Hall collected the recollections of hunters, scouts, and old settlers — and gave the literature of the early West its first forums.",
  "metaDescription": "James Hall at AETERNUS: The Harpe's Head, A Legend of Kentucky (1833), in the complete text of the Philadelphia first edition with a frontispiece and nine new plates.",
  "bioKicker": "Author & context",
  "bioTitle": "Soldier, judge,<br>chronicler of the frontier",
  "bioLede": "Military service gave Hall an unsentimental eye for how men behave under the worst conditions, and that eye is at work throughout his one novel.",
  "blocks": [
    {
      "h": "Philadelphia and the War of 1812",
      "p": [
        "James Hall was born in Philadelphia on August 19, 1793. In the War of 1812 he was distinguished at the battle of Lundy’s Lane and at the siege of Fort Erie, and served as a lieutenant under Colonel Winfield Scott on the Canadian frontier.",
        "In 1815 he took part in Commodore Stephen Decatur’s operations against the Barbary corsairs in the Mediterranean."
      ]
    },
    {
      "h": "A judge on the Illinois frontier",
      "p": [
        "In 1820 Hall moved to Shawneetown, Illinois, where he practiced law, edited the <i>Illinois Gazette</i>, served as state’s attorney, and in 1824 was appointed a circuit judge.",
        "His rounds through a raw and thinly settled country brought him into contact with the hunters, scouts, and old settlers whose recollections of the frontier’s first generation he began to collect and publish."
      ]
    },
    {
      "h": "The first voice of the West",
      "p": [
        "The <i>Western Souvenir</i> (1828) was the first literary annual published west of the Allegheny Mountains; the <i>Illinois Monthly Magazine</i>, founded by Hall in 1830, the first literary periodical west of the Ohio.",
        "<i>Letters from the West</i> (1828) and <i>Legends of the West</i> (1832) collected sketches and tales of the border; <i>The Harpe’s Head</i> (1833) was his only novel. With Thomas L. McKenney he produced the <i>History of the Indian Tribes of North America</i> (1838–1844). Hall died on July 5, 1868, at Loveland, near Cincinnati."
      ]
    },
    {
      "h": "Image and source",
      "p": [
        "Portrait: steel engraving by J. C. Buttre after a painting by J. O. Eaton, frontispiece to <i>The Romance of Western History</i>, 1857.",
        "Text: <i>The Harpe’s Head; A Legend of Kentucky</i>, Key &amp; Biddle, Philadelphia, 1833."
      ]
    }
  ],
  "facts": [
    ["Series", "Anthracite"],
    ["Text", "English · first edition, 1833"],
    ["Print edition", "270 pages · frontispiece and nine plates"],
    ["Status", "In preparation"]
  ],
  "worksKicker": "The AETERNUS edition",
  "worksTitle": "The Harpe’s Head",
  "worksIntro": "The complete text of the Philadelphia first edition of 1833, checked word by word against the original page images, with a publisher’s apparatus, a frontispiece, and nine new plates. Paperback, hardcover, and Kindle editions are in preparation; ordering links will follow when available.",
  "gridClass": "single-item",
  "books": [
    {
      "cover": { "gen": "wald", "title": "The Harpe’s<br>Head" },
      "meta": "Frontier novel · Philadelphia · 1833",
      "title": "The Harpe’s Head (Illustrated)",
      "subtitle": "A Legend of Kentucky",
      "modal": {
        "metadata": "AETERNUS · Anthracite Series · 270 print pages",
        "summary": "Virginia in the 1790s: a young stranger rides into the settled world of the planter aristocracy, while in the mountains and canebrakes of Kentucky the Harpe brothers make the borderlands a place where no traveller rides safe. Hall sets a romance of planters and pioneers against the darkest legend of the Kentucky frontier.",
        "sample": "The complete text of the 1833 first edition, checked word by word against the original page images. Publisher’s foreword, note on the text, historical note, afterword, and glossary; a frontispiece and nine plates created for this edition.",
        "status": "In preparation · ordering links to follow"
      }
    }
  ]
});

// Daniel Carter Beard (DCB_001-EN, Shelters, Shacks, and Shanties). The copy follows the
// approved English paratext package of the edition (PARATEXT_PAKET_EN_V1: publisher’s note,
// about the author, afterword, editorial note, blurb). English-only edition, so there is no
// German counterpart page and /qr/beard/ leads straight here. Preview until the edition is
// live on Amazon; the ordering link is activated with publication.
module.exports.push({
  "slug": "daniel-carter-beard",
  "name": "Daniel Carter Beard",
  "brand": "AETERNUS",
  "monogram": "DCB",
  "dates": "1850&ndash;1941",
  "seriesClass": "",
  "preview": true,
  "previewStatus": "Paperback and Kindle in preparation &middot; ordering links to follow",
  "sampleLabel": "About this edition",
  "portrait": {
    "file": "portrait-beard",
    "alt": "Daniel Carter Beard in Scout uniform, photographed by Bain News Service",
    "modern": true
  },
  "schema": {
    "birthDate": "1850-06-21",
    "deathDate": "1941-06-11",
    "description": "American illustrator, author and outdoor educator; cofounder of the Boy Scouts of America."
  },
  "eyebrow": "Amber &middot; Youth, adventure, character",
  "tagline": "The buildings here suggested require a woodsman more than an architect.",
  "intro": "Illustrator, author and outdoor teacher: in 1914 Beard wrote down how a shelter is built in the woods &mdash; from a bed of balsam boughs to a log house with a wooden latch &mdash; and drew every stage himself.",
  "metaDescription": "Daniel Carter Beard: life, work and the AETERNUS edition of Shelters, Shacks, and Shanties (1914) in the Amber series &mdash; the complete first-edition text with all 63 plates of the author’s own drawings.",
  "bioKicker": "Author &amp; context",
  "bioTitle": "First the drawing,<br>then the roof",
  "bioLede": "A draughtsman who taught building by making its parts visible: the frame under the covering, the mechanism inside the latch.",
  "blocks": [
    {
      "h": "Life &amp; period",
      "p": [
        "Born in Cincinnati, Ohio, in 1850, Beard spent part of his childhood in Covington, Kentucky, where the frontier and the figure of Daniel Boone caught his imagination early. He worked in engineering, surveying and mapmaking before turning to professional illustration in New York; the Library of Congress dates his study at the Art Students League to 1880&ndash;1884.",
        "Those occupations explain the range of skills his books bring together: observing an object, understanding its structure, and making that structure intelligible on paper."
      ]
    },
    {
      "h": "The draughtsman as teacher",
      "p": [
        "<i>The American Boy’s Handy Book</i> appeared in 1882 under the fuller title <i>What to Do and How to Do It</i>. Beard also illustrated Mark Twain, including the first edition of <i>A Connecticut Yankee in King Arthur’s Court</i> in 1889.",
        "In <i>Shelters, Shacks, and Shanties</i> his method becomes explicit: he says his readers rely more on the diagrams than on the written explanation, and that he has tried to make those diagrams explain themselves."
      ]
    },
    {
      "h": "Scouting &amp; legacy",
      "p": [
        "In 1905 Beard founded the Sons of Daniel Boone; in 1910 he became a cofounder of the Boy Scouts of America, serving as a national Scout commissioner and on its executive board until his death. The outdoor school he established in 1915 gave another setting to the activities he described in print.",
        "He published his autobiography, <i>Hardly a Man Is Now Alive</i>, in 1939 and died at Suffern, New York, in 1941. In the foreword to this book, dated at Flushing on 1 April 1914, he addresses boys, Scoutmasters and sportsmen alike, and later recounts building his own log house at Big Tink Pond &mdash; mistakes included."
      ]
    }
  ],
  "facts": [
    ["Series", "Amber line &middot; Pillar V"],
    ["First edition", "New York, 1914"],
    ["Text", "The author’s own English, first edition"],
    ["Print edition", "270 pages &middot; 63 plates"],
    ["Formats", "Paperback &middot; Kindle"]
  ],
  "worksKicker": "The AETERNUS edition",
  "worksTitle": "The book of the shelter",
  "worksIntro": "The edition gives the complete English text of the 1914 first edition, with Beard’s spelling and wording kept as he wrote them. All 63 plates of his own drawings are reproduced with their original figure numbers and in the groupings of the original pages, because the comparison within a group is part of his teaching. A publisher’s note, an account of the author, an afterword and a glossary of thirty period building terms accompany the work; an editorial note identifies the witness used to supply two pages missing from the principal copy.",
  "gridClass": "single-item",
  "books": [
    {
      "cover": { "img": "cover-shelters-shacks-shanties" },
      "meta": "Outdoor classic &middot; New York &middot; 1914",
      "title": "Shelters, Shacks, and Shanties (Illustrated)",
      "subtitle": "The 1914 Classic of Building in the Woods, with the Author’s Own Drawings",
      "modal": {
        "metadata": "AETERNUS · Amber series · 270 print pages · 63 plates",
        "summary": "A bed of balsam boughs, a shelter beneath a fallen tree, a cabin with a wooden latch: Beard begins with what lies close at hand and works towards the construction of a log house. His drawings open roofs to reveal their frames, separate the parts of a fastening, and show how a few tools can be put to work — bark coverings, framed shanties, sod walls, raised camps and log buildings across forty-nine chapters.",
        "sample": "The text follows the English first edition of 1914, published in New York by Charles Scribner’s Sons; the two printed pages missing from the principal copy are supplied from the 1916 printing, and that substitution is confined to the gap. Beard’s spelling and vocabulary are retained, his foreword stays distinct from the publisher’s material, and the plates keep his original figure numbers. Paperback ISBN 978-3-67605-072-2; e-book ISBN 978-3-67605-071-5.",
        "status": "Paperback and Kindle in preparation · ordering links to follow"
      }
    }
  ]
});
