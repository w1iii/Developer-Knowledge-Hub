-- Master Schema File - Run all tables in order
-- Execute these files in order:
-- 1. 01_users.sql
-- 2. 02_questions.sql
-- 3. 03_answers.sql
-- 4. 04_votes.sql
-- 5. 05_tags.sql
-- 6. 06_question_tags.sql
-- 7. 07_question_views.sql

-- Or run this entire file at once

\i 01_users.sql
\i 02_questions.sql
\i 03_answers.sql
\i 04_votes.sql
\i 05_tags.sql
\i 06_question_tags.sql
\i 07_question_views.sql
