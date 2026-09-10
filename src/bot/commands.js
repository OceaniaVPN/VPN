import { sendMessage } from "../telegram.js";
import { mainMenu, back } from "./keyboards.js";
import { upsertUser, attachReferral, getReferralStats } from "../database/storage.js";
import { escapeHtml } from "../config.js";

const SUBSCRIPTIONS = [
  {
    name: "VIP",
    url: "https://github.com/lsncococososo-rgb/GRN_VPN/raw/refs/heads/main/Vip.txt"
  },
  {
    name: "Обход БС",
    url: "https://github.com/lsncococososo-rgb/GRN_VPN/raw/refs/heads/main/%D0%9E%D0%B1%D1%85%D0%BE%D0%B4%20%D0%B1%D1%81"
  }
];

const SUPPORT_CARD = "2200701212779232";

export async function start(cfg, chatId, from, startParam = "") {
  await upsertUser(cfg.db, {
    chat_id: chatId,
    username: from?.username,
    first_name: from?.first_name
  });

  const m = String(startParam || "").match(/^ref_(-?\d+)$/i);
  if (m) await attachReferral(cfg.db, Number(m[1]), chatId);

  await sendMessage(
    cfg.telegramToken,
    chatId,
    `🌊 <b>OCEANIA VPN</b>\n\nДобро пожаловать!\nВыбери нужный раздел ниже.`,
    mainMenu()
  );
}

export async function subscriptions(cfg, chatId) {
  await sendMessage(
    cfg.telegramToken,
    chatId,
    `📡 <b>Подписки</b>\n\n<b>VIP</b>\n<code>${SUBSCRIPTIONS[0].url}</code>\n\n<b>Обход БС</b>\n<code>${SUBSCRIPTIONS[1].url}</code>`,
    back()
  );
}

export async function referral(cfg, chatId) {
  const link = cfg.botUsername
    ? `https://t.me/${cfg.botUsername}?start=ref_${chatId}`
    : "BOT_USERNAME не настроен";
  const stats = await getReferralStats(cfg.db, chatId);

  await sendMessage(
    cfg.telegramToken,
    chatId,
    `🔗 <b>Реферальная система</b>\n\nТвоя реферальная ссылка:\n<code>${escapeHtml(link)}</code>\n\n👥 Приглашено: <b>${stats.count}</b>\n🎁 Начислено дней: <b>${stats.bonusDays}</b>`,
    back()
  );
}

export async function support(cfg, chatId) {
  await sendMessage(
    cfg.telegramToken,
    chatId,
    `💳 <b>Поддержать проект</b>\n\nЕсли хочешь поддержать развитие проекта, можешь отправить любую сумму на карту:\n\n<code>${SUPPORT_CARD}</code>\n\nСпасибо ❤️`,
    back()
  );
}

export async function help(cfg, chatId) {
  await sendMessage(
    cfg.telegramToken,
    chatId,
    `ℹ️ <b>OCEANIA VPN</b>\n\n/start — главное меню\n\nЗдесь доступны подписки, реферальная система и поддержка проекта.`,
    back()
  );
}
