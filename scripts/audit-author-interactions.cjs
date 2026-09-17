async page => {
  const base = 'http://127.0.0.1:4173';
  const xml = await (await page.request.get(base + '/sitemap.xml')).text();
  const routes = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].replace(/^https?:\/\/[^/]+/, '')).filter(p => /^\/(autoren|en\/authors|es\/autores|pl\/autorzy)\//.test(p));
  const findings = [];
  let dialogs = 0, links = 0;
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      await page.goto(base + route);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const order = await page.evaluate(() => {
        const sections = [...document.querySelectorAll('main > section')];
        const hero = sections.find(el => el.classList.contains('hero'));
        const works = sections.find(el => el.classList.contains('works'));
        const bio = sections.find(el => el.classList.contains('biography'));
        return sections[0] === hero && sections[1] === works && sections.at(-1) === bio && Math.abs(hero.getBoundingClientRect().bottom - works.getBoundingClientRect().top) < 2 && bio.getBoundingClientRect().top >= works.getBoundingClientRect().bottom;
      });
      if (!order) findings.push({ route, width, type:'incorrect-section-order' });
      const anchors = page.locator('a.cover-button');
      links += await anchors.count();
      const buttons = page.locator('button.cover-button');
      for (let i = 0; i < await buttons.count(); i++) {
        await buttons.nth(i).click();
        await page.locator('.modal.is-open').waitFor();
        const problems = await page.locator('.modal').evaluate(el => {
          const problems = [];
          for (const target of el.querySelectorAll('h3,p,.status-line,.amazon-button')) {
            if (!target.getClientRects().length || getComputedStyle(target).visibility !== 'visible') continue;
            if (/\uFFFD|\bundefined\b|&(?:amp|auml|ouml|uuml|nbsp|#\d+);|<\/?(?:i|em|br)>/.test(target.innerText)) problems.push({ type: 'modal-broken-text', text: target.innerText });
            if (target.scrollWidth > target.clientWidth + 2) problems.push({ type: 'modal-overflow', text: target.innerText.slice(0, 100) });
          }
          return problems;
        });
        findings.push(...problems.map(p => ({ route, width, index: i, ...p })));
        await page.keyboard.press('Escape');
        if (!await buttons.nth(i).evaluate(el => el === document.activeElement)) findings.push({ route, width, index:i, type:'focus-not-restored' });
        dialogs++;
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + '/autoren/johanna-spyri/');
  await page.locator('#werke').scrollIntoViewIfNeeded();
  await page.locator('#werke img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
  await page.evaluate(() => document.activeElement.blur());
  await page.locator('#werke').screenshot({ path: 'output/playwright/heidi-works-corrected.png' });
  await page.setViewportSize({ width: 768, height: 1000 });
  await page.goto(base + '/bernstein-maerchen/');
  await page.locator('.fairy-book').scrollIntoViewIfNeeded();
  await page.locator('.fairy-book img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
  await page.locator('.fairy-book').screenshot({ path: 'output/playwright/grimm-tablet-corrected.png' });
  return {authorPages:routes.length, dialogs, links, findings};
}
