import { getConfig, isValidChatId, isSafeConfigFilename } from "./config.js";
import { handleUpdate } from "./bot/handlers.js";
import { initDatabase } from "./database/init.js";
import { getFileContent } from "./github.js";

const VPN_CLIENTS = ["happ","hiddify","v2rayng","v2raytun","v2rayn","v2box","shadowrocket","quantumult","surge","loon","stash","clash","sing-box","singbox","karing","nekoray","nekobox","foxray","matsuri","flclash"];
function isVpnClient(ua) { const x = String(ua || "").toLowerCase(); return VPN_CLIENTS.some(v => x.includes(v)); }
function parseMeta(content) { const m = {}; for (const line of content.split("\n")) { const x = line.match(/^#([\w-]+):\s*(.*)$/); if (x) m[x[1].toLowerCase()] = x[2].trim(); } return m; }

async function serveSubscription(request, cfg) {
  const url = new URL(request.url);
  const u = url.searchParams.get("u");
  const f = url.searchParams.get("f");
  const filename = u ? `user_${u}.txt` : f;
  if (!filename || (u && !isValidChatId(u)) || (f && !isSafeConfigFilename(f))) return new Response("Bad subscription path", { status: 400 });
  const content = await getFileContent(cfg, filename);
  if (!content) return new Response("Subscription not found", { status: 404 });
  if (!isVpnClient(request.headers.get("user-agent"))) {
    const meta = parseMeta(content);
    return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${meta["profile-title"] || "Oceania VPN"}</title><body style="font-family:system-ui;background:#071c16;color:#fff;padding:32px"><h1>🌊 Oceania VPN</h1><p>Подписка: <b>${meta["profile-title"] || "My Subscription"}</b></p><p>Открой эту ссылку в VPN-клиенте для получения конфигураций.</p></body>`, { headers: { "content-type": "text/html;charset=utf-8", "cache-control": "no-store" } });
  }
  const headers = { "content-type": "text/plain;charset=utf-8", "cache-control": "no-store" };
  const meta = parseMeta(content);
  if (meta["subscription-userinfo"]) headers["Subscription-Userinfo"] = meta["subscription-userinfo"];
  if (meta["profile-title"]) headers["Profile-Title"] = meta["profile-title"];
  if (meta["profile-update-interval"]) headers["Profile-Update-Interval"] = meta["profile-update-interval"];
  if (meta["profile-web-page-url"]) headers["Profile-Web-Page-Url"] = meta["profile-web-page-url"];
  return new Response(content, { headers });
}

export default {
  async fetch(request, env) {
    const cfg = getConfig(env);
    if (!cfg.telegramToken || !cfg.githubToken) return new Response("Worker secrets are not configured", { status: 503 });
    if (cfg.db) { try { await initDatabase(cfg.db); } catch (e) { console.error("D1 init failed", e); } }
    const url = new URL(request.url);
    if (url.pathname === "/sub") return serveSubscription(request, cfg);
    if (url.pathname === "/health") return Response.json({ ok: true, service: "oceaniavpn" });
    if (url.pathname === "/telegram/webhook") {
      if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
      if (cfg.webhookSecret && request.headers.get("x-telegram-bot-api-secret-token") !== cfg.webhookSecret) return new Response("Unauthorized", { status: 401 });
      const update = await request.json();
      await handleUpdate(cfg, update);
      return Response.json({ ok: true });
    }
    if (url.pathname === "/") return new Response("Oceania VPN bot is running", { headers: { "content-type": "text/plain;charset=utf-8" } });
    return new Response("Not Found", { status: 404 });
  }
};
