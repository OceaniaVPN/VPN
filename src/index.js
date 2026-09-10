import { getConfig } from "./config.js";
import { handleUpdate } from "./bot/handlers.js";
import { initDatabase } from "./database/init.js";

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

function pageHtml(origin, plan) {
  const selected = SUBSCRIPTIONS[plan] || SUBSCRIPTIONS.vip;
  const subUrl = `${origin}/sub/${plan}`;
  const happ = `happ://add/${subUrl}`;
  const incy = `incy://import/${subUrl}`;
  const v2raytun = `v2raytun://import/${subUrl}`;

  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#071f16">
  <title>${selected.title} • GRN VPN</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    * { box-sizing: border-box; }
    body { margin:0; min-height:100vh; background:radial-gradient(circle at top,#124a34 0,#071f16 45%,#03100b 100%); color:#fff; display:flex; justify-content:center; padding:24px 16px 40px; }
    .wrap { width:min(620px,100%); }
    .glass { background:rgba(255,255,255,.075); border:1px solid rgba(255,255,255,.13); box-shadow:0 20px 60px rgba(0,0,0,.35); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); border-radius:28px; padding:24px; }
    .brand { color:#b8ffcf; font-weight:800; letter-spacing:.12em; font-size:13px; }
    h1 { margin:10px 0 8px; font-size:30px; line-height:1.08; }
    .sub { color:#d7eee0; opacity:.88; line-height:1.55; }
    .grid { display:grid; gap:12px; margin-top:22px; }
    a.btn { display:block; text-decoration:none; color:#07140d; background:#b8ffcf; border-radius:18px; padding:16px 18px; font-weight:800; transition:transform .15s ease, filter .15s ease; }
    a.btn:hover { transform:translateY(-1px); filter:brightness(1.04); }
    a.btn.alt { color:#fff; background:rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.14); }
    .name { display:block; font-size:17px; }
    .hint { display:block; font-size:12px; font-weight:500; opacity:.72; margin-top:4px; }
    .copy { margin-top:18px; padding:14px; border-radius:16px; background:rgba(0,0,0,.22); overflow:auto; font-size:12px; color:#d9ffe5; word-break:break-all; }
    .back { margin-top:14px; display:block; text-align:center; color:#b8ffcf; text-decoration:none; font-size:14px; }
    .note { margin-top:18px; font-size:12px; line-height:1.5; color:#b9d5c3; }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="glass">
      <div class="brand">🌿 GRN VPN</div>
      <h1>Подключение</h1>
      <div class="sub">${selected.title}. Выберите приложение — Worker передаст ему deep-link ссылку на подписку.</div>
      <div class="grid">
        <a class="btn" href="${happ}"><span class="name">💚 Открыть в Happ</span><span class="hint">Импорт подписки через deep link</span></a>
        <a class="btn" href="${incy}"><span class="name">🌱 Открыть в Incy</span><span class="hint">Импорт подписки через deep link</span></a>
        <a class="btn" href="${v2raytun}"><span class="name">🟢 Открыть в v2RayTun</span><span class="hint">Импорт подписки через deep link</span></a>
        <a class="btn alt" href="${subUrl}"><span class="name">🔗 Открыть ссылку подписки</span><span class="hint">Если deep link не перехватился приложением</span></a>
      </div>
      <div class="copy">${subUrl}</div>
      <a class="back" href="${origin}/connect">← Вернуться к выбору режима</a>
      <div class="note">Happ официально поддерживает добавление конфигураций и подписок через URL и deep link. Incy документирует <b>incy://import/{data}</b>, а v2RayTun — <b>v2raytun://import/{configuration}</b> и <b>v2raytun://import/{subscription_link}</b>.</div>
    </section>
  </main>
</body>
</html>`;
}

async function subscriptionResponse(plan) {
  const selected = SUBSCRIPTIONS[plan];
  if (!selected) return new Response("Unknown subscription", { status: 404 });

  const upstream = await fetch(selected.source, {
    headers: { "User-Agent": "GRN-VPN-Worker/1.0" }
  });
  if (!upstream.ok) return new Response("Subscription source unavailable", { status: 502 });

  const body = await upstream.text();
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "profile-title": selected.title.slice(0, 25),
      "profile-web-page-url": "https://vpn.novogodniysait.workers.dev/connect"
    }
  });
}

export default {
  async fetch(request, env) {
    const cfg = getConfig(env);
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json({ ok: true, service: "oceaniavpn-bot" });
    }

    if (url.pathname === "/") {
      return new Response("Oceania VPN bot is running", {
        headers: { "content-type": "text/plain;charset=utf-8" }
      });
    }

    if (url.pathname === "/connect" && request.method === "GET") {
      const plan = (url.searchParams.get("plan") || "vip").toLowerCase();
      return new Response(pageHtml(url.origin, SUBSCRIPTIONS[plan] ? plan : "vip"), {
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
      });
    }

    const subMatch = url.pathname.match(/^\/sub\/(vip|bs)$/i);
    if (subMatch && request.method === "GET") {
      return subscriptionResponse(subMatch[1].toLowerCase());
    }

    if (url.pathname !== "/telegram/webhook") {
      return new Response("Not Found", { status: 404 });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (!cfg.telegramToken) {
      console.error("Telegram bot token is not configured");
      return new Response("Telegram bot token is not configured", { status: 503 });
    }

    if (
      cfg.webhookSecret &&
      request.headers.get("x-telegram-bot-api-secret-token") !== cfg.webhookSecret
    ) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const update = await request.json();

      if (cfg.db) {
        try {
          await initDatabase(cfg.db);
        } catch (error) {
          console.error("D1 init failed", error);
        }
      }

      await handleUpdate(cfg, update);
      return Response.json({ ok: true });
    } catch (error) {
      console.error("Telegram webhook error", error);
      return Response.json({ ok: false }, { status: 200 });
    }
  }
};
