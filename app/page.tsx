
"use client"

import { useState } from 'react'
import Link from 'next/link';
import { useRouter } from 'next/navigation'

export default function Home(){
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const router = useRouter()
  
  const handleSubmit = async() =>{
    try{
      const response = await fetch('api/authControllers/login',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      
      if(!response.ok){
        setError(data.error)
        return
      }
      setError("")
      router.push('/dashboard')
    }catch(e){
      console.log(e)
    }
  }
  
  return(
    <div className="login-container">
      <h1> Login </h1> 
      <form action={handleSubmit}>
        <input type="text" value={email} onChange={(e)=>setEmail(e.target.value)} className="form-input-login"  placeholder="email" /> 
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="form-input-login" placeholder="password" />
        <button> Submit </button>
      </form>
      { error && <p> {error} </p>}
      <Link href="/signup" id="create-account"> Create account </Link>
    </div>
  )
}
