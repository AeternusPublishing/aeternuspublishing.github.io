// Run with playwright-cli run-code --filename=scripts/audit-text-browser.cjs.
// Read-only browser audit: all sitemap pages at desktop, tablet and mobile widths.
async page => {
  const base = 'http://127.0.0.1:4173';
  const sitemap = await (await page.request.get(base + '/sitemap.xml')).text();
  const routes = [...new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].replace(/^https?:\/\/[^/]+/, '')))];
  const results = [];
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      const response = await page.goto(base + route, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => Promise.all(document.getAnimations().map(a => a.finish())));
      const issues = await page.evaluate(() => {
        const issues = [];
        const visible = el => el.getClientRects().length && getComputedStyle(el).visibility === 'visible' && !el.closest('[aria-hidden="true"]');
        const name = el => el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).trim().replace(/\s+/g, '.') : '');
        for (const el of document.querySelectorAll('.cover-button')) {
          const s = getComputedStyle(el);
          if (s.textDecorationLine !== 'none') issues.push({ type: 'card-underline', element: name(el), text: el.innerText.slice(0, 100) });
          if (s.fontFamily !== getComputedStyle(document.body).fontFamily) issues.push({ type: 'card-font', element: name(el), font: s.fontFamily });
        }
        if (document.documentElement.scrollWidth > innerWidth + 2) issues.push({ type: 'page-overflow', pixels: document.documentElement.scrollWidth - innerWidth });
        for (const el of document.querySelectorAll('h1,h2,h3,p,.book-meta,.book-subtitle,.details-label,.primary-cta,.text-link')) {
          if (!visible(el)) continue;
          const t = el.textContent.trim();
          if (/\uFFFD|Ã[\u0080-\u00BF]|Â[\u0080-\u00BF]|â€|\bundefined\b|\bNaN\b|\{\{|\{%|&(?:amp|nbsp|auml|ouml|uuml|quot|#\d+);/.test(t)) issues.push({ type: 'broken-text', element: name(el), text: t.slice(0, 180) });
          const r = document.createRange(); r.selectNodeContents(el);
          const rects = [...r.getClientRects()].filter(r => r.width && r.height);
          for (const rect of rects) {
            if (rect.left < -2 || rect.right > innerWidth + 2) { issues.push({type:'text-outside-viewport',element:name(el),text:t.slice(0,100)}); break; }
            let parent = el;
            let clipped = false;
            while (parent && parent !== document.body) {
              const s = getComputedStyle(parent), box = parent.getBoundingClientRect();
              if ((['hidden','clip'].includes(s.overflowX) && (rect.left < box.left - 2 || rect.right > box.right + 2)) || (['hidden','clip'].includes(s.overflowY) && (rect.top < box.top - 3 || rect.bottom > box.bottom + 3))) { clipped = true; break; }
              parent = parent.parentElement;
            }
            if (clipped) { issues.push({type:'clipped-text',element:name(el),text:t.slice(0,100)}); break; }
          }
        }
        return issues;
      });
      results.push({ route, width, status: response.status(), issues });
    }
  }
  return { pages: routes.length, checks: results.length, findings: results.filter(r => r.status !== 200 || r.issues.length) };
}
