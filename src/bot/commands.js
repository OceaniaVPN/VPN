import { sendMessage, editMessage } from "../telegram.js";
import { mainMenu, back, subscriptions as subscriptionsKeyboard } from "./keyboards.js";
import { upsertUser, attachReferral, getReferralStats } from "../database/storage.js";
import { escapeHtml } from "../config.js";

const SUPPORT_CARD = "2200701212779232";
const BRAND = "<b>OCEANIA VPN</b>";

function header(icon, title, subtitle = "") {
  return `${icon} ${BRAND}\n<b>${title}</b>${subtitle ? `\n<i>${subtitle}</i>` : ""}`;
}

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

  const name = escapeHtml(from?.first_name || "друг");
  return deliver(
    cfg,
    chatId,
    `🌊 <b>OCEANIA VPN</b>\n\n<b>Привет, ${name}! 👋</b>\n\n╭───────────────╮\n│  🟢 <b>СЕРВИС ONLINE</b>  │\n╰───────────────╯\n\nТвой личный центр управления VPN.\nЗдесь всё собрано в одном месте — быстро, чисто и без лишнего шума.\n\n⚡ <b>Быстрый доступ</b>\n📡 Конфигурации • 🔗 Бонусы • 💚 Поддержка\n\n<i>Добро пожаловать в OCEANIA.</i>`,
    mainMenu(),
    messageId
  );
}

export async function subscriptions(cfg, chatId, messageId = null) {
  return deliver(
    cfg,
    chatId,
    `${header("📡", "Подписки", "Выбери конфигурацию одним нажатием")}\n\n╭─ 👑 <b>VIP</b>\n│ Премиум-конфигурация для максимального комфорта.\n╰──────────────\n\n╭─ 🛡️ <b>ОБХОД БС</b>\n│ Альтернативная конфигурация для ограниченных сетей.\n╰──────────────\n\n💡 <i>Кнопки ниже сразу откроют нужную конфигурацию.</i>`,
    subscriptionsKeyboard(),
    messageId
  );
}

export async function referral(cfg, chatId, messageId = null) {
  const link = cfg.botUsername
    ? `https://t.me/${cfg.botUsername}?start=ref_${chatId}`
    : "BOT_USERNAME не настроен";
  const stats = await getReferralStats(cfg.db, chatId);

  return deliver(
    cfg,
    chatId,
    `${header("🔗", "Реферальный центр", "Приглашай друзей — получай больше")}\n\n╭───────────────╮\n│ 🎁 <b>ТВОЙ БОНУС</b>       │\n│ 👥 Приглашено: <b>${stats.count}</b>    │\n│ ⚡ Дней начислено: <b>${stats.bonusDays}</b> │\n╰───────────────╯\n\n🔗 <b>Твоя персональная ссылка</b>\n<code>${escapeHtml(link)}</code>\n\n<i>Скопируй ссылку и отправь её другу. Бонусы начислятся автоматически.</i>`,
    back(),
    messageId
  );
}

export async function support(cfg, chatId, messageId = null) {
  return deliver(
    cfg,
    chatId,
    `${header("💚", "Поддержка проекта", "Ты помогаешь ему становиться лучше")}\n\n╭───────────────╮\n│  ☕ <b>СПАСИБО, ЧТО ТЫ ЗДЕСЬ</b>  │\n╰───────────────╯\n\nЕсли проект оказался полезным, его можно поддержать любой суммой. Это помогает развивать OCEANIA VPN и добавлять новые возможности.\n\n💳 <b>Карта для поддержки</b>\n<code>${SUPPORT_CARD}</code>\n\n🙏 <i>Каждая поддержка — топливо для проекта.</i>`,
    back(),
    messageId
  );
}

export async function help(cfg, chatId, messageId = null) {
  return deliver(
    cfg,
    chatId,
    `${header("✨", "Центр помощи", "Коротко и понятно")}\n\n<b>📡 Подписки</b>\nПолучение доступных VPN-конфигураций.\n\n<b>🔗 Рефералы</b>\nПерсональная ссылка и статистика бонусов.\n\n<b>💚 Поддержка</b>\nПомощь проекту и его развитию.\n\n<b>🏠 Главное меню</b>\nВозврат на стартовый экран.\n\n━━━━━━━━━━━━━━\n\n🌊 <i>OCEANIA VPN — интернет без лишнего шума.</i>`,
    back(),
    messageId
  );
}
