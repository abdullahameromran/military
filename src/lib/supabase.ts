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

// In-memory store for free days
let freeDaysStore: { date: string }[] = [];

const mockSupabase = {
  from: (table: string) => {
    if (table === 'free_days') {
      return {
        select: (columns = '*') => ({
          order: (column: string, options: { ascending: boolean }) => {
             return Promise.resolve({
                data: [...freeDaysStore].sort((a, b) => {
                    const dateA = new Date(a.date).getTime();
                    const dateB = new Date(b.date).getTime();
                    return options.ascending ? dateA - dateB : dateB - dateA;
                }),
                error: null
              });
          },
           eq: (column: string, value: any) => ({
            limit: (count: number) => {
               return Promise.resolve({
                data: freeDaysStore.filter(d => d.date === value).slice(0, count),
                error: null
              });
            }
          }),
          // This handles the simple select without other filters
          then: (callback: (result: { data: any[], error: any }) => void) => {
             const result = { data: freeDaysStore, error: null };
             if (callback) {
                callback(result);
             }
             return Promise.resolve(result);
           }
        }),
        insert: (rows: { date: string }[]) => {
          rows.forEach(row => {
            if (!freeDaysStore.find(d => d.date === row.date)) {
              freeDaysStore.push(row);
            }
          });
          return Promise.resolve({ error: null });
        },
        delete: () => ({
          gt: (column: string, value: number) => {
            freeDaysStore = [];
            return Promise.resolve({ error: null });
          }
        }),
      };
    }
    // Default mock for any other table
    return {
      select: () => Promise.resolve({ data: [], error: { message: `Table "${table}" does not exist in mock.` } }),
      insert: () => Promise.resolve({ error: { message: `Table "${table}" does not exist in mock.` } }),
      delete: () => Promise.resolve({ error: { message: `Table "${table}" does not exist in mock.` } }),
    };
  },
};


const useMock = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-supabase-url');

export const supabase = useMock ? mockSupabase as any : createClient(supabaseUrl, supabaseAnonKey);
