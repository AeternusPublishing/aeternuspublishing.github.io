const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const root = path.resolve("public");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp", ".avif": "image/avif", ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2" };
http.createServer((req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    let file = path.resolve(root, "." + decodeURIComponent(url.pathname));
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) { res.writeHead(404).end("Not found"); return; }
    const compress = /\.(html|css|js|json|svg)$/.test(file) && /gzip/.test(req.headers["accept-encoding"] || "");
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-cache", ...(compress ? {"Content-Encoding": "gzip", "Vary": "Accept-Encoding"} : {}) });
    if (compress) fs.createReadStream(file).pipe(zlib.createGzip()).pipe(res);
    else fs.createReadStream(file).pipe(res);
  } catch { res.writeHead(400).end("Bad request"); }
}).listen(4173, "127.0.0.1", () => console.log("Preview: http://127.0.0.1:4173"));
