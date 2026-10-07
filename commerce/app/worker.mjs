import {createService} from './service.mjs';
import {verifyAccess} from './access.mjs';
export default {
  async scheduled(_controller,env,ctx) {
    if(env.MODE==='sandbox' && env.AUTO_FULFILLMENT==='true' && env.PRIVATE_DEPLOYMENT_VERIFIED==='true')ctx.waitUntil(createService(env).processQueue());
  },
  async fetch(request,env) {
    if (env.MODE !== 'sandbox') return new Response('Sandbox configuration required',{status:503});
    if (!env.ACCESS_AUDIENCE || !env.ADMIN_TOKEN) return new Response('Private access configuration required',{status:503});
    if (env.PRIVATE_DEPLOYMENT_VERIFIED !== 'true') return new Response('Private deployment not provisioned',{status:503});
    const path=new URL(request.url).pathname;
    // Only the signed Stripe endpoint bypasses Access; it authenticates the raw body itself.
    if (path !== '/api/webhooks/stripe' && !await verifyAccess(request.headers.get('Cf-Access-Jwt-Assertion'),env)) return new Response('Private access required',{status:401});
    const response=path.startsWith('/api/') ? await createService(env).route(request) : await env.ASSETS.fetch(request);
    const headers=new Headers(response.headers);
    headers.set('Cache-Control','no-store'); headers.set('X-Robots-Tag','noindex, nofollow');
    headers.set('X-Content-Type-Options','nosniff'); headers.set('Referrer-Policy','no-referrer');
    headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'none'");
    return new Response(response.body,{status:response.status,headers});
  }
};
