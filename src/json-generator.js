const SUPPORTED_URI = /^(vless|vmess|trojan|ss|hysteria2?|tuic|wg|wireguard):\/\//i;

function splitInput(text) {
  return String(text || "")
    .replace(/```(?:json|text)?/gi, "")
    .replace(/```/g, "")
    .split(/\r?\n+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function removeBs(config) {
  if (!config || typeof config !== "object" || Array.isArray(config)) return null;

  const outbounds = Array.isArray(config.outbounds) ? config.outbounds : [];
  const cleanOutbounds = outbounds.filter(out => {
    const tag = String(out?.tag || "").toLowerCase();
    return !tag.startsWith("proxy-bs-") && !tag.includes("bs") && !String(out?.remarks || "").toLowerCase().includes("бс");
  });

  if (!cleanOutbounds.length) return null;

  const clean = { ...config, outbounds: cleanOutbounds };
  delete clean.balancers;
  delete clean.burstObservatory;

  if (clean.routing && typeof clean.routing === "object") {
    const routing = { ...clean.routing };
    delete routing.balancers;

    if (Array.isArray(routing.rules)) {
      routing.rules = routing.rules.map(rule => {
        if (!rule || typeof rule !== "object") return rule;
        const next = { ...rule };
        delete next.balancerTag;
        const tag = String(next.outboundTag || "");
        if (tag.toLowerCase().startsWith("proxy-bs-")) {
          next.outboundTag = cleanOutbounds.find(o => o?.tag && o.tag !== "direct" && o.tag !== "block")?.tag || "direct";
        }
        return next;
      });
    }
    clean.routing = routing;
  }

  return clean;
}

function parseVless(uri, index) {
  const url = new URL(uri);
  const id = decodeURIComponent(url.username);
  const address = url.hostname;
  const port = Number(url.port || 443);
  const p = url.searchParams;
  const network = p.get("type") || p.get("network") || "tcp";
  const security = p.get("security") || "none";
  const tag = (p.get("remarks") || p.get("name") || url.hash.replace(/^#/, "") || `proxy-${index}`).trim();

  const user = { id, encryption: "none" };
  const flow = p.get("flow");
  if (flow) user.flow = flow;

  const outbound = {
    protocol: "vless",
    settings: { vnext: [{ address, port, users: [user] }] },
    streamSettings: { network, security },
    tag
  };

  if (security === "reality") {
    outbound.streamSettings.realitySettings = {
      serverName: p.get("sni") || p.get("serverName") || "",
      fingerprint: p.get("fp") || p.get("fingerprint") || "chrome",
      publicKey: p.get("pbk") || p.get("publicKey") || ""
    };
    const sid = p.get("sid") || p.get("shortId");
    if (sid) outbound.streamSettings.realitySettings.shortId = sid;
  } else if (security === "tls") {
    outbound.streamSettings.tlsSettings = {
      serverName: p.get("sni") || p.get("serverName") || "",
      fingerprint: p.get("fp") || p.get("fingerprint") || undefined
    };
    if (!outbound.streamSettings.tlsSettings.fingerprint) delete outbound.streamSettings.tlsSettings.fingerprint;
  }

  if (network === "grpc") {
    outbound.streamSettings.grpcSettings = {
      multiMode: false,
      serviceName: p.get("serviceName") || p.get("serviceName") || ""
    };
  } else if (network === "ws") {
    outbound.streamSettings.wsSettings = { path: p.get("path") || "/" };
  } else if (network === "xhttp") {
    outbound.streamSettings.xhttpSettings = {
      mode: p.get("mode") || "auto",
      path: p.get("path") || "/"
    };
  }

  return {
    dns: { servers: ["1.1.1.1", "8.8.8.8", "77.88.8.8"], queryStrategy: "UseIP" },
    routing: {
      rules: [
        { type: "field", protocol: ["quic"], outboundTag: "block" },
        { type: "field", protocol: ["bittorrent"], outboundTag: "block" },
        { type: "field", domain: ["regexp:\\.(ru|su|xn--p1ai)$"], outboundTag: "direct" },
        { type: "field", network: "tcp,udp", outboundTag: tag }
      ],
      domainMatcher: "hybrid",
      domainStrategy: "IPIfNonMatch"
    },
    inbounds: [
      { tag: "socks", port: 10808, listen: "127.0.0.1", protocol: "socks", settings: { udp: true, auth: "noauth" }, sniffing: { enabled: true, routeOnly: false, destOverride: ["http", "tls"] } },
      { tag: "http", port: 10809, listen: "127.0.0.1", protocol: "http", settings: { allowTransparent: false }, sniffing: { enabled: true, routeOnly: false, destOverride: ["http", "tls"] } }
    ],
    outbounds: [outbound, { tag: "direct", protocol: "freedom" }, { tag: "block", protocol: "blackhole" }],
    remarks: `${tag}`,
    meta: { description: "GRN VPN JSON subscription" }
  };
}

export function generateJsonSubscription(input) {
  const raw = String(input || "").trim();
  if (!raw) throw new Error("Ключи не переданы");

  const configs = [];
  const lines = splitInput(raw);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (SUPPORTED_URI.test(line)) {
      if (/^vless:\/\//i.test(line)) configs.push(parseVless(line, configs.length));
      continue;
    }

    try {
      const parsed = JSON.parse(line);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const clean = removeBs(item);
          if (clean) configs.push(clean);
        }
      } else {
        const clean = removeBs(parsed);
        if (clean) configs.push(clean);
      }
    } catch {
      // Ignore non-JSON lines so a mixed list can still be processed.
    }
  }

  if (!configs.length) throw new Error("Не найдено ни одного VLESS/JSON ключа");
  return JSON.stringify(configs, null, 2);
}
