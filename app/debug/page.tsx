'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function DebugPage() {
  const [envVars, setEnvVars] = useState({
    url: '',
    key: '',
    client: null as any,
    environment: '',
    domain: '',
    buildTime: ''
  })

  const [connectionTest, setConnectionTest] = useState({
    status: 'testing',
    message: '',
    details: null as any
  })

  const [productionInfo, setProductionInfo] = useState({
    vercelUrl: '',
    isProduction: false,
    vercelEnv: '',
    vercelRegion: ''
  })

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    setEnvVars({
      url,
      key: key ? 'SET' : 'NOT SET',
      client: supabase ? 'INITIALIZED' : 'NULL',
      environment: process.env.NODE_ENV || 'unknown',
      domain: typeof window !== 'undefined' ? window.location.hostname : 'server-side',
      buildTime: new Date().toISOString()
    })

    // Production environment detection
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      setProductionInfo({
        vercelUrl: window.location.origin,
        isProduction: hostname.includes('vercel.app') || hostname.includes('vercel.com'),
        vercelEnv: process.env.VERCEL_ENV || 'local',
        vercelRegion: process.env.VERCEL_REGION || 'unknown'
      })
    }

    // Console logging with more details
    console.log('🔍 Environment Debug Info:')
    console.log('  Environment:', process.env.NODE_ENV)
    console.log('  Domain:', typeof window !== 'undefined' ? window.location.hostname : 'server-side')
    console.log('  NEXT_PUBLIC_SUPABASE_URL:', url)
    console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', key ? `${key.slice(0, 20)}...` : 'NOT SET')
    console.log('  Supabase Client:', supabase)
    console.log('  Vercel Environment:', process.env.VERCEL_ENV)
    console.log('  Vercel Region:', process.env.VERCEL_REGION)
    console.log('  Build Time:', new Date().toISOString())
    
    // Test Supabase connection
    testConnection()
  }, [])

  const testConnection = async () => {
    if (!supabase) {
      setConnectionTest({
        status: 'failed',
        message: 'Supabase client not initialized',
        details: 'Environment variables missing or invalid'
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from('themes')
        .select('id')
        .limit(1)

      if (error) {
        setConnectionTest({
          status: 'failed',
          message: 'Database connection failed',
          details: error.message
        })
      } else {
        setConnectionTest({
          status: 'success',
          message: 'Database connection successful',
          details: `Found ${data?.length || 0} records`
        })
      }
    } catch (err: any) {
      setConnectionTest({
        status: 'failed',
        message: 'Connection test failed',
        details: err.message
      })
    }
  }

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
              <div>
                <span className="font-medium">Environment:</span>
                <span className="ml-2 text-blue-600">{envVars.environment}</span>
              </div>
              <div>
                <span className="font-medium">Domain:</span>
                <span className="ml-2 text-blue-600">{envVars.domain}</span>
              </div>
            </div>
          </div>

          {productionInfo.isProduction && (
            <div className="bg-blue-50 p-4 rounded-lg shadow border-l-4 border-blue-400">
              <h2 className="font-semibold text-lg mb-2 text-blue-800">🚀 Production Environment Detected</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Vercel URL:</span>
                  <span className="ml-2 text-blue-600">{productionInfo.vercelUrl}</span>
                </div>
                <div>
                  <span className="font-medium">Vercel Environment:</span>
                  <span className="ml-2 text-blue-600">{productionInfo.vercelEnv}</span>
                </div>
                <div>
                  <span className="font-medium">Vercel Region:</span>
                  <span className="ml-2 text-blue-600">{productionInfo.vercelRegion}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold text-lg mb-2">Connection Test</h2>
            <div className={`p-3 rounded ${connectionTest.status === 'success' ? 'bg-green-50 text-green-800' : connectionTest.status === 'failed' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'}`}>
              <div className="font-medium">
                {connectionTest.status === 'success' && '✅'}
                {connectionTest.status === 'failed' && '❌'}
                {connectionTest.status === 'testing' && '🔄'}
                {' '}{connectionTest.message}
              </div>
              {connectionTest.details && (
                <div className="text-sm mt-1">
                  Details: {connectionTest.details}
                </div>
              )}
            </div>
            <button 
              onClick={testConnection}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              🔄 Test Connection Again
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold text-lg mb-2">Troubleshooting Guide</h2>
            {productionInfo.isProduction ? (
              <div className="space-y-3">
                <div className="text-blue-800">
                  <p className="font-medium">🌐 Production Environment Checklist:</p>
                </div>
                {envVars.url === 'NOT SET' || envVars.key === 'NOT SET' ? (
                  <div className="text-red-600 space-y-2">
                    <p>❌ Vercel environment variables not configured</p>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-sm">
                      <li>Go to Vercel Dashboard → Project Settings → Environment Variables</li>
                      <li>Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                      <li>Set environment to: Production, Preview, Development</li>
                      <li>Redeploy your application</li>
                    </ol>
                    <div className="bg-gray-100 p-2 rounded text-sm mt-2">
                      <p className="font-medium">Quick setup script:</p>
                      <code>node scripts/setup-vercel-env.js</code>
                    </div>
                  </div>
                ) : envVars.client === 'NULL' ? (
                  <div className="text-yellow-600 space-y-2">
                    <p>⚠️ Environment variables set but client initialization failed</p>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-sm">
                      <li>Check Supabase project URL format</li>
                      <li>Verify anon key is correct in Supabase Dashboard</li>
                      <li>Check browser console for detailed errors</li>
                      <li>Ensure Supabase project is not paused</li>
                    </ol>
                  </div>
                ) : (
                  <div className="text-green-600 space-y-2">
                    <p>✅ Production environment properly configured!</p>
                    <p className="text-sm">All Supabase environment variables are loaded and client is initialized.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {envVars.url === 'NOT SET' || envVars.key === 'NOT SET' ? (
                  <div className="text-red-600 space-y-2">
                    <p>❌ Local environment variables not loaded</p>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-sm">
                      <li>Check .env.local file exists in root directory</li>
                      <li>Restart development server: Ctrl+C and npm run dev</li>
                      <li>Clear browser cache and reload</li>
                      <li>Check .env.local format (no quotes, no spaces around =)</li>
                    </ol>
                  </div>
                ) : envVars.client === 'NULL' ? (
                  <div className="text-yellow-600 space-y-2">
                    <p>⚠️ Environment variables loaded but client failed to initialize</p>
                    <p className="text-sm">Check browser console for detailed error messages</p>
                  </div>
                ) : (
                  <div className="text-green-600 space-y-2">
                    <p>✅ Local development environment operational!</p>
                    <p className="text-sm">Supabase client is properly initialized</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold text-lg mb-2">Additional Debug Information</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Build Time:</span>
                <span className="ml-2 text-gray-600">{envVars.buildTime}</span>
              </div>
              <div>
                <span className="font-medium">Browser Console:</span>
                <span className="ml-2 text-gray-600">Press F12 to view detailed logs</span>
              </div>
              {productionInfo.isProduction && (
                <div className="mt-3 p-2 bg-blue-50 rounded">
                  <p className="font-medium text-blue-800">📋 Next Steps for Production:</p>
                  <ul className="list-disc list-inside text-blue-700 mt-1">
                    <li>Update Supabase Site URL: {productionInfo.vercelUrl}</li>
                    <li>Add redirect URL: {productionInfo.vercelUrl}/auth/callback</li>
                    <li>Test authentication flow</li>
                  </ul>
                </div>
              )}
            </div>
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