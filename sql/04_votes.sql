-- Votes Table Schema
CREATE TABLE IF NOT EXISTS votes (
    vote_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(question_id) ON DELETE CASCADE,
    answer_id INTEGER REFERENCES answers(answer_id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_vote_target CHECK (
        (question_id IS NOT NULL AND answer_id IS NULL) OR 
        (question_id IS NULL AND answer_id IS NOT NULL)
    ),
    UNIQUE(user_id, question_id),
    UNIQUE(user_id, answer_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_question_id ON votes(question_id);
CREATE INDEX IF NOT EXISTS idx_votes_answer_id ON votes(answer_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
