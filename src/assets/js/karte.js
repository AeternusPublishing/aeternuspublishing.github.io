/* Verlagskarte — zeichnet Reihen, Autoren, Baende und Stoffe aus
 * window.AETERNUS_KARTE.
 *
 * Kein Fremdcode, keine externe Quelle. Die Anordnung ist deterministisch
 * (feste Ringe, feste Winkel): zwei Aufrufe derselben Daten ergeben dasselbe
 * Bild. Lebendig wird es durch die Bewegung darueber - ein leises Schweben
 * der Punkte, ein Pulsieren unter dem Zeiger - nicht durch eine Simulation,
 * die die Karte bei jedem Besuch anders auswuerfelt.
 *
 * Verwandtschaft: Baende verschiedener Autoren, die denselben Stoff tragen,
 * sind untereinander verbunden. Diese Boegen liegen still, bis jemand einen
 * Punkt beruehrt; in der Stoff-Ansicht sind sie durchgehend zu sehen.
 */
(function () {
  "use strict";

  var SIZE = 1500;
  var C = SIZE / 2;
  var R = { reihe: 210, autor: 380, werk: 505, motiv: 265, motivWerk: 505 };
  var STAGGER = 66;                 // zweiter Radius fuer jeden zweiten Band
  var DOT = { reihe: 11, autor: 9, werk: 5.5, motiv: 10 };
  var MAXCHARS = { reihe: 24, autor: 21, werk: 20, motiv: 24 };
  var DUR = 520;

  function polar(r, deg) {
    var a = (deg - 90) * Math.PI / 180;
    return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
  }

  // Kuerzt eine Beschriftung, haelt aber den Bandzusatz fest: vier Baende, die
  // alle "Die Eroberung des Westens" heissen, waeren sonst vier gleiche Punkte.
  function shorten(label, max) {
    if (label.length <= max) return label;
    var i = label.lastIndexOf(" · ");
    if (i > 0) {
      var tail = label.slice(i + 3);
      var head = label.slice(0, i);
      var room = max - tail.length - 4;
      if (room >= 6) return head.slice(0, room).trim() + "… " + tail;
    }
    return label.slice(0, max - 1).trim() + "…";
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
    if (!root || root.dataset.karteReady === "1") return;
    var data = window.AETERNUS_KARTE;
    if (!data || !data.nodes) return;
    root.dataset.karteReady = "1";

    var T = data.labels || {};
    var svg = root.querySelector("[data-karte-svg]");
    var panel = root.querySelector("[data-karte-panel]");
    var modeButtons = root.querySelectorAll("[data-karte-mode]");
    var chips = root.querySelectorAll("[data-karte-series]");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var byId = {};
    data.nodes.forEach(function (n) { byId[n.id] = n; });

    var kids = {}, parents = {};
    data.links.forEach(function (l) {
      (kids[l.a] = kids[l.a] || []).push(l.b);
      (parents[l.b] = parents[l.b] || []).push(l.a);
    });

    // Verwandtschaft je Band, fuer Hervorhebung und Seitenspalte.
    var kinOf = {};
    (data.kin || []).forEach(function (k) {
      (kinOf[k.a] = kinOf[k.a] || []).push(k.b);
      (kinOf[k.b] = kinOf[k.b] || []).push(k.a);
    });

    var view = "reihen";
    var activeSeries = null;
    var selected = null;
    var hot = null;              // Punkt unter dem Zeiger oder im Tastaturfokus
    var pos = {};                // Position am Ende des letzten Uebergangs
    var cur = {};                // aktuell gezeichnete Position
    var target = {};

    function worksOf(authorId) {
      return (kids[authorId] || []).filter(function (id) { return byId[id].type === "werk"; });
    }

    // --- Anordnung ---------------------------------------------------------
    function layout() {
      target = {};
      var inSeries = function (n) { return !activeSeries || n.series === activeSeries; };

      function place(id, r, deg) {
        var p = polar(r, deg);
        target[id] = { x: p.x, y: p.y, deg: deg, r: r };
      }

      if (view === "reihen") {
        var reihen = data.nodes.filter(function (n) { return n.type === "reihe" && inSeries(n); });
        var weights = reihen.map(function (r) {
          var autoren = (kids[r.id] || []).filter(function (id) { return byId[id].type === "autor"; });
          var w = autoren.reduce(function (s, id) { return s + Math.max(1, worksOf(id).length); }, 0);
          // Untergrenze fuer belegte Reihen, damit eine Reihe mit einem
          // einzigen Band nicht zu einem Strich zusammenfaellt; leere Reihen
          // behalten ein schmales, aber sichtbares Segment.
          return w > 0 ? Math.max(3, w) : 1.5;
        });
        var total = weights.reduce(function (a, b) { return a + b; }, 0);
        var cursor = 0;
        reihen.forEach(function (r, i) {
          var span = weights[i] / total * 360;
          var from = cursor, mid = cursor + span / 2;
          cursor += span;
          place(r.id, R.reihe, mid);

          var autoren = (kids[r.id] || []).filter(function (id) { return byId[id].type === "autor"; });
          if (!autoren.length) return;
          var aw = autoren.map(function (id) { return Math.max(1, worksOf(id).length); });
          var awTotal = aw.reduce(function (a, b) { return a + b; }, 0);
          var pad = span * 0.06;
          var inner = span - 2 * pad;
          var ac = from + pad;
          autoren.forEach(function (id, j) {
            var aspan = aw[j] / awTotal * inner;
            var amid = ac + aspan / 2;
            byId[id].stagger = j % 2 === 1;
            place(id, R.autor, amid);
            var works = worksOf(id);
            var wc = ac + aspan * 0.08;
            var wspan = aspan * 0.84;
            works.forEach(function (wid, k) {
              var step = works.length > 1 ? wspan / (works.length - 1) : 0;
              var wa = works.length > 1 ? wc + step * k : amid;
              // Zwei Radien im Wechsel: die Titel stehen radial und wuerden
              // sich bei einem Autor mit neun Baenden sonst kreuzen.
              place(wid, R.werk + (k % 2 ? STAGGER : 0), wa);
            });
            ac += aspan;
          });
        });
      } else {
        var motive = data.nodes.filter(function (n) { return n.type === "motiv"; });
        var listOf = function (m) {
          return (parents[m.id] || []).filter(function (id) { return inSeries(byId[id]); });
        };
        var used = motive.filter(function (m) { return listOf(m).length; });
        var mw = used.map(function (m) { return listOf(m).length; });
        var mTotal = mw.reduce(function (a, b) { return a + b; }, 0) || 1;
        var mc = 0;
        used.forEach(function (m, i) {
          var span = mw[i] / mTotal * 360;
          var mid = mc + span / 2;
          place(m.id, R.motiv, mid);
          var werke = listOf(m);
          var pad = span * 0.08;
          var inner = span - 2 * pad;
          werke.forEach(function (wid, k) {
            var step = werke.length > 1 ? inner / (werke.length - 1) : 0;
            var wa = werke.length > 1 ? mc + pad + step * k : mid;
            place(wid, R.motivWerk + (k % 2 ? STAGGER : 0), wa);
          });
          mc += span;
        });
      }
    }

    // --- Aufbau ------------------------------------------------------------
    var gRoot = el("g", { "data-root": "" });
    var gKin = el("g", { "data-kin": "" });
    var gEdges = el("g", { "data-edges": "" });
    var gNodes = el("g", { "data-nodes": "" });
    var gCenter = el("g", { class: "karte-center" });

    var centerText = el("text", { x: C, y: C - 4, "text-anchor": "middle", "font-size": 17 });
    centerText.textContent = "AETERNUS";
    var centerSub = el("text", { x: C, y: C + 20, "text-anchor": "middle", "font-size": 11, opacity: ".65" });
    gCenter.appendChild(el("circle", { cx: C, cy: C, r: 74, fill: "none", stroke: "rgba(212,175,55,.28)" }));
    gCenter.appendChild(centerText);
    gCenter.appendChild(centerSub);

    gRoot.appendChild(gKin);
    gRoot.appendChild(gEdges);
    gRoot.appendChild(gCenter);
    gRoot.appendChild(gNodes);
    svg.appendChild(gRoot);

    var edgeEls = [], kinEls = [], nodeEls = {};

    // Jede Verbindung besteht aus zwei Linien: der ruhigen Grundlinie und
    // darueber einem Funken, der nur laeuft, wenn die Verbindung leuchtet.
    // pathLength=100 normiert alle Laengen, damit der Funke auf einer kurzen
    // und einer langen Linie gleich schnell wandert.
    data.links.forEach(function (l) {
      var p = el("path", { class: "karte-edge" + (l.kind === "motiv" ? " is-motiv" : "") });
      var sp = el("path", { class: "karte-spark", pathLength: "100" });
      edgeEls.push({ el: p, spark: sp, link: l });
      gEdges.appendChild(p);
      gEdges.appendChild(sp);
    });

    (data.kin || []).forEach(function (k) {
      var p = el("path", { class: "karte-kin" });
      var sp = el("path", { class: "karte-spark is-kin-spark", pathLength: "100" });
      kinEls.push({ el: p, spark: sp, link: k });
      gKin.appendChild(p);
      gKin.appendChild(sp);
    });

    data.nodes.forEach(function (n, i) {
      var g = el("g", {
        class: "karte-node type-" + n.type + (n.preview ? " is-preview" : ""),
        tabindex: "0", role: "button", "data-id": n.id
      });
      var title = el("title");
      title.textContent = n.label + (n.sub ? " — " + n.sub : "");
      g.appendChild(title);

      // Der Pulsring liegt unter dem Punkt und ist unsichtbar, bis der Punkt
      // warm wird; erst dann laeuft er nach aussen aus.
      g.appendChild(el("circle", { class: "pulse", r: DOT[n.type] + 3, fill: "none", stroke: n.color }));

      if (n.type === "motiv") {
        g.appendChild(el("rect", { x: -7, y: -7, width: 14, height: 14, fill: "none", stroke: "rgba(243,231,207,.7)", transform: "rotate(45)" }));
      } else {
        var leer = n.type === "reihe" && !(kids[n.id] || []).length;
        g.appendChild(el("circle", {
          r: DOT[n.type],
          fill: n.type === "werk" ? n.color : "none",
          stroke: n.color === "#3a3a3a" ? "#8a8170" : n.color,
          "stroke-width": n.type === "werk" ? 1 : 2,
          "stroke-dasharray": leer ? "3 4" : null
        }));
        if (n.type !== "werk" && !leer) {
          g.appendChild(el("circle", { r: DOT[n.type] - 3.2, fill: n.color, opacity: ".9" }));
        }
      }

      var t = el("text", { "text-anchor": "middle", y: 0 });
      t.textContent = shorten(n.label, MAXCHARS[n.type] || 24);
      g.appendChild(t);

      g.addEventListener("mouseenter", function () { warm(n.id); });
      g.addEventListener("mouseleave", function () { warm(null); });
      g.addEventListener("focus", function () { warm(n.id); show(n.id); });
      g.addEventListener("blur", function () { warm(null); });
      g.addEventListener("click", function (e) { e.stopPropagation(); select(n.id); });
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(n.id); }
      });

      n.phase = i * 0.7;   // Startpunkt der Schwebebewegung
      nodeEls[n.id] = { g: g, text: t, node: n };
      gNodes.appendChild(g);
    });

    // --- Zeichnen ----------------------------------------------------------
    var breathT = 0;

    function breath(n) {
      if (reduce) return { x: 0, y: 0 };
      return {
        x: Math.sin(breathT * 0.00042 + n.phase) * 4.5,
        y: Math.cos(breathT * 0.00037 + n.phase * 1.7) * 4.5
      };
    }

    function at(id) {
      var p = cur[id];
      if (!p) return null;
      var b = breath(byId[id]);
      return { x: p.x + b.x, y: p.y + b.y, deg: p.deg, r: p.r };
    }

    function draw() {
      Object.keys(nodeEls).forEach(function (id) {
        var ne = nodeEls[id];
        var p = at(id);
        if (!p) { ne.g.style.display = "none"; return; }
        ne.g.style.display = "";
        ne.g.setAttribute("transform", "translate(" + p.x.toFixed(1) + "," + p.y.toFixed(1) + ")");
        placeLabel(ne, p);
      });

      edgeEls.forEach(function (e) {
        var a = at(e.link.a), b = at(e.link.b);
        var relevant = view === "reihen" ? e.link.kind !== "motiv" : e.link.kind === "motiv";
        if (!a || !b || !relevant) { e.el.style.display = "none"; e.spark.style.display = "none"; return; }
        e.el.style.display = "";
        var cp = polar((a.r + b.r) / 2 * 0.62, (a.deg + b.deg) / 2);
        var d = "M" + a.x.toFixed(1) + " " + a.y.toFixed(1) +
          " Q" + cp.x.toFixed(1) + " " + cp.y.toFixed(1) + " " + b.x.toFixed(1) + " " + b.y.toFixed(1);
        e.el.setAttribute("d", d);
        // Der Funke wird nur nachgefuehrt, solange er zu sehen ist.
        if (e.el.classList.contains("is-lit")) { e.spark.style.display = ""; e.spark.setAttribute("d", d); }
        else e.spark.style.display = "none";
      });

      kinEls.forEach(function (k) {
        var a = at(k.link.a), b = at(k.link.b);
        if (!a || !b) { k.el.style.display = "none"; k.spark.style.display = "none"; return; }
        k.el.style.display = "";
        // Sehne durch die Mitte: die Verwandtschaft zweier Baende laeuft quer
        // durch die Karte, nicht am Ring entlang.
        var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        var cx = C + (mx - C) * 0.3, cy = C + (my - C) * 0.3;
        var dk = "M" + a.x.toFixed(1) + " " + a.y.toFixed(1) +
          " Q" + cx.toFixed(1) + " " + cy.toFixed(1) + " " + b.x.toFixed(1) + " " + b.y.toFixed(1);
        k.el.setAttribute("d", dk);
        if (k.el.classList.contains("is-lit")) { k.spark.style.display = ""; k.spark.setAttribute("d", dk); }
        else k.spark.style.display = "none";
      });
    }

    function placeLabel(ne, p) {
      var n = ne.node, t = ne.text;
      if (n.type === "werk") {
        var flip = Math.cos((p.deg - 90) * Math.PI / 180) < 0;
        t.setAttribute("text-anchor", flip ? "end" : "start");
        t.setAttribute("transform", "rotate(" + (p.deg - 90 + (flip ? 180 : 0)) + ") translate(" + (flip ? -12 : 12) + ",4)");
      } else if (n.type === "autor") {
        // Zwei Hoehen im Wechsel: benachbarte Namen stehen sonst ineinander,
        // sobald ein Autor nur einen Band traegt und sein Segment schmal ist.
        var below = p.deg > 90 && p.deg < 270;
        var out = n.stagger ? 34 : -24;
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("transform", "translate(0," + (below ? -out : out) + ")");
      } else {
        var unten = p.deg > 90 && p.deg < 270;
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("transform", "translate(0," + (unten ? 34 : -22) + ")");
      }
    }

    // Die Ringe stehen fest, die Beschriftungen wachsen mit dem Programm:
    // nach jeder Anordnung wird das fertige Bild so skaliert und verschoben,
    // dass es die Zeichenflaeche ausfuellt, ohne an ihrem Rand zu haengen.
    // Damit fuellt auch eine einzeln gefilterte Reihe das Feld.
    function fit() {
      gRoot.removeAttribute("transform");
      var bb = gRoot.getBBox();
      if (!bb.width || !bb.height) return;
      var pad = 30;
      var s = Math.min((SIZE - 2 * pad) / bb.width, (SIZE - 2 * pad) / bb.height);
      s = Math.min(s, 1.3);   // darueber laufen die Namen ineinander
      gRoot.setAttribute("transform",
        "translate(" + (C - s * (bb.x + bb.width / 2)).toFixed(1) + "," +
        (C - s * (bb.y + bb.height / 2)).toFixed(1) + ") scale(" + s.toFixed(3) + ")");
    }

    // --- Uebergang und Schweben --------------------------------------------
    var raf = null;

    function arrange(instant) {
      layout();
      var from = {};
      Object.keys(nodeEls).forEach(function (id) { from[id] = pos[id]; });

      // Ein Bildtakt laeuft nicht, wenn die Seite im Hintergrund geoeffnet
      // wurde - dann stuende die Karte leer, bis jemand hinsieht.
      if (reduce || instant || document.hidden) {
        cur = {};
        Object.keys(target).forEach(function (id) { pos[id] = target[id]; cur[id] = target[id]; });
        draw(); fit();
        return;
      }

      if (raf) cancelAnimationFrame(raf);
      var start = null;
      var step = function (ts) {
        if (start === null) start = ts;
        var t = Math.min(1, (ts - start) / DUR);
        var e = 1 - Math.pow(1 - t, 3);
        cur = {};
        Object.keys(target).forEach(function (id) {
          var to = target[id];
          var fr = from[id] || { x: C, y: C, deg: to.deg, r: 0 };
          cur[id] = {
            x: fr.x + (to.x - fr.x) * e,
            y: fr.y + (to.y - fr.y) * e,
            deg: to.deg, r: to.r
          };
        });
        draw();
        fit();
        if (t < 1) raf = requestAnimationFrame(step);
        else Object.keys(target).forEach(function (id) { pos[id] = target[id]; });
      };
      raf = requestAnimationFrame(step);
    }

    // Leises Schweben. Es laeuft nur, solange die Karte im Bild ist, und ruht
    // bei ausdruecklichem Wunsch nach wenig Bewegung.
    var breathing = false, breathRaf = null;
    function breatheLoop(ts) {
      breathT = ts;
      draw();
      breathRaf = requestAnimationFrame(breatheLoop);
    }
    function setBreathing(on) {
      if (reduce || on === breathing) return;
      breathing = on;
      if (on) breathRaf = requestAnimationFrame(breatheLoop);
      else if (breathRaf) { cancelAnimationFrame(breathRaf); breathRaf = null; }
    }
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        setBreathing(entries[0].isIntersecting && !document.hidden);
      }, { threshold: 0.05 }).observe(svg);
    } else {
      setBreathing(true);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) setBreathing(false);
    });

    // --- Hervorhebung ------------------------------------------------------
    function relatives(id) {
      if (!id) return null;
      var set = {}, kin = {};
      set[id] = true;
      (kids[id] || []).forEach(function (k) {
        set[k] = true;
        (kids[k] || []).forEach(function (k2) { set[k2] = true; });
      });
      (parents[id] || []).forEach(function (p) {
        set[p] = true;
        (parents[p] || []).forEach(function (p2) { set[p2] = true; });
      });
      var werke = byId[id].type === "werk" ? [id] : worksOf(id);
      werke.forEach(function (w) {
        (kinOf[w] || []).forEach(function (o) { kin[o] = true; set[o] = true; });
      });
      return { set: set, kin: kin };
    }

    function highlight() {
      var id = hot || selected;
      var rel = relatives(id);
      // Bei einem Autor leuchten nur die Verwandtschaften seiner eigenen
      // Baende - nicht auch die, die zwei fremde Baende untereinander haben.
      var eigene = {};
      if (id && byId[id].type === "autor") worksOf(id).forEach(function (w) { eigene[w] = true; });
      Object.keys(nodeEls).forEach(function (nid) {
        var g = nodeEls[nid].g;
        g.classList.toggle("is-dim", !!rel && !rel.set[nid]);
        g.classList.toggle("is-lit", !!rel && !!rel.set[nid]);
        g.classList.toggle("is-kin", !!rel && !!rel.kin[nid]);
        g.classList.toggle("is-hot", nid === id);
        g.classList.toggle("is-active", nid === selected);
      });
      edgeEls.forEach(function (e) {
        var on = rel && rel.set[e.link.a] && rel.set[e.link.b];
        e.el.classList.toggle("is-lit", !!on);
        e.el.classList.toggle("is-dim", !!rel && !on);
        e.spark.classList.toggle("is-on", !!on);
      });
      kinEls.forEach(function (k) {
        var on = rel && rel.set[k.link.a] && rel.set[k.link.b] &&
          (k.link.a === id || k.link.b === id || eigene[k.link.a] || eigene[k.link.b]);
        k.el.classList.toggle("is-lit", !!on);
        k.el.classList.toggle("is-dim", !!rel && !on);
        k.spark.classList.toggle("is-on", !!on);
      });
      // Die Funken brauchen sofort ihren Pfad; ohne Schweben laeuft sonst
      // kein Zeichendurchgang, der ihn nachtraegt.
      draw();
    }

    // Solange nichts ausgewaehlt ist, folgt die Seitenspalte dem Zeiger:
    // hinsehen genuegt, um zu lesen, woran ein Punkt haengt. Eine getroffene
    // Auswahl bleibt dagegen stehen, bis sie aufgehoben wird.
    function warm(id) {
      hot = id;
      highlight();
      if (!selected) show(id);
    }

    function select(id) {
      selected = selected === id ? null : id;
      highlight();
      show(selected);
    }

    // --- Seitenspalte ------------------------------------------------------
    function show(id) {
      if (!id) { panel.innerHTML = panel.dataset.empty; return; }
      var n = byId[id];
      var html = '<p class="kicker">' + esc(T["type_" + n.type] || "") + "</p>";
      html += "<h2>" + esc(n.label) + "</h2>";

      var meta = [];
      if (n.sub) meta.push(esc(n.sub));
      if (n.year) meta.push(esc(String(n.year)));
      if (n.type === "werk" && n.author) meta.push(esc(n.author));
      if (meta.length) html += '<p class="meta">' + meta.join(" &middot; ") + "</p>";
      if (n.note) html += '<p class="text">' + esc(n.note) + "</p>";

      var children = (kids[id] || []).filter(function (c) { return byId[c].type !== "motiv"; });
      if (n.type === "reihe" && !children.length && T.emptySeries) {
        html += '<p class="hint">' + esc(T.emptySeries) + "</p>";
      }
      if (children.length) {
        html += '<p class="kicker" style="margin-top:24px">' +
          esc(n.type === "reihe" ? (T.authorsLabel || "") : (T.worksLabel || "")) + "</p><ul>";
        children.forEach(function (c) {
          html += '<li><button type="button" data-goto="' + esc(c) + '">' + esc(byId[c].label) + "</button></li>";
        });
        html += "</ul>";
      }

      if (n.type === "werk") {
        var m = (kids[id] || []).filter(function (c) { return byId[c].type === "motiv"; })[0];
        if (m) html += '<p class="hint">' + esc(T.motivLabel || "") + ": " + esc(byId[m].label) + "</p>";
        var kin = kinOf[id] || [];
        if (kin.length) {
          html += '<p class="kicker" style="margin-top:24px">' + esc(T.kinLabel || "") + "</p><ul>";
          kin.forEach(function (o) {
            html += '<li><button type="button" data-goto="' + esc(o) + '">' + esc(byId[o].label) +
              ' <span class="who">' + esc(byId[o].author) + "</span></button></li>";
          });
          html += "</ul>";
        }
      }

      if (n.url) {
        html += '<a class="go" href="' + esc(n.url) + '"' + (n.external ? ' rel="noopener"' : "") + ">" +
          esc(n.external ? (T.buy || "") : (T.open || "")) + ' <span aria-hidden="true">&rarr;</span></a>';
      }
      panel.innerHTML = html;
      panel.querySelectorAll("[data-goto]").forEach(function (b) {
        var gid = b.getAttribute("data-goto");
        b.addEventListener("click", function () { select(gid); });
        b.addEventListener("mouseenter", function () { warm(gid); });
        b.addEventListener("mouseleave", function () { warm(null); });
      });
    }

    // --- Bedienelemente ----------------------------------------------------
    modeButtons.forEach(function (b) {
      b.addEventListener("click", function () {
        view = b.getAttribute("data-karte-mode");
        modeButtons.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
        svg.classList.toggle("view-motive", view === "motive");
        centerSub.textContent = view === "reihen" ? (T.bySeries || "") : (T.byMotive || "");
        selected = null; hot = null;
        arrange();
        highlight();
        show(null);
      });
    });

    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        var slug = c.getAttribute("data-karte-series");
        activeSeries = (slug === "" || activeSeries === slug) ? null : slug;
        chips.forEach(function (o) {
          var s = o.getAttribute("data-karte-series");
          o.setAttribute("aria-pressed", String(activeSeries === null ? s === "" : s === activeSeries));
        });
        selected = null; hot = null;
        arrange();
        highlight();
        show(null);
      });
    });

    svg.addEventListener("click", function (e) {
      if (!e.target.closest(".karte-node")) { selected = null; hot = null; highlight(); show(null); }
    });

    centerSub.textContent = T.bySeries || "";
    panel.dataset.empty = panel.innerHTML;
    arrange(true);
    // Schriftmasse aendern sich, sobald die Hausschrift geladen ist; die
    // Einpassung wird dann einmal nachgezogen.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(); });
  }

  function boot() { document.querySelectorAll("[data-karte]").forEach(init); }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
