import { supabase } from '@/lib/supabase'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2, XCircle, ShieldCheck, UserCog, CalendarDays } from 'lucide-react'
import { format } from 'date-fns'

export const revalidate = 0 // Revalidate on every request

async function getAvailability() {
  const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD format

  try {
    // Check for today
    const { data: todayData, error: todayError } = await supabase
      .from('free_days')
      .select('date')
      .eq('date', today)
      .limit(1)

    if (todayError) throw todayError;

    // Fetch upcoming free days
    const { data: upcomingData, error: upcomingError } = await supabase
      .from('free_days')
      .select('date')
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(10)
    
    if (upcomingError) throw upcomingError;

    const isUnavailableToday = todayData && todayData.length > 0
    return { 
      isAvailableToday: !isUnavailableToday, 
      upcomingUnavailableDays: upcomingData.map((d: any) => d.date),
      error: null 
    }
  } catch (e: any) {
    console.error('Supabase error:', e.message)
    return { 
      isAvailableToday: true, 
      upcomingUnavailableDays: [], 
      error: "Could not connect to the database. Displaying default status." 
    }
  }
}

export default async function Home() {
  const { isAvailableToday, upcomingUnavailableDays, error } = await getAvailability()

  return (
    <div className="flex flex-col min-h-screen bg-background">
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
              {isAvailableToday ? (
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
                  isAvailableToday ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isAvailableToday ? 'Available' : 'Unavailable'}
              </p>
            </div>
             <p className="text-sm text-muted-foreground mt-2">
               Today is {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </CardContent>

          {upcomingUnavailableDays && upcomingUnavailableDays.length > 0 && (
            <>
              <CardHeader className="pt-0">
                <CardTitle className="text-xl flex items-center gap-2 justify-center">
                  <CalendarDays className="h-5 w-5" />
                  Upcoming Unavailable Days
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pt-0 px-8 pb-8">
                <ul className="list-disc list-inside space-y-2 text-center w-full bg-muted/50 p-4 rounded-lg">
                  {upcomingUnavailableDays.map((day: string) => (
                    <li key={day} className="font-medium text-sm">
                      {format(new Date(day + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </>
          )}

          <CardHeader className="pt-0">
            <p className="text-xs text-muted-foreground text-center">
              Last checked: {new Date().toLocaleTimeString()}
              {error && <span className="text-destructive block mt-2 text-center">{error}</span>}
            </p>
          </CardHeader>
        </Card>
      </main>
    </div>
  )
}
