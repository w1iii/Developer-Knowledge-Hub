"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import './Sidebar.css'

export default function Sidebar(){
  const [searchQuery, setSearchQuery] = useState('')
  const [addQuestionModal, setAddQuestionModal] = useState(false)
  const [searchResult, setSearchResult] = useState([])
  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const router = useRouter()

  const handleLogout = async () => {
    const viewedKey = 'viewedQuestions'
    try {
      await fetch('/api/authControllers/logout', { method: 'POST' })
      sessionStorage.removeItem('user_id')
      sessionStorage.removeItem(viewedKey)
      router.push('/')
    } catch (e) {
      console.log(e)
    }
  }

  return(

  <aside className="db-sidebar">
          <div className="db-user-section">
            <div className="db-avatar">{getInitials('Lui')}</div>
            <span className="db-username-label">Lui</span>
            <button className="db-btn-logout" onClick={handleLogout}>Logout</button>
          </div>

          <nav className="db-nav-section">
            <a className="db-nav-item active">
              <span className="db-nav-item-icon">🏠</span> Home
            </a>
            <a className="db-nav-item">
              <span className="db-nav-item-icon">🔥</span> Trending
            </a>
            <a className="db-nav-item">
              <span className="db-nav-item-icon">📰</span> Latest News
            </a>
            <a className="db-nav-item">
              <span className="db-nav-item-icon">🏆</span> Leaderboards
            </a>
            <a className="db-nav-item">
              <span className="db-nav-item-icon">🌐</span> Communities
            </a>
            <div className="db-nav-divider" />
            <a className="db-nav-item">
              <span className="db-nav-item-icon">⚙️</span> Settings
            </a>
          </nav>
        </aside>
    )
}
