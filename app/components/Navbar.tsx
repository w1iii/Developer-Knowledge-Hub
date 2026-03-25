"use client"

import { useState } from 'react'
import './Navbar.css'

export default function Navbar(){
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState([])
return(
  <nav className="db-navbar">
          <span className="db-navbar-brand">&lt;<span>DevTalk</span>/&gt;</span>

          <div className="db-search-wrapper">
            <span className="db-search-icon">🔍</span>
            <input
              type="text"
              className="db-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="search..."
            />
            {searchResult.length > 0 && (
              <div className="db-search-results-dropdown">
                {searchResult.map((item: any) => (
                  <div key={item.question_id} className="db-search-result-item">{item.title}</div>
                ))}
              </div>
            )}
          </div>

          <div className="db-navbar-actions">
            <button className="db-btn-create" onClick={() => setAddQuestionModal(true)}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>＋</span> Create
            </button>
          </div>
        </nav>
  )
}
