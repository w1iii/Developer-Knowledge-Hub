"use client"

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import './page.css'

interface Question {
  question_id: number
  user_id: number
  username: string
  title: string
  description: string
  views: number
  upvote_count: number
  downvote_count: number
  user_vote: 'upvote' | 'downvote' | null
  tags: Tag[]
}

interface Tag {
  tag_id: number
  tag_name: string
}

type VoteType = 'upvote' | 'downvote';

interface Answers {
  answer_id: number
  user_id: number
  content: string
  upvote_count: number
  downvote_count: number
  user_vote: 'upvote' | 'downvote' | null
}

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

export default function Dashboard() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  sessionStorage.setItem('user_id', String(currentUserId))

  const [addQuestionModal, setAddQuestionModal] = useState(false)
  const [newTitle, setnewTitle] = useState('')
  const [newDescription, setnewDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answers[]>([])
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null)
  const [viewQuestionId, setViewQuestionId] = useState<number | null>(null)
  const [currentViewingQuestionId, setCurrentViewingQuestionId] = useState<number | null>(null)
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [newAnswerContent, setNewAnswerContent] = useState('')
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState([])

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

  const router = useRouter()

  useEffect(() => {
    router.refresh()
    
    async function loadUser() {
      try {
        const res = await fetch("/api/authControllers/me", { credentials: "include" })
        const data = await res.json()
        setCurrentUserId(data.user_id)
      } catch (e) {
        console.log("Failed to load user", e)
        router.push('/')
      }
    }
    loadUser()
  }, [router])

  useEffect(() => {
    async function loadQuestions() {
      const res = await fetch("/api/postControllers/viewQuestions", { credentials: "include" })
      const data = await res.json()
      setQuestions(data)
    }
    loadQuestions()
  }, [])

  useEffect(() => {
    async function loadTags() {
      const res = await fetch("/api/tagControllers/viewTags")
      const data = await res.json()
      setAvailableTags(data)
    }
    loadTags()
  }, [])

  const loadQuestions = async () => {
    const res = await fetch("/api/postControllers/viewQuestions", { credentials: "include" })
    const data = await res.json()
    setQuestions(data)
  }

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
        loadQuestions()
      } else {
        alert('Failed to add: ' + (await res.json()).error)
      }
    } catch (e) {
      console.log('Save error', e)
      alert('Error saving question')
    }
  }

  const showModal = (question: Question) => {
    setSelectedQuestionId(prev => prev === question.question_id ? null : question.question_id)
    if (selectedQuestionId !== question.question_id) {
      setnewTitle(question.title)
      setnewDescription(question.description)
    } else {
      setnewTitle('')
      setnewDescription('')
    }
  }

  const toggleTag = (tagId: number) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const handleSave = async () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      alert('Title and description cannot be empty')
      return
    }
    try {
      const res = await fetch('/api/postControllers/editQuestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ question_id: selectedQuestionId, title: newTitle, description: newDescription })
      })
      if (res.ok) {
        setQuestions(prev => prev.map(q =>
          q.question_id === selectedQuestionId ? { ...q, title: newTitle, description: newDescription } : q
        ))
        setSelectedQuestionId(null)
        setnewTitle('')
        setnewDescription('')
      } else {
        alert('Failed to save: ' + (await res.json()).error)
      }
    } catch (e) {
      console.log('Save error', e)
      alert('Error saving question')
    }
  }

  const handleDelete = async (question: Question) => {
    try {
      const res = await fetch('/api/postControllers/deleteQuestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ question_id: question.question_id })
      })
      if (res.ok) {
        loadQuestions()
      } else {
        alert('Failed to delete: ' + (await res.json()).error)
      }
    } catch (e) {
      console.log('Delete error', e)
      alert('Error deleting question')
    }
  }

  const loadAnswers = async (questionId: number) => {
    try {
      const res = await fetch('/api/commentControllers/viewAnswers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ question_id: questionId })
      })
      const data = await res.json()
      setAnswers(data.result || [])
    } catch (e) {
      console.log('Fetch error: ', e)
    }
  }

  const viewQuestion = (question: Question) => {
    router.push(`/dashboard/viewSingleQuestion/${question.question_id}`)
  }

  const handleEditAnswer = async (answerId: number) => {
    const res = await fetch('/api/commentControllers/editAnswer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ answer_id: answerId, content: editContent })
    })
    if (res.ok) {
      setEditingAnswerId(null)
      if (currentViewingQuestionId) await loadAnswers(currentViewingQuestionId)
    }
  }

  const handleDeleteAnswer = async (answerId: number) => {
    if (!confirm('Are you sure you want to delete this answer?')) return
    const res = await fetch('/api/commentControllers/deleteAnswer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ answer_id: answerId })
    })
    if (res.ok) {
      if (currentViewingQuestionId) await loadAnswers(currentViewingQuestionId)
    } else {
      alert('Failed to delete answer')
    }
  }

  const handleAddAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAnswerContent.trim() || !currentViewingQuestionId) return
    try {
      const res = await fetch('/api/commentControllers/addAnswer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ question_id: currentViewingQuestionId, content: newAnswerContent })
      })
      if (res.ok) {
        setNewAnswerContent('')
        await loadAnswers(currentViewingQuestionId)
      } else {
        alert('Failed to add answer')
      }
    } catch (e) {
      console.log('Error adding answer:', e)
      alert('Error adding answer')
    }
  }

  const toggleVote = async (question: Question, voteType: VoteType) => {
    const previousVote = question.user_vote
    const previousUpvoteCount = question.upvote_count
    const previousDownvoteCount = question.downvote_count

    let newVote: 'upvote' | 'downvote' | null
    let upvoteDelta = 0
    let downvoteDelta = 0

    if (previousVote === voteType) {
      newVote = null
      if (voteType === 'upvote') upvoteDelta = -1
      else downvoteDelta = -1
    } else {
      newVote = voteType
      if (previousVote === null) {
        if (voteType === 'upvote') upvoteDelta = 1
        else downvoteDelta = 1
      } else {
        if (voteType === 'upvote') { upvoteDelta = 1; downvoteDelta = -1 }
        else { upvoteDelta = -1; downvoteDelta = 1 }
      }
    }

    setQuestions(prev => prev.map(q =>
      q.question_id === question.question_id
        ? { ...q, user_vote: newVote, upvote_count: q.upvote_count + upvoteDelta, downvote_count: q.downvote_count + downvoteDelta }
        : q
    ))

    try {
      if (newVote === null) {
        await fetch('/api/voteControllers/deleteVote', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ question_id: question.question_id })
        })
      } else {
        const res = await fetch('/api/voteControllers/addVote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ question_id: question.question_id, vote_type: voteType })
        })
        if (!res.ok) throw new Error('Failed to vote')
      }
    } catch (e) {
      console.log("Vote error:", e)
      setQuestions(prev => prev.map(q =>
        q.question_id === question.question_id
          ? { ...q, user_vote: previousVote, upvote_count: previousUpvoteCount, downvote_count: previousDownvoteCount }
          : q
      ))
    }
  }

  const toggleAnswerVote = async (answer: Answers, voteType: VoteType) => {
    const previousVote = answer.user_vote
    const previousUpvoteCount = answer.upvote_count
    const previousDownvoteCount = answer.downvote_count

    let newVote: 'upvote' | 'downvote' | null
    let upvoteDelta = 0
    let downvoteDelta = 0

    if (previousVote === voteType) {
      newVote = null
      if (voteType === 'upvote') upvoteDelta = -1
      else downvoteDelta = -1
    } else {
      newVote = voteType
      if (previousVote === null) {
        if (voteType === 'upvote') upvoteDelta = 1
        else downvoteDelta = 1
      } else {
        if (voteType === 'upvote') { upvoteDelta = 1; downvoteDelta = -1 }
        else { upvoteDelta = -1; downvoteDelta = 1 }
      }
    }

    setAnswers(prev => prev.map(a =>
      a.answer_id === answer.answer_id
        ? { ...a, user_vote: newVote, upvote_count: a.upvote_count + upvoteDelta, downvote_count: a.downvote_count + downvoteDelta }
        : a
    ))

    try {
      if (newVote === null) {
        await fetch('/api/voteControllers/deleteVote', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ answer_id: answer.answer_id })
        })
      } else {
        const res = await fetch('/api/voteControllers/addVote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ answer_id: answer.answer_id, vote_type: voteType })
        })
        if (!res.ok) throw new Error('Failed to vote')
      }
    } catch (e) {
      console.log("Vote error:", e)
      setAnswers(prev => prev.map(a =>
        a.answer_id === answer.answer_id
          ? { ...a, user_vote: previousVote, upvote_count: previousUpvoteCount, downvote_count: previousDownvoteCount }
          : a
      ))
    }
  }

  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand">&lt;<span>DevTalk</span>/&gt;</span>

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

      {addQuestionModal && (
        <div className="modal-overlay" onClick={() => setAddQuestionModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Ask a Question</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                className="modal-input"
                type="text"
                value={newTitle}
                onChange={e => setnewTitle(e.target.value)}
                placeholder="Question title..."
              />
              <input
                className="modal-input"
                type="text"
                value={newDescription}
                onChange={e => setnewDescription(e.target.value)}
                placeholder="Describe your question..."
              />
              <div>
                <p className="tags-label" style={{ marginBottom: 10 }}>Tags</p>
                <div className="tags-grid">
                  {availableTags.map(tag => (
                    <button
                      key={tag.tag_id}
                      type="button"
                      className={`tag-toggle ${selectedTagIds.includes(tag.tag_id) ? 'selected' : ''}`}
                      onClick={() => toggleTag(tag.tag_id)}
                    >
                      {tag.tag_name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setAddQuestionModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Post Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">All Questions</h1>
        </div>

        <div className="questions-list">
          {questions.map((q: Question) => (
            <div className="question-card" key={q.question_id}>

              <div className="question-card-meta">
                <div className="user-pill">
                  <div className="avatar-sm">{getInitials(q.username)}</div>
                  <span className="user-name">{q.username}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="views-badge">👁 {q.views}</span>
                  <div className="vote-cluster">
                    <button
                      className={`vote-btn ${q.user_vote === 'upvote' ? 'active-up' : ''}`}
                      onClick={() => toggleVote(q, 'upvote')}
                    >
                      ▲ {q.upvote_count}
                    </button>
                    <button
                      className={`vote-btn ${q.user_vote === 'downvote' ? 'active-down' : ''}`}
                      onClick={() => toggleVote(q, 'downvote')}
                    >
                      ▼ {q.downvote_count}
                    </button>
                  </div>
                </div>
              </div>

              <div className="question-card-body" onClick={() => viewQuestion(q)}>
                <h2 className="question-card-title">{q.title}</h2>
                <p className="question-card-desc">{q.description}</p>
              </div>

              <div className="question-card-footer">
                <div className="tags-row">
                  {q.tags?.map(tag => (
                    <span key={tag.tag_id} className="tag-badge">{tag.tag_name}</span>
                  ))}
                </div>
                <span className="answers-count">Answers: <strong>0</strong></span>
              </div>

              {
              //   selectedQuestionId === q.question_id && (
              //   <div className="inline-edit-section">
              //     <input className="modal-input" type="text" value={newTitle} onChange={e => setnewTitle(e.target.value)} />
              //     <input className="modal-input" type="text" value={newDescription} onChange={e => setnewDescription(e.target.value)} />
              //     <div style={{ display: 'flex', gap: 8 }}>
              //       <button className="btn-primary" onClick={handleSave}>Save</button>
              //       <button className="btn-secondary" onClick={() => setSelectedQuestionId(null)}>Cancel</button>
              //     </div>
              //   </div>
              // )
              }
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
