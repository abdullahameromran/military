import { supabase } from '@/lib/supabase'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2, XCircle, ShieldCheck, UserCog } from 'lucide-react'

export const revalidate = 0 // Revalidate on every request

async function getAvailability() {
  const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD format

  try {
    const { data, error } = await supabase
      .from('free_days')
      .select('date')
      .eq('date', today)
      .limit(1)

    if (error) {
      console.error('Supabase error:', error.message)
      // If table doesn't exist or there's an error, assume available as a fallback
      return { isAvailable: true, error: "Could not connect to the database. Displaying default status." }
    }

    const isUnavailable = data && data.length > 0
    return { isAvailable: !isUnavailable, error: null }
  } catch (e: any) {
    console.error('Catch error:', e)
    return { isAvailable: true, error: "An unexpected error occurred. Displaying default status." }
  }
}

export default async function Home() {
  const { isAvailable, error } = await getAvailability()

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-semibold text-lg text-primary">
            <ShieldCheck className="h-6 w-6" />
            <span>DutyNotifier</span>
          </div>
          <Button asChild variant="ghost">
            <Link href="/admin">
              <UserCog className="mr-2 h-4 w-4" />
              Admin
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-2xl text-center font-bold text-primary">
              Current Availability
            </CardTitle>
            <CardDescription className="text-center">
              Status updated in real-time
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="flex items-center gap-4">
              {isAvailable ? (
                <CheckCircle2
                  className="h-16 w-16 text-green-500"
                  aria-label="Available"
                />
              ) : (
                <XCircle
                  className="h-16 w-16 text-red-500"
                  aria-label="Unavailable"
                />
              )}
              <p
                className={`text-4xl font-extrabold ${
                  isAvailable ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isAvailable ? 'Available' : 'Unavailable'}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-xs text-muted-foreground">
              Last checked: {new Date().toLocaleTimeString()}
              {error && <span className="text-destructive block mt-2 text-center">{error}</span>}
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
