ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin'));
ALTER TABLE users ADD COLUMN created_at TEXT NOT NULL DEFAULT '';
UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at = '';
CREATE INDEX IF NOT EXISTS users_created_at_idx ON users (created_at DESC);
