// src/lib/supabase/server.ts
'use server'

import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const supabaseServer = () =>
  createServerComponentClient({ cookies })
