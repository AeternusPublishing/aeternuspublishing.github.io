export function productFindings(item,currency) {
  const problems=[];
  if(item.approved!==true)problems.push('PRODUCT_NOT_APPROVED');
  if(!Number.isInteger(item.pages)||item.pages<2)problems.push('PAGE_COUNT_MISSING');
  if(typeof item.package!=='string'||!item.package)problems.push('LULU_PROFILE_MISSING');
  if(!Number.isSafeInteger(item.prices?.[currency])||item.prices[currency]<=0)problems.push('PRICE_MISSING');
  for(const name of ['cover','interior']) {
    const asset=item.print_assets?.[name];
    if(!asset || !/^https:\/\//.test(asset.url||'') || !/^[a-f0-9]{64}$/.test(asset.sha256||''))
      problems.push(`${name.toUpperCase()}_EVIDENCE_MISSING`);
  }
  return problems;
}
