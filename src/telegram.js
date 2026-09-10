async function request(token, method, body) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return res.json();
}

function addNavigation(markup) {
  if (markup?.keyboard) return markup;
  const rows = markup?.inline_keyboard ? markup.inline_keyboard.map(r => [...r]) : [];
  if (!rows.some(r => r.some(b => b?.callback_data === "menu"))) rows.push([{ text: "🏠 Главное меню", callback_data: "menu" }]);
  return { ...(markup || {}), inline_keyboard: rows };
}

export async function sendMessage(token, chatId, text, replyMarkup = null) {
  return request(token, "sendMessage", { chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true, reply_markup: replyMarkup ? addNavigation(replyMarkup) : undefined });
}
export async function editMessage(token, chatId, messageId, text, replyMarkup = null) {
  return request(token, "editMessageText", { chat_id: chatId, message_id: messageId, text, parse_mode: "HTML", reply_markup: replyMarkup ? addNavigation(replyMarkup) : undefined });
}
export async function answerCallback(token, callbackId) { return request(token, "answerCallbackQuery", { callback_query_id: callbackId }); }
export async function getFile(token, fileId) {
  const info = await request(token, "getFile", { file_id: fileId });
  if (!info?.result?.file_path) return null;
  const res = await fetch(`https://api.telegram.org/file/bot${token}/${info.result.file_path}`);
  return res.ok ? res.text() : null;
}
