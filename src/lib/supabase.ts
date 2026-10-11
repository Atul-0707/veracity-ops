import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://azdruovlokopxggsbsgn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6ZHJ1b3Zsb2tvcHhnZ3Nic2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NTM5MDksImV4cCI6MjEwNzIyOTkwOX0.LiLlbACc-o-z9K31bdSH2CJIZ7PRu1ORaYhUgQmNk9U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
