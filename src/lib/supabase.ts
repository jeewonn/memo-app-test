import { createClient } from '@supabase/supabase-js'
import { Memo } from '@/types/memo'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 브라우저용 클라이언트
export const createBrowserClient = () => {
  return createClient<{ memos: Memo }>(supabaseUrl, supabaseAnonKey)
}

// 서버용 클라이언트
export const createServerClient = () => {
  return createClient<{ memos: Memo }>(supabaseUrl, supabaseAnonKey)
}


