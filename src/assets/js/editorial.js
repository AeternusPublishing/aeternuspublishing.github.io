(() => {
  const toggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".main-navigation");
  if (toggle && navigation) {
    toggle.hidden = false;
    document.documentElement.classList.add("has-menu");
    const close = () => { toggle.setAttribute("aria-expanded", "false"); navigation.classList.remove("is-open"); };
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open)); navigation.classList.toggle("is-open", open);
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { close(); toggle.focus(); } });
    navigation.addEventListener("click", e => { if (e.target.closest("a")) close(); });
    document.addEventListener("click", e => { if (!e.target.closest(".masthead")) close(); });
  }
  const form = document.querySelector("[data-catalogue-filters]");
  if (form) {
    form.hidden = false;
    const cards = [...document.querySelectorAll("[data-book-card]")];
    const count = document.querySelector("[data-result-count]");
    const empty = document.querySelector("[data-no-results]");
    const fields = ["q", "reihe", "status"];
    const normalize = s => s.toLocaleLowerCase("de").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/-/g, "");
    const readURL = () => {
      const params = new URLSearchParams(location.search);
      for (const key of fields) form.elements[key].value = params.get(key) || "";
    };
    function filter(writeURL = true) {
      const terms = normalize(form.elements.q.value.trim()).split(/\s+/).filter(Boolean);
      const series = form.elements.reihe.value;
      const status = form.elements.status.value;
      let total = 0;
      for (const card of cards) {
        const show = terms.every(t => normalize(card.dataset.search).includes(t)) && (!series || card.dataset.series === series) && (!status || card.dataset.status === status);
        card.hidden = !show; if (show) total++;
      }
      count.textContent = total + (total === 1 ? " Ausgabe" : " Ausgaben");
      empty.hidden = total > 0;
      if (writeURL) {
        const url = new URL(location.href);
        for (const key of fields) { const value = form.elements[key].value.trim(); value ? url.searchParams.set(key, value) : url.searchParams.delete(key); }
        history.replaceState(null, "", url);
      }
    }
    form.addEventListener("input", () => filter());
    form.addEventListener("change", () => filter());
    form.addEventListener("submit", e => { e.preventDefault(); filter(); });
    form.addEventListener("reset", () => { for (const key of fields) form.elements[key].value = ""; filter(); });
    document.querySelector("[data-reset-search]")?.addEventListener("click", () => { form.reset(); form.elements.q.focus(); });
    window.addEventListener("popstate", () => { readURL(); filter(false); });
    readURL(); filter(false);
  }
  const reader = document.querySelector("[data-reading-text]");
  if (reader) {
    document.querySelector(".reading-controls").hidden = false;
    let size = 20;
    document.querySelectorAll("[data-reading-size]").forEach(button => button.addEventListener("click", () => {
      size = Math.max(18, Math.min(28, size + (button.dataset.readingSize === "larger" ? 2 : -2)));
      reader.style.setProperty("--reading-size", size + "px");
    }));
  }
})();
