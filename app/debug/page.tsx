'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function DebugPage() {
  const [envVars, setEnvVars] = useState({
    url: '',
    key: '',
    client: null as any
  })

  useEffect(() => {
    setEnvVars({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      client: supabase ? 'INITIALIZED' : 'NULL'
    })

    // Console logging
    console.log('🔍 Client-side Environment Check:')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET')
    console.log('Supabase Client:', supabase)
  }, [])

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Environment Debug</h1>
        
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold text-lg mb-2">Environment Variables</h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</span>
                <span className={`ml-2 ${envVars.url !== 'NOT SET' ? 'text-green-600' : 'text-red-600'}`}>
                  {envVars.url}
                </span>
              </div>
              <div>
                <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                <span className={`ml-2 ${envVars.key === 'SET' ? 'text-green-600' : 'text-red-600'}`}>
                  {envVars.key}
                </span>
              </div>
              <div>
                <span className="font-medium">Supabase Client:</span>
                <span className={`ml-2 ${envVars.client === 'INITIALIZED' ? 'text-green-600' : 'text-red-600'}`}>
                  {envVars.client}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold text-lg mb-2">Steps to Fix</h2>
            {envVars.url === 'NOT SET' || envVars.key === 'NOT SET' ? (
              <div className="text-red-600 space-y-1">
                <p>❌ Environment variables not loaded</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Check .env.local file exists in root directory</li>
                  <li>Restart development server: Ctrl+C and npm run dev</li>
                  <li>Clear browser cache and reload</li>
                  <li>Check .env.local format (no quotes, no spaces around =)</li>
                </ol>
              </div>
            ) : envVars.client === 'NULL' ? (
              <div className="text-yellow-600">
                <p>⚠️ Environment variables loaded but client failed to initialize</p>
                <p>Check browser console for detailed error messages</p>
              </div>
            ) : (
              <div className="text-green-600">
                <p>✅ All systems operational!</p>
                <p>Supabase client is properly initialized</p>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold text-lg mb-2">Browser Console Output</h2>
            <p className="text-sm text-gray-600">
              Check the browser developer console (F12) for detailed Supabase initialization logs.
            </p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
            <a 
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}