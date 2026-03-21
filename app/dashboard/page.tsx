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

interface Answers{
  answer_id: number
  user_id: number
  content: string
}

export default function Dashboard(){
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [addQuestionModal, setAddQuestionModal] = useState(false)

  const [newTitle, setnewTitle] = useState('')
  const [newDescription, setnewDescription] = useState('')

  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answers[]>([])

  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null)

  const [viewQuestionId, setViewQuestionId] = useState<number | null>(null)
  const [currentViewingQuestionId, setCurrentViewingQuestionId] = useState<number | null>(null)
  
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [newAnswerContent, setNewAnswerContent] = useState('');


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

  const loadAnswers = async (questionId: number) => {
    try{
      const res = await fetch('/api/commentControllers/viewAnswers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          question_id: questionId,
        })
      })
      const data = await res.json()
      setAnswers(data.result || [])
    }catch(e){
      console.log('Fetch error: ', e)
    }
  }

  const viewQuestion = async (question: Question) => {
    const isClosing = viewQuestionId === question.question_id
    setViewQuestionId(isClosing ? null : question.question_id)
    setCurrentViewingQuestionId(isClosing ? null : question.question_id)
    if (!isClosing) {
      await loadAnswers(question.question_id)
    }
  }

  const handleEditAnswer = async (answerId: number) => {
    const res = await fetch('/api/commentControllers/editAnswer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        answer_id: answerId,
        content: editContent
      })
    });
    if (res.ok) {
      setEditingAnswerId(null);
      if (currentViewingQuestionId) {
        await loadAnswers(currentViewingQuestionId)
      }
    }
  };

  const handleDeleteAnswer = async (answerId: number) => {
    if (!confirm('Are you sure you want to delete this answer?')) return;
    
    const res = await fetch('/api/commentControllers/deleteAnswer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        answer_id: answerId
      })
    });
    if (res.ok) {
      if (currentViewingQuestionId) {
        await loadAnswers(currentViewingQuestionId)
      }
    } else {
      alert('Failed to delete answer');
    }
  };

  const handleAddAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswerContent.trim() || !currentViewingQuestionId) return;

    try {
      const res = await fetch('/api/commentControllers/addAnswer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          question_id: currentViewingQuestionId,
          content: newAnswerContent
        })
      });
      if (res.ok) {
        setNewAnswerContent('');
        await loadAnswers(currentViewingQuestionId);
      } else {
        alert('Failed to add answer');
      }
    } catch (e) {
      console.log('Error adding answer:', e);
      alert('Error adding answer');
    }
  };

  const upVote = async(question: Question)=> {
    try{
      await fetch('/api/voteControllers/addVote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          question_id: question.question_id,
          vote_type: "upvote" 
        })
      });
    }catch(e){
      console.log("Error: ", e)
      console.log("Failed to upvote")
    }
  };
const downVote = async(question: Question)=> {
    try{
      await fetch('/api/voteControllers/addVote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          question_id: question.question_id,
          vote_type: "downVote" 
        })
      });
    }catch(e){
      console.log("Error: ", e)
      console.log("Failed to upvote")
    }
  };



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
          <div className="question-section-container" key={q.question_id} >
              <div className="question-container-header">
                <p>{q.username}</p>
                <div className="vote-container">
                  <button onClick={ () => upVote(q) } > {q.votes_count} upvote </button>
                  <button onClick={ () => downVote(q) } > {q.votes_count} upvote </button>
                </div>
              </div>
          <div className="question-container" onClick={() => viewQuestion(q)}>
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
            
            { selectedQuestionId === q.question_id && 
              <div className="question-container-modal">
                <p>{q.username}</p>
                <input type="text" value={newTitle} onChange={(e) => setnewTitle(e.target.value)} />
                <input type="text" value={newDescription} onChange={(e) => setnewDescription(e.target.value)} />
                <button onClick={handleSave}>Save</button>
              </div>
            }
          </div>
          { viewQuestionId === q.question_id && 
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
                      <p> Answers: Load answers from DB </p>
                      <p> Votes: {q.votes_count} </p>
                    </div>
                  { 
                    // Map Answers DB  //
                  }
                    <div className="answer-section">
                      { answers ?  
                      <ul>
                        
                        {answers.map((a: Answers) => (
                          <li key={a.answer_id}>
                            {editingAnswerId === a.answer_id ? (
                              <>
                                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                                <button onClick={() => handleEditAnswer(a.answer_id)}>Save</button>
                                <button onClick={() => setEditingAnswerId(null)}>Cancel</button>
                              </>
                            ) : (
                              <>
                                {a.content}
                                {a.user_id === currentUserId && (
                                  <>
                                    <button onClick={() => { setEditingAnswerId(a.answer_id); setEditContent(a.content); }}>Edit</button>
                                    <button onClick={() => handleDeleteAnswer(a.answer_id)}>Delete</button>
                                  </>
                                )}
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                      :
                      <p> no answers yet. </p>
                    }

                    <form onSubmit={handleAddAnswer} className="add-answer-form">
                      <textarea 
                        value={newAnswerContent} 
                        onChange={(e) => setNewAnswerContent(e.target.value)} 
                        placeholder="Write your answer..."
                        rows={3}
                      />
                      <button type="submit">Post Answer</button>
                    </form>

                    </div>
                  </div>
              </div>
            }
            </div>
        ))}
      </div>
    </>
  )
}


