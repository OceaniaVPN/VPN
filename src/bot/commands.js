import { sendMessage } from "../telegram.js";
import { mainMenu, back } from "./keyboards.js";
import { upsertUser, attachReferral, getReferralStats } from "../database/storage.js";
import { escapeHtml } from "../config.js";

export async function start(cfg, chatId, from, startParam = "") {
  await upsertUser(cfg.db, { chat_id: chatId, username: from?.username, first_name: from?.first_name });
  const m = String(startParam || "").match(/^ref_(-?\d+)$/i);
  if (m) await attachReferral(cfg.db, Number(m[1]), chatId);
  await sendMessage(cfg.telegramToken, chatId, `🌊 <b>OCEANIA VPN</b>\n\nДобро пожаловать. Выбирай действие ниже.`, mainMenu(chatId === cfg.adminId));
}

export async function referral(cfg, chatId) {
  const origin = cfg.workerOrigin || "";
  const bot = cfg.botUsername || "";
  const link = bot ? `https://t.me/${bot}?start=ref_${chatId}` : `Ссылка строится после настройки BOT_USERNAME`;
  const stats = await getReferralStats(cfg.db, chatId);
  await sendMessage(cfg.telegramToken, chatId, `🔗 <b>Реферальная система</b>\n\nТвоя ссылка:\n<code>${escapeHtml(link)}</code>\n\n👥 Приглашено: <b>${stats.count}</b>\n🎁 Начислено дней: <b>${stats.bonusDays}</b>\n\nНаграда начисляется после квалифицирующего действия приглашённого пользователя.`, back());
}

export async function help(cfg, chatId) {
  await sendMessage(cfg.telegramToken, chatId, `ℹ️ <b>OCEANIA VPN</b>\n\n/start — меню\n/create — создать подписку\n/my — моя подписка\n/list — серверы\n/ref — реферальная ссылка\n/decode URL — декодировать подписку\n/cancel — отменить действие`, back());
}
