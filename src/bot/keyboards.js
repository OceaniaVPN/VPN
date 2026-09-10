export const mainMenu = (isAdmin = false) => {
  const rows = [
    [{ text: "🚀 Создать подписку", callback_data: "create" }],
    [{ text: "📋 Моя подписка", callback_data: "my" }, { text: "📡 Серверы", callback_data: "list" }],
    [{ text: "🔗 Рефка", callback_data: "ref" }],
    [{ text: "🌐 Прокси", callback_data: "proxy" }, { text: "🔍 Декодер", callback_data: "decode" }],
    [{ text: "⚡ Полезные функции", callback_data: "features" }],
    [{ text: "ℹ️ Помощь", callback_data: "help" }]
  ];
  if (isAdmin) rows.push([{ text: "🛠 DEV", callback_data: "dev" }]);
  return { inline_keyboard: rows };
};
export const back = () => ({ inline_keyboard: [[{ text: "🏠 Главное меню", callback_data: "menu" }]] });
