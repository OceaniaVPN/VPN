import { sendMessage } from "../telegram.js";
import { mainMenu, back } from "./keyboards.js";
import { upsertUser, attachReferral, getReferralStats } from "../database/storage.js";
import { escapeHtml } from "../config.js";

const SUBSCRIPTIONS = [
  {
    name: "VIP",
    icon: "👑",
    description: "Премиум-конфигурация с максимальным комфортом.",
    url: "https://github.com/lsncococososo-rgb/GRN_VPN/raw/refs/heads/main/Vip.txt"
  },
  {
    name: "Обход БС",
    icon: "🛡️",
    description: "Альтернативная конфигурация для обхода ограничений.",
    url: "https://github.com/lsncococososo-rgb/GRN_VPN/raw/refs/heads/main/%D0%9E%D0%B1%D1%85%D0%BE%D0%B4%20%D0%B1%D1%81"
  }
];

const SUPPORT_CARD = "2200701212779232";

const BRAND = "<b>OCEANIA VPN</b>";

function header(icon, title, subtitle = "") {
  return `${icon} ${BRAND}\n<b>${title}</b>${subtitle ? `\n<i>${subtitle}</i>` : ""}`;
}

export async function start(cfg, chatId, from, startParam = "") {
  await upsertUser(cfg.db, {
    chat_id: chatId,
    username: from?.username,
    first_name: from?.first_name
  });

  const m = String(startParam || "").match(/^ref_(-?\d+)$/i);
  if (m) await attachReferral(cfg.db, Number(m[1]), chatId);

  const name = escapeHtml(from?.first_name || "друг");
  return sendMessage(
    cfg.telegramToken,
    chatId,
    `🌊 <b>OCEANIA VPN</b>\n\nПривет, <b>${name}</b>! 👋\n\nТвой персональный VPN-центр уже готов.\nВыбирай раздел — всё самое нужное находится в одном месте.\n\n✨ <i>Быстро. Красиво. Без лишнего.</i>`,
    mainMenu()
  );
}

export async function subscriptions(cfg, chatId) {
  const blocks = SUBSCRIPTIONS.map((item) =>
    `${item.icon} <b>${item.name}</b>\n<i>${item.description}</i>\n🔗 <a href="${item.url}">Получить конфигурацию</a>`
  ).join("\n\n━━━━━━━━━━━━━━\n\n");

  return sendMessage(
    cfg.telegramToken,
    chatId,
    `${header("📡", "Подписки", "Выбери подходящую конфигурацию") }\n\n${blocks}\n\n━━━━━━━━━━━━━━\n\n💡 <i>Нажми на ссылку, чтобы открыть конфигурацию.</i>`,
    back()
  );
}

export async function referral(cfg, chatId) {
  const link = cfg.botUsername
    ? `https://t.me/${cfg.botUsername}?start=ref_${chatId}`
    : "BOT_USERNAME не настроен";
  const stats = await getReferralStats(cfg.db, chatId);

  return sendMessage(
    cfg.telegramToken,
    chatId,
    `${header("🔗", "Реферальная система", "Приглашай друзей — получай бонусы")}\n\n🎁 <b>Твоя награда</b>\nПриглашай новых пользователей и получай дополнительные дни доступа.\n\n👥 Приглашено: <b>${stats.count}</b>\n⚡ Начислено дней: <b>${stats.bonusDays}</b>\n\n🔗 <b>Твоя ссылка</b>\n<code>${escapeHtml(link)}</code>\n\n<i>Просто отправь её другу 👇</i>`,
    back()
  );
}

export async function support(cfg, chatId) {
  return sendMessage(
    cfg.telegramToken,
    chatId,
    `${header("💚", "Поддержка проекта", "Помоги OCEANIA VPN становиться лучше")}\n\n☕ Если тебе нравится проект и ты хочешь помочь его развитию — любая сумма имеет значение.\n\n💳 <b>Карта для поддержки</b>\n<code>${SUPPORT_CARD}</code>\n\n🙏 <i>Спасибо каждому, кто поддерживает проект!</i>`,
    back()
  );
}

export async function help(cfg, chatId) {
  return sendMessage(
    cfg.telegramToken,
    chatId,
    `${header("✨", "Помощь", "Всё просто")}\n\n/start — открыть главное меню\n\n📡 <b>Подписки</b> — доступные VPN-конфигурации\n🔗 <b>Реферальная система</b> — ссылка и статистика\n💚 <b>Поддержка проекта</b> — помочь развитию\n\n━━━━━━━━━━━━━━\n\n🌊 <i>OCEANIA VPN — твой спокойный интернет.</i>`,
    back()
  );
}
