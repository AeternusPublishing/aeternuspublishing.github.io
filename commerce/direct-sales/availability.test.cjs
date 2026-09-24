const assert = require('node:assert/strict');
const test = require('node:test');
const { REQUIRED_GATES, directSalesUrl } = require('./availability.cjs');
const launch = require('./launch.json');

const book = { work_id: 'CBB_001', availability: 'AVAILABLE' };
const ready = () => ({
  enabled: true,
  api_origin: 'https://shop.aeternuspublishing.com/',
  approved_work_ids: ['CBB_001'],
  gates: Object.fromEntries(REQUIRED_GATES.map(key => [key, true]))
});

test('the committed configuration never exposes a buy link', () => {
  assert.equal(directSalesUrl(book, launch), null);
});

test('each missing gate blocks the buy link', () => {
  for (const gate of REQUIRED_GATES) {
    const settings = ready();
    settings.gates[gate] = false;
    assert.equal(directSalesUrl(book, settings), null, gate);
    delete settings.gates[gate];
    assert.equal(directSalesUrl(book, settings), null, gate);
  }
});

test('unknown book, unavailable book or unsafe origin blocks the link', () => {
  const settings = ready();
  assert.equal(directSalesUrl({ ...book, work_id: 'UNKNOWN' }, settings), null);
  assert.equal(directSalesUrl({ ...book, availability: 'COMING_SOON' }, settings), null);
  settings.api_origin = 'http://shop.aeternuspublishing.com/';
  assert.equal(directSalesUrl(book, settings), null);
});

test('a fully authorized configuration produces only the approved route', () => {
  assert.equal(directSalesUrl(book, ready()), 'https://shop.aeternuspublishing.com/books/CBB_001');
});
