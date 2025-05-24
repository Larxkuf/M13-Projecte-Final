import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hqzzeamhqjhemgpacktz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxenplYW1ocWpoZW1ncGFja3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyODQ5ODgsImV4cCI6MjA1Nzg2MDk4OH0.fYEhXioGCH8gR8d2osDXT0gNpovn-qBmvzoqgNaaOo8'

export const supabase = createClient(supabaseUrl, supabaseKey)