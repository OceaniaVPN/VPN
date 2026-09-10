export const mainMenu = () => ({
  inline_keyboard: [
    [{ text: "📡 Подписки", callback_data: "subs" }],
    [{ text: "🔗 Реферальная система", callback_data: "ref" }],
    [{ text: "💳 Поддержать проект", callback_data: "support" }]
  ]
});

export const back = () => ({
  inline_keyboard: [[{ text: "🏠 Главное меню", callback_data: "menu" }]]
});
