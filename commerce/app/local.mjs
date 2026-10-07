import {createServer} from 'node:http';
import {randomBytes} from 'node:crypto';
import {readFileSync,mkdirSync,existsSync} from 'node:fs';
import {join,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {database} from './local-db.mjs';
import {createService} from './service.mjs';

const port = Number(process.env.SHOP_PORT || 8093);
const origin = `http://127.0.0.1:${port}`;
const privateFolder = process.env.SHOP_DATA_DIR || join(process.env.LOCALAPPDATA || process.env.HOME,'AETERNUS','commerce-preview');
mkdirSync(privateFolder,{recursive:true});
const adminToken = process.env.ADMIN_TOKEN || randomBytes(32).toString('hex');
const env = {...process.env,MODE:process.env.MODE || 'simulation',ADMIN_TOKEN:adminToken,DB:database(join(privateFolder,'test-orders.sqlite'))};
const service = createService(env);
const publicFolder = resolve(fileURLToPath(new URL('./public/',import.meta.url)));
const root = resolve(publicFolder,'../../..');
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml'};
const server = createServer(async (req,res) => {
  try {
    // Reject DNS rebinding and untrusted Host headers even when the socket is loopback.
    if (req.headers.host !== `127.0.0.1:${port}`) {res.writeHead(403); res.end(); return;}
    let content;
    if (req.url.startsWith('/api/')) {
      const chunks=[]; let length=0;
      for await (const chunk of req) {length+=chunk.length; if(length>128000) {res.writeHead(413); res.end(); return;} chunks.push(chunk);}
      content = await service.route(new Request(origin+req.url,{method:req.method,headers:req.headers,...(req.method !== 'GET' && req.method !== 'HEAD' ? {body:Buffer.concat(chunks)} : {})}));
    } else {
      const url = new URL(req.url,origin);
      let path;
      if (['/','/shop/','/shop'].includes(url.pathname)) path=join(publicFolder,'index.html');
      else if (url.pathname === '/admin/' || url.pathname === '/admin') path=join(publicFolder,'admin.html');
      else if (url.pathname.startsWith('/assets/')) path=resolve(root,'src','.'+decodeURIComponent(url.pathname));
      else path=resolve(publicFolder,'.'+decodeURIComponent(url.pathname));
      const allowed = path.startsWith(publicFolder+sep) || path.startsWith(join(root,'src','assets')+sep);
      if (!allowed || !existsSync(path)) content=new Response('Not found',{status:404});
      else {
        let body=readFileSync(path);
        // Local authentication bootstrap stays in browser memory; never serialized into repository or URLs.
        if (url.pathname.startsWith('/admin')) body=Buffer.from(body.toString().replace('LOCAL_ADMIN_TOKEN',adminToken));
        content=new Response(body,{headers:{'Content-Type':mime[path.slice(path.lastIndexOf('.'))] || 'application/octet-stream'}});
      }
    }
    res.writeHead(content.status,{...Object.fromEntries(content.headers),'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',
      'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'none'"});
    res.end(Buffer.from(await content.arrayBuffer()));
  } catch {res.writeHead(500); res.end('Preview request failed');}
});
server.listen(port,'127.0.0.1',()=>console.log(`AETERNUS ${env.MODE} preview: ${origin}/shop/ | Verwaltung: ${origin}/admin/ | private data: ${privateFolder}`));
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(()=>{env.DB.close(); process.exit(0);}));
