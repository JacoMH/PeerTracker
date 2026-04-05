import { createClient } from '@supabase/supabase-js'

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabase_public = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC || ''

// Create a single supabase client for user tasks
export const supabase = createClient(supabase_url, supabase_public)