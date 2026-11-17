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
