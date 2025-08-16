'use client'

import { useState } from 'react'
import AuthForm from '@/components/auth/AuthForm'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signup')
  const router = useRouter()

  const handleModeChange = (newMode: 'signin' | 'signup' | 'reset') => {
    if (newMode === 'signin') {
      router.push('/auth/signin')
    } else {
      setMode(newMode)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-4">
      <AuthForm mode={mode} onModeChange={handleModeChange} />
    </div>
  )
}