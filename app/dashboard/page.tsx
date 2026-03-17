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
  votes_count: number
  views: number
}

export default function Dashboard(){
  const [addQuestionModal, setAddQuestionModal] = useState(false)
  const [newTitle, setnewTitle] = useState('')
  const [newDescription, setnewDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/authControllers/me", {
          credentials: "include"
        })
        const data = await res.json()
        console.log("Fetched user data:", data)
        setCurrentUserId(data.user_id)
      } catch (e) {
        console.log("Failed to load user", e)
        router.push('/') // redirect if not logged in
      }
    }
    loadUser()
  }, [router])

  useEffect(() => {
    async function loadQuestions() {
      const res = await fetch("/api/postControllers/viewQuestions", {
        credentials: "include"
      })
      const data = await res.json()
      console.log("Data results: ", data)
      setQuestions(data)
    }
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
      const res = await fetch("/api/postControllers/viewQuestions", {
        credentials: "include"
      })
      const data = await res.json()
      console.log("Data results: ", data)
      setQuestions(data)
    }

  const handleLogout = async () =>{
    try{
      await fetch('/api/authControllers/logout', {
        method: 'POST',
      })
      router.push('/')
    }catch(e){
      console.log(e)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("adding item...")
    if (!newTitle.trim() || !newDescription.trim()) {
      alert('Title and description cannot be empty')
      return
    }
    console.log("Title: ", newTitle, "Description: ", newDescription)
    try{
      const res = await fetch('/api/postControllers/addQuestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: newTitle,
          description: newDescription
        })
      })
      if(res.ok){
        setnewTitle('')
        setnewDescription('')
        setAddQuestionModal(false)
        loadQuestions()
      }else{
        alert('Failed to add: ' + (await res.json()).error)
      }
    }catch(e){
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
        body: JSON.stringify({
          question_id: selectedQuestionId,
          title: newTitle,
          description: newDescription
        })
      })
      if (res.ok) {
        // Update the questions state
        setQuestions(prev => prev.map(q => 
          q.question_id === selectedQuestionId 
            ? { ...q, title: newTitle, description: newDescription } 
            : q
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
    console.log("DELETE")
    console.log("Question id: ", question.question_id)

    try{
      const res = await fetch('/api/postControllers/deleteQuestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          question_id: question.question_id,
        })
      })
      if (res.ok) {
        loadQuestions()
      } else {
        alert('Failed to save: ' + (await res.json()).error)
      }
    }catch(e){
      console.log('Save error', e)
      alert('Error saving question')
    }
  }

  return(
    <>
      <h1> Dashboard </h1>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={() => setAddQuestionModal(prev => !prev)}> add question</button>
      {  addQuestionModal && 
        <div className="add-question-modal">
            <form onSubmit={handleAdd}>
            <input type="text" value={newTitle} onChange={(e) => setnewTitle(e.target.value)} placeholder="title" />
            <input type="text" value={newDescription} onChange={(e) => setnewDescription(e.target.value)} placeholder="Description" />
            <button> Submit </button>
            </form>
        </div>
      }
      <div className="main-question-container">
        {questions.map((q: Question) => (
          <div className="question-container" key={q.question_id} onClick={() => console.log("Question-container: ", q.question_id)}>
              <div className="question-container-header">
                <p>{q.username}</p>
                {(() => { return q.user_id === currentUserId && <button onClick={() => showModal(q)}>Edit Question</button>; })()}
                {(() => { return q.user_id === currentUserId && <button onClick={() => handleDelete(q)}>Delete Question</button>; })()}
              </div>
              <div className="question-container-body">
                <h2>{q.title}</h2>
                <p>{q.description}</p>
              </div>
              <div className="question-container-bottom">
                <p> Tags: Next.js Typescript</p>
                <div className="question-container-actions">
                  <p> Answers: 0 </p>
                  <p> Votes: 0 </p>
                </div>
              </div>
            <div className="question-container-view" key={q.question_id} onClick={() => console.log("Question-container: ", q.question_id)}>
              <div className="question-container-header">
                <p>{q.username}</p>
                {(() => { return q.user_id === currentUserId && <button onClick={() => showModal(q)}>Edit Question</button>; })()}
                {(() => { return q.user_id === currentUserId && <button onClick={() => handleDelete(q)}>Delete Question</button>; })()}
              </div>
              <div className="question-container-body">
                <h2>{q.title}</h2>
                <p>{q.description}</p>
              </div>
              <div className="question-container-bottom">
                <p> Tags: Next.js Typescript</p>
                <div className="question-container-actions">
                  <p> Answers: 0 </p>
                  <p> Votes: {q.votes_count} </p>
                </div>
                <div className="answer-section">
                  <ul>
                    <li> answer 1</li>
                    <li> answer 2</li>
                    <li> answer 3</li>
                  </ul>
                </div>
              </div>
          </div>
            { selectedQuestionId === q.question_id && 
              <div className="question-container-modal">
                <p>{q.username}</p>
                <input type="text" value={newTitle} onChange={(e) => setnewTitle(e.target.value)} />
                <input type="text" value={newDescription} onChange={(e) => setnewDescription(e.target.value)} />
                <button onClick={handleSave}>Save</button>
              </div>
            }
          </div>
        ))}
      </div>
    </>
  )
}


