export function buildFile(state, uris = [], defaults = {}) {
  const title = state.title || defaults.title || "My Subscription";
  const interval = Number(state.interval || defaults.interval || 4);
  const days = state.expireDays && state.expireDays !== "none" ? Math.max(0, parseInt(state.expireDays, 10) || 0) : 0;
  const expire = days ? Math.floor(Date.now() / 1000) + days * 86400 : 0;
  const lines = [
    `#profile-title: ${title}`,
    `#profile-update-interval: ${interval}`,
    `#subscription-userinfo: upload=0; download=0; total=536870912000; expire=${expire}`
  ];
  if (state.webpage) lines.push(`#profile-web-page-url: ${state.webpage}`);
  if (state.announce) lines.push(`#announce: ${state.announce}`);
  if (days) { lines.push(`#x-expire-days-total: ${days}`, `#x-expire-ts: ${expire}`); }
  if (state.theme) lines.push(`#x-theme: ${state.theme}`);
  lines.push("", ...uris);
  return lines.join("\n");
}
