"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function Sidebar(){
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
    <>
      <nav className="navbar">
        <span className="navbar-brand">&lt;<span> DevTalk </span> /&gt;</span>

        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="search..."
          />
          {searchResult.length > 0 && (
            <div className="search-results-dropdown">
              {searchResult.map((item: any) => (
                <div key={item.question_id} className="search-result-item">{item.title}</div>
              ))}
            </div>
          )}
        </div>

        <div className="navbar-actions">
          <button className="btn-create" onClick={() => setAddQuestionModal(true)}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>＋</span> Create
          </button>
        </div>
      </nav>
      <aside className="sidebar">
          <div className="user-section">
            <div className="avatar">{getInitials('Lui')}</div>
            <span className="username-label">Lui</span>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>

          <nav className="nav-section">
            <a className="nav-item active">
              <span className="nav-item-icon">🏠</span> Home
            </a>
            <a className="nav-item">
              <span className="nav-item-icon">🔥</span> Trending
            </a>
            <a className="nav-item">
              <span className="nav-item-icon">📰</span> Latest News
            </a>
            <a className="nav-item">
              <span className="nav-item-icon">🏆</span> Leaderboards
            </a>
            <a className="nav-item">
              <span className="nav-item-icon">🌐</span> Communities
            </a>
            <div className="nav-divider" />
            <a className="nav-item">
              <span className="nav-item-icon">⚙️</span> Settings
            </a>
          </nav>
        </aside>
    </>
  )
}
