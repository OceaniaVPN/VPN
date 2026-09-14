import { getConfig } from "./config.js";
import { handleUpdate } from "./bot/handlers.js";
import { initDatabase } from "./database/init.js";
import { generateJsonSubscription } from "./json-generator.js";
import { pageHtml, APP_ICONS } from "./page.js";

const SUBSCRIPTIONS = {
  vip: {
    title: "GRN VPN VIP",
    source: "https://raw.githubusercontent.com/lsncococososo-rgb/GRN_VPN/main/Vip.txt",
    apiSource: "https://api.github.com/repos/lsncococososo-rgb/GRN_VPN/contents/Vip.txt?ref=main"
  },
  bs: {
    title: "GRN VPN ОБХОД БС",
    source: "https://raw.githubusercontent.com/lsncococososo-rgb/GRN_VPN/main/%D0%9E%D0%B1%D1%85%D0%BE%D0%B4%20%D0%B1%D1%81",
    apiSource: "https://api.github.com/repos/lsncococososo-rgb/GRN_VPN/contents/%D0%9E%D0%B1%D1%85%D0%BE%D0%B4%20%D0%B1%D1%81?ref=main"
  }
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

function subscriptionHeaders(origin, plan, contentType = "application/json; charset=utf-8") {
  return {
    "content-type": contentType,
    "cache-control": "public, max-age=3600, s-maxage=3600",
    "content-disposition": `inline; filename="GRN_VPN_${plan}.json"`,
    "profile-title": SUBSCRIPTION_METADATA["profile-title"],
    "profile-update-interval": SUBSCRIPTION_METADATA["profile-update-interval"],
    "support-url": SUBSCRIPTION_METADATA["support-url"],
    "announce": SUBSCRIPTION_METADATA.announce,
    "subscription-userinfo": SUBSCRIPTION_METADATA["subscription-userinfo"],
    "profile-web-page-url": `${origin}/connect?plan=${plan}`
  };
}

async function readSubscriptionSource(selected) {
  try {
    const response = await fetch(selected.source, {
      headers: {
        "User-Agent": "GRN-VPN-Worker/1.0",
        Accept: "text/plain, text/*, */*"
      },
      redirect: "follow"
    });
    if (response.ok) {
      const text = await response.text();
      if (text.trim()) return text;
    }
  } catch (error) {
    console.error("Primary subscription fetch failed", error);
  }

  const response = await fetch(selected.apiSource, {
    headers: {
      "User-Agent": "GRN-VPN-Worker/1.0",
      Accept: "application/vnd.github+json"
    },
    redirect: "follow"
  });
  if (!response.ok) throw new Error(`GitHub source unavailable: ${response.status}`);

  const data = await response.json();
  if (!data || typeof data.content !== "string") throw new Error("GitHub source returned no content");

  const binary = atob(data.content.replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const text = new TextDecoder().decode(bytes);
  if (!text.trim()) throw new Error("GitHub source is empty");
  return text;
}

function stripMetadata(sourceText) {
  return String(sourceText || "")
    .split(/\r?\n/)
    .filter(line => !line.trim().startsWith("#"))
    .join("\n")
    .trim();
}

async function iconResponse(name) {
  const source = APP_ICONS[name];
  if (!source) return new Response("Not Found", { status: 404 });
  try {
    const upstream = await fetch(source, { headers: { "User-Agent": "GRN-VPN-Worker/1.0" } });
    if (!upstream.ok) return new Response("Icon unavailable", { status: 502 });
    return new Response(upstream.body, {
      headers: {
        "content-type": upstream.headers.get("content-type") || "image/png",
        "cache-control": "public, max-age=86400, s-maxage=604800, immutable"
      }
    });
  } catch {
    return new Response("Icon unavailable", { status: 502 });
  }
}

async function subscriptionResponse(request, plan, ctx) {
  const selected = SUBSCRIPTIONS[plan];
  if (!selected) return new Response("Unknown subscription", { status: 404 });

  const cache = caches.default;
  const origin = new URL(request.url).origin;
  const cacheKey = new Request(`${origin}/sub/${plan}?cache=v9`, { method: "GET" });

  try {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  } catch (error) {
    console.error("Subscription cache read failed", error);
  }

  try {
    const sourceText = await readSubscriptionSource(selected);
    const stripped = stripMetadata(sourceText);
    if (!stripped) throw new Error("Subscription source is empty");

    let json;
    try {
      const parsed = JSON.parse(stripped);
      json = JSON.stringify(parsed, null, 2);
    } catch {
      const generated = generateJsonSubscription(stripped);
      json = typeof generated === "string"
        ? JSON.stringify(JSON.parse(generated), null, 2)
        : JSON.stringify(generated, null, 2);
    }

    if (!json || json === "undefined") throw new Error("JSON generation returned empty result");

    const response = new Response(json + "\n", {
      headers: subscriptionHeaders(origin, plan)
    });

    try {
      const cacheWrite = cache.put(cacheKey, response.clone());
      if (ctx?.waitUntil) ctx.waitUntil(cacheWrite.catch(error => console.error("Subscription cache write failed", error)));
      else cacheWrite.catch(error => console.error("Subscription cache write failed", error));
    } catch (error) {
      console.error("Subscription cache write scheduling failed", error);
    }

    return response;
  } catch (error) {
    console.error(`Subscription ${plan} error`, error);
    return new Response(`Subscription ${plan} unavailable: ${error?.message || "conversion failed"}`, {
      status: 502,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  }
}

async function subscriptionMetadata(request, plan, ctx) {
  if (!SUBSCRIPTIONS[plan]) return new Response("Unknown subscription", { status: 404 });

  const cache = caches.default;
  const origin = new URL(request.url).origin;
  const cacheKey = new Request(`${origin}/sub/${plan}/metadata?cache=v9`, { method: "GET" });

  try {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  } catch (error) {
    console.error("Metadata cache read failed", error);
  }

  const response = new Response(SUBSCRIPTION_METADATA_BODY + "\n", {
    headers: {
      ...subscriptionHeaders(origin, plan, "text/plain; charset=utf-8"),
      "content-disposition": `inline; filename="GRN_VPN_${plan}_metadata.txt"`
    }
  });

  try {
    const cacheWrite = cache.put(cacheKey, response.clone());
    if (ctx?.waitUntil) ctx.waitUntil(cacheWrite.catch(error => console.error("Metadata cache write failed", error)));
    else cacheWrite.catch(error => console.error("Metadata cache write failed", error));
  } catch (error) {
    console.error("Metadata cache write scheduling failed", error);
  }

  return response;
}

export default {
  async fetch(request, env, ctx) {
    const cfg = getConfig(env);
    const url = new URL(request.url);

    if (url.pathname === "/health") return Response.json({ ok: true, service: "oceaniavpn-bot" });
    if (url.pathname === "/") return new Response("Oceania VPN bot is running", { headers: { "content-type": "text/plain;charset=utf-8" } });

    if (url.pathname === "/connect" && request.method === "GET") {
      const plan = (url.searchParams.get("plan") || "vip").toLowerCase();
      const selected = SUBSCRIPTIONS[plan] || SUBSCRIPTIONS.vip;
      return new Response(pageHtml(url.origin, selected.title, SUBSCRIPTIONS[plan] ? plan : "vip"), {
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
      });
    }

    const iconMatch = url.pathname.match(/^\/icon\/(happ|incy|v2raytun)\.png$/i);
    if (iconMatch && request.method === "GET") return iconResponse(iconMatch[1].toLowerCase());

    const metadataMatch = url.pathname.match(/^\/sub\/(vip|bs)\/(metadata|flags)$/i);
    if (metadataMatch && request.method === "GET") return subscriptionMetadata(request, metadataMatch[1].toLowerCase(), ctx);

    const subMatch = url.pathname.match(/^\/sub\/(vip|bs)$/i);
    if (subMatch && request.method === "GET") return subscriptionResponse(request, subMatch[1].toLowerCase(), ctx);

    if (url.pathname === "/telegram/webhook" && request.method === "POST") {
      try {
        const update = await request.json();
        await initDatabase(cfg.db);
        await handleUpdate(cfg, update);
      } catch (error) {
        console.error("Webhook error", error);
      }
      return new Response("ok");
    }

    return new Response("Not Found", { status: 404 });
  }
};
