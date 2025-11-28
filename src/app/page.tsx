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

export const revalidate = 0

async function getAvailability() {
  const today = new Date().toLocaleDateString('en-CA') 

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
  const nextFreeDay = !isAvailableToday && upcomingFreeDays.length > 0 ? upcomingFreeDays[0] : null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 font-semibold text-xl text-primary">
            <ShieldCheck className="h-7 w-7" />
            <span className="font-headline">Freedom Countdown</span>
          </Link>
          <Button asChild variant="outline">
            <Link href="/admin">
              <UserCog className="mr-2 h-4 w-4" />
              Admin Panel
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-2xl animate-fade-in-up border-2 border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline font-bold text-primary tracking-tight">
              Abdullah's Freedom Meter
            </CardTitle>
            <CardDescription className="text-lg">
              Is he free from the shackles of military service?
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="flex items-center justify-center gap-4 min-h-[80px]">
              {isAvailableToday ? (
                <>
                  <CheckCircle2
                    className="h-20 w-20 text-green-500"
                    aria-label="Available"
                  />
                  <p
                    className={`text-5xl font-extrabold text-green-600`}
                  >
                    HE IS FREE!
                  </p>
                </>
              ) : (
                <>
                  <XCircle
                    className="h-20 w-20 text-red-500"
                    aria-label="Unavailable"
                  />
                  {nextFreeDay ? (
                    <Countdown nextFreeDay={nextFreeDay} />
                  ) : (
                     <p className="text-2xl font-bold text-red-600">Nope. Military service calls.</p>
                  )}
                </>
              )}
            </div>
             <p className="text-md text-muted-foreground pt-2">
               Today is {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </CardContent>

          {upcomingFreeDays && upcomingFreeDays.length > 0 && (
            <>
              <CardHeader className="pt-2 border-t">
                <CardTitle className="text-2xl flex items-center gap-3 justify-center font-headline">
                  <CalendarDays className="h-6 w-6 text-primary" />
                  Upcoming Free Days
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pt-0 px-8 pb-8">
                <ul className="space-y-3 text-center w-full">
                  {upcomingFreeDays.map((day: string) => (
                    <li key={day} className="font-semibold text-lg bg-secondary text-secondary-foreground p-3 rounded-lg shadow-sm">
                      {format(new Date(day + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </>
          )}

          <CardHeader className="pt-2 border-t">
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
