"use client"

import { useState } from 'react'
import Link from 'next/link';

export default function Home(){
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  
  const handleSubmit = async(e:React.FormEvent<HTMLFormElement>) =>{
    e.preventDefault()

    try{
      const response = await fetch('/api/authControllers/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await response.json()

      if(!response.ok){
        setError(data.error)
        return
      }

      setMessage("Account successfully ")
      setUsername("")
      setEmail("")
      setPassword("")
    }catch(err:any){
      setError(err)
    }
  }

  
  return(
    <div className="login-container">
      <Link href="/"> back </Link>
      <h1> Signup </h1> 
      { message && <p> {message} </p>}
      <form onSubmit={handleSubmit}>
        <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)} className="form-input-login"  placeholder="username" /> 
        <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="form-input-login"  placeholder="email" /> 
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="form-input-login" placeholder="password" />
        <button> Submit </button>
      </form>
      {error && <p> {error} </p>}
    </div>
  )
}
