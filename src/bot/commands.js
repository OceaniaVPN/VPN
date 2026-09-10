import { sendMessage } from "../telegram.js";
import { mainMenu, back } from "./keyboards.js";
import { upsertUser, attachReferral, getReferralStats, qualifyReferral } from "../database/storage.js";
import { getFileContent, createOrUpdateFile } from "../github.js";
import { decodeSubscription } from "../decoder.js";
import { buildFile } from "../build.js";
import { escapeHtml } from "../config.js";

export async function start(cfg, chatId, from, startParam = "") {
  await upsertUser(cfg.db, { chat_id: chatId, username: from?.username, first_name: from?.first_name });
  const m = String(startParam || "").match(/^ref_(-?\d+)$/i);
  if (m) await attachReferral(cfg.db, Number(m[1]), chatId);
  await sendMessage(cfg.telegramToken, chatId, `🌊 <b>OCEANIA VPN</b>\n\nДобро пожаловать. Выбирай действие ниже.`, mainMenu(chatId === cfg.adminId));
}

export async function referral(cfg, chatId) {
  const link = cfg.botUsername ? `https://t.me/${cfg.botUsername}?start=ref_${chatId}` : `BOT_USERNAME не настроен`;
  const stats = await getReferralStats(cfg.db, chatId);
  await sendMessage(cfg.telegramToken, chatId, `🔗 <b>Реферальная система</b>\n\nТвоя ссылка:\n<code>${escapeHtml(link)}</code>\n\n👥 Приглашено: <b>${stats.count}</b>\n🎁 Начислено дней: <b>${stats.bonusDays}</b>`, back());
}

export async function create(cfg, chatId, url) {
  if (!url) return sendMessage(cfg.telegramToken, chatId, `🚀 <b>Создание подписки</b>\n\nОтправь ссылку так:\n<code>/create https://example.com/sub</code>`, back());
  await sendMessage(cfg.telegramToken, chatId, `⏳ Декодирую источник...`);
  const result = await decodeSubscription(url);
  if (!result.ok) return sendMessage(cfg.telegramToken, chatId, `❌ ${escapeHtml(result.error)}`, back());
  const content = buildFile({ title: "Oceania VPN", interval: 4 }, result.uris);
  const filename = `user_${chatId}.txt`;
  const saved = await createOrUpdateFile(cfg, filename, content, `Create subscription for ${chatId}`);
  if (!saved?.content?.sha && !saved?.content && !saved?.sha) return sendMessage(cfg.telegramToken, chatId, `❌ Не удалось сохранить подписку.`, back());
  const sub = `${cfg.workerOrigin || ""}/sub?u=${chatId}`;
  const bonus = Number(cfg.referralBonusDays || 3);
  await qualifyReferral(cfg.db, chatId, bonus);
  await sendMessage(cfg.telegramToken, chatId, `✅ <b>Подписка готова</b>\n\n📡 Конфигураций: <b>${result.uris.length}</b>\n🔗 <code>${escapeHtml(sub)}</code>\n\nНаграда рефереру обработана.`, { inline_keyboard: [[{ text: "📋 Моя подписка", callback_data: "my" }], [{ text: "🏠 Меню", callback_data: "menu" }]] });
}

export async function my(cfg, chatId) {
  const content = await getFileContent(cfg, `user_${chatId}.txt`);
  if (!content) return sendMessage(cfg.telegramToken, chatId, `📭 Подписка ещё не создана.`, back());
  const count = content.split("\n").filter(x => /^(?:vless|vmess|trojan|ss|hysteria|tuic|wg):\/\//i.test(x)).length;
  await sendMessage(cfg.telegramToken, chatId, `📋 <b>Моя подписка</b>\n\n📡 Серверов: <b>${count}</b>\n🔗 <code>${escapeHtml(`${cfg.workerOrigin || ""}/sub?u=${chatId}`)}</code>`, back());
}

export async function help(cfg, chatId) {
  await sendMessage(cfg.telegramToken, chatId, `ℹ️ <b>OCEANIA VPN</b>\n\n/start — меню\n/create URL — создать подписку\n/my — моя подписка\n/ref — реферальная ссылка\n/decode URL — декодировать\n/help — помощь`, back());
}
