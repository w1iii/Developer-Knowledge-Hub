# DevTalk - Developer Knowledge Hub

A Stack Overflow-inspired Q&A platform for developers to learn, ask questions, and share knowledge.

## Features

- **Authentication** - JWT-based user registration and login with secure cookie handling
- **Questions** - Post, edit, delete, and view developer questions
- **Tags** - Categorize questions with technology tags (JavaScript, Python, React, etc.)
- **Voting System** - Upvote/downvote questions and answers
- **Answers** - Add, edit, and delete answers to questions
- **Search** - Real-time search through questions
- **View Tracking** - Track unique question views per user
- **Dashboard** - Personalized dashboard for authenticated users

## Tech Stack

- **Frontend**: Next.js 16 (React 19), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with `pg` driver
- **Authentication**: JWT (jose library) with bcrypt password hashing

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env`:
   ```env
   DATABASE_URL=postgres://user:password@localhost:5432/devtalk
   JWT_SECRET=your-secret-key
   ```

4. Initialize the database with SQL schema files in `sql/`:
   - Create `users` and `questions` tables (not included - configure as needed)
   - Run `tags_tables.sql` for tags structure
   - Run `question_views_table.sql` for view tracking
   - Run `tags_seed.sql` for initial tag data

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── authControllers/    # Authentication endpoints
│   │   ├── commentControllers/  # Answer/comment endpoints
│   │   ├── postControllers/     # Question CRUD endpoints
│   │   ├── questions/            # Question fetching
│   │   ├── searchController/    # Search functionality
│   │   ├── tagControllers/      # Tag management
│   │   └── voteControllers/     # Voting endpoints
│   ├── components/       # React components (Navbar, Sidebar, Marquee3D)
│   ├── dashboard/        # Authenticated user dashboard
│   ├── signup/          # User registration
│   └── page.tsx         # Login page
├── lib/
│   ├── db.ts            # Database connection
│   └── utils.ts         # Utility functions
├── middleware.ts        # JWT verification middleware
├── sql/                 # Database schema files
└── public/              # Static assets
```

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/authControllers/login` | POST | User login |
| `/api/authControllers/signup` | POST | User registration |
| `/api/authControllers/me` | GET | Get current user |
| `/api/authControllers/logout` | POST | User logout |
| `/api/postControllers/viewQuestions` | GET | List all questions |
| `/api/postControllers/addQuestion` | POST | Create question |
| `/api/postControllers/editQuestion` | POST | Update question |
| `/api/postControllers/deleteQuestion` | POST | Delete question |
| `/api/commentControllers/viewAnswers` | POST | Get answers for question |
| `/api/commentControllers/addAnswer` | POST | Add answer |
| `/api/commentControllers/editAnswer` | POST | Edit answer |
| `/api/commentControllers/deleteAnswer` | POST | Delete answer |
| `/api/tagControllers/viewTags` | GET | List all tags |
| `/api/voteControllers/addVote` | POST | Add vote |
| `/api/voteControllers/deleteVote` | DELETE | Remove vote |
| `/api/searchController` | POST | Search questions |
| `/api/questions` | GET | Public questions list |

## Available Scripts

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```
