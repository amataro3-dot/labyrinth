// 翻訳の足し忘れを見つける道具。labyrinth のフォルダで `node tools/check-i18n.mjs` と打つ。
// - main.js の T("…") の文が、i18n.js の辞書にあるか
// - main.js に、T() に入っていない日本語が残っていないか(Firebase のログに書く文は日本語のままでよいので除く)
// - index.html の日本語が、辞書にあるか
// - 辞書の英語・韓国語の {n} などが、日本語と同じか
// 何も出なければ OK。
import fs from "fs";

const src = fs.readFileSync("i18n.js", "utf8");
const body = src.slice(src.indexOf("const I18N = {") + "const I18N = ".length, src.indexOf("};", src.indexOf("const I18N = {")) + 1);
const I18N = Function("return " + body)();
const JP = /[぀-ヺー-ヿ一-鿿]/;
const problems = [];

// main.js: T( の中の文字(T(a?"…":"…") のような書き方も)を取り出す
const main = fs.readFileSync("main.js", "utf8");
let clean = main;
for (let i = main.indexOf("T("); i >= 0; i = main.indexOf("T(", i + 2)) {
  if (/[\w$.]/.test(main[i - 1] || "")) continue;
  let j = i + 2, d = 0, q = null;
  for (; j < main.length; j++) {          // 1つ目の引数の終わり(深さ0の , か ))まで
    const c = main[j];
    if (q) { if (c === "\\") j++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === "`") q = c;
    else if (c === "(" || c === "[" || c === "{") d++;
    else if (c === ")" || c === "]" || c === "}") { if (!d) break; d--; }
    else if (c === "," && !d) break;
  }
  const arg = main.slice(i + 2, j);
  for (const m of arg.matchAll(/"((?:[^"\\]|\\.)*)"/g)) if (JP.test(m[1]) && !I18N[m[1]]) problems.push(`main.js: 辞書にない: ${m[1]}`);
  clean = clean.replace(arg, arg.replace(/[^\x00-\x7f]/g, "_"));
}
clean.split("\n").forEach((line, i) => {
  if (line.includes('psh("log"') || line.includes("m:PN(u)+") || /^\s*\/\*/.test(line)) return;
  const rest = line.replace(/\/\*.*?\*\//g, "").replace(/\.match\(\/.*?\/u\)/g, "").replace(/"START\(出題者\)"/g, "");
  const left = rest.match(/[^\x00-\x7f]*[\u3040-\u30fa\u30fc-\u30ff\u4e00-\u9fff][^\x00-\x7f]*/g);
  if (left) problems.push(`main.js:${i + 1} T() に入っていない日本語: ${left.join(" | ")}`);
});
// index.html
const html = fs.readFileSync("index.html", "utf8").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/<title>[\s\S]*?<\/title>/, "");
const texts = [...html.matchAll(/>([^<>]+)</g)].map(m => m[1].trim()).concat([...html.matchAll(/placeholder="([^"]+)"/g)].map(m => m[1]));
texts.filter(t => JP.test(t) && t !== "・").forEach(t => { if (!I18N[t]) problems.push(`index.html: 辞書にない: ${t}`); });
// 辞書
const ph = s => (s.match(/\{\w+\}/g) || []).sort().join(",");
for (const [k, v] of Object.entries(I18N)) {
  if (!Array.isArray(v) || v.length !== 2 || !v[0] || !v[1]) { problems.push(`I18N["${k}"] は [英語, 韓国語] にする`); continue; }
  v.forEach((t, i) => { if (ph(t) !== ph(k)) problems.push(`I18N["${k}"] の${i ? "韓国語" : "英語"}の {…} が日本語とちがう`); });
}
if (problems.length) { console.log(problems.join("\n")); process.exit(1); }
console.log(`OK: 翻訳の足し忘れなし(${Object.keys(I18N).length} 文)`);
