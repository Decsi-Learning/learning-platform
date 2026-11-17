-- users.password stores the PBKDF2-SHA-256 encoded password hash, never plaintext.
CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
	email TEXT UNIQUE,
	password TEXT,
	role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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

CREATE INDEX IF NOT EXISTS users_created_at_idx ON users (created_at DESC);

CREATE TABLE IF NOT EXISTS forum_posts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL,
	track_id TEXT,
	topic_id TEXT,
	title TEXT NOT NULL,
	body TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS forum_posts_recent_idx ON forum_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS forum_posts_topic_idx ON forum_posts (track_id, topic_id, created_at DESC);

CREATE TABLE IF NOT EXISTS forum_replies (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	post_id INTEGER NOT NULL,
	user_id INTEGER NOT NULL,
	body TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS forum_replies_post_idx ON forum_replies (post_id, created_at);

CREATE TABLE IF NOT EXISTS forum_helpful (
	user_id INTEGER NOT NULL,
	reply_id INTEGER NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (user_id, reply_id),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (reply_id) REFERENCES forum_replies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS forum_reports (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	reporter_id INTEGER NOT NULL,
	post_id INTEGER,
	reply_id INTEGER,
	reason TEXT NOT NULL,
	ai_status TEXT NOT NULL DEFAULT 'pending',
	ai_summary TEXT NOT NULL DEFAULT '',
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
	FOREIGN KEY (reply_id) REFERENCES forum_replies(id) ON DELETE CASCADE,
	CHECK ((post_id IS NOT NULL AND reply_id IS NULL) OR (post_id IS NULL AND reply_id IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS forum_notifications (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL,
	type TEXT NOT NULL,
	post_id INTEGER,
	message TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	read_at TEXT,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS forum_notifications_user_idx ON forum_notifications (user_id, read_at, created_at DESC);
