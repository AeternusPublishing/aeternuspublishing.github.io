export function renderMessage(order,kind,details) {
  const english=order.data.language==='en';
  const reference=order.id.slice(0,8).toUpperCase();
  const amounts=new Intl.NumberFormat(english?'en':'de',{style:'currency',currency:order.data.currency});
  const titles={
    ORDER_RECEIPT:english?'Your AETERNUS test order':'Ihre AETERNUS-Testbestellung',
    FULFILLMENT_UPDATE:english?'Update on your test order':'Neues zu Ihrer Testbestellung',
    WITHDRAWAL_RECEIPT:english?'Withdrawal received':'Widerruf eingegangen',
    REFUND_RECEIPT:english?'Test refund recorded':'Testerstattung erfasst'
  };
  const lines=[english?'Hello,':'Guten Tag,','',`${titles[kind]} · ${reference}`];
  if(kind==='ORDER_RECEIPT') {
    for(const item of order.data.items)lines.push(`${item.quantity} × ${item.title} · ${item.format}`);
    lines.push(`${english?'Total':'Gesamt'}: ${amounts.format(order.data.total/100)}`);
  }
  if(kind==='FULFILLMENT_UPDATE')lines.push(`${english?'Status':'Stand'}: ${details.status}`);
  if(kind==='WITHDRAWAL_RECEIPT')lines.push(`${english?'Received':'Eingang'}: ${details.received}`,`${english?'Reference':'Vorgang'}: ${details.request_id}`);
  if(kind==='REFUND_RECEIPT')lines.push(`${english?'Amount':'Betrag'}: ${amounts.format(details.amount/100)}`,`${english?'Provider status':'Anbieterstand'}: ${details.provider_status}`);
  lines.push('',english?'TEST MODE: no real payment, production or shipment.':'TESTBETRIEB: keine echte Zahlung, Produktion oder Lieferung.','AETERNUS');
  return {subject:`[TEST] ${titles[kind]} ${reference}`,text:lines.join('\n'),details};
}
