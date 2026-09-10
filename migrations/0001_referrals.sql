CREATE TABLE IF NOT EXISTS users (
  chat_id INTEGER PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  bonus_days INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_id INTEGER NOT NULL,
  referred_id INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  bonus_days INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  qualified_at INTEGER,
  rewarded_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
