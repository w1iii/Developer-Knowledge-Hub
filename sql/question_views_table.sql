-- Create question_views table to track unique views
CREATE TABLE IF NOT EXISTS question_views (
    view_id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(question_id, user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_question_views_lookup ON question_views(question_id, user_id);
