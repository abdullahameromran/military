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
    return { freeDays: [], error: "Could not fetch availability. Using in-memory store as a fallback." };
  }

  return { freeDays: data.map((d: any) => d.date), error: null };
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
          <AlertTitle>Database Notice</AlertTitle>
          <AlertDescription>
            {error} You can connect to a real Supabase database by setting the environment variables in the `.env` file.
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
