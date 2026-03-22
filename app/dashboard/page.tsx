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

interface Tag{
  tag_id: number
  tag_name: string
}

type VoteType = 'upvote' | 'downvote';

interface Answers{
  answer_id: number
  user_id: number
  content: string
  upvote_count: number
  downvote_count: number
  user_vote: 'upvote' | 'downvote' | null
}

export default function Dashboard(){
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
  
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [newAnswerContent, setNewAnswerContent] = useState('');

  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState([])

  // SEARCH INPUT LOGIC
  useEffect(() =>{
    if(!searchQuery || searchQuery.length < 3){
      setSearchResult([])
      return
    }
    try{
      const delay = setTimeout(async() =>{
        const res = await fetch('/api/searchController', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            searchQuery: searchQuery
          })
        })
        const data = await res.json()
        setSearchResult(data.searchResult)
        console.log("search result data: ", searchResult)
      }, 250)
      return () => clearTimeout(delay)
    }catch{
      console.log("==================================")
      console.log("SEARCH CONTROLLER NOT IMPLEMENTED")
      console.log("==================================")
    }
  }, [searchQuery])

  const router = useRouter()
  
  // CHECK IF HAS TOKEN (LOGGED IN BEFORE)
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

  //LOAD QUESTIONS DASHBOARD ON LOG IN
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

  useEffect(() => {
    async function loadTags() {
      const res = await fetch("/api/tagControllers/viewTags")
      const data = await res.json()
      setAvailableTags(data)
    }
    loadTags()
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
    const viewedKey = 'viewedQuestions';
    try{
      await fetch('/api/authControllers/logout', {
        method: 'POST',
      })
      sessionStorage.removeItem('user_id')
      sessionStorage.removeItem(viewedKey);
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
          description: newDescription,
          tag_ids: selectedTagIds
        })
      })
      if(res.ok){
        setnewTitle('')
        setnewDescription('')
        setAddQuestionModal(false)
        setSelectedTagIds([])
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

  const toggleTag = (tagId: number) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
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

    const viewedKey = 'viewedQuestions';
    const viewed: number[] = JSON.parse(sessionStorage.getItem(viewedKey) || '[]');

    if (!isClosing && !viewed.includes(question.question_id)) {
      const newViewed = [...viewed, question.question_id];
      sessionStorage.setItem(viewedKey, JSON.stringify(newViewed));

      try{
        const res = await fetch('/api/postControllers/viewSingleQuestion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            question_id: question.question_id,
          })
        })
        const data = await res.json();
        setQuestions(prev => prev.map(q => 
          q.question_id === question.question_id 
            ? { ...q, views: data.views } 
            : q
        ));
      }catch(e){
        console.log("Error: ", e)
        console.log("Error in adding view")
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

  const toggleVote = async (question: Question, voteType: VoteType) => {
    const previousVote = question.user_vote;
    const previousUpvoteCount = question.upvote_count;
    const previousDownvoteCount = question.downvote_count;

    let newVote: 'upvote' | 'downvote' | null;
    let upvoteDelta = 0;
    let downvoteDelta = 0;

    if (previousVote === voteType) {
      newVote = null;
      if (voteType === 'upvote') {
        upvoteDelta = -1;
      } else {
        downvoteDelta = -1;
      }
    } else {
      newVote = voteType;
      if (previousVote === null) {
        if (voteType === 'upvote') {
          upvoteDelta = 1;
        } else {
          downvoteDelta = 1;
        }
      } else {
        if (voteType === 'upvote') {
          upvoteDelta = 1;
          downvoteDelta = -1;
        } else {
          upvoteDelta = -1;
          downvoteDelta = 1;
        }
      }
    }

    setQuestions(prev => prev.map(q => 
      q.question_id === question.question_id
        ? { 
            ...q, 
            user_vote: newVote, 
            upvote_count: q.upvote_count + upvoteDelta,
            downvote_count: q.downvote_count + downvoteDelta
          }
        : q
    ));

    try {
      if (newVote === null) {
        await fetch('/api/voteControllers/deleteVote', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ question_id: question.question_id })
        });
      } else {
        const res = await fetch('/api/voteControllers/addVote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ question_id: question.question_id, vote_type: voteType })
        });
        if (!res.ok) {
          throw new Error('Failed to vote');
        }
      }
    } catch (e) {
      console.log("Vote error:", e);
      setQuestions(prev => prev.map(q => 
        q.question_id === question.question_id
          ? { 
              ...q, 
              user_vote: previousVote, 
              upvote_count: previousUpvoteCount,
              downvote_count: previousDownvoteCount
            }
          : q
      ));
    }
  };

  // ANSWER VOTES CONTROLLER
  const toggleAnswerVote = async (answer: Answers, voteType: VoteType) => {
    const previousVote = answer.user_vote;
    const previousUpvoteCount = answer.upvote_count;
    const previousDownvoteCount = answer.downvote_count;

    let newVote: 'upvote' | 'downvote' | null;
    let upvoteDelta = 0;
    let downvoteDelta = 0;

    if (previousVote === voteType) {
      newVote = null;
      if (voteType === 'upvote') {
        upvoteDelta = -1;
      } else {
        downvoteDelta = -1;
      }
    } else {
      newVote = voteType;
      if (previousVote === null) {
        if (voteType === 'upvote') {
          upvoteDelta = 1;
        } else {
          downvoteDelta = 1;
        }
      } else {
        if (voteType === 'upvote') {
          upvoteDelta = 1;
          downvoteDelta = -1;
        } else {
          upvoteDelta = -1;
          downvoteDelta = 1;
        }
      }
    }

    setAnswers(prev => prev.map(a => 
      a.answer_id === answer.answer_id
        ? { 
            ...a, 
            user_vote: newVote, 
            upvote_count: a.upvote_count + upvoteDelta,
            downvote_count: a.downvote_count + downvoteDelta
          }
        : a
    ));

    try {
      if (newVote === null) {
        await fetch('/api/voteControllers/deleteVote', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ answer_id: answer.answer_id })
        });
      } else {
        const res = await fetch('/api/voteControllers/addVote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ answer_id: answer.answer_id, vote_type: voteType })
        });
        if (!res.ok) {
          throw new Error('Failed to vote');
        }
      }
    } catch (e) {
      console.log("Vote error:", e);
      setAnswers(prev => prev.map(a => 
        a.answer_id === answer.answer_id
          ? { 
              ...a, 
              user_vote: previousVote, 
              upvote_count: previousUpvoteCount,
              downvote_count: previousDownvoteCount
            }
          : a
      ));
    }
  };


  return(
    <>
      <h1> Dashboard </h1>
      <div className='searchbar-section'>
        <input type='text' className='search-input' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder='search' />
        {searchResult.length > 0 && (
          <div className="search-result-container">
            {searchResult.map((item: any) => (
              <div
                key={item.question_id}
                className="search-result"
              >
                {item.title}
              </div>
            ))}
          </div>
        )}
      </div>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={() => setAddQuestionModal(prev => !prev)}> add question</button>
      {  addQuestionModal && 
        <div className="add-question-modal">
            <form onSubmit={handleAdd}>
            <input type="text" value={newTitle} onChange={(e) => setnewTitle(e.target.value)} placeholder="title" />
            <input type="text" value={newDescription} onChange={(e) => setnewDescription(e.target.value)} placeholder="Description" />

          <div className="tags-selection">
            <p>Select Tags:</p>
            {availableTags.map(tag => (
              <button
                key={tag.tag_id}
                type="button"
                className={selectedTagIds.includes(tag.tag_id) ? 'selected' : ''}
                onClick={() => toggleTag(tag.tag_id)}
              >
                {tag.tag_name}
              </button>
            ))}
            </div>
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
                  <p className="upvote-count"> {q.upvote_count} </p>
                  <button 
                    className={`vote-btn vote-btn-up ${q.user_vote === 'upvote' ? 'active' : ''}`}
                    onClick={() => toggleVote(q, 'upvote')}
                  >
                    ▲ 
                  </button>
                  <p className="downvote_count"> {q.downvote_count} </p>
                  <button 
                    className={`vote-btn vote-btn-down ${q.user_vote === 'downvote' ? 'active' : ''}`}
                    onClick={() => toggleVote(q, 'downvote')}
                  >
                    ▼
                  </button>
                </div>
                <p className="question-views"> views: {q.views} </p>
              </div>
          <div className="question-container" onClick={() => viewQuestion(q)}>
              <div className="question-container-body">
                <h2>{q.title}</h2>
                <p>{q.description}</p>
              </div>
              <div className="question-container-bottom">
                <div className="tags-display">
                  <p> Tags: 
                  {q.tags && q.tags.map(tag => (
                    <span key={tag.tag_id} className="tag-badge">
                      {tag.tag_name}
                    </span>
                  ))} </p>
                </div>
                <div className="question-container-actions">
                  <p> Answers: 0 </p>
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
                     <p> Tags: {
                      q.tags?.map(tag => (
                        <span key={tag.tag_id} className="tag-badge-small">{tag.tag_name}</span>
                      ))
                     } </p>
                    <div className="question-container-actions">
                      <h2> Answers </h2>
                    </div>
                  { 
                    // Map Answers DB  //
                  }
                    <div className="answer-section">
                      { answers ?  
                      <ul>
                        
                        {answers.map((a: Answers) => (
                          <li key={a.answer_id} className="answer-item">
                            <div className="answer-vote-container">
                              <button 
                                className={`vote-btn vote-btn-up ${a.user_vote === 'upvote' ? 'active' : ''}`}
                                onClick={() => toggleAnswerVote(a, 'upvote')} 
                              >
                                ▲
                              </button>
                              <span>{a.upvote_count}</span>
                              <button 
                                className={`vote-btn vote-btn-down ${a.user_vote === 'downvote' ? 'active' : ''}`}
                                onClick={() => toggleAnswerVote(a, 'downvote')} 
                              >
                                ▼
                              </button>
                              <span>{a.downvote_count}</span>
                            </div>
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


