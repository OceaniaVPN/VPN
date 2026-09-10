export const mainMenu = () => ({
  inline_keyboard: [
    [{ text: "🌊  OCEANIA VPN", callback_data: "menu" }],
    [
      { text: "📡  Подписки", callback_data: "subs" },
      { text: "🔗  Рефералы", callback_data: "ref" }
    ],
    [
      { text: "💚  Поддержать проект", callback_data: "support" },
      { text: "✨  Помощь", callback_data: "help" }
    ]
  ]
});

export const subscriptions = () => ({
  inline_keyboard: [
    [
      { text: "👑  VIP", url: "https://github.com/lsncococososo-rgb/GRN_VPN/raw/refs/heads/main/Vip.txt" },
      { text: "🛡️  Обход БС", url: "https://github.com/lsncococososo-rgb/GRN_VPN/raw/refs/heads/main/%D0%9E%D0%B1%D1%85%D0%BE%D0%B4%20%D0%B1%D1%81" }
    ],
    [{ text: "🏠  Главное меню", callback_data: "menu" }]
  ]
});

export const back = () => ({
  inline_keyboard: [
    [{ text: "‹  Назад в меню", callback_data: "menu" }]
  ]
});
