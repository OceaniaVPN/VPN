export function getConfig(env) {
  return {
    telegramToken: env.TELEGRAM_BOT_TOKEN,
    githubToken: env.GITHUB_TOKEN,
    adminId: Number(env.ADMIN_ID || 0),
    botUsername: String(env.BOT_USERNAME || "").replace(/^@/, ""),
    configRepoOwner: env.CONFIG_REPO_OWNER || "OceaniaVPN",
    configRepoName: env.CONFIG_REPO_NAME || "StekloVPN",
    configsFolder: env.CONFIGS_FOLDER || "configs",
    branch: env.BRANCH || "main",
    workerOrigin: (env.WORKER_ORIGIN || "").replace(/\/$/, ""),
    subscriptionSecret: env.SUBSCRIPTION_SECRET || env.TELEGRAM_BOT_TOKEN || "",
    webhookSecret: env.TELEGRAM_WEBHOOK_SECRET || "",
    db: env.DB || null,
  };
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
export function isValidChatId(value) { return /^-?\d{1,20}$/.test(String(value || "")); }
export function isSafeConfigFilename(value) { return /^(?:user_-?\d{1,20}|decoded_-?\d{1,20}_[a-z0-9]+)\.txt$/i.test(String(value || "")); }
