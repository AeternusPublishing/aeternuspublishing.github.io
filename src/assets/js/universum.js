/* Das Universum des Verlags — ein Kraftfeld aus Buechern, Ereignissen, Orten,
 * Stoffen und Personen.
 *
 * Warum eine Simulation und keine feste Ordnung: Ein Buch haengt an mehreren
 * Ereignissen, ein Ereignis an mehreren Buechern, ein Ort liegt in einem
 * groesseren Raum. Das ist kein Baum, sondern ein Netz - es findet seine Form
 * nur, wenn man es sich selbst ordnen laesst. Der Zufallsgeber ist gesetzt
 * (fester Startwert), damit dieselben Daten immer dasselbe Bild ergeben.
 *
 * Kein Fremdcode, keine externe Quelle.
 */
(function () {
  "use strict";

  // Ruhelaengen: was inhaltlich enger zusammengehoert, zieht staerker.
  var FEDER = {
    autorschaft: { laenge: 95, kraft: 0.05 },
    teil_von: { laenge: 100, kraft: 0.05 },
    ereignis: { laenge: 115, kraft: 0.045 },
    person: { laenge: 120, kraft: 0.035 },
    ort: { laenge: 140, kraft: 0.026 },
    motiv: { laenge: 160, kraft: 0.018 },
    wirkung: { laenge: 125, kraft: 0.045 },
    verwandt: { laenge: 200, kraft: 0.003 }
  };
  var ABSTOSSUNG = 11000;
  var TICKS = 520;

  var RADIUS = { werk: 7, autor: 5.5, ereignis: 6, ort: 5, motiv: 4.5, person: 4.5 };
  var FARBE = {
    werk: "#e2c074", autor: "#f3e7cf", ereignis: "#c98b5e",
    ort: "#7fa3a0", motiv: "#a08fc0", person: "#c98b8b"
  };

  // Gesetzter Zufallsgeber: gleiche Daten, gleiches Bild.
  function zufall(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function el(name, attrs) {
    var n = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (var k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    return n;
  }

  function esc(s) {
    return String(s === null || s === undefined ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function init(root) {
    if (!root || root.dataset.uniReady === "1") return;
    var data = window.AETERNUS_UNIVERSUM;
    if (!data || !data.knoten) return;
    root.dataset.uniReady = "1";

    var T = data.labels || {};
    var svg = root.querySelector("[data-uni-svg]");
    var panel = root.querySelector("[data-uni-panel]");
    var suche = root.querySelector("[data-uni-suche]");
    var trefferliste = root.querySelector("[data-uni-treffer]");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var N = data.knoten.map(function (n, i) { return Object.assign({}, n, { i: i }); });
    var byId = {};
    N.forEach(function (n) { byId[n.id] = n; });
    var K = data.kanten.filter(function (k) { return byId[k.a] && byId[k.b]; });

    // Nachbarschaft
    var nachbarn = {};
    K.forEach(function (k) {
      (nachbarn[k.a] = nachbarn[k.a] || []).push({ id: k.b, art: k.art, k: k });
      (nachbarn[k.b] = nachbarn[k.b] || []).push({ id: k.a, art: k.art, k: k });
    });
    N.forEach(function (n) { n.grad = (nachbarn[n.id] || []).length; });

    var aus = {};                 // ausgeblendete Knotenarten
    var gewaehlt = null, warm = null;
    var fokus = null;             // Knoten, der die Karte allein beherrscht
    var fokusMenge = null;        // was im Fokus ueberhaupt zu sehen ist

    // --- Kraftfeld ---------------------------------------------------------
    var rnd = zufall(20260908);
    N.forEach(function (n) {
      var w = rnd() * Math.PI * 2, r = 60 + rnd() * 340;
      n.x = Math.cos(w) * r; n.y = Math.sin(w) * r; n.vx = 0; n.vy = 0;
    });

    function sichtbar(n) {
      if (aus[n.typ]) return false;
      // Im Fokus verschwindet der Rest wirklich. Ihn nur abzudunkeln liess
      // neunzig blasse Punkte stehen, durch die man die Antwort suchen musste.
      if (fokusMenge) return !!fokusMenge[n.id];
      return true;
    }

    function tick(alpha) {
      var i, j, a, b, dx, dy, d2, d, f;
      var akt = N.filter(sichtbar);

      for (i = 0; i < akt.length; i++) {
        for (j = i + 1; j < akt.length; j++) {
          a = akt[i]; b = akt[j];
          dx = b.x - a.x; dy = b.y - a.y;
          d2 = dx * dx + dy * dy || 0.01;
          if (d2 > 640000) continue;          // weit entfernt: vernachlaessigbar
          d = Math.sqrt(d2);
          f = ABSTOSSUNG / d2 * alpha;
          dx /= d; dy /= d;
          a.vx -= dx * f; a.vy -= dy * f;
          b.vx += dx * f; b.vy += dy * f;
        }
      }

      K.forEach(function (k) {
        a = byId[k.a]; b = byId[k.b];
        if (!sichtbar(a) || !sichtbar(b)) return;
        var s = FEDER[k.art] || FEDER.motiv;
        dx = b.x - a.x; dy = b.y - a.y;
        d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        f = (d - s.laenge) * s.kraft * alpha;
        dx /= d; dy /= d;
        a.vx += dx * f; a.vy += dy * f;
        b.vx -= dx * f; b.vy -= dy * f;
      });

      akt.forEach(function (n) {
        n.vx -= n.x * 0.0016 * alpha;         // sanft zur Mitte
        n.vy -= n.y * 0.0016 * alpha;
        n.x += n.vx; n.y += n.vy;
        n.vx *= 0.86; n.vy *= 0.86;
      });
    }

    function ordnen(schritte) {
      for (var t = 0; t < schritte; t++) tick(Math.max(0.08, 1 - t / schritte));
      // Ruhelage festhalten: das Schweben schwingt um sie, nicht um sich selbst.
      N.forEach(function (n) { n.ruheX = n.x; n.ruheY = n.y; });
    }

    // Eigene Anordnung fuer den Fokus: das gewaehlte Werk in der Mitte, seine
    // verwandten Baende auf einem weiten Ring, die Merkmale auf einem engen.
    // Gleichmaessige Winkel heissen: die Beschriftungen koennen einander nicht
    // mehr ueberdecken - im Kraftfeld lagen sie uebereinander, weil dort die
    // Physik entscheidet und nicht die Lesbarkeit.
    var R_MERKMAL = 245, R_WERK = 500;

    function fokusAnordnung(id) {
      var mitte = byId[id];
      var nb = nachbarn[id] || [];
      var u = umfeld(id);

      var buecher = Object.keys(u.verwandt).map(function (x) { return byId[x]; })
        .filter(function (n) { return !aus[n.typ]; });
      var merkmale = nb.map(function (x) { return byId[x.id]; })
        .filter(function (n) {
          return ["ereignis", "ort", "motiv", "person", "autor"].indexOf(n.typ) >= 0 && !aus[n.typ];
        });

      var menge = {};
      menge[id] = true;
      buecher.forEach(function (n) { menge[n.id] = true; });
      merkmale.forEach(function (n) { menge[n.id] = true; });
      fokusMenge = menge;

      mitte.zielX = 0; mitte.zielY = 0;
      var ring = function (liste, r, versatz) {
        liste.forEach(function (n, i) {
          var w = (i / Math.max(1, liste.length)) * Math.PI * 2 + versatz;
          n.zielX = Math.cos(w) * r;
          n.zielY = Math.sin(w) * r;
        });
      };
      ring(merkmale, R_MERKMAL, -Math.PI / 2);
      ring(buecher, R_WERK, -Math.PI / 2 + Math.PI / Math.max(1, buecher.length));
    }

    // Weicher Uebergang zwischen den beiden Anordnungen.
    var anordnungsRaf = null;
    function fahreAnordnung(fertig) {
      var von = N.map(function (n) { return { n: n, x: n.x, y: n.y }; });
      if (reduce || document.hidden) {
        von.forEach(function (v) { if (v.n.zielX !== undefined) { v.n.x = v.n.zielX; v.n.y = v.n.zielY; } });
        zeichnen(); if (fertig) fertig(); return;
      }
      if (anordnungsRaf) cancelAnimationFrame(anordnungsRaf);
      var start = null;
      var schritt = function (ts) {
        if (start === null) start = ts;
        var t = Math.min(1, (ts - start) / 620);
        var e = 1 - Math.pow(1 - t, 3);
        von.forEach(function (v) {
          if (v.n.zielX === undefined) return;
          v.n.x = v.x + (v.n.zielX - v.x) * e;
          v.n.y = v.y + (v.n.zielY - v.y) * e;
        });
        zeichnen();
        if (t < 1) anordnungsRaf = requestAnimationFrame(schritt);
        else if (fertig) fertig();
      };
      anordnungsRaf = requestAnimationFrame(schritt);
    }

    function fokusVerlassen() {
      fokus = null; fokusMenge = null;
      if (history.replaceState) history.replaceState(null, "", location.pathname);
      N.forEach(function (n) { n.zielX = n.ruheX; n.zielY = n.ruheY; });
      fahreAnordnung(function () { einpassen(); });
    }

    // --- Zeichnen ----------------------------------------------------------
    var gWelt = el("g", { "data-welt": "" });
    var gKanten = el("g", {});
    var gFunken = el("g", {});
    var gKnoten = el("g", {});
    gWelt.appendChild(gKanten); gWelt.appendChild(gFunken); gWelt.appendChild(gKnoten);
    svg.appendChild(gWelt);

    var kantenEl = K.map(function (k) {
      var p = el("line", { class: "uni-kante art-" + k.art });
      gKanten.appendChild(p);
      return { el: p, k: k, funke: null };
    });

    var knotenEl = {};
    N.forEach(function (n) {
      var g = el("g", { class: "uni-knoten typ-" + n.typ, tabindex: "0", role: "button", "data-id": n.id });
      var titel = el("title");
      titel.textContent = n.label;
      g.appendChild(titel);
      g.appendChild(el("circle", { class: "puls", r: RADIUS[n.typ] + 2, fill: "none", stroke: FARBE[n.typ] }));
      var r = RADIUS[n.typ] + Math.min(4, (n.grad || 0) * 0.18);
      if (n.typ === "werk") {
        g.appendChild(el("circle", { class: "halo", r: r * 1.9, fill: FARBE[n.typ], opacity: ".05" }));
      }
      // Erschienene Baende stehen als voller Stern, angekuendigte als offener
      // Ring - man sieht auf einen Blick, wohin man heute schon greifen kann.
      var offen = n.typ === "werk" && !n.extern;
      g.appendChild(el("circle", {
        class: "kern", r: r,
        fill: n.typ === "werk" && !offen ? FARBE[n.typ] : "none",
        stroke: FARBE[n.typ], "stroke-width": n.typ === "werk" && !offen ? 0 : 1.6,
        "stroke-dasharray": offen ? "2.5 2.5" : null
      }));
      var t = el("text", { class: "beschriftung", y: r + 13, "text-anchor": "middle" });
      t.textContent = n.label;
      g.appendChild(t);

      g.addEventListener("mouseenter", function () { setWarm(n.id); });
      g.addEventListener("mouseleave", function () { setWarm(null); });
      g.addEventListener("focus", function () { setWarm(n.id); });
      g.addEventListener("blur", function () { setWarm(null); });
      g.addEventListener("click", function (e) { e.stopPropagation(); waehle(n.id); });
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); waehle(n.id); }
      });
      knotenEl[n.id] = { g: g, text: t };
      gKnoten.appendChild(g);
    });

    // --- Kamera ------------------------------------------------------------
    var cam = { x: 0, y: 0, z: 1 };
    var ziel = { x: 0, y: 0, z: 1 };

    function anwenden() {
      var w = svg.clientWidth || 1200, h = svg.clientHeight || 800;
      gWelt.setAttribute("transform",
        "translate(" + (w / 2 - cam.x * cam.z).toFixed(1) + "," + (h / 2 - cam.y * cam.z).toFixed(1) +
        ") scale(" + cam.z.toFixed(3) + ")");
      svg.classList.toggle("nah", cam.z > 1.35);
    }

    function zeichnen() {
      N.forEach(function (n) {
        var e = knotenEl[n.id];
        if (!sichtbar(n)) { e.g.style.display = "none"; return; }
        e.g.style.display = "";
        // Die Groesse faehrt weich auf ihr Ziel zu: das beruehrte Werk waechst,
        // seine Verwandtschaft waechst mit, der Rest bleibt klein.
        var ziel = n.zielSkala || 1;
        // Ohne laufenden Bildtakt (verborgener Tab, Vorschaufenster im
        // Hintergrund) gaebe es keinen zweiten Zeichenschritt - die Groesse
        // bliebe auf halbem Weg stehen. Dann springt sie sofort ans Ziel.
        n.skala = (reduce || document.hidden) ? ziel
          : (n.skala || 1) + (ziel - (n.skala || 1)) * 0.28;
        if (Math.abs(ziel - n.skala) < 0.006) n.skala = ziel;
        var s = n.skala > 1.001 ? " scale(" + n.skala.toFixed(3) + ")" : "";
        e.g.setAttribute("transform", "translate(" + n.x.toFixed(1) + "," + n.y.toFixed(1) + ")" + s);
      });
      kantenEl.forEach(function (ke) {
        var a = byId[ke.k.a], b = byId[ke.k.b];
        // Im Fokus zaehlen nur die Linien, die vom Mittelpunkt ausgehen. Die
        // Ringbaende sind untereinander ebenfalls verwandt - zeichnet man das
        // mit, entsteht ein Pentagramm, in dem die eigentliche Aussage
        // untergeht. Wer diese Verbindungen sehen will, waehlt das Buch.
        if (fokus && ke.k.a !== fokus && ke.k.b !== fokus) {
          ke.el.style.display = "none"; if (ke.funke) ke.funke.style.display = "none"; return;
        }
        if (!sichtbar(a) || !sichtbar(b)) { ke.el.style.display = "none"; if (ke.funke) ke.funke.style.display = "none"; return; }
        ke.el.style.display = "";
        ke.el.setAttribute("x1", a.x.toFixed(1)); ke.el.setAttribute("y1", a.y.toFixed(1));
        ke.el.setAttribute("x2", b.x.toFixed(1)); ke.el.setAttribute("y2", b.y.toFixed(1));
        if (ke.funke) {
          ke.funke.setAttribute("x1", a.x.toFixed(1)); ke.funke.setAttribute("y1", a.y.toFixed(1));
          ke.funke.setAttribute("x2", b.x.toFixed(1)); ke.funke.setAttribute("y2", b.y.toFixed(1));
        }
      });
      anwenden();
    }

    // --- Hervorheben -------------------------------------------------------
    // Wer zu einem Punkt gehoert - und in welchem Rang.
    //
    // Verwandt sind nur andere BAENDE, und nur ueber eine belegte, gewichtete
    // Verbindung. Ein Werk, das zufaellig auch "Jagd" fuehrt, ist kein
    // Lesevorschlag; wer jede Beruehrung als Verwandtschaft zaehlt, hebt am
    // Ende alles hervor und damit nichts. Die Merkmalsknoten bleiben sichtbar,
    // aber sie erklaeren die Verbindung - sie sind nicht ihr Ziel.
    var HOECHSTENS = 8;

    function umfeld(id) {
      if (!id) return null;
      var set = {}, verwandt = {}, rang = [];
      set[id] = true;
      (nachbarn[id] || []).forEach(function (x) {
        set[x.id] = true;
        if ((x.art === "verwandt" || x.art === "wirkung") && byId[x.id].typ === "werk") {
          rang.push({ id: x.id, gewicht: x.art === "wirkung" ? 99 : (x.k.gewicht || 0) });
        }
      });
      // Steht ein Merkmal im Mittelpunkt, sind seine Baende das Ziel.
      if (byId[id].typ !== "werk" && byId[id].typ !== "autor") {
        (nachbarn[id] || []).forEach(function (x) {
          if (byId[x.id].typ === "werk") rang.push({ id: x.id, gewicht: 50 });
        });
      }
      if (byId[id].typ === "autor") {
        (nachbarn[id] || []).forEach(function (x) {
          if (byId[x.id].typ === "werk") rang.push({ id: x.id, gewicht: 50 });
        });
      }
      // Ein Band, den es schon gibt, geht einem vor, der noch in Vorbereitung
      // ist: die Karte soll zu Buechern fuehren, nicht zu Ankuendigungen.
      // Gemessen am harten Merkmal - fuehrt der Band einen Weg zum Buch.
      rang.sort(function (a, b) {
        var da = byId[a.id].extern ? 1 : 0, db = byId[b.id].extern ? 1 : 0;
        if (da !== db) return db - da;
        return b.gewicht - a.gewicht;
      });
      rang.slice(0, HOECHSTENS).forEach(function (x) { verwandt[x.id] = true; set[x.id] = true; });
      return { set: set, verwandt: verwandt };
    }

    function hervorheben() {
      var id = warm || gewaehlt;
      var u = umfeld(id);
      var vorn = [];
      N.forEach(function (n) {
        var g = knotenEl[n.id].g;
        var heiss = n.id === id;
        var verwandt = !!u && !!u.verwandt[n.id];
        var nah = !!u && !!u.set[n.id];
        g.classList.toggle("ist-fern", !!u && !nah);
        g.classList.toggle("ist-nah", nah && !verwandt && !heiss);
        g.classList.toggle("ist-verwandt", verwandt && !heiss);
        g.classList.toggle("ist-heiss", heiss);
        g.classList.toggle("ist-gewaehlt", n.id === gewaehlt);
        n.zielSkala = heiss ? 2.1 : (verwandt ? 1.5 : 1);
        if (heiss || verwandt) vorn.push(g);
      });
      // Was leuchtet, gehoert nach oben - sonst liegt ein blasser Punkt darueber.
      vorn.forEach(function (g) { gKnoten.appendChild(g); });

      kantenEl.forEach(function (ke) {
        var direkt = u && (ke.k.a === id || ke.k.b === id);
        // Querverbindung: die Linie zwischen zwei verwandten Baenden, auch
        // wenn sie nicht am beruehrten Punkt selbst haengt.
        var quer = u && ke.k.art === "verwandt" &&
          (u.verwandt[ke.k.a] || ke.k.a === id) && (u.verwandt[ke.k.b] || ke.k.b === id);
        var an = direkt || quer;
        ke.el.classList.toggle("ist-hell", !!an);
        ke.el.classList.toggle("ist-quer", !!quer);
        ke.el.classList.toggle("ist-fern", !!u && !an);
        // Der Funke entsteht erst, wenn eine Linie leuchtet - und verschwindet
        // wieder, damit nicht dreihundert Lichter gleichzeitig laufen.
        if (an && !ke.funke) {
          ke.funke = el("line", { class: "uni-funke art-" + ke.k.art + (quer ? " ist-quer" : "") });
          gFunken.appendChild(ke.funke);
        } else if (!an && ke.funke) {
          gFunken.removeChild(ke.funke); ke.funke = null;
        }
      });
      zeichnen();
    }

    function setWarm(id) { warm = id; hervorheben(); if (!gewaehlt) zeigen(id); }

    function waehle(id) {
      gewaehlt = gewaehlt === id ? null : id;
      warm = null;
      zeigen(gewaehlt);
      if (!gewaehlt) { hervorheben(); fokusVerlassen(); return; }
      fokus = gewaehlt;
      if (history.replaceState) history.replaceState(null, "", "#" + gewaehlt);
      fokusAnordnung(gewaehlt);
      hervorheben();
      fahreAnordnung(function () { einpassen(); });
    }

    // --- Kamerafahrt -------------------------------------------------------
    var fahrt = null;
    function blickAuf(n, z) {
      ziel = { x: n.x, y: n.y, z: z || Math.max(cam.z, 1.9) };
      if (reduce) { cam = { x: ziel.x, y: ziel.y, z: ziel.z }; anwenden(); return; }
      if (fahrt) cancelAnimationFrame(fahrt);
      var start = null, von = { x: cam.x, y: cam.y, z: cam.z };
      var schritt = function (ts) {
        if (start === null) start = ts;
        var t = Math.min(1, (ts - start) / 620);
        var e = 1 - Math.pow(1 - t, 3);
        cam.x = von.x + (ziel.x - von.x) * e;
        cam.y = von.y + (ziel.y - von.y) * e;
        cam.z = von.z + (ziel.z - von.z) * e;
        anwenden();
        if (t < 1) fahrt = requestAnimationFrame(schritt);
      };
      fahrt = requestAnimationFrame(schritt);
    }

    // --- Seitenspalte ------------------------------------------------------
    function chip(text, id) {
      return '<button type="button" class="uni-chip" data-goto="' + esc(id) + '">' + esc(text) + "</button>";
    }

    function zeigen(id) {
      if (!id) { panel.innerHTML = panel.dataset.leer; binden(); return; }
      var n = byId[id];
      var html = '<p class="kicker">' + esc(T["typ_" + n.typ] || "") + "</p>";
      html += "<h2>" + esc(n.label) + "</h2>";

      if (n.typ === "werk") {
        var meta = [];
        if (n.autorName) meta.push(esc(n.autorName));
        if (n.handlung) meta.push(esc(n.handlung[0] === n.handlung[1] ? n.handlung[0] : n.handlung[0] + "–" + n.handlung[1]));
        if (meta.length) html += '<p class="meta">' + meta.join(" &middot; ") + "</p>";
        if (!n.extern && T.inVorbereitung) html += '<p class="meta vorbereitung-zeile">' + esc(T.inVorbereitung) + "</p>";
        if (n.untertitel) html += '<p class="unter">' + esc(n.untertitel) + "</p>";
        if (n.text) html += '<p class="text">' + esc(n.text) + "</p>";
      } else if (n.jahre) {
        html += '<p class="meta">' + esc(n.jahre[0] === n.jahre[1] ? n.jahre[0] : n.jahre[0] + "–" + n.jahre[1]) + "</p>";
      }

      var nb = nachbarn[id] || [];
      var werkeDaran = nb.filter(function (x) { return byId[x.id].typ === "werk" && x.art !== "verwandt"; });
      var merkmale = nb.filter(function (x) {
        return ["ereignis", "ort", "motiv", "person"].indexOf(byId[x.id].typ) >= 0;
      });
      // Richtung zaehlt: die Schlacht gehoert zum Krieg, der Krieg umfasst
      // die Schlacht. Beides in einen Topf zu werfen ergaebe Unsinn.
      var oben = nb.filter(function (x) { return x.art === "teil_von" && x.k.a === id; });
      var unten = nb.filter(function (x) { return x.art === "teil_von" && x.k.b === id; });
      var verwandt = nb.filter(function (x) { return x.art === "verwandt"; })
        .sort(function (a, b) { return (b.k.gewicht || 0) - (a.k.gewicht || 0); });

      if (merkmale.length && n.typ === "werk") {
        html += '<p class="kicker top">' + esc(T.merkmale || "") + "</p><div class=\"uni-chips\">";
        merkmale.forEach(function (x) { html += chip(byId[x.id].label, x.id); });
        html += "</div>";
      }
      if (unten.length) {
        html += '<p class="kicker top">' + esc(T.umfasst || "") + "</p><div class=\"uni-chips\">";
        unten.forEach(function (x) { html += chip(byId[x.id].label, x.id); });
        html += "</div>";
      }
      if (oben.length) {
        html += '<p class="kicker top">' + esc(T.gehoertZu || "") + "</p><div class=\"uni-chips\">";
        oben.forEach(function (x) { html += chip(byId[x.id].label, x.id); });
        html += "</div>";
      }
      if (n.typ !== "werk" && werkeDaran.length) {
        html += '<p class="kicker top">' + esc(T.werkeDaran || "") + "</p><ul>";
        werkeDaran.forEach(function (x) {
          html += '<li><button type="button" data-goto="' + esc(x.id) + '">' + esc(byId[x.id].label) +
            (byId[x.id].autorName ? ' <span class="wer">' + esc(byId[x.id].autorName) + "</span>" : "") + "</button></li>";
        });
        html += "</ul>";
      }
      if (verwandt.length) {
        html += '<p class="kicker top">' + esc(T.verwandt || "") + "</p><ul>";
        verwandt.sort(function (a, b) {
          var da = byId[a.id].extern ? 1 : 0, db = byId[b.id].extern ? 1 : 0;
          if (da !== db) return db - da;
          return (b.k.gewicht || 0) - (a.k.gewicht || 0);
        });
        verwandt.slice(0, 8).forEach(function (x) {
          var gruende = (x.k.gruende || []).map(function (g) { return g.label; }).join(", ");
          var vorbereitung = byId[x.id].typ === "werk" && !byId[x.id].extern && T.inVorbereitung
            ? ' <span class="vorbereitung">' + esc(T.inVorbereitung) + "</span>" : "";
          html += '<li><button type="button" data-goto="' + esc(x.id) + '">' + esc(byId[x.id].label) +
            vorbereitung + '<span class="warum">' + esc(gruende) + "</span></button></li>";
        });
        html += "</ul>";
      }
      if (n.herkunft) html += '<p class="herkunft">' + esc(T.herkunft || "") + ": " + esc(n.herkunft) + "</p>";
      if (n.url) {
        html += '<a class="go" href="' + esc(n.url) + '"' + (n.extern ? ' rel="noopener"' : "") + ">" +
          esc(n.extern ? (T.zumBuch || "") : (T.seite || "")) + ' <span aria-hidden="true">&rarr;</span></a>';
      }
      panel.innerHTML = html;
      binden();
    }

    function binden() {
      panel.querySelectorAll("[data-goto]").forEach(function (b) {
        var gid = b.getAttribute("data-goto");
        b.addEventListener("click", function () { waehle(gid); });
        b.addEventListener("mouseenter", function () { if (!gewaehlt) setWarm(gid); });
      });
    }

    // --- Bedienung ---------------------------------------------------------
    root.querySelectorAll("[data-uni-typ]").forEach(function (b) {
      b.addEventListener("click", function () {
        var typ = b.getAttribute("data-uni-typ");
        aus[typ] = !aus[typ];
        b.setAttribute("aria-pressed", String(!aus[typ]));
        if (fokus) { fokusAnordnung(fokus); hervorheben(); fahreAnordnung(function () { einpassen(); }); return; }
        ordnen(160);
        zeichnen();
        hervorheben();
      });
    });

    if (suche) {
      suche.addEventListener("input", function () {
        var q = suche.value.trim().toLowerCase();
        if (!q) { trefferliste.innerHTML = ""; trefferliste.hidden = true; return; }
        var treffer = N.filter(function (n) { return n.label.toLowerCase().indexOf(q) >= 0; }).slice(0, 8);
        trefferliste.innerHTML = treffer.map(function (n) {
          return '<button type="button" data-goto="' + esc(n.id) + '"><span class="art">' +
            esc(T["typ_" + n.typ] || "") + "</span>" + esc(n.label) + "</button>";
        }).join("");
        trefferliste.hidden = !treffer.length;
        trefferliste.querySelectorAll("[data-goto]").forEach(function (b) {
          b.addEventListener("click", function () {
            waehle(b.getAttribute("data-goto"));
            trefferliste.hidden = true; suche.value = "";
          });
        });
      });
    }

    // Ziehen und Zoomen
    var zieht = false, zx = 0, zy = 0;
    svg.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".uni-knoten")) return;
      zieht = true; zx = e.clientX; zy = e.clientY; svg.setPointerCapture(e.pointerId);
      svg.classList.add("zieht");
    });
    svg.addEventListener("pointermove", function (e) {
      if (!zieht) return;
      cam.x -= (e.clientX - zx) / cam.z; cam.y -= (e.clientY - zy) / cam.z;
      zx = e.clientX; zy = e.clientY; anwenden();
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
      svg.addEventListener(ev, function () { zieht = false; svg.classList.remove("zieht"); });
    });
    svg.addEventListener("wheel", function (e) {
      e.preventDefault();
      var f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      cam.z = Math.max(0.35, Math.min(4, cam.z * f));
      anwenden();
    }, { passive: false });
    svg.addEventListener("click", function (e) {
      if (!e.target.closest(".uni-knoten")) {
        gewaehlt = null; warm = null; hervorheben(); zeigen(null);
        if (fokus) fokusVerlassen();
      }
    });

    root.querySelector("[data-uni-heim]") && root.querySelector("[data-uni-heim]").addEventListener("click", function () {
      gewaehlt = null; warm = null; hervorheben(); zeigen(null);
      if (fokus) fokusVerlassen(); else einpassen();
    });

    // Das ganze Feld ins Bild ruecken. Rechts bleibt Platz fuer die
    // Seitenspalte, damit keine Sterne dauerhaft dahinter liegen.
    function einpassen() {
      if (!N.filter(sichtbar).length) return;
      // Gemessen wird die gezeichnete Flaeche samt Beschriftungen, nicht die
      // Punktkoordinaten: sonst haengt der laengste Titel ausserhalb des Bildes.
      var vorher = gWelt.getAttribute("transform");
      gWelt.removeAttribute("transform");
      var bb = gWelt.getBBox();
      if (vorher) gWelt.setAttribute("transform", vorher);
      if (!bb.width || !bb.height) return;

      var w = svg.clientWidth || 1200, h = svg.clientHeight || 800;
      var breit = w > 900;
      var frei = w - (breit ? 430 : 48);          // Platz fuer die Seitenspalte
      var z = Math.min(frei / (bb.width + 60), (h - 150) / (bb.height + 60));
      cam.z = Math.max(0.3, Math.min(1.8, z));
      cam.x = bb.x + bb.width / 2 + (breit ? 195 / cam.z : 0);
      cam.y = bb.y + bb.height / 2;
      anwenden();
    }

    // Einstieg von aussen: /karte/#werk:ets-rolf - von jeder Autorenseite
    // fuehrt ein Weg hierher, und wer so kommt, will nicht das ganze Feld
    // sehen, sondern die Querverbindungen seines Bandes.
    function ausAdresse() {
      var wunsch = (location.hash || "").replace(/^#/, "");
      if (!wunsch) {
        var m = (location.search || "").match(/[?&]w=([^&]+)/);
        wunsch = m ? m[1] : "";
      }
      if (!wunsch) return null;
      wunsch = decodeURIComponent(wunsch);
      if (byId[wunsch]) return wunsch;
      // Zweiter Weg: der Titel selbst, wie er auf der Autorenseite steht.
      var gesucht = wunsch.toLowerCase();
      var treffer = N.filter(function (n) {
        return n.label.toLowerCase() === gesucht || n.key === wunsch;
      });
      return treffer.length ? treffer[0].id : null;
    }

    // --- Start -------------------------------------------------------------
    panel.dataset.leer = panel.innerHTML;
    ordnen(TICKS);
    zeichnen();
    einpassen();
    window.addEventListener("resize", function () { anwenden(); });

    var einstieg = ausAdresse();
    if (einstieg) waehle(einstieg);
    window.addEventListener("hashchange", function () {
      var z = ausAdresse();
      if (z && z !== gewaehlt) waehle(z);
    });

    // Ruhe im Bild. Die Kraftsimulation laeuft einmal und steht dann still -
    // sie weiter tickern zu lassen, liess die Punkte zittern und die
    // Beschriftungen flackern. Was bleibt, ist ein sehr leises Schweben aus
    // einer festen Sinuskurve: keine Physik, keine Zufallsschritte, und es
    // haelt an, sobald jemand etwas anschaut oder ausgewaehlt hat.
    if (!reduce) {
      N.forEach(function (n) { n.ruheX = n.x; n.ruheY = n.y; n.phase = n.i * 0.73; });
      var t0 = null, letzte = 0;
      var schweben = function (ts) {
        raf2 = requestAnimationFrame(schweben);
        if (t0 === null) t0 = ts;
        if (ts - letzte < 40) return;          // 25 Bilder je Sekunde genuegen
        letzte = ts;
        if (warm || gewaehlt || fokus) {
          // Beim Lesen steht das Bild still - aber das Wachsen des beruehrten
          // Punktes muss zu Ende laufen, sonst bleibt es auf halbem Weg stehen.
          var laeuft = N.some(function (n) { return Math.abs((n.zielSkala || 1) - (n.skala || 1)) > 0.006; });
          if (!laeuft) return;
          N.forEach(function (n) { n.x = n.ruheX; n.y = n.ruheY; });
          zeichnen();
          return;
        }
        var t = (ts - t0) / 1000;
        N.forEach(function (n) {
          n.x = n.ruheX + Math.sin(t * 0.32 + n.phase) * 2.4;
          n.y = n.ruheY + Math.cos(t * 0.27 + n.phase * 1.6) * 2.4;
        });
        zeichnen();
      };
      var raf2 = null;
      var beobachter = window.IntersectionObserver ? new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { if (!raf2) raf2 = requestAnimationFrame(schweben); }
        else if (raf2) { cancelAnimationFrame(raf2); raf2 = null; }
      }, { threshold: 0.02 }) : null;
      if (beobachter) beobachter.observe(svg); else raf2 = requestAnimationFrame(schweben);
    }
  }

  function boot() { document.querySelectorAll("[data-uni]").forEach(init); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
