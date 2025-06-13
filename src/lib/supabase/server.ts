// src/lib/supabase/server.ts
'use server'

import { createClient } from '@supabase/supabase-js'

export const supabaseServer = () => {
  // Explicitly check and use environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined')
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

// Add a function specifically for API routes
export const supabaseApi = () => {
  // Use the same environment variables but with explicit error handling for API routes
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Environment variables are missing in API route:', { 
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })
    throw new Error('Supabase configuration error: Missing environment variables in API route')
  }
  
  // Create and return the Supabase client
  return createClient(supabaseUrl, supabaseKey)
}
