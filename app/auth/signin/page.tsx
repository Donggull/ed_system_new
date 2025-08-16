'use client'

import { useState } from 'react'
import AuthForm from '@/components/auth/AuthForm'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin')
  const router = useRouter()

  const handleModeChange = (newMode: 'signin' | 'signup' | 'reset') => {
    if (newMode === 'signup') {
      router.push('/auth/signup')
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