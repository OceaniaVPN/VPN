import { getConfig } from "./config.js";
import { handleUpdate } from "./bot/handlers.js";
import { initDatabase } from "./database/init.js";

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
