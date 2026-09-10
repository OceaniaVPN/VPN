import { sendMessage, editMessage } from "../telegram.js";
import { mainMenu, back, subscriptions as subscriptionsKeyboard } from "./keyboards.js";
import { upsertUser, attachReferral, getReferralStats } from "../database/storage.js";
import { escapeHtml } from "../config.js";

const SUPPORT_CARD = "2200701212779232";
const LINE = "━━━━━━━━━━━━━━━━━━━━";
const MINI = "────────────────────";
const BRAND = "🌿 <b>GRN VPN</b>";

async function deliver(cfg, chatId, text, markup, messageId = null) {
  if (messageId) {
    try {
      return await editMessage(cfg.telegramToken, chatId, messageId, text, markup);
    } catch (error) {
      console.error("Message edit failed, sending a new message", error);
    }
  }
  return sendMessage(cfg.telegramToken, chatId, text, markup);
}

function title(icon, name, subtitle) {
  return `${BRAND}\n${LINE}\n${icon} <b>${name}</b>\n<i>${subtitle}</i>`;
}

export async function start(cfg, chatId, from, startParam = "", messageId = null) {
  if (!messageId) {
    await upsertUser(cfg.db, {
      chat_id: chatId,
      username: from?.username,
      first_name: from?.first_name
    });

    const m = String(startParam || "").match(/^ref_(-?\d+)$/i);
    if (m) await attachReferral(cfg.db, Number(m[1]), chatId);
  }

  const name = escapeHtml(from?.first_name || "гость");
  const text = `${BRAND}\n\n💚 <b>Добро пожаловать, ${name}.</b> 🌿\n\n╭────────────────────────╮\n│  🟢 <b>SYSTEM ONLINE</b>       │\n│  ⚡ Скорость   <b>MAX</b>        │\n│  🛡️ Защита      <b>ACTIVE</b>     │\n│  🌿 Доступ       <b>GLOBAL</b>    │\n╰────────────────────────╯\n\n🍀 <b>ТВОЙ ЛИЧНЫЙ ЦЕНТР</b> 💚\nУправляй подключением, получай\nконфигурации и бонусы — всё в одном месте. 🌱\n\n${MINI}\n\n🌿 <b>GRN VPN / PRIVATE NETWORK</b>\n<i>Технологии, которые не мешают тебе пользоваться интернетом.</i> 💚\n\n${LINE}\n🟢 <code>NODE • SECURE • 24/7</code> 🌱`;

  return deliver(cfg, chatId, text, mainMenu(), messageId);
}

export async function subscriptions(cfg, chatId, messageId = null) {
  const text = `${title("🌿", "ПОДКЛЮЧЕНИЕ", "Выбери режим доступа 💚")}\n\n╭─ 🟢 <b>VIP / PREMIUM</b> 👑\n│ Максимум комфорта и скорости. ⚡\n│ <i>Основная конфигурация проекта</i>\n╰────────────────────────\n\n╭─ 🌱 <b>ОБХОД БС</b> 🛡️\n│ Альтернативный режим подключения.\n│ <i>Для сетей с ограничениями</i>\n╰────────────────────────\n\n💚 <b>Нажатие сразу откроет конфигурацию.</b>\n🟢 <code>ENCRYPTED • PRIVATE • READY</code>`;
  return deliver(cfg, chatId, text, subscriptionsKeyboard(), messageId);
}

export async function referral(cfg, chatId, messageId = null) {
  const link = cfg.botUsername
    ? `https://t.me/${cfg.botUsername}?start=ref_${chatId}`
    : "BOT_USERNAME не настроен";
  const stats = await getReferralStats(cfg.db, chatId);

  const text = `${title("🍀", "BONUS CENTER", "Приглашай друзей — открывай больше возможностей 🌿")}\n\n╭────────────────────────╮\n│  👥 <b>ДРУЗЬЯ</b>           ${stats.count}\n│  💚 <b>БОНУСНЫЕ ДНИ</b>     ${stats.bonusDays}\n│  🟢 <b>СТАТУС</b>            ACTIVE\n╰────────────────────────╯\n\n🌱 <b>ТВОЯ ПЕРСОНАЛЬНАЯ ССЫЛКА</b>\n<code>${escapeHtml(link)}</code>\n\n${MINI}\n\n<i>Отправь ссылку другу. Система сама\nотследит приглашение и начислит бонус.</i> 🍀\n\n🟢 <code>INVITE • EARN • REPEAT</code>`;

  return deliver(cfg, chatId, text, back(), messageId);
}

export async function support(cfg, chatId, messageId = null) {
  const text = `${title("💚", "SUPPORT", "Проект развивается благодаря своим людям 🌿")}\n\n╭────────────────────────╮\n│       🌱 <b>THANK YOU</b> 🌱       │\n│                              │\n│  💚 Твоя поддержка помогает   │\n│  GRN VPN становиться лучше.  │\n╰────────────────────────╯\n\n💳 <b>КАРТА ДЛЯ ПОДДЕРЖКИ</b>\n<code>${SUPPORT_CARD}</code>\n\n${MINI}\n\n<i>Любая сумма — это вклад в новые\nфункции, стабильность и развитие.</i> 🌿\n\n🍀 <b>GRN VPN COMMUNITY</b> 🟢`;
  return deliver(cfg, chatId, text, back(), messageId);
}

export async function help(cfg, chatId, messageId = null) {
  const text = `${title("🌿", "О ПРОЕКТЕ", "GRN VPN / PRIVATE NETWORK 💚")}\n\n🟢 <b>01  ПОДКЛЮЧЕНИЕ</b>\nПолучай актуальные конфигурации VPN. ⚡\n\n🍀 <b>02  BONUS CENTER</b>\nПриглашай друзей и отслеживай награды. 🎁\n\n💚 <b>03  SUPPORT</b>\nПоддерживай развитие проекта напрямую. 🌱\n\n${LINE}\n\n╭─ 🌿 <b>PHILOSOPHY</b>\n│ 💚 Private by design.\n│ 🟢 Simple by default.\n│ 🌱 Fast when it matters.\n╰────────────────────────\n\n🍀 <code>GRN VPN • EST. 2026</code> 🟢`;
  return deliver(cfg, chatId, text, back(), messageId);
}
