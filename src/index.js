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

const SUBSCRIPTION_METADATA = {
  "profile-title": "GRN_VPN",
  "profile-update-interval": "2",
  "support-url": "https://t.me/info_Grina",
  "announce": "VPN не гарантирует работа способность владелец - @apruxx",
  "subscription-userinfo": "upload=0; download=0; total=107374292918240; expire=0"
};

const SUBSCRIPTION_METADATA_BODY = Object.entries(SUBSCRIPTION_METADATA)
  .map(([key, value]) => `#${key}: ${value}`)
  .join("\n");

function metadataHeaders(origin) {
  return {
    "profile-title": SUBSCRIPTION_METADATA["profile-title"],
    "profile-update-interval": SUBSCRIPTION_METADATA["profile-update-interval"],
    "support-url": SUBSCRIPTION_METADATA["support-url"],
    "announce": SUBSCRIPTION_METADATA.announce,
    "subscription-userinfo": SUBSCRIPTION_METADATA["subscription-userinfo"],
    "profile-web-page-url": `${origin}/connect`
  };
}

function pageHtml(origin, plan) {
  const selected = SUBSCRIPTIONS[plan] || SUBSCRIPTIONS.vip;
  const subUrl = `${origin}/sub/${plan}`;
  const happ = `happ://add/${subUrl}`;
  const incy = `incy://import/${subUrl}`;
  const v2raytun = `v2raytun://import/${subUrl}`;

  return `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#071b14"><title>${selected.title} • GRN VPN</title><style>
:root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}*{box-sizing:border-box}html{min-height:100%}body{margin:0;min-height:100vh;color:#fff;display:flex;justify-content:center;align-items:center;overflow-x:hidden;padding:max(22px,env(safe-area-inset-top)) 16px max(30px,env(safe-area-inset-bottom));background:radial-gradient(circle at 10% 8%,rgba(91,255,175,.27),transparent 30%),radial-gradient(circle at 92% 14%,rgba(50,191,255,.18),transparent 28%),radial-gradient(circle at 48% 100%,rgba(126,82,255,.2),transparent 35%),linear-gradient(135deg,#03110c 0%,#083b2a 44%,#061c30 100%);background-size:150% 150%;animation:gradientMove 14s ease-in-out infinite alternate}body:before,body:after{content:"";position:fixed;width:300px;height:300px;border-radius:50%;filter:blur(75px);opacity:.22;pointer-events:none}body:before{top:-130px;left:-90px;background:#43ffae}body:after{right:-110px;bottom:-140px;background:#6e67ff}@keyframes gradientMove{0%{background-position:0% 20%}100%{background-position:100% 80%}}.wrap{position:relative;width:min(540px,100%);z-index:1}.glass{position:relative;overflow:hidden;padding:30px;border:1px solid rgba(255,255,255,.17);border-radius:34px;background:linear-gradient(145deg,rgba(255,255,255,.14),rgba(255,255,255,.045));box-shadow:0 32px 100px rgba(0,0,0,.44),inset 0 1px 0 rgba(255,255,255,.14);backdrop-filter:blur(26px) saturate(135%);-webkit-backdrop-filter:blur(26px) saturate(135%)}.glass:before{content:"";position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.13),transparent 28%,transparent 72%,rgba(120,255,190,.07));pointer-events:none}.content{position:relative}.topline{display:flex;align-items:center;justify-content:space-between;gap:12px}.brand{display:inline-flex;align-items:center;gap:8px;color:#baffd6;font-size:12px;font-weight:850;letter-spacing:.18em;text-transform:uppercase}.brand-dot{width:8px;height:8px;border-radius:50%;background:#9dffc4;box-shadow:0 0 18px rgba(120,255,181,.9)}.secure{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border:1px solid rgba(184,255,207,.15);border-radius:999px;color:rgba(226,255,237,.68);background:rgba(115,255,174,.055);font-size:10px;font-weight:750;letter-spacing:.04em}.secure i{width:6px;height:6px;border-radius:50%;background:#8dffc0;box-shadow:0 0 10px #70ffb1}h1{margin:18px 0 7px;font-size:clamp(33px,8vw,46px);line-height:.96;letter-spacing:-.05em}.sub{margin:0;color:rgba(235,255,243,.76);font-size:15px;line-height:1.55;max-width:430px}.plan{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:20px;padding:12px 14px;border:1px solid rgba(184,255,207,.16);border-radius:18px;color:#dcffe8;background:linear-gradient(90deg,rgba(115,255,174,.10),rgba(255,255,255,.045));font-size:12px;font-weight:800}.plan span:last-child{color:rgba(220,255,232,.45);font-weight:650}.grid{display:grid;gap:11px;margin-top:14px}a.btn{position:relative;display:flex;align-items:center;gap:14px;min-height:72px;padding:13px 16px;color:#fff;text-decoration:none;border:1px solid rgba(255,255,255,.12);border-radius:21px;background:rgba(255,255,255,.072);box-shadow:inset 0 1px 0 rgba(255,255,255,.07);transition:transform .18s ease,background .18s ease,border-color .18s ease,box-shadow .18s ease;-webkit-tap-highlight-color:transparent}a.btn:hover{transform:translateY(-2px);background:rgba(255,255,255,.115);border-color:rgba(190,255,214,.27);box-shadow:0 14px 30px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.09)}a.btn:active{transform:translateY(0) scale(.985)}.icon{display:grid;place-items:center;flex:0 0 46px;width:46px;height:46px;padding:4px;overflow:hidden;border-radius:15px;background:rgba(184,255,207,.10);border:1px solid rgba(184,255,207,.13)}.icon img{display:block;width:100%;height:100%;object-fit:contain;border-radius:11px}.text{min-width:0;flex:1}.name{display:block;font-size:16px;font-weight:850;letter-spacing:-.015em}.hint{display:block;margin-top:3px;color:rgba(220,255,232,.52);font-size:11px}.arrow{color:rgba(220,255,232,.52);font-size:24px;line-height:1;transition:transform .18s ease,color .18s ease}a.btn:hover .arrow{color:#c3ffda;transform:translateX(3px)}a.btn.primary{color:#062014;border-color:rgba(220,255,232,.5);background:linear-gradient(135deg,#c2ffd7,#72f5aa);box-shadow:0 14px 36px rgba(55,255,157,.19),inset 0 1px 0 rgba(255,255,255,.5)}a.btn.primary .icon{background:rgba(0,70,37,.10);border-color:rgba(0,70,37,.10)}a.btn.primary .hint{color:rgba(4,45,27,.58)}a.btn.primary .arrow{color:rgba(4,45,27,.65)}.back{display:block;margin-top:17px;padding:8px;color:rgba(205,255,220,.68);text-align:center;text-decoration:none;font-size:13px;transition:color .18s ease}.back:hover{color:#fff}.footer{margin-top:13px;color:rgba(210,238,220,.36);text-align:center;font-size:10px;letter-spacing:.03em}@media(max-width:480px){body{align-items:flex-start;padding-top:max(14px,env(safe-area-inset-top))}.glass{padding:23px 17px 19px;border-radius:28px}.secure{display:none}h1{margin-top:13px}.grid{margin-top:13px}a.btn{min-height:68px;border-radius:19px}}@media(prefers-reduced-motion:reduce){body{animation:none}a.btn,.arrow{transition:none}}
</style></head><body><main class="wrap"><section class="glass"><div class="content"><div class="topline"><div class="brand"><span class="brand-dot"></span> GRN VPN</div><div class="secure"><i></i> ПОДПИСКА ОНЛАЙН</div></div><h1>Подключение</h1><p class="sub">Выберите приложение — ссылка подписки отдаёт JSON и служебные данные профиля одним запросом.</p><div class="plan"><span>${selected.title}</span><span>автообновление · 2 ч</span></div><div class="grid"><a class="btn primary" href="${happ}"><span class="icon"><img src="/icon/happ.png" alt="Happ"></span><span class="text"><span class="name">Happ</span><span class="hint">Добавить подписку одним нажатием</span></span><span class="arrow">›</span></a><a class="btn" href="${incy}"><span class="icon"><img src="/icon/INCY.png" alt="Incy"></span><span class="text"><span class="name">Incy</span><span class="hint">Импортировать подписку</span></span><span class="arrow">›</span></a><a class="btn" href="${v2raytun}"><span class="icon"><img src="/icon/v2raytun.png" alt="v2RayTun"></span><span class="text"><span class="name">v2RayTun</span><span class="hint">Импортировать подписку</span></span><span class="arrow">›</span></a></div><a class="back" href="${origin}/connect">← Вернуться к выбору режима</a><div class="footer">GRN VPN • защищённое подключение</div></div></section></main></body></html>`;
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
  const cacheKey = new Request(new URL(`/sub/${plan}?cache=v3`, request.url).toString(), request);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const upstream = await fetch(selected.source, { headers: { "User-Agent": "GRN-VPN-Worker/1.0" } });
  if (!upstream.ok) return new Response("Subscription source unavailable", { status: 502 });
  const sourceText = await upstream.text();
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

  const origin = new URL(request.url).origin;
  const response = new Response(json + "\n", {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
      "content-disposition": `attachment; filename="GRN_VPN_${plan}.json"`,
      ...metadataHeaders(origin)
    }
  });
  await cache.put(cacheKey, response.clone());
  return response;
}

async function subscriptionMetadata(request, plan) {
  if (!SUBSCRIPTIONS[plan]) return new Response("Unknown subscription", { status: 404 });
  const cache = caches.default;
  const cacheKey = new Request(new URL(`/sub/${plan}/metadata?cache=v3`, request.url).toString(), request);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const origin = new URL(request.url).origin;
  const response = new Response(SUBSCRIPTION_METADATA_BODY + "\n", {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
      ...metadataHeaders(origin)
    }
  });
  await cache.put(cacheKey, response.clone());
  return response;
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
    const metadataMatch = url.pathname.match(/^\/sub\/(vip|bs)\/(metadata|flags)$/i);
    if (metadataMatch && request.method === "GET") return subscriptionMetadata(request, metadataMatch[1].toLowerCase());
    const subMatch = url.pathname.match(/^\/sub\/(vip|bs)$/i);
    if (subMatch && request.method === "GET") return subscriptionResponse(request, subMatch[1].toLowerCase());
    if (url.pathname === "/telegram/webhook" && request.method === "POST") {
      try { const update = await request.json(); await initDatabase(cfg.db); await handleUpdate(cfg, update); return new Response("ok"); }
      catch (error) { console.error("Webhook error", error); return new Response("ok"); }
    }
    return new Response("Not Found", { status: 404 });
  }
};
