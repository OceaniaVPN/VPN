function decodeB64(value) {
  try { return atob(value.replace(/-/g, "+").replace(/_/g, "/")); } catch { return null; }
}
export async function decodeSubscription(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Happ/3.26.3" }, redirect: "follow" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    let text = (await res.text()).replace(/^\uFEFF/, "").trim();
    const urls = [...text.matchAll(/(?:vless|vmess|trojan|ss|hysteria2?|tuic|wg|wireguard):\/\/[^\s<>'"`]+/gi)].map(m => m[0]);
    if (urls.length) return { ok: true, uris: [...new Set(urls)], metadata: {} };
    const decoded = decodeB64(text.replace(/\s/g, ""));
    if (decoded) {
      const nested = [...decoded.matchAll(/(?:vless|vmess|trojan|ss|hysteria2?|tuic|wg|wireguard):\/\/[^\s<>'"`]+/gi)].map(m => m[0]);
      if (nested.length) return { ok: true, uris: [...new Set(nested)], metadata: {} };
    }
    return { ok: false, error: "В подписке не найдены поддерживаемые конфигурации" };
  } catch (e) { return { ok: false, error: e.message }; }
}
