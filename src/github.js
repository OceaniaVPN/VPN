function toBase64Utf8(value) {
  const bytes = new TextEncoder().encode(String(value ?? ""));
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function fromBase64Utf8(value) {
  const binary = atob(String(value).replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function api(cfg, path, options = {}) {
  if (!cfg?.githubToken) throw new Error("GitHub token is not configured");

  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${cfg.githubToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "OceaniaVPN",
      ...(options.headers || {})
    }
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`GitHub returned invalid JSON (HTTP ${res.status})`);
  }

  if (!res.ok) throw new Error(data?.message || `GitHub HTTP ${res.status}`);
  return data;
}

const base = cfg => `/repos/${cfg.configRepoOwner}/${cfg.configRepoName}/contents/${cfg.configsFolder}`;

export async function getFileContent(cfg, filename) {
  try {
    const d = await api(cfg, `${base(cfg)}/${encodeURIComponent(filename)}?ref=${encodeURIComponent(cfg.branch)}`);
    return d.content ? fromBase64Utf8(d.content) : null;
  } catch {
    return null;
  }
}

export async function createOrUpdateFile(cfg, filename, content, message) {
  const path = `${base(cfg)}/${encodeURIComponent(filename)}`;
  let existing = null;
  try {
    existing = await api(cfg, `${path}?ref=${encodeURIComponent(cfg.branch)}`);
  } catch {}

  const body = {
    message,
    content: toBase64Utf8(content),
    branch: cfg.branch
  };
  if (existing?.sha) body.sha = existing.sha;
  return api(cfg, path, { method: "PUT", body: JSON.stringify(body) });
}

export async function deleteFile(cfg, filename, message) {
  const path = `${base(cfg)}/${encodeURIComponent(filename)}`;
  const existing = await api(cfg, `${path}?ref=${encodeURIComponent(cfg.branch)}`);
  return api(cfg, path, {
    method: "DELETE",
    body: JSON.stringify({ message, sha: existing.sha, branch: cfg.branch })
  });
}
