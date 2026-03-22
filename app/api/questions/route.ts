
// =============================
// /app/api/questions/route.ts
// (example backend)
// =============================

import { NextResponse } from "next/server"

export async function GET() {
  const questions = [
    {
      id: "1",
      title: "How does ts_rank work?",
      content: "I'm confused about Postgres full-text search ranking...",
      user: "lui",
    },
    {
      id: "2",
      title: "Next.js auth issue",
      content: "Why is my JWT not persisting?",
      user: "dev123",
    },
    {
      id: "3",
      title: "Best CV roadmap?",
      content: "I want to switch from web dev to AI...",
      user: "visionguy",
    },
    {
      id: "4",
      title: "React useEffect dependency",
      content: "Why is my effect running twice in Strict Mode?",
      user: "react_newbie",
    },
    {
      id: "5",
      title: "Docker container exits immediately",
      content: "My Node app container keeps stopping after start...",
      user: "docker_fan",
    },
    {
      id: "6",
      title: "TypeScript generic constraint",
      content: "How do I constrain a generic to have specific properties?",
      user: "ts_wizard",
    },
    {
      id: "7",
      title: "Git merge vs rebase",
      content: "When should I use merge instead of rebase?",
      user: "git_master",
    },
    {
      id: "8",
      title: "Postgres indexing strategy",
      content: "What's the best index for JSON columns?",
      user: "db_admin",
    },
    {
      id: "9",
      title: "CSS grid vs flexbox",
      content: "When to use grid over flexbox for layouts?",
      user: "css_artist",
    },
    {
      id: "10",
      title: "API rate limiting",
      content: "Best practices for implementing rate limiting?",
      user: "backend_pro",
    },
    {
      id: "11",
      title: "Next.js server actions",
      content: "How to handle errors in server actions?",
      user: "next_fan",
    },
    {
      id: "12",
      title: "Tailwind custom config",
      content: "How to add custom colors to Tailwind theme?",
      user: "style_guru",
    },
    {
      id: "13",
      title: "GraphQL vs REST",
      content: "When is GraphQL actually better than REST?",
      user: "api_architect",
    },
    {
      id: "14",
      title: "MongoDB aggregation pipeline",
      content: "How to group and sum nested array values?",
      user: "mongo_dev",
    },
    {
      id: "15",
      title: "Vercel deployment failed",
      content: "Build works locally but fails on Vercel...",
      user: "cloud_dev",
    },
  ]

  return NextResponse.json(questions)
}
