export async function upsertUser(db, user) {
  if (!db || !user?.chat_id) return false;
  try {
    const now = Date.now();
    await db.prepare(`INSERT INTO users(chat_id,username,first_name,created_at,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(chat_id) DO UPDATE SET username=excluded.username, first_name=excluded.first_name, updated_at=excluded.updated_at`).bind(user.chat_id, user.username || null, user.first_name || null, now, now).run();
    return true;
  } catch (error) {
    console.error("upsertUser failed", error);
    return false;
  }
}

export async function attachReferral(db, referrerId, referredId) {
  if (!db || !referrerId || !referredId || referrerId === referredId) return false;
  try {
    const existing = await db.prepare(`SELECT id FROM referrals WHERE referred_id=?`).bind(referredId).first();
    if (existing) return false;
    await db.prepare(`INSERT INTO referrals(referrer_id,referred_id,status,created_at) VALUES(?,?, 'pending', ?)`).bind(referrerId, referredId, Date.now()).run();
    return true;
  } catch (error) {
    console.error("attachReferral failed", error);
    return false;
  }
}

export async function getReferralStats(db, chatId) {
  if (!db || !chatId) return { count: 0, rewarded: 0, bonusDays: 0 };
  try {
    const row = await db.prepare(`SELECT COUNT(*) count, SUM(CASE WHEN status='rewarded' THEN 1 ELSE 0 END) rewarded, COALESCE(SUM(bonus_days),0) bonusDays FROM referrals WHERE referrer_id=?`).bind(chatId).first();
    return {
      count: Number(row?.count || 0),
      rewarded: Number(row?.rewarded || 0),
      bonusDays: Number(row?.bonusDays || 0)
    };
  } catch (error) {
    console.error("getReferralStats failed", error);
    return { count: 0, rewarded: 0, bonusDays: 0 };
  }
}

export async function qualifyReferral(db, referredId, bonusDays) {
  if (!db || !referredId || !bonusDays) return false;
  try {
    const ref = await db.prepare(`SELECT id,referrer_id,status FROM referrals WHERE referred_id=?`).bind(referredId).first();
    if (!ref || ref.status !== "pending") return false;
    const now = Date.now();
    await db.batch([
      db.prepare(`UPDATE referrals SET status='rewarded', bonus_days=?, qualified_at=?, rewarded_at=? WHERE id=?`).bind(bonusDays, now, now, ref.id),
      db.prepare(`UPDATE users SET bonus_days=bonus_days+?, updated_at=? WHERE chat_id=?`).bind(bonusDays, now, ref.referrer_id)
    ]);
    return true;
  } catch (error) {
    console.error("qualifyReferral failed", error);
    return false;
  }
}
