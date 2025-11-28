'use client'

import { useState, useEffect, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { saveFreeDays } from './actions'
import { useToast } from '@/hooks/use-toast'
import { CalendarDays } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Saving...' : 'Save Availability'}
    </Button>
  )
}

type AvailabilityManagerProps = {
  initialFreeDays: string[]
}

export function AvailabilityManager({ initialFreeDays }: AvailabilityManagerProps) {
  const [days, setDays] = useState<Date[]>(
    initialFreeDays.map(d => new Date(d + 'T00:00:00')) // Adjust for timezone issues
  )
  const { toast } = useToast()

  const [state, formAction] = useActionState(saveFreeDays, null)

  useEffect(() => {
    if (state?.message) {
      if (state.type === 'success') {
        toast({
          title: "Success",
          description: state.message,
          variant: 'default',
        })
      } else {
        toast({
          title: "Error",
          description: state.message,
          variant: 'destructive',
        })
      }
    }
  }, [state, toast])

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-bold">Manage Availability</CardTitle>
        </div>
        <CardDescription>
          Select the days you are unavailable. These will be shown on the public
          status page.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent>
          <div className="flex justify-center rounded-md border">
            <Calendar
              mode="multiple"
              selected={days}
              onSelect={setDays}
              className="p-3"
            />
          </div>
          {days?.map(day => (
            <input type="hidden" name="dates[]" key={day.toISOString()} value={day.toISOString().split('T')[0]} />
          ))}
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  )
}
