"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Marquee3D from "../components/Marquee3D"
import "../page.css"

type Post = {
  id: string
  title: string
  content: string
  user: string
}

export default function Signup() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [posts, setPosts] = useState<Post[]>([])
  const router = useRouter()

  useState(() => {
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
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/authControllers/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Signup failed")
        return
      }

      setMessage("Account created successfully!")
      setUsername("")
      setEmail("")
      setPassword("")
      setError("")

      setTimeout(() => {
        router.push("/")
      }, 1500)
    } catch (err: any) {
      setError(err.message || "An error occurred")
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
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-input-login"
            placeholder="username"
          />
          <input
            type="email"
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
          <button type="submit">Create Account</button>
        </form>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <Link href="/" className="create-account-link">
          Already have an account? Login
        </Link>
      </div>
    </div>
  )
}
