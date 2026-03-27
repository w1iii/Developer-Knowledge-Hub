-- Question Tags Junction Table Schema
CREATE TABLE IF NOT EXISTS question_tags (
    question_id INTEGER NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(tag_id) ON DELETE RESTRICT,
    PRIMARY KEY (question_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_question_tags_tag_id ON question_tags(tag_id);
