"use client"

import { useState } from "react"
import "../page.css"

type Post = {
  id: string
  title: string
  content: string
  user: string
}

interface MarqueeProps {
  children: React.ReactNode
  reverse?: boolean
  pauseOnHover?: boolean
}

function Marquee({ children, reverse, pauseOnHover }: MarqueeProps) {
  const [isPaused, setIsPaused] = useState(false)

  const childrenArray = Array.isArray(children) ? children : [children]

  return (
    <div className="marquee">
      <div
        className={`marquee-track ${!isPaused ? (reverse ? "animate-marquee-reverse" : "animate-marquee") : "paused"}`}
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      >
        {childrenArray}
        {childrenArray}
      </div>
    </div>
  )
}

export default function Marquee3D({ posts }: { posts: Post[] }) {
  const Card = ({ title, content, user }: Post) => (
    <figure className="marquee-card">
      <figcaption className="marquee-card-title">{title}</figcaption>
      <p className="marquee-card-user">@{user}</p>
      <blockquote className="marquee-card-content">{content}</blockquote>
    </figure>
  )

  const firstColumn = posts.slice(0, Math.ceil(posts.length / 2))
  const secondColumn = posts.slice(Math.ceil(posts.length / 2))
  const thirdColumn = posts.slice(0, Math.ceil(posts.length / 2))
  const fourthColumn = posts.slice(Math.ceil(posts.length / 2))

  return (
    <div className="marquee-3d-container">
      <div className="marquee-3d-glow" />

      <div className="marquee-3d-content">
        <div className="marquee-column">
          <Marquee pauseOnHover>
            {firstColumn.map((p) => (
              <Card key={p.id} {...p} />
            ))}
          </Marquee>
        </div>

        <div className="marquee-column">
          <Marquee reverse pauseOnHover>
            {secondColumn.map((p) => (
              <Card key={p.id} {...p} />
            ))}
          </Marquee>
        </div>

        <div className="marquee-column">
          <Marquee pauseOnHover>
            {thirdColumn.map((p) => (
              <Card key={p.id} {...p} />
            ))}
          </Marquee>
        </div>

        <div className="marquee-column">
          <Marquee reverse pauseOnHover>
            {fourthColumn.map((p) => (
              <Card key={p.id} {...p} />
            ))}
          </Marquee>
        </div>
      </div>

      <div className="fade-top" />
      <div className="fade-bottom" />
      <div className="fade-left" />
      <div className="fade-right" />
    </div>
  )
}
