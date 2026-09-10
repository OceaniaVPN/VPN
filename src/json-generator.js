const SUPPORTED_URI = /^(vless|vmess|trojan|ss|hysteria2?|tuic|wg|wireguard):\/\//i;

function splitInput(text) {
  return String(text || "")
    .replace(/```(?:json|text)?/gi, "")
    .replace(/```/g, "")
    .split(/\r?\n+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function decodeFragment(value) {
  const raw = String(value || "").replace(/^#/, "");
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function humanName(value, fallback) {
  const name = String(value || "").trim();
  return name || fallback;
}

function makeTag(name, index) {
  const cleaned = humanName(name, `Server ${String(index + 1).padStart(2, "0")}`)
    .replace(/[\r\n]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  return `proxy-${cleaned}`;
}

function extractJsonOutbounds(config) {
  if (!config || typeof config !== "object" || Array.isArray(config)) return [];
  const outbounds = Array.isArray(config.outbounds) ? config.outbounds : [];
  return outbounds.filter(out => {
    const protocol = String(out?.protocol || "").toLowerCase();
    return !["freedom", "blackhole", "dns", "loopback"].includes(protocol);
  });
}

function parseVless(uri, index) {
  const url = new URL(uri);
  const id = decodeURIComponent(url.username);
  const address = url.hostname;
  const port = Number(url.port || 443);
  const p = url.searchParams;
  const network = p.get("type") || p.get("network") || "tcp";
  const security = p.get("security") || "none";
  const name = humanName(
    p.get("remarks") || p.get("name") || decodeFragment(url.hash),
    `Server ${String(index + 1).padStart(2, "0")}`
  );
  const tag = makeTag(name, index);

  const user = { id, encryption: "none" };
  const flow = p.get("flow");
  if (flow) user.flow = flow;

  const outbound = {
    protocol: "vless",
    settings: { vnext: [{ address, port, users: [user] }] },
    streamSettings: { network, security },
    tag,
    remarks: name
  };

  const alpn = p.get("alpn");
  if (security === "reality") {
    outbound.streamSettings.realitySettings = {
      serverName: p.get("sni") || p.get("serverName") || "",
      fingerprint: p.get("fp") || p.get("fingerprint") || "chrome",
      publicKey: p.get("pbk") || p.get("publicKey") || ""
    };
    const sid = p.get("sid") || p.get("shortId");
    if (sid) outbound.streamSettings.realitySettings.shortId = sid;
    if (alpn) outbound.streamSettings.realitySettings.alpn = alpn.split(",").map(s => s.trim()).filter(Boolean);
  } else if (security === "tls") {
    outbound.streamSettings.tlsSettings = {
      serverName: p.get("sni") || p.get("serverName") || ""
    };
    const fp = p.get("fp") || p.get("fingerprint");
    if (fp) outbound.streamSettings.tlsSettings.fingerprint = fp;
    if (alpn) outbound.streamSettings.tlsSettings.alpn = alpn.split(",").map(s => s.trim()).filter(Boolean);
  }

  if (network === "grpc") {
    outbound.streamSettings.grpcSettings = {
      multiMode: false,
      serviceName: p.get("serviceName") || ""
    };
  } else if (network === "ws") {
    outbound.streamSettings.wsSettings = {
      path: p.get("path") || "/",
      headers: {}
    };
    const host = p.get("host");
    if (host) outbound.streamSettings.wsSettings.headers.Host = host;
  } else if (network === "xhttp") {
    outbound.streamSettings.xhttpSettings = {
      mode: p.get("mode") || "auto",
      path: p.get("path") || "/"
    };
    const host = p.get("host");
    if (host) outbound.streamSettings.xhttpSettings.host = host;
  }

  return outbound;
}

function normalizeJsonOutbound(out, index) {
  const copy = JSON.parse(JSON.stringify(out));
  const name = humanName(copy.remarks || copy.name || copy.tag, `Server ${String(index + 1).padStart(2, "0")}`);
  copy.tag = makeTag(name, index);
  copy.remarks = name;
  delete copy.name;
  return copy;
}

function buildSubscription(outbounds) {
  const proxyOutbounds = outbounds.map((out, index) => normalizeJsonOutbound(out, index));
  const tags = proxyOutbounds.map(out => out.tag);
  const manualServers = proxyOutbounds.map(out => ({
    tag: out.tag,
    name: out.remarks
  }));

  return {
    dns: {
      servers: ["1.1.1.1", "8.8.8.8", "77.88.8.8"],
      queryStrategy: "UseIP"
    },
    routing: {
      domainStrategy: "IPIfNonMatch",
      rules: [
        { type: "field", protocol: ["quic", "bittorrent"], outboundTag: "block" },
        { type: "field", network: "tcp,udp", balancerTag: "auto" }
      ],
      balancers: [
        {
          tag: "auto",
          selector: ["proxy-"],
          fallbackTag: tags[0],
          strategy: {
            type: "leastLoad",
            settings: {
              expected: Math.min(2, tags.length),
              maxRTT: "1s",
              tolerance: 0.2
            }
          }
        }
      ]
    },
    inbounds: [
      {
        tag: "socks",
        port: 10808,
        listen: "127.0.0.1",
        protocol: "socks",
        settings: { udp: true, auth: "noauth" },
        sniffing: { enabled: true, routeOnly: false, destOverride: ["http", "tls"] }
      },
      {
        tag: "http",
        port: 10809,
        listen: "127.0.0.1",
        protocol: "http",
        settings: { allowTransparent: false },
        sniffing: { enabled: true, routeOnly: false, destOverride: ["http", "tls"] }
      }
    ],
    outbounds: [
      ...proxyOutbounds,
      { tag: "direct", protocol: "freedom" },
      { tag: "block", protocol: "blackhole" }
    ],
    remarks: "GRN VPN Auto",
    meta: {
      description: "GRN VPN: one auto balancer followed by manually selectable named servers",
      balancer: "auto",
      manualSelection: true,
      manualServers
    }
  };
}

export function generateJsonSubscription(input) {
  const raw = String(input || "").trim();
  if (!raw) throw new Error("Ключи не переданы");

  const outbounds = [];
  const lines = splitInput(raw);

  for (const line of lines) {
    if (SUPPORTED_URI.test(line)) {
      if (/^vless:\/\//i.test(line)) {
        outbounds.push(parseVless(line, outbounds.length));
      }
      continue;
    }

    try {
      const parsed = JSON.parse(line);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        outbounds.push(...extractJsonOutbounds(item));
      }
    } catch {
      // Ignore non-JSON lines so mixed input can still be processed.
    }
  }

  if (!outbounds.length) throw new Error("Не найдено ни одного поддерживаемого ключа");

  return JSON.stringify(buildSubscription(outbounds), null, 2);
}
