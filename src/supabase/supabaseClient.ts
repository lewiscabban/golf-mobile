import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://plhcjzdcjzjdhthzviin.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsaGNqemRjanpqZGh0aHp2aWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NTM2MTgsImV4cCI6MjA1MDEyOTYxOH0.dAgppTwIgNV-Vh2iLK0JcAdlzbX2jihmWwSWYJiUrow"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
