async function api(cfg, path, options = {}) {
  const res = await fetch(`https://api.github.com${path}`, { ...options, headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${cfg.githubToken}`, "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "OceaniaVPN" } });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `GitHub HTTP ${res.status}`);
  return data;
}
const base = cfg => `/repos/${cfg.configRepoOwner}/${cfg.configRepoName}/contents/${cfg.configsFolder}`;
export async function getFileContent(cfg, filename) {
  try { const d = await api(cfg, `${base(cfg)}/${encodeURIComponent(filename)}?ref=${encodeURIComponent(cfg.branch)}`); return d.content ? atob(d.content.replace(/\n/g, "")) : null; } catch { return null; }
}
export async function createOrUpdateFile(cfg, filename, content, message) {
  const path = `${base(cfg)}/${encodeURIComponent(filename)}`;
  let existing = null; try { existing = await api(cfg, `${path}?ref=${encodeURIComponent(cfg.branch)}`); } catch {}
  const body = { message, content: btoa(unescape(encodeURIComponent(content))), branch: cfg.branch };
  if (existing?.sha) body.sha = existing.sha;
  return api(cfg, path, { method: "PUT", body: JSON.stringify(body) });
}
export async function deleteFile(cfg, filename, message) {
  const path = `${base(cfg)}/${encodeURIComponent(filename)}`;
  const existing = await api(cfg, `${path}?ref=${encodeURIComponent(cfg.branch)}`);
  return api(cfg, path, { method: "DELETE", body: JSON.stringify({ message, sha: existing.sha, branch: cfg.branch }) });
}
