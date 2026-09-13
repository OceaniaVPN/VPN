import { getConfig } from "./config.js";
import { handleUpdate } from "./bot/handlers.js";
import { initDatabase } from "./database/init.js";
import { generateJsonSubscription } from "./json-generator.js";

const SUBSCRIPTIONS = {
  vip: {
    title: "GRN VPN VIP",
    source: "https://github.com/lsncococososo-rgb/GRN_VPN/raw/refs/heads/main/Vip.txt"
  },
  bs: {
    title: "GRN VPN ОБХОД БС",
    source: "https://github.com/lsncococososo-rgb/GRN_VPN/raw/refs/heads/main/%D0%9E%D0%B1%D1%85%D0%BE%D0%B4%20%D0%B1%D1%81"
  }
};

const APP_ICONS = {
  happ: "https://raw.githubusercontent.com/OceaniaVPN/VPN/main/icon/happ.png",
  incy: "https://raw.githubusercontent.com/OceaniaVPN/VPN/main/icon/INCY.png",
  v2raytun: "https://raw.githubusercontent.com/OceaniaVPN/VPN/main/icon/v2raytun.png"
};

function pageHtml(origin, plan) {
  const selected = SUBSCRIPTIONS[plan] || SUBSCRIPTIONS.vip;
  const subUrl = `${origin}/sub/${plan}`;
  const happ = `happ://add/${subUrl}`;
  const incy = `incy://import/${subUrl}`;
  const v2raytun = `v2raytun://import/${subUrl}`;

  return `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#071b14"><title>${selected.title} • GRN VPN</title><style>
:root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}*{box-sizing:border-box}html{min-height:100%}body{margin:0;min-height:100vh;color:#fff;display:flex;justify-content:center;align-items:center;overflow-x:hidden;padding:max(22px,env(safe-area-inset-top)) 16px max(30px,env(safe-area-inset-bottom));background:radial-gradient(circle at 12% 12%,rgba(78,255,164,.26),transparent 31%),radial-gradient(circle at 88% 18%,rgba(40,182,255,.20),transparent 28%),radial-gradient(circle at 50% 92%,rgba(119,77,255,.22),transparent 34%),linear-gradient(135deg,#03110c 0%,#083b2a 45%,#061d32 100%);background-size:150% 150%;animation:gradientMove 14s ease-in-out infinite alternate}body:before,body:after{content:"";position:fixed;width:280px;height:280px;border-radius:50%;filter:blur(70px);opacity:.22;pointer-events:none}body:before{top:-120px;left:-80px;background:#43ffae}body:after{right:-100px;bottom:-130px;background:#6e67ff}@keyframes gradientMove{0%{background-position:0% 20%}100%{background-position:100% 80%}}.wrap{position:relative;width:min(520px,100%);z-index:1}.glass{position:relative;overflow:hidden;padding:28px;border:1px solid rgba(255,255,255,.16);border-radius:32px;background:linear-gradient(145deg,rgba(255,255,255,.13),rgba(255,255,255,.045));box-shadow:0 30px 90px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.12);backdrop-filter:blur(24px) saturate(130%);-webkit-backdrop-filter:blur(24px) saturate(130%)}.glass:before{content:"";position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.12),transparent 30%,transparent 70%,rgba(120,255,190,.06));pointer-events:none}.content{position:relative}.brand{display:inline-flex;align-items:center;gap:8px;color:#baffd6;font-size:12px;font-weight:850;letter-spacing:.18em;text-transform:uppercase}.brand-dot{width:8px;height:8px;border-radius:50%;background:#9dffc4;box-shadow:0 0 18px rgba(120,255,181,.9)}h1{margin:14px 0 7px;font-size:clamp(31px,8vw,43px);line-height:.98;letter-spacing:-.045em}.sub{margin:0;color:rgba(235,255,243,.78);font-size:15px;line-height:1.55}.plan{display:inline-flex;margin-top:18px;padding:8px 12px;border:1px solid rgba(184,255,207,.18);border-radius:999px;color:#d7ffe4;background:rgba(115,255,174,.08);font-size:12px;font-weight:750}.grid{display:grid;gap:11px;margin-top:24px}a.btn{position:relative;display:flex;align-items:center;gap:14px;min-height:68px;padding:13px 16px;color:#fff;text-decoration:none;border:1px solid rgba(255,255,255,.12);border-radius:20px;background:rgba(255,255,255,.075);box-shadow:inset 0 1px 0 rgba(255,255,255,.06);transition:transform .18s ease,background .18s ease,border-color .18s ease,box-shadow .18s ease;-webkit-tap-highlight-color:transparent}a.btn:hover{transform:translateY(-2px);background:rgba(255,255,255,.12);border-color:rgba(190,255,214,.25);box-shadow:0 12px 28px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.08)}a.btn:active{transform:translateY(0) scale(.985)}.icon{display:grid;place-items:center;flex:0 0 42px;width:42px;height:42px;padding:4px;overflow:hidden;border-radius:14px;background:rgba(184,255,207,.11);border:1px solid rgba(184,255,207,.12)}.icon img{display:block;width:100%;height:100%;object-fit:contain;border-radius:10px}.text{min-width:0;flex:1}.name{display:block;font-size:16px;font-weight:800;letter-spacing:-.01em}.arrow{color:rgba(220,255,232,.55);font-size:21px;transition:transform .18s ease,color .18s ease}a.btn:hover .arrow{color:#c3ffda;transform:translateX(3px)}a.btn.primary{color:#062014;border-color:rgba(220,255,232,.5);background:linear-gradient(135deg,#baffd1,#76f6ae);box-shadow:0 12px 32px rgba(55,255,157,.18),inset 0 1px 0 rgba(255,255,255,.45)}a.btn.primary .icon{background:rgba(0,70,37,.10);border-color:rgba(0,70,37,.10)}a.btn.primary .arrow{color:rgba(4,45,27,.65)}.back{display:block;margin-top:18px;padding:9px;color:rgba(205,255,220,.72);text-align:center;text-decoration:none;font-size:13px;transition:color .18s ease}.back:hover{color:#fff}.footer{margin-top:17px;color:rgba(210,238,220,.42);text-align:center;font-size:11px;letter-spacing:.02em}@media(max-width:480px){body{align-items:flex-start;padding-top:max(14px,env(safe-area-inset-top))}.glass{padding:23px 18px 19px;border-radius:27px}h1{margin-top:12px}.grid{margin-top:20px}a.btn{min-height:64px;border-radius:18px}}@media(prefers-reduced-motion:reduce){body{animation:none}a.btn,.arrow{transition:none}}
</style></head><body><main class="wrap"><section class="glass"><div class="content"><div class="brand"><span class="brand-dot"></span> GRN VPN</div><h1>Подключение</h1><p class="sub">Выберите приложение, в котором хотите использовать подписку.</p><div class="plan">${selected.title}</div><div class="grid"><a class="btn primary" href="${happ}"><span class="icon"><img src="/icon/happ.png" alt="Happ"></span><span class="text"><span class="name">Happ</span></span><span class="arrow">›</span></a><a class="btn" href="${incy}"><span class="icon"><img src="/icon/INCY.png" alt="Incy"></span><span class="text"><span class="name">Incy</span></span><span class="arrow">›</span></a><a class="btn" href="${v2raytun}"><span class="icon"><img src="/icon/v2raytun.png" alt="v2RayTun"></span><span class="text"><span class="name">v2RayTun</span></span><span class="arrow">›</span></a></div><a class="back" href="${origin}/connect">← Вернуться к выбору режима</a><div class="footer">GRN VPN • защищённое подключение</div></div></section></main></body></html>`;
}

async function iconResponse(name) {
  const source = APP_ICONS[name];
  if (!source) return new Response("Not Found", { status: 404 });
  const upstream = await fetch(source, { headers: { "User-Agent": "GRN-VPN-Worker/1.0" } });
  if (!upstream.ok) return new Response("Icon unavailable", { status: 502 });
  const contentType = upstream.headers.get("content-type") || "image/png";
  return new Response(upstream.body, { headers: { "content-type": contentType, "cache-control": "public, max-age=86400, s-maxage=604800, immutable" } });
}

async function subscriptionResponse(request, plan) {
  const selected = SUBSCRIPTIONS[plan];
  if (!selected) return new Response("Unknown subscription", { status: 404 });
  const cache = caches.default;
  const cacheKey = new Request(new URL(`/sub/${plan}`, request.url).toString(), request);
  let cached = await cache.match(cacheKey);
  if (cached) return cached;
  const upstream = await fetch(selected.source, { headers: { "User-Agent": "GRN-VPN-Worker/1.0" } });
  if (!upstream.ok) return new Response("Subscription source unavailable", { status: 502 });
  const sourceText = await upstream.text();
  // Upstream may be VLESS text with Clash/Hiddify metadata or already JSON.
  // /sub/* always returns JSON, while /sub/*/metadata returns the metadata separately.
  const stripped = sourceText
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("#"))
    .join("\n")
    .trim();

  let json;
  try {
    JSON.parse(stripped);
    json = stripped;
  } catch {
    try {
      json = generateJsonSubscription(stripped);
      JSON.parse(json);
    } catch (error) {
      console.error("Subscription conversion error", error);
      return new Response("Subscription source could not be converted to JSON", { status: 502 });
    }
  }
  const response = new Response(json + "\n", { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=3600, s-maxage=3600" } });
  await cache.put(cacheKey, response.clone());
  return response;
}

function subscriptionMetadata(plan) {
  if (!SUBSCRIPTIONS[plan]) return new Response("Unknown subscription", { status: 404 });
  const metadata = [
    "#profile-title: GRN_VPN",
    "#profile-update-interval: 2",
    "#support-url: https://t.me/info_Grina",
    "#announce: VPN не гарантирует работоспособность владелец - @apruxx",
    "#subscription-userinfo: upload=0; download=0; total=107374292918240; expire=0"
  ].join("\n");
  return new Response(metadata + "\n", { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600, s-maxage=3600" } });
}

export default {
  async fetch(request, env) {
    const cfg = getConfig(env);
    const url = new URL(request.url);
    if (url.pathname === "/health") return Response.json({ ok: true, service: "oceaniavpn-bot" });
    if (url.pathname === "/") return new Response("Oceania VPN bot is running", { headers: { "content-type": "text/plain;charset=utf-8" } });
    if (url.pathname === "/connect" && request.method === "GET") {
      const plan = (url.searchParams.get("plan") || "vip").toLowerCase();
      return new Response(pageHtml(url.origin, SUBSCRIPTIONS[plan] ? plan : "vip"), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    }
    const iconMatch = url.pathname.match(/^\/icon\/(happ|INCY|v2raytun)\.png$/i);
    if (iconMatch && request.method === "GET") return iconResponse(iconMatch[1].toLowerCase());
    const metadataMatch = url.pathname.match(/^\/sub\/(vip|bs)\/metadata$/i);
    if (metadataMatch && request.method === "GET") return subscriptionMetadata(metadataMatch[1].toLowerCase());
    const subMatch = url.pathname.match(/^\/sub\/(vip|bs)$/i);
    if (subMatch && request.method === "GET") return subscriptionResponse(request, subMatch[1].toLowerCase());
    if (url.pathname === "/telegram/webhook" && request.method === "POST") {
      try { const update = await request.json(); await initDatabase(cfg.db); await handleUpdate(cfg, update); return new Response("ok"); }
      catch (error) { console.error("Webhook error", error); return new Response("ok"); }
    }
    return new Response("Not Found", { status: 404 });
  }
};
