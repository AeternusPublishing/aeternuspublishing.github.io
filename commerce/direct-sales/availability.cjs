const launch = require('./launch.json');

const REQUIRED_GATES = Object.freeze([
  'seller_price_from_bookregister',
  'lulu_profile_print_ready',
  'physical_sample_approved',
  'stripe_test_checkout_passed',
  'lulu_sandbox_fulfillment_passed',
  'legal_tax_approved',
  'publisher_live_release'
]);

function directSalesUrl(book, settings = launch) {
  if (!settings?.enabled || !settings.api_origin || !Array.isArray(settings.approved_work_ids)) return null;
  if (!REQUIRED_GATES.every(gate => settings.gates?.[gate] === true)) return null;
  if (!book?.work_id || !settings.approved_work_ids.includes(book.work_id)) return null;
  if (book.availability !== 'AVAILABLE') return null;
  let origin;
  try { origin = new URL(settings.api_origin); } catch { return null; }
  if (origin.protocol !== 'https:' || origin.username || origin.password || origin.search || origin.hash || origin.pathname !== '/') return null;
  return new URL(`/books/${encodeURIComponent(book.work_id)}`, origin).href;
}

module.exports = { REQUIRED_GATES, directSalesUrl };
