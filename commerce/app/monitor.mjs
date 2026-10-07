// Read-only local operational snapshot. No addresses, customer emails or secrets in output.
import {DatabaseSync} from 'node:sqlite';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
export function inspectOrders(orders,requests,time=Date.now()) {
  const alerts=[];
  for(const order of orders) {
    const data=JSON.parse(order.data);
    const age=time-Date.parse(order.created);
    const add=code=>alerts.push({order_id:order.id,status:order.status,code});
    if(['SUBMISSION_UNKNOWN','SUBMITTING','REFUND_PENDING'].includes(order.status))add('MANUAL_RECONCILIATION');
    if(order.status==='PAYMENT_PENDING'&&age>86400000)add('PAYMENT_STALE_REVIEW');
    if(order.status==='PAID'&&(order.refunded || requests.some(r=>r.order_id===order.id&&r.kind==='WITHDRAWAL')))add('FULFILLMENT_HOLD');
    if(data.lulu_status==='UNPAID')add('LULU_PAYMENT_REQUIRED');
    if(['PRINT_SUBMITTED','IN_PRODUCTION'].includes(order.status)&&age>7*86400000)add('FULFILLMENT_DELAY_REVIEW');
  }
  for(const request of requests)if(['REFUND_PENDING','REFUND_RECORDED'].includes(request.kind)) {
    const data=JSON.parse(request.data);
    if(!data.provider || data.provider.status!=='succeeded')alerts.push({order_id:request.order_id,request_id:request.id,code:'REFUND_PROVIDER_RECONCILIATION'});
  }
  return alerts;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]) {
  const folder=process.env.SHOP_DATA_DIR || join(process.env.LOCALAPPDATA || process.env.HOME,'AETERNUS','commerce-preview');
  let db;
  try {
    db=new DatabaseSync(join(folder,'test-orders.sqlite'),{readOnly:true});
    const orders=db.prepare('SELECT id,status,created,data,refunded FROM orders').all();
    const requests=db.prepare('SELECT id,order_id,kind,data FROM requests').all();
    const alerts=inspectOrders(orders,requests);
    const report={schema_version:1,checked_at:new Date().toISOString(),database_integrity:db.prepare('PRAGMA integrity_check').get().integrity_check,
      order_count:orders.length,status_counts:orders.reduce((sum,o)=>(sum[o.status]=(sum[o.status]||0)+1,sum),{}),
      outbox_unsent:db.prepare("SELECT count(*) AS n FROM outbox WHERE status <> 'SENT'").get().n,alerts,
      mode:'LOCAL_TEST_ONLY',side_effects:false};
    console.log(JSON.stringify(report,null,2));
    if(report.database_integrity!=='ok'||alerts.length)process.exitCode=2;
  }catch {console.error('Local test database unavailable or invalid; no changes made');process.exitCode=2;}
  finally {db?.close();}
}
