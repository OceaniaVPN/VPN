export const mainMenu = () => ({
  inline_keyboard: [
    [
      { text: "📡  Подписки", callback_data: "subs" },
      { text: "🔗  Рефералы", callback_data: "ref" }
    ],
    [
      { text: "💚  Поддержать проект", callback_data: "support" }
    ],
    [
      { text: "✨  Помощь", callback_data: "help" }
    ]
  ]
});

export const back = () => ({
  inline_keyboard: [
    [{ text: "🏠  Главное меню", callback_data: "menu" }]
  ]
});
