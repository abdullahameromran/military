import { createClient } from '@supabase/supabase-js'

// Note: This setup uses the anon key for both client-side and server-side operations.
// For production applications, you should use the service_role key for server-side mutations
// and implement Row Level Security (RLS) on your tables.

// Example RLS policies for a 'free_days' table:
// -- Allow public read access
// CREATE POLICY "Allow public read access" ON public.free_days FOR SELECT USING (true);
// -- Allow admin users to manage all records
// CREATE POLICY "Allow admin full access" ON public.free_days FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());
// (is_admin_user() would be a custom function to check user roles)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or anon key environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
