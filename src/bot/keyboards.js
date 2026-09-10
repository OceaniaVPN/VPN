export const mainMenu = () => ({
  inline_keyboard: [
    [{ text: "🌿  G R N   V P N  💚", callback_data: "menu" }],
    [
      { text: "🟢 ⚡ ПОДКЛЮЧЕНИЕ", callback_data: "subs" },
      { text: "🍀 🎁 БОНУСЫ", callback_data: "ref" }
    ],
    [
      { text: "💚 🌱 ПОДДЕРЖАТЬ", callback_data: "support" },
      { text: "🌿 ✦ О ПРОЕКТЕ", callback_data: "help" }
    ],
    [{ text: "━━━━━━━━  🌿 GRN VPN 💚  ━━━━━━━━", callback_data: "menu" }]
  ]
});

export const subscriptions = () => ({
  inline_keyboard: [
    [{ text: "💚 👑  ПОЛУЧИТЬ VIP", url: "https://github.com/lsncococososo-rgb/GRN_VPN/raw/refs/heads/main/Vip.txt" }],
    [{ text: "🌿 🛡️  ПОЛУЧИТЬ ОБХОД БС", url: "https://github.com/lsncococososo-rgb/GRN_VPN/raw/refs/heads/main/%D0%9E%D0%B1%D1%85%D0%BE%D0%B4%20%D0%B1%D1%81" }],
    [{ text: "🌱 ‹  ВЕРНУТЬСЯ", callback_data: "menu" }]
  ]
});

export const back = () => ({
  inline_keyboard: [
    [{ text: "🌿 ‹  ВЕРНУТЬСЯ В GRN VPN 💚", callback_data: "menu" }]
  ]
});
