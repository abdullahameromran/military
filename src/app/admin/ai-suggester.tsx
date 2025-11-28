'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { suggestFreeDays, SuggestFreeDaysOutput } from '@/ai/flows/suggest-free-days'
import { Sparkles, Bot } from 'lucide-react'
import { format } from 'date-fns'

type AiSuggesterProps = {
  currentFreeDays: string[]
}

export function AiSuggester({ currentFreeDays }: AiSuggesterProps) {
  const [schedules, setSchedules] = useState('')
  const [suggestions, setSuggestions] = useState<SuggestFreeDaysOutput | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetSuggestions = async () => {
    setIsLoading(true)
    setError(null)
    setSuggestions(null)
    try {
      const pastAvailabilityData = currentFreeDays.length > 0 ? `Current unavailable days: ${currentFreeDays.join(', ')}` : "No past unavailability data provided."
      
      const result = await suggestFreeDays({
        pastAvailabilityData,
        commonMilitaryLeaveSchedules: schedules,
        numberOfSuggestions: 5,
      })
      setSuggestions(result)
    } catch (e: any) {
      console.error(e)
      setError('Failed to get suggestions. Please check the console for more details.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-bold">AI Availability Helper</CardTitle>
        </div>
        <CardDescription>
          Get suggestions for potential free days based on past patterns and
          other schedules.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="schedules">
            Common Leave Schedules (optional)
          </Label>
          <Textarea
            id="schedules"
            placeholder="e.g., 'Block leave from 2024-12-20 to 2025-01-05', '4-day weekend for Thanksgiving'"
            value={schedules}
            onChange={(e) => setSchedules(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button onClick={handleGetSuggestions} disabled={isLoading} className="w-full">
          {isLoading ? 'Thinking...' : 'Get Suggestions'}
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        {isLoading && (
          <div className="w-full space-y-3">
             <Skeleton className="h-5 w-1/3" />
             <Skeleton className="h-4 w-full" />
             <div className="space-y-2 pt-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
             </div>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {suggestions && (
          <div className="w-full space-y-3 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold flex items-center gap-2"><Bot className="h-5 w-5" /> AI's Reasoning:</h4>
            <p className="text-sm text-muted-foreground italic">"{suggestions.reasoning}"</p>
            <div className="space-y-2 pt-2">
              <h5 className="font-semibold">Suggested Dates:</h5>
              <ul className="list-disc list-inside space-y-1">
                {suggestions.suggestedFreeDays.map((day) => (
                  <li key={day} className="text-sm font-medium">
                    {format(new Date(day + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
                  </li>
                ))}
              </ul>
            </div>
             <p className="text-xs text-muted-foreground pt-2">Manually add these dates to the calendar above and click "Save Availability".</p>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
