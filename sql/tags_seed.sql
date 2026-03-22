-- Tags Seed Data

INSERT INTO tags (tag_name, description) VALUES
('javascript', 'JavaScript programming language for web development'),
('typescript', 'TypeScript - typed superset of JavaScript'),
('python', 'Python programming language'),
('sql', 'Structured Query Language for database management'),
('css', 'Cascading Style Sheets for web styling'),
('html', 'HyperText Markup Language for web page structure'),
('react', 'React library for building user interfaces'),
('nodejs', 'Node.js JavaScript runtime environment'),
('git', 'Git version control system'),
('docker', 'Docker containerization platform')
ON CONFLICT (tag_name) DO NOTHING;
