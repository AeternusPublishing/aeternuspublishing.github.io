// Verify Cloudflare Access JWT cryptographically, rather than trusting a forwarded header.
export async function verifyAccess(token, env, fetcher = fetch) {
  if (!token || !/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_ISSUER || '') || !env.ACCESS_AUDIENCE) return false;
  try {
    const [header,payload,signature,...extra] = token.split('.');
    if (extra.length || !signature || token.length > 16000) return false;
    const decode = s => Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
    const h=JSON.parse(new TextDecoder().decode(decode(header)));
    const p=JSON.parse(new TextDecoder().decode(decode(payload)));
    const time=Date.now()/1000;
    if (h.alg !== 'RS256' || p.iss !== env.ACCESS_ISSUER || !Array.isArray(p.aud) || !p.aud.includes(env.ACCESS_AUDIENCE) || !Number.isFinite(p.exp) || p.exp <= time || !Number.isFinite(p.iat) || p.iat > time+60 || (p.nbf && p.nbf > time+60)) return false;
    const response=await fetcher(`${env.ACCESS_ISSUER}/cdn-cgi/access/certs`,{signal:AbortSignal.timeout(10000)});
    if (!response.ok) return false;
    const jwks=await response.json();const jwk=jwks.keys?.find(k=>k.kid===h.kid && k.kty==='RSA');
    if (!jwk) return false;
    const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
    return crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode(signature),new TextEncoder().encode(`${header}.${payload}`));
  } catch {return false;}
}
