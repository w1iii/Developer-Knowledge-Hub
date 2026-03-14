
"use client"

import { useState } from 'react'
import Link from 'next/link';
import { useRouter } from 'next/navigation'

export default function Home(){
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const router = useRouter()
  
  const handleSubmit = async() =>{
    console.log("Email: ", email)
    console.log("Password: ", password)
    try{
      const response = await fetch('api/authControllers/login',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      if(!response.ok){
        throw new Error("Login Failed")
      }
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
      <Link href="/signup" id="create-account"> Create account </Link>

    </div>
  )
}
