'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function TestConnectionPage() {
  const [status, setStatus] = useState<any>({})
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    const supabase = supabaseBrowser()

    try {
      // Test 1: Get session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      setSession(sessionData.session)

      setStatus(prev => ({
        ...prev,
        session: sessionData.session ? 'Connected' : 'Not connected',
        sessionError: sessionError?.message
      }))

      // Test 2: Get user
      const { data: userData, error: userError } = await supabase.auth.getUser()
      setStatus(prev => ({
        ...prev,
        user: userData.user ? userData.user.email : 'No user',
        userError: userError?.message
      }))

      // Test 3: Test database query
      const { data: dbData, error: dbError } = await supabase
        .from('inscription_evenements')
        .select('count')
        .limit(1)

      setStatus(prev => ({
        ...prev,
        database: dbError ? 'Error' : 'OK',
        dbError: dbError?.message
      }))

    } catch (error: any) {
      setStatus(prev => ({
        ...prev,
        globalError: error.message
      }))
    }
  }

  const testLogin = async () => {
    const supabase = supabaseBrowser()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'marcmenu707@gmail.com',
      password: 'ViE51800!'
    })

    setStatus(prev => ({
      ...prev,
      loginTest: error ? 'Failed' : 'Success',
      loginError: error?.message,
      loginData: data
    }))

    if (!error) {
      // Force reload to update session
      window.location.reload()
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test de connexion Supabase</h1>

      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Status:</h2>
          <pre className="text-xs overflow-auto">{JSON.stringify(status, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Session:</h2>
          <pre className="text-xs overflow-auto">{JSON.stringify(session, null, 2)}</pre>
        </div>

        <button
          onClick={testLogin}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Login (marcmenu707@gmail.com)
        </button>

        <button
          onClick={testConnection}
          className="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Refresh Status
        </button>
      </div>
    </div>
  )
}
