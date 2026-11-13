CREATE TABLE IF NOT EXISTS learning_page_progress (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL,
	track_id TEXT NOT NULL,
	topic_id TEXT NOT NULL,
	page_id TEXT NOT NULL,
	last_accessed_at TEXT NOT NULL,
	UNIQUE (user_id, track_id, topic_id, page_id)
);

CREATE INDEX IF NOT EXISTS learning_page_progress_user_idx
	ON learning_page_progress (user_id, track_id, topic_id);
