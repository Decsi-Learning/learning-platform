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

CREATE INDEX IF NOT EXISTS learning_progress_user_recent_idx
	ON learning_progress (user_id, status, last_accessed_at DESC);
