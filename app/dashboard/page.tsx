"use client"

import { useRouter } from 'next/navigation'

export default function Dashboard(){

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

    </>
 ) 
}


