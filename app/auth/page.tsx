'use client'

import { useState } from 'react'
import AuthForm from '@/components/auth/AuthForm'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-4">
      <AuthForm mode={mode} onModeChange={setMode} />
    </div>
  )
}