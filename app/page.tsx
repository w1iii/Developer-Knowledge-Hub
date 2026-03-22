"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Marquee3D from "./components/Marquee3D"
import "./page.css"

type Post = {
  id: string
  title: string
  content: string
  user: string
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch("/api/questions")
        const data = await res.json()
        setPosts(data)
      } catch (e) {
        console.log("Failed to load posts", e)
      }
    }

    loadPosts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/authControllers/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login failed")
        return
      }

      setError("")
      router.push("/dashboard")
    } catch (e) {
      console.log(e)
      setError("An error occurred")
    }
  }

  return (
    <div className="login-page-container">
      <div className="left-container">
        <h1>&lt; DevTalk /&gt;</h1>
        <p>Learn.Ask.Build.</p>

        <div className="ui-container">
          {posts.length > 0 && <Marquee3D posts={posts} />}
        </div>
      </div>

      <div className="login-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input-login"
            placeholder="email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input-login"
            placeholder="password"
          />
          <button type="submit">Submit</button>
        </form>
        {error && <p className="error-message">{error}</p>}
        <Link href="/signup" className="create-account-link">
          Create account
        </Link>
      </div>
    </div>
  )
}
