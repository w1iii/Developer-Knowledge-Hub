"use client"

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Dashboard(){
  const [questions, setQuestions] = useState([])

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

  const router = useRouter()

  const handleLogout = async () =>{
    try{
      await fetch('api/authControllers/logout', {
        method: 'POST',
      })
      router.push('/')
    }catch(e){
      console.log(e)
    }
  }

  return(
    <>
      <h1> Dashboard </h1>
      <button onClick={handleLogout}>Logout</button>
      <div>
        {questions.map((q: any, i) => (
          <div key={i}>
            <p>{q.username}</p>
            <h2>{q.title}</h2>
            <p>{q.description}</p>
          </div>
          ))}
      </div>

    </>
 ) 
}


