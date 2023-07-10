import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hgjdchierhxsyosxrfqi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnamRjaGllcmh4c3lvc3hyZnFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODg4NDE2MDgsImV4cCI6MjAwNDQxNzYwOH0.gRZoCB5w_eZTlK0RIXQtwl1wWIOc4dYZvcbJrrzgFrc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)