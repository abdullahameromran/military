import { supabase } from '@/lib/supabase'
import { AvailabilityManager } from './availability-manager'
import { AiSuggester } from './ai-suggester'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export const revalidate = 0 // Revalidate on every request

async function getFreeDays() {
  const { data, error } = await supabase
    .from('free_days')
    .select('date')
    .order('date', { ascending: true });

  if (error) {
    console.error("Supabase fetch error:", error.message);
    // This error often means the table doesn't exist.
    // We'll return an empty array and show a warning in the UI.
    return { freeDays: [], error: "Could not fetch availability. Please ensure the 'free_days' table exists in your Supabase project." };
  }

  return { freeDays: data.map(d => d.date), error: null };
}

export default async function AdminPage() {
  const { freeDays, error } = await getFreeDays();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your availability and get AI-powered suggestions for free days.
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Database Error</AlertTitle>
          <AlertDescription>
            {error} You can create it with the following SQL schema:
            <code className="block bg-muted p-2 rounded-md my-2 text-xs">
              CREATE TABLE free_days (id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, date DATE NOT NULL UNIQUE, created_at TIMESTAMPTZ DEFAULT now() NOT NULL);
            </code>
            Also, ensure Row Level Security (RLS) is configured if enabled.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <AvailabilityManager initialFreeDays={freeDays} />
        <AiSuggester currentFreeDays={freeDays} />
      </div>
    </div>
  )
}
