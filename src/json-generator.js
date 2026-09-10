const SUPPORTED_URI = /^(vless|vmess|trojan|ss|hysteria2?|tuic|wg|wireguard):\/\//i;

function splitInput(text) {
  return String(text || "")
    .replace(/```(?:json|text)?/gi, "")
    .replace(/```/g, "")
    .split(/\r?\n+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function isBsOutbound(out) {
  if (!out || typeof out !== "object") return true;
  const tag = String(out.tag || "").toLowerCase();
  const remarks = String(out.remarks || "").toLowerCase();
  return tag.startsWith("proxy-bs-") || tag.includes("bs") || remarks.includes("бс") || remarks.includes("белые списки");
}

function extractJsonOutbounds(config) {
  if (!config || typeof config !== "object" || Array.isArray(config)) return [];
  const outbounds = Array.isArray(config.outbounds) ? config.outbounds : [];
  return outbounds.filter(out => {
    const protocol = String(out?.protocol || "").toLowerCase();
    if (["freedom", "blackhole", "dns", "loopback"].includes(protocol)) return false;
    return !isBsOutbound(out);
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
  const name = (p.get("remarks") || p.get("name") || url.hash.replace(/^#/, "") || `proxy-${index + 1}`).trim();
  const tag = `proxy-${index + 1}`;

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
      serverName: p.get("sni") || p.get("serverName") || ""
    };
    const fp = p.get("fp") || p.get("fingerprint");
    if (fp) outbound.streamSettings.tlsSettings.fingerprint = fp;
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
  }

  return outbound;
}

function normalizeJsonOutbound(out, index) {
  const copy = JSON.parse(JSON.stringify(out));
  copy.tag = `proxy-${index + 1}`;
  delete copy.remarks;
  return copy;
}

function buildSubscription(outbounds) {
  const proxyOutbounds = outbounds.map((out, index) => normalizeJsonOutbound(out, index));
  const tags = proxyOutbounds.map(out => out.tag);

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
      description: "GRN VPN JSON subscription with one auto balancer",
      balancer: "auto",
      servers: tags.length
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

  const clean = outbounds.filter(out => !isBsOutbound(out));
  if (!clean.length) throw new Error("Не найдено ни одного обычного ключа после удаления БС");

  return JSON.stringify(buildSubscription(clean), null, 2);
}
