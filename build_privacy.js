// 把 上架管理\隱私權政策\*.md 轉成網站用的 privacy.html
// 用法：node build_privacy.js <來源.md> <輸出.html> <頁面標題> [跳過第一條 --- 之前的說明: skip]
// 沒有裝任何套件，只處理政策檔會用到的 Markdown 子集：標題、表格、粗體、清單、網址、分隔線
const fs = require("fs");
const [,, src, out, title, mode] = process.argv;
let md = fs.readFileSync(src, "utf8").replace(/\r\n/g, "\n");
if (mode === "skip") {
  const i = md.indexOf("\n---\n");
  if (i >= 0) md = "# " + title + "\n" + md.slice(i + 5);
}
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = s => {
  s = esc(s);
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(https?:\/\/[^\s<）)]+)/g, '<a href="$1">$1</a>');
  s = s.replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, '<a href="mailto:$1">$1</a>');
  return s;
};
const lines = md.split("\n");
const html = [];
let i = 0, para = [], list = null;
const flushPara = () => { if (para.length) { html.push("<p>" + para.map(inline).join("<br>") + "</p>"); para = []; } };
const flushList = () => { if (list) { html.push("<ul>" + list.map(x => "<li>" + inline(x) + "</li>").join("") + "</ul>"); list = null; } };
while (i < lines.length) {
  const l = lines[i];
  if (/^\|/.test(l)) {
    flushPara(); flushList();
    const rows = [];
    while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; }
    const cells = r => r.replace(/^\||\|$/g, "").split("|").map(c => c.trim());
    const head = cells(rows[0]);
    const body = rows.slice(2).map(cells);
    html.push("<table><thead><tr>" + head.map(c => "<th>" + inline(c) + "</th>").join("") + "</tr></thead><tbody>" +
      body.map(r => "<tr>" + r.map(c => "<td>" + inline(c) + "</td>").join("") + "</tr>").join("") + "</tbody></table>");
    continue;
  }
  let m;
  if ((m = /^(#{1,3}) (.+)$/.exec(l))) {
    flushPara(); flushList();
    const lv = m[1].length;
    if (lv === 1) html.push("<h1>" + inline(m[2]) + "</h1>");
    else html.push(`<h${lv}>` + inline(m[2]) + `</h${lv}>`);
  } else if (/^---+$/.test(l)) {
    flushPara(); flushList(); html.push('<hr class="ink">');
  } else if ((m = /^[-*] (.+)$/.exec(l))) {
    flushPara(); if (!list) list = []; list.push(m[1]);
  } else if (/^\s*$/.test(l)) {
    flushPara(); flushList();
  } else {
    flushList(); para.push(l);
  }
  i++;
}
flushPara(); flushList();
const page = `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<link rel="icon" href="../assets/zhiqiwending.png">
<link rel="stylesheet" href="../assets/site.css">
</head>
<body>
<div class="wrap">
<nav class="top"><a href="../">← 皞界 HAOWORLD GAMES</a></nav>
${html.join("\n")}
<footer>© 2026 皞界 HAOWORLD GAMES · <a href="../">首頁</a></footer>
</div>
</body>
</html>
`;
fs.writeFileSync(out, page, "utf8");
console.log("寫出", out, html.length, "段");
