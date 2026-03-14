"use client"

import { useState } from 'react'

export default function Home(){
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  
  const handleSubmit = async(e:React.FormEvent<HTMLFormElement>) =>{
    e.preventDefault()
    console.log("Username: ", username)
    console.log("Email: ", email)
    console.log("Password: ", password)

    try{
      const response = await fetch('/api/authControllers/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      })
      if(response.ok){
        setMessage("Account successfully ")
        setUsername("")
        setEmail("")
        setPassword("")
      }
    }catch(err:any){
      setError(message)
    }
  }
  
  return(
    <div className="login-container">
      <h1> Login </h1> 
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
