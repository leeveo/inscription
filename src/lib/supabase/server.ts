// src/lib/supabase/server.ts
'use server'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const supabaseServer = () => {
  // Make sure environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      // Get cookie value manually since we're in a server component
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
