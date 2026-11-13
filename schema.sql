-- users.password stores the PBKDF2-SHA-256 encoded password hash, never plaintext.
CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
	email TEXT UNIQUE,
	password TEXT
);
CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, prompt TEXT, reply TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS learning_progress (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL,
	track_id TEXT NOT NULL,
	topic_id TEXT NOT NULL,
	status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed')),
	last_accessed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	completed_at TEXT,
	UNIQUE (user_id, track_id, topic_id)
);
CREATE INDEX IF NOT EXISTS learning_progress_user_recent_idx ON learning_progress (user_id, status, last_accessed_at DESC);
CREATE TABLE IF NOT EXISTS learning_page_progress (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL,
	track_id TEXT NOT NULL,
	topic_id TEXT NOT NULL,
	page_id TEXT NOT NULL,
	last_accessed_at TEXT NOT NULL,
	UNIQUE (user_id, track_id, topic_id, page_id)
);
CREATE INDEX IF NOT EXISTS learning_page_progress_user_idx ON learning_page_progress (user_id, track_id, topic_id);
