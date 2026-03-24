
"use client"

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Sidebar } from '../../../components/Sidebar'
import Link from 'next/link'
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

export default function ViewSingleQuestionPage() {
  const params = useParams()
  const questionId = params.questionId as string
  const router = useRouter()

  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<Answers[]>([])
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [newAnswerContent, setNewAnswerContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

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
    async function loadQuestion() {
      if (!questionId) return
      try {
        setLoading(true)
        const res = await fetch('/api/postControllers/viewSingleQuestion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ question_id: Number(questionId) })
        })
        if (!res.ok) {
          if (res.status === 404) {
            setError('Question not found')
          } else {
            setError('Failed to load question')
          }
          return
        }
        const data = await res.json()
        setQuestion(data)
        setEditTitle(data.title)
        setEditDescription(data.description)
        await loadAnswers(Number(questionId))
      } catch (e) {
        console.log("Error loading question:", e)
        setError('Failed to load question')
      } finally {
        setLoading(false)
      }
    }
    loadQuestion()
  }, [questionId])

  const loadAnswers = async (qId: number) => {
    try {
      const res = await fetch('/api/commentControllers/viewAnswers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ question_id: qId })
      })
      const data = await res.json()
      setAnswers(data.result || [])
    } catch (e) {
      console.log('Fetch error: ', e)
    }
  }

  const handleEdit = () => {
    if (question) {
      setEditTitle(question.title)
      setEditDescription(question.description)
      setShowEditModal(true)
    }
  }

  const handleSaveEdit = async () => {
    if (!question || !editTitle.trim() || !editDescription.trim()) return
    try {
      const res = await fetch('/api/postControllers/editQuestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          question_id: question.question_id, 
          title: editTitle, 
          description: editDescription 
        })
      })
      if (res.ok) {
        setQuestion({ ...question, title: editTitle, description: editDescription })
        setShowEditModal(false)
      } else {
        alert('Failed to update question')
      }
    } catch (e) {
      console.log('Error saving:', e)
      alert('Error saving question')
    }
  }

  const handleDelete = async () => {
    if (!question || !confirm('Are you sure you want to delete this question?')) return
    try {
      const res = await fetch('/api/postControllers/deleteQuestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ question_id: question.question_id })
      })
      if (res.ok) {
        router.push('/dashboard')
      } else {
        alert('Failed to delete question')
      }
    } catch (e) {
      console.log('Delete error:', e)
      alert('Error deleting question')
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
      if (question) await loadAnswers(question.question_id)
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
      if (question) await loadAnswers(question.question_id)
    } else {
      alert('Failed to delete answer')
    }
  }

  const handleAddAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAnswerContent.trim() || !question) return
    try {
      const res = await fetch('/api/commentControllers/addAnswer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ question_id: question.question_id, content: newAnswerContent })
      })
      if (res.ok) {
        setNewAnswerContent('')
        await loadAnswers(question.question_id)
      } else {
        alert('Failed to add answer')
      }
    } catch (e) {
      console.log('Error adding answer:', e)
      alert('Error adding answer')
    }
  }

  const toggleVote = async (voteType: VoteType) => {
    if (!question) return
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

    setQuestion({ 
      ...question, 
      user_vote: newVote, 
      upvote_count: question.upvote_count + upvoteDelta, 
      downvote_count: question.downvote_count + downvoteDelta 
    })

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
      setQuestion({ 
        ...question, 
        user_vote: previousVote, 
        upvote_count: previousUpvoteCount, 
        downvote_count: previousDownvoteCount 
      })
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

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="main-content">
          <div className="loading">Loading...</div>
        </main>
      </>
    )
  }

  if (error || !question) {
    return (
      <>
        <Sidebar />
        <main className="main-content">
          <div className="error-state">
            <h2>{error || 'Question not found'}</h2>
            <Link href="/dashboard" className="btn-primary">Back to Dashboard</Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Sidebar />
      
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Edit Question</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                className="modal-input"
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                placeholder="Question title..."
              />
              <input
                className="modal-input"
                type="text"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                placeholder="Describe your question..."
              />
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="button" className="btn-primary" onClick={handleSaveEdit}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="main-content">
        <div className="back-link">
          <Link href="/dashboard" className="btn-secondary">← Back to Questions</Link>
        </div>

        <div className="question-detail-card">
          <div className="question-card-meta">
            <div className="user-pill">
              <div className="avatar-sm">{getInitials(question.username)}</div>
              <span className="user-name">{question.username}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="views-badge">👁 {question.views}</span>
              <div className="vote-cluster">
                <button
                  className={`vote-btn ${question.user_vote === 'upvote' ? 'active-up' : ''}`}
                  onClick={() => toggleVote('upvote')}
                >
                  ▲ {question.upvote_count}
                </button>
                <button
                  className={`vote-btn ${question.user_vote === 'downvote' ? 'active-down' : ''}`}
                  onClick={() => toggleVote('downvote')}
                >
                  ▼ {question.downvote_count}
                </button>
              </div>
            </div>
          </div>

          {question.user_id === currentUserId && (
            <div className="question-actions">
              <button className="btn-edit" onClick={handleEdit}>Edit</button>
              <button className="btn-delete" onClick={handleDelete}>Delete</button>
            </div>
          )}

          <div className="question-card-body">
            <h1 className="question-detail-title">{question.title}</h1>
            <p className="question-detail-desc">{question.description}</p>
          </div>

          <div className="question-card-footer">
            <div className="tags-row">
              {question.tags?.map(tag => (
                <span key={tag.tag_id} className="tag-badge">{tag.tag_name}</span>
              ))}
            </div>
          </div>

          <div className='answers-section'>
            <div className='heading-container'>
              <h3 className="section-heading">Answers ({answers.length})</h3>
            </div>

            {answers.length > 0 ? (
              <ul className="answers-list">
                {answers.map((a: Answers) => (
                  <li key={a.answer_id} className="answer-item">
                    <div className="answer-vote-col">
                      <button
                        className={`answer-vote-btn ${a.user_vote === 'upvote' ? 'active-up' : ''}`}
                        onClick={() => toggleAnswerVote(a, 'upvote')}
                      >▲</button>
                      <span className="answer-vote-count">{a.upvote_count}</span>
                      <button
                        className={`answer-vote-btn ${a.user_vote === 'downvote' ? 'active-down' : ''}`}
                        onClick={() => toggleAnswerVote(a, 'downvote')}
                      >▼</button>
                      <span className="answer-vote-count">{a.downvote_count}</span>
                    </div>

                    <div className="answer-body">
                      {editingAnswerId === a.answer_id ? (
                        <>
                          <textarea
                            className="answer-textarea"
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            rows={3}
                          />
                          <div className="answer-edit-actions">
                            <button className="btn-primary" style={{ padding: '6px 16px', fontSize: 13 }} onClick={() => handleEditAnswer(a.answer_id)}>Save</button>
                            <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => setEditingAnswerId(null)}>Cancel</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="answer-content">{a.content}</p>
                          {a.user_id === currentUserId && (
                            <div className="answer-edit-actions">
                              <button className="btn-edit" style={{ padding: '5px 14px', fontSize: 12 }} onClick={() => { setEditingAnswerId(a.answer_id); setEditContent(a.content) }}>Edit</button>
                              <button className="btn-delete" style={{ padding: '5px 14px', fontSize: 12 }} onClick={() => handleDeleteAnswer(a.answer_id)}>Delete</button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-answers">No answers yet. Be the first to answer!</p>
            )}

            <form className="add-answer-form" onSubmit={handleAddAnswer}>
              <span className="add-answer-label">Your Answer</span>
              <textarea
                className="answer-textarea"
                value={newAnswerContent}
                onChange={e => setNewAnswerContent(e.target.value)}
                placeholder="Write your answer here..."
                rows={4}
                style={{ marginBottom: 0 }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary">Post Answer</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
