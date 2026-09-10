import { start, subscriptions, referral, support, help } from "./commands.js";
import { mainMenu } from "./keyboards.js";
import { sendMessage, answerCallback } from "../telegram.js";

export async function handleUpdate(cfg, update) {
  const msg = update?.message;
  const cb = update?.callback_query;

  if (cb) {
    const chatId = cb.message?.chat?.id;
    const messageId = cb.message?.message_id;
    await answerCallback(cfg.telegramToken, cb.id);
    if (!chatId) return;

    if (cb.data === "menu") return start(cfg, chatId, cb.from, "", messageId);
    if (cb.data === "subs") return subscriptions(cfg, chatId, messageId);
    if (cb.data === "ref") return referral(cfg, chatId, messageId);
    if (cb.data === "support") return support(cfg, chatId, messageId);
    if (cb.data === "help") return help(cfg, chatId, messageId);
    return sendMessage(cfg.telegramToken, chatId, "🌊 <b>OCEANIA VPN</b>\n\nВыбери раздел в меню ниже 👇", mainMenu());
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

  return sendMessage(cfg.telegramToken, chatId, "🌊 <b>OCEANIA VPN</b>\n\nВыбери раздел в меню ниже 👇", mainMenu());
}
