import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assess} from '../preflight.mjs';
import {inspectOrders} from '../monitor.mjs';
import {productFindings} from '../product-check.mjs';

test('missing interior cannot be approved just by setting a catalog flag',()=>{
  const item={approved:true,pages:32,package:'fixture',prices:{EUR:100},print_assets:{cover:{url:'https://example.invalid/cover.pdf',sha256:'a'.repeat(64)}}};
  assert.deepEqual(productFindings(item,'EUR'),['INTERIOR_EVIDENCE_MISSING']);
  const result=assess({pilot_skus:['fixture'],initial_currency:'EUR',pilot_selection_status:'APPROVED',requirements:[],live_enabled:true},{items:[{sku:'fixture',...item}]});
  assert.equal(result.ready,false);
});
test('machine report rejects unbound approval and missing pilot products',()=>{
  const result=assess({pilot_skus:[],initial_currency:'EUR',requirements:[{id:'legal',status:'VERIFIED',evidence:null}],live_enabled:false},{items:[]});
  assert.equal(result.ready,false);
  assert.ok(result.findings.some(f=>f.id==='legal'));
  assert.ok(result.findings.some(f=>f.code==='NO_PILOT_PRODUCTS'));
});
test('monitor identifies unpaid Lulu job and unresolved refund without personal data',()=>{
  const alerts=inspectOrders([{id:'order',status:'PRINT_SUBMITTED',created:'2026-10-07',refunded:0,data:JSON.stringify({lulu_status:'UNPAID',email:'private@example.invalid'})}],
    [{id:'refund',order_id:'order',kind:'REFUND_PENDING',data:'{"amount":100}'}],Date.parse('2026-10-08'));
  assert.equal(alerts.length,2);
  assert.ok(alerts.some(a=>a.code==='LULU_PAYMENT_REQUIRED'));
  assert.ok(!JSON.stringify(alerts).includes('private'));
});
