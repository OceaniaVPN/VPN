export const mainMenu = () => ({
  inline_keyboard: [
    [{ text: "🌿  G R N   V P N  💚", callback_data: "menu" }],
    [
      { text: "⚡ ПОДКЛЮЧЕНИЕ", callback_data: "subs" },
      { text: "🎁 БОНУСЫ", callback_data: "ref" }
    ],
    [
      { text: "🌱 ПОДДЕРЖАТЬ", callback_data: "support" },
      { text: "✦ О ПРОЕКТЕ", callback_data: "help" }
    ]
  ]
});

export const subscriptions = (workerOrigin = "https://vpn.novogodniysait.workers.dev") => {
  const origin = String(workerOrigin || "https://vpn.novogodniysait.workers.dev").replace(/\/$/, "");
  return {
    inline_keyboard: [
      [{ text: "💚 👑  ПОЛУЧИТЬ VIP", url: `${origin}/connect?plan=vip` }],
      [{ text: "🌿 🛡️  ПОЛУЧИТЬ ОБХОД БС", url: `${origin}/connect?plan=bs` }],
      [{ text: "🌱 ‹  ВЕРНУТЬСЯ", callback_data: "menu" }]
    ]
  };
};

export const back = () => ({
  inline_keyboard: [
    [{ text: "🌿 ‹  ВЕРНУТЬСЯ В GRN VPN 💚", callback_data: "menu" }]
  ]
});
