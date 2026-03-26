"use client"

import { useState, useEffect } from 'react'
import './Navbar.css'

interface Tag {
  tag_id: number
  tag_name: string
}

export default function Navbar(){
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState([])
  const [addQuestionModal, setAddQuestionModal] = useState(false)
  const [newTitle, setnewTitle] = useState('')
  const [newDescription, setnewDescription] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])


useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setSearchResult([])
      return
    }
    try {
      const delay = setTimeout(async () => {
        const res = await fetch('/api/searchController', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ searchQuery })
        })
        const data = await res.json()
        setSearchResult(data.searchResult)
      }, 250)
      return () => clearTimeout(delay)
    } catch {
      console.log("SEARCH CONTROLLER NOT IMPLEMENTED")
    }
  }, [searchQuery])



  useEffect(() => {
    async function loadTags() {
      const res = await fetch("/api/tagControllers/viewTags")
      const data = await res.json()
      setAvailableTags(data)
    }
    loadTags()
  }, [])

  const toggleTag = (tagId: number) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }
 const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newDescription.trim()) {
      alert('Title and description cannot be empty')
      return
    }
    try {
      const res = await fetch('/api/postControllers/addQuestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: newTitle, description: newDescription, tag_ids: selectedTagIds })
      })
      if (res.ok) {
        setnewTitle('')
        setnewDescription('')
        setAddQuestionModal(false)
        setSelectedTagIds([])
      } else {
        alert('Failed to add: ' + (await res.json()).error)
      }
    } catch (e) {
      console.log('Save error', e)
      alert('Error saving question')
    }
  }
return(
  <nav className="db-navbar">
    {addQuestionModal && (
            <div className="db-modal-overlay" onClick={() => setAddQuestionModal(false)}>
              <div className="db-modal-card" onClick={e => e.stopPropagation()}>
                <h2 className="db-modal-title">Ask a Question</h2>
                <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <input
                    className="db-modal-input"
                    type="text"
                    value={newTitle}
                    onChange={e => setnewTitle(e.target.value)}
                    placeholder="Question title..."
                  />
                  <input
                    className="db-modal-input"
                    type="text"
                    value={newDescription}
                    onChange={e => setnewDescription(e.target.value)}
                    placeholder="Describe your question..."
                  />
                  <div>
                    <p className="db-tags-label" style={{ marginBottom: 10 }}>Tags</p>
                    <div className="db-tags-grid">
                      {availableTags.map(tag => (
                        <button
                          key={tag.tag_id}
                          type="button"
                          className={`db-tag-toggle ${selectedTagIds.includes(tag.tag_id) ? 'selected' : ''}`}
                          onClick={() => toggleTag(tag.tag_id)}
                        >
                          {tag.tag_name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="db-modal-actions">
                    <button type="button" className="db-btn-secondary" onClick={() => setAddQuestionModal(false)}>Cancel</button>
                    <button type="submit" className="db-btn-primary">Post Question</button>
                  </div>
                </form>
              </div>
            </div>
          )}
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
