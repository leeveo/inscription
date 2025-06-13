// src/lib/supabase/server.ts
'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const supabaseServer = () => {
  return createServerComponentClient({ cookies })
}
