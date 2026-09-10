import { start, subscriptions, referral, support, help } from "./commands.js";
import { sendMessage, answerCallback } from "../telegram.js";

export async function handleUpdate(cfg, update) {
  const msg = update?.message;
  const cb = update?.callback_query;

  if (cb) {
    const chatId = cb.message?.chat?.id;
    await answerCallback(cfg.telegramToken, cb.id);
    if (!chatId) return;

    if (cb.data === "menu") return start(cfg, chatId, cb.from);
    if (cb.data === "subs") return subscriptions(cfg, chatId);
    if (cb.data === "ref") return referral(cfg, chatId);
    if (cb.data === "support") return support(cfg, chatId);
    if (cb.data === "help") return help(cfg, chatId);
    return sendMessage(cfg.telegramToken, chatId, "Используй /start для открытия меню.");
  }

  if (!msg?.chat?.id) return;
  const chatId = msg.chat.id;
  const text = String(msg.text || "").trim();
  const match = text.match(/^\/(\w+)(?:@\w+)?(?:\s+(.+))?$/);

  if (match) {
    const [, cmd, arg] = match;
    if (cmd === "start") return start(cfg, chatId, msg.from, arg);
    if (cmd === "ref") return referral(cfg, chatId);
    if (cmd === "support") return support(cfg, chatId);
    if (cmd === "help") return help(cfg, chatId);
  }

  return sendMessage(cfg.telegramToken, chatId, "Используй /start для открытия меню.", mainMenu());
}
