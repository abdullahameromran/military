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
import { CheckCircle2, XCircle, UserCog, CalendarDays, ShieldCheck } from 'lucide-react'
import { format } from 'date-fns'
import { Countdown } from './countdown'

export const revalidate = 0 // Revalidate on every request

async function getAvailability() {
  const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD format

  try {
    const { data: todayData, error: todayError } = await supabase
      .from('free_days')
      .select('date')
      .eq('date', today)
      .limit(1)

    if (todayError) throw todayError;

    const { data: upcomingData, error: upcomingError } = await supabase
      .from('free_days')
      .select('date')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(5)
    
    if (upcomingError) throw upcomingError;
    
    const isFreeToday = todayData && todayData.length > 0
    return { 
      isAvailableToday: isFreeToday, 
      upcomingFreeDays: upcomingData.map((d: any) => d.date),
      error: null 
    }
  } catch (e: any) {
    console.error('Supabase error:', e.message)
    return { 
      isAvailableToday: false, 
      upcomingFreeDays: [], 
      error: "Could not connect to the database. Displaying default status." 
    }
  }
}

export default async function Home() {
  const { isAvailableToday, upcomingFreeDays, error } = await getAvailability()
  const nextFreeDay = upcomingFreeDays.length > 0 ? upcomingFreeDays[0] : null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-primary">
            <ShieldCheck className="h-6 w-6" />
            <span>DutyNotifier</span>
          </Link>
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
              Abdullah's Freedom Meter
            </CardTitle>
            <CardDescription className="text-center">
              Is he free from the shackles of military service? Let's find out!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="flex items-center justify-center gap-4 min-h-[80px]">
              {isAvailableToday ? (
                <>
                  <CheckCircle2
                    className="h-16 w-16 text-green-500"
                    aria-label="Available"
                  />
                  <p
                    className={`text-4xl font-extrabold text-green-600`}
                  >
                    HE IS FREE!
                  </p>
                </>
              ) : (
                <>
                  <XCircle
                    className="h-16 w-16 text-red-500"
                    aria-label="Unavailable"
                  />
                  {nextFreeDay ? (
                    <Countdown nextFreeDay={nextFreeDay} />
                  ) : (
                    <p className="text-2xl font-bold text-red-600">Nope. Duty calls.</p>
                  )}
                </>
              )}
            </div>
             <p className="text-sm text-muted-foreground mt-2">
               Today is {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </CardContent>

          {upcomingFreeDays && upcomingFreeDays.length > 0 && (
            <>
              <CardHeader className="pt-0">
                <CardTitle className="text-xl flex items-center gap-2 justify-center">
                  <CalendarDays className="h-5 w-5" />
                  Upcoming Free Days
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pt-0 px-8 pb-8">
                <ul className="list-disc list-inside space-y-2 text-center w-full bg-muted/50 p-4 rounded-lg">
                  {upcomingFreeDays.map((day: string) => (
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
