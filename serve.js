// 本機預覽用：node serve.js → http://localhost:8765
const http = require("http"), fs = require("fs"), path = require("path");
const root = __dirname;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".png": "image/png", ".js": "text/javascript" };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const f = path.join(root, p);
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "Content-Type": types[path.extname(f)] || "application/octet-stream" });
    res.end(d);
  });
}).listen(8765, () => console.log("http://localhost:8765"));
