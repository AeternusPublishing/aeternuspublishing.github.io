(() => {
      "use strict";

      if (!window.d3) {
        document.getElementById("fallback").hidden = false;
        return;
      }

      const xml = value => String(value).replace(/[<>&'"]/g, char => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]);
      const { nodes: nodesData, links: linksData } = JSON.parse(document.getElementById("kosmos-data").textContent);

      const regionCoordinates = {
        "north-america": [[-168, 77], [-48, 7]],
        europe: [[-16, 72], [37, 34]],
        africa: [[-21, 39], [55, -38]],
        asia: [[34, 79], [151, 3]]
      };

      const nodeById = new Map(nodesData.map(item => [item.id, item]));
      const neighbors = new Map(nodesData.map(item => [item.id, new Set()]));
      const relations = new Map(nodesData.map(item => [item.id, []]));
      linksData.forEach(link => {
        neighbors.get(link.source).add(link.target);
        neighbors.get(link.target).add(link.source);
        relations.get(link.source).push({ id: link.target, reason: link.reason });
        relations.get(link.target).push({ id: link.source, reason: link.reason });
      });

      document.getElementById("cosmos-stats").textContent = `${nodesData.length} Werke · ${linksData.length} Verbindungen`;

      const svg = d3.select("#graph");
      const defs = svg.append("defs");
      const ocean = defs.append("radialGradient")
        .attr("id", "world-ocean")
        .attr("cx", "50%")
        .attr("cy", "45%")
        .attr("r", "65%");
      ocean.append("stop").attr("offset", "0%").attr("stop-color", "#1b1915").attr("stop-opacity", .72);
      ocean.append("stop").attr("offset", "62%").attr("stop-color", "#12110f").attr("stop-opacity", .35);
      ocean.append("stop").attr("offset", "100%").attr("stop-color", "#090908").attr("stop-opacity", .15);

      const sphereShadow = defs.append("filter")
        .attr("id", "sphere-shadow")
        .attr("x", "-20%")
        .attr("y", "-20%")
        .attr("width", "140%")
        .attr("height", "140%");
      sphereShadow.append("feDropShadow")
        .attr("dx", 0)
        .attr("dy", 10)
        .attr("stdDeviation", 18)
        .attr("flood-color", "#000")
        .attr("flood-opacity", .5);

      const mapLayer = svg.append("g").attr("aria-hidden", "true");
      const sphere = mapLayer.append("path").attr("class", "sphere");
      const graticule = mapLayer.append("path").attr("class", "graticule");
      const land = mapLayer.append("path").attr("class", "land");
      const edgeLayer = svg.append("g").attr("aria-hidden", "true");
      const nodeLayer = svg.append("g");
      const focusBook = d3.select("main").append("button").attr("type", "button")
        .attr("class", "focus-book").attr("tabindex", -1).attr("aria-hidden", "true");
      focusBook.append("img").attr("alt", "");
      focusBook.append("strong");
      focusBook.append("small");
      focusBook.append("span").text("Das Werk entdecken →");

      const edges = edgeLayer.selectAll("path").data(linksData).join("path").attr("class", "edge");
      const nodes = nodeLayer.selectAll("g").data(nodesData).join("g").attr("class", "node").attr("tabindex", 0).attr("role", "button").attr("aria-label", item => `${item.title} von ${item.author}. Details öffnen.`);

      nodes.append("circle")
        .attr("class", "node-halo")
        .attr("r", 9)
        .style("--pulse-delay", (_, index) => `${index * -.37}s`);
      nodes.append("rect").attr("class", "hit-area").attr("x", -18).attr("y", -23).attr("width", 36).attr("height", 46).attr("rx", 8);
      const covers = nodes.append("g").attr("class", "cover").style("--pulse-delay", (_, index) => `${index * -.37}s`);
      covers.append("rect").attr("class", "cover-frame").attr("x", -9).attr("y", -13.5).attr("width", 18).attr("height", 27).attr("rx", 1);
      covers.append("image").attr("href", item => item.coverImageUrl).attr("x", -8.4).attr("y", -12.9).attr("width", 16.8).attr("height", 25.8).attr("preserveAspectRatio", "xMidYMid slice");

      nodes.append("text").attr("class", "label").attr("y", 21).each(function(item) {
        const words = item.title.split(/\s+/);
        const midpoint = item.title.length > 20 ? Math.ceil(words.length / 2) : words.length;
        const text = d3.select(this);
        text.append("tspan").attr("x", 0).text(words.slice(0, midpoint).join(" "));
        if (midpoint < words.length) text.append("tspan").attr("x", 0).attr("dy", 13).text(words.slice(midpoint).join(" "));
      });

      let width = innerWidth;
      let height = innerHeight;
      let currentRegion = "world";
      let selectedId = null;
      let exploredId = null;
      let projection = d3.geoNaturalEarth1();
      let geoPath = d3.geoPath(projection);
      let worldLand = null;
      let focusId = null;
      const resetButton = document.getElementById("reset-focus");

      // Exploration persists across the empty space between books. Only an
      // explicit reset, region change or another book changes the selection.
      focusBook.on("click", () => { if (focusId) openBook(focusId); });

      const setFocus = activeId => {
        if (focusId !== activeId) {
          focusId = activeId;
          const item = nodeById.get(activeId);
          focusBook.classed("is-visible", Boolean(item)).attr("aria-hidden", String(!item)).attr("tabindex", item ? 0 : -1);
          if (item) {
            focusBook.select("img").attr("src", item.coverImageUrl).attr("alt", `Cover von ${item.title}`);
            focusBook.select("strong").text(item.title);
            focusBook.select("small").text(item.author);
            focusBook.attr("aria-label", `${item.title}: Details öffnen`);
          }
        }
        resetButton.hidden = !activeId;
        const related = activeId ? neighbors.get(activeId) : new Set();
        nodes
          .classed("is-active", item => item.id === activeId)
          .classed("is-neighbor", item => Boolean(activeId && related.has(item.id)))
          .classed("is-dimmed", item => activeId ? item.id !== activeId && !related.has(item.id) : currentRegion !== "world" && item.region !== currentRegion)
          .attr("tabindex", function() { return this.classList.contains("is-dimmed") ? -1 : 0; });
        edges.classed("is-related", link => Boolean(activeId && (link.source.id === activeId || link.target.id === activeId))).classed("is-dimmed", link => activeId ? link.source.id !== activeId && link.target.id !== activeId : currentRegion !== "world" && link.source.region !== currentRegion && link.target.region !== currentRegion);
        renderGraph();
      };

      const updateFocus = () => setFocus(selectedId || exploredId);
      const clearFocus = () => { exploredId = null; updateFocus(); };
      resetButton.addEventListener("click", () => {
        clearFocus();
        document.querySelector(`[data-region="${currentRegion}"]`).focus({ preventScroll: true });
      });
      svg.on("click", event => {
        if (!event.target.closest(".node") && !selectedId) clearFocus();
      });

      nodes
        .on("pointermove", function(event, item) {
          // A panel disappearing or a layout settling under a stationary
          // cursor must not choose a different book without pointer movement.
          if (selectedId || event.pointerType === "touch" || focusId === item.id) return;
          exploredId = item.id;
          this.parentNode.appendChild(this);
          updateFocus();
        })
        .on("focus", (_, item) => { exploredId = item.id; updateFocus(); })
        .on("pointerup", (event, item) => {
          if (event.button === 0 || event.pointerType === "touch" || event.pointerType === "pen") openBook(item.id);
        })
        .on("keydown", (event, item) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openBook(item.id); } });

      function renderGraph() {
        const box = svg.node().viewBox.baseVal;
        const scale = (box.width || width) / width;
        const center = { x: box.x + (box.width || width) / 2, y: box.y + (box.height || height) * .52 };
        const coverHeight = Math.max(0, Math.min(Math.max(210, height * .36), 360, height - 290));
        const halfWidth = (coverHeight / 3 + 25) * scale;
        const halfHeight = (coverHeight / 2 + 65) * scale;
        const active = nodeById.get(focusId);
        const nodePosition = item => {
          if (!active) return item;
          const dx = item.x - center.x, dy = item.y - center.y;
          const radius = Math.max(halfWidth, halfHeight) + 45 * scale;
          const distance = Math.hypot(dx, dy) || 1;
          return distance < radius ? { x: center.x + (dx || 1) / distance * radius, y: center.y + dy / distance * radius } : item;
        };
        const position = item => item.id === focusId ? center : nodePosition(item);
        edges.attr("d", link => {
          let source = position(link.source), target = position(link.target);
          // End the line at the featured book's boundary, not behind its cover.
          const clip = other => {
            const dx = other.x - center.x, dy = other.y - center.y;
            const ratio = Math.min(halfWidth / Math.max(.01, Math.abs(dx)), halfHeight / Math.max(.01, Math.abs(dy)));
            return { x: center.x + dx * ratio, y: center.y + dy * ratio };
          };
          if (link.source.id === focusId) source = clip(target);
          if (link.target.id === focusId) target = clip(source);
          const dx = target.x - source.x, dy = target.y - source.y;
          const length = Math.hypot(dx, dy) || 1;
          const bend = Math.min(30, length * .065);
          return `M${source.x},${source.y} Q${(source.x + target.x) / 2 - dy / length * bend},${(source.y + target.y) / 2 + dx / length * bend} ${target.x},${target.y}`;
        });
        nodes.attr("transform", item => {
          const point = nodePosition(item);
          return `translate(${point.x},${point.y})`;
        });
      }

      const simulation = d3.forceSimulation(nodesData)
        .force("link", d3.forceLink(linksData).id(item => item.id).distance(74).strength(.018))
        .force("charge", d3.forceManyBody().strength(-58))
        .force("collision", d3.forceCollide().radius(30).strength(1))
        .alphaDecay(.038)
        .velocityDecay(.5)
        .on("tick", renderGraph);

      const worldViewBox = () => [0, 0, width, height];
      const regionViewBox = region => {
        if (region === "world") return worldViewBox();
        const [northWest, southEast] = regionCoordinates[region];
        const a = projection(northWest);
        const b = projection(southEast);
        const centerX = (a[0] + b[0]) / 2;
        const centerY = (a[1] + b[1]) / 2;
        let boxWidth = Math.max(Math.abs(b[0] - a[0]) + 130, width * .66);
        let boxHeight = Math.max(Math.abs(b[1] - a[1]) + 110, height * .66);
        const ratio = width / height;
        if (boxWidth / boxHeight > ratio) boxHeight = boxWidth / ratio;
        else boxWidth = boxHeight * ratio;
        return [centerX - boxWidth / 2, centerY - boxHeight / 2, boxWidth, boxHeight];
      };

      const chooseRegion = (region, animate = true) => {
        currentRegion = region;
        document.querySelectorAll("[data-region]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.region === region)));
        updateFocus();
        const target = regionViewBox(region).join(" ");
        svg.interrupt();
        if (animate && !matchMedia("(prefers-reduced-motion: reduce)").matches) svg.transition().duration(650).ease(d3.easeCubicInOut).attr("viewBox", target).tween("focus-lines", () => () => renderGraph());
        else { svg.attr("viewBox", target); renderGraph(); }
      };

      document.querySelectorAll("[data-region]").forEach(button => button.addEventListener("click", () => {
        exploredId = null;
        chooseRegion(button.dataset.region);
      }));

      const panel = document.getElementById("book-panel");
      const panelCover = document.getElementById("panel-cover");
      const landingLink = document.getElementById("landing-link");
      const amazonLink = document.getElementById("amazon-link");

      function openBook(id) {
        const item = nodeById.get(id);
        if (!item) return;
        selectedId = id;
        exploredId = id;
        updateFocus();
        panelCover.src = item.coverImageUrl;
        panelCover.alt = `Cover von ${item.title}`;
        document.getElementById("panel-kicker").textContent = `${item.year} · ${item.place}`;
        document.getElementById("panel-title").textContent = item.title;
        document.getElementById("panel-author").textContent = item.author;
        document.getElementById("panel-subtitle").textContent = item.subtitle;
        document.getElementById("panel-summary").textContent = item.summary;
        const regionLabel = item.region === "north-america" ? "Nordamerika" : item.region === "europe" ? "Europa" : item.region === "africa" ? "Afrika" : "Asien";
        const statusClass = ["Lieferbar", "Im Programm"].includes(item.status) ? "status-live" : "status-upcoming";
        document.getElementById("panel-meta").innerHTML = `<span class="meta-pill ${statusClass}">${xml(item.status)}</span><span class="meta-pill">${xml(regionLabel)}</span>${item.language === "Englisch" ? '<span class="meta-pill">Englische Ausgabe</span>' : ''}`;
        const related = relations.get(id);
        document.getElementById("relation-count").textContent = `${related.length} direkte ${related.length === 1 ? "Verbindung" : "Verbindungen"}`;
        document.getElementById("related-list").innerHTML = related.map(relation => {
          const book = nodeById.get(relation.id);
          return `<button class="related-book" type="button" data-related="${book.id}"><span><strong>${xml(book.title)}</strong><small>${xml(relation.reason)}</small></span><span aria-hidden="true">→</span></button>`;
        }).join("") || '<p class="panel-summary">Zu diesem Werk sind noch keine direkten Verbindungen verzeichnet.</p>';
        landingLink.href = item.landingUrl;
        landingLink.hidden = !item.landingUrl;
        amazonLink.href = item.amazonUrl || "#";
        amazonLink.hidden = !item.amazonUrl;
        document.body.classList.add("panel-open");
        panel.inert = false;
        document.querySelectorAll("main, .atlas-home, .atlas-catalogue").forEach(element => { element.inert = true; });
        panel.setAttribute("aria-hidden", "false");
        requestAnimationFrame(() => document.querySelector(".panel-close").focus({ preventScroll: true }));
      }

      function closePanel({ restoreFocus = true } = {}) {
        if (!selectedId) return;
        const previous = selectedId;
        selectedId = null;
        exploredId = previous;
        document.body.classList.remove("panel-open");
        panel.inert = true;
        document.querySelectorAll("main, .atlas-home, .atlas-catalogue").forEach(element => { element.inert = false; });
        panel.setAttribute("aria-hidden", "true");
        updateFocus();
        if (restoreFocus) nodes.filter(item => item.id === previous).node()?.focus({ preventScroll: true });
      }

      document.querySelectorAll("[data-close-panel]").forEach(button => button.addEventListener("click", () => closePanel()));
      document.getElementById("related-list").addEventListener("click", event => {
        const button = event.target.closest("[data-related]");
        if (!button) return;
        const related = nodeById.get(button.dataset.related);
        chooseRegion(related.region);
        openBook(related.id);
      });
      document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !selectedId && exploredId) {
          event.preventDefault();
          clearFocus();
          document.querySelector(`[data-region="${currentRegion}"]`).focus({ preventScroll: true });
          return;
        }
        if (!selectedId) return;
        if (event.key === "Escape") { event.preventDefault(); closePanel(); }
        if (event.key === "Tab") {
          const controls = [...panel.querySelectorAll('button, a[href]')].filter(element => !element.hidden);
          const first = controls[0], last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      });

      const dataPositionForces = () => {
        nodesData.forEach(item => {
          const [targetX, targetY] = projection(item.location);
          item.targetX = targetX;
          item.targetY = targetY;
        });
        simulation.force("x", d3.forceX(item => item.targetX).strength(.52)).force("y", d3.forceY(item => item.targetY).strength(.52)).alpha(.75).restart();
      };

      const drawMap = () => {
        projection = d3.geoNaturalEarth1().fitExtent([[52, 110], [width - 52, height - 78]], { type: "Sphere" });
        geoPath = d3.geoPath(projection);
        sphere.attr("d", geoPath({ type: "Sphere" }));
        graticule.attr("d", geoPath(d3.geoGraticule10()));
        if (worldLand) land.attr("d", geoPath(worldLand));
        dataPositionForces();
      };

      const resize = () => {
        width = innerWidth;
        height = innerHeight;
        svg.attr("width", width).attr("height", height);
        drawMap();
        chooseRegion(currentRegion, false);
      };

      fetch("/assets/data/land-110m.json")
        .then(response => response.ok ? response.json() : Promise.reject(new Error("Karte nicht verfügbar")))
        .then(world => {
          if (window.topojson) {
            worldLand = topojson.feature(world, world.objects.land);
            land.attr("d", geoPath(worldLand));
          }
        })
        .catch(() => land.remove());

      addEventListener("resize", resize, { passive: true });
      resize();
    })();
