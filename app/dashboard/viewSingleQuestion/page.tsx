
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ViewSingleQuestionIndex() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return null
}
