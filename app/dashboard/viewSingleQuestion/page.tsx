
"use client"

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Sidebar } from '../../components/Sidebar'
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

export default function viewSingleQuestion() {
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

  const viewQuestion = async (question: Question) => {
    const isClosing = viewQuestionId === question.question_id
    setViewQuestionId(isClosing ? null : question.question_id)
    setCurrentViewingQuestionId(isClosing ? null : question.question_id)

    const viewedKey = 'viewedQuestions'
    const viewed: number[] = JSON.parse(sessionStorage.getItem(viewedKey) || '[]')

    if (!isClosing && !viewed.includes(question.question_id)) {
      const newViewed = [...viewed, question.question_id]
      sessionStorage.setItem(viewedKey, JSON.stringify(newViewed))
      try {
        const res = await fetch('/api/postControllers/viewSingleQuestion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ question_id: question.question_id })
        })
        const data = await res.json()
        setQuestions(prev => prev.map(q =>
          q.question_id === question.question_id ? { ...q, views: data.views } : q
        ))
      } catch (e) {
        console.log("Error adding view", e)
      }
    }

    if (!isClosing) {
      await loadAnswers(question.question_id)
    }
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
      < Sidebar />
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
          <h1 className="page-title"> Single Question</h1>
        </div>

        <div className="questions-list">
          <div className="question-card-meta">
                <div className="user-pill">
                  { 
                  // <div className="avatar-sm">{getInitials(q.username)}</div>
                  }
                  <div className="avatar-sm"> IN</div>
                  <span className="user-name"> username </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="views-badge">👁 0</span>
                  <div className="vote-cluster">
                    <button
                      className="vote-btn"
                      // className={`vote-btn ${q.user_vote === 'upvote' ? 'active-up' : ''}`}
                      // onClick={() => toggleVote(q, 'upvote')}
                    >
                      ▲ 0 
                    </button>
                    <button
                      className="vote-btn"
                      // className={`vote-btn ${q.user_vote === 'downvote' ? 'active-down' : ''}`}
                      // onClick={() => toggleVote(q, 'downvote')}
                    >
                      ▼ 0 
                    </button>
                  </div>
                </div>
            </div>
           <div className="question-card-body">
                <h2 className="question-card-title"> Title </h2>
                <p className="question-card-desc"> Description</p>
           </div>
           <div className="question-card-footer">
                <div className="tags-row">
                  tags
                </div>
                <span className="answers-count">Answers: <strong>0</strong></span>
           </div>
           <div className='answers-section'>
            <h3 className="section-heading">Answers</h3>
          </div>
        </div>
      </main>
    </>
  )
}
