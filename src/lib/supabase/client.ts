// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

// Create a singleton instance to avoid multiple GoTrueClient instances
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export const supabaseBrowser = () => {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseInstance;
};
