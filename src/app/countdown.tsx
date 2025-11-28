'use client'

import { useState, useEffect } from 'react'
import { differenceInSeconds, intervalToDuration } from 'date-fns'

type CountdownProps = {
  nextFreeDay: string
}

function formatDuration(duration: Duration) {
  let parts = [];
  if (duration.days && duration.days > 0) parts.push(`${duration.days}d`);
  if (duration.hours && duration.hours > 0) parts.push(`${duration.hours}h`);
  if (duration.minutes && duration.minutes > 0) parts.push(`${duration.minutes}m`);
  parts.push(`${duration.seconds}s`);
  return parts.join(' ');
}


export function Countdown({ nextFreeDay }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState('Loading...')

  useEffect(() => {
    if (!nextFreeDay) return

    const targetDate = new Date(`${nextFreeDay}T00:00:00`)

    const timer = setInterval(() => {
      const secondsRemaining = differenceInSeconds(targetDate, new Date())

      if (secondsRemaining <= 0) {
        clearInterval(timer)
        setTimeLeft('The time has come!')
        // Optional: Trigger a page reload to get fresh data
        window.location.reload()
        return
      }

      const duration = intervalToDuration({ start: 0, end: secondsRemaining * 1000 })
      
      const formatted = [
        { value: duration.days, label: 'd' },
        { value: duration.hours, label: 'h' },
        { value: duration.minutes, label: 'm' },
        { value: duration.seconds, label: 's' },
      ]
      
      setTimeLeft(
        formatted
        .filter(part => typeof part.value !== 'undefined')
        .map(part => `${part.value}${part.label}`)
        .join(' ')
      )

    }, 1000)

    return () => clearInterval(timer)
  }, [nextFreeDay])

  return (
      <div className="text-center">
        <p className="text-3xl font-extrabold text-amber-500 animate-pulse">
         {timeLeft}
        </p>
         <p className="text-sm font-medium text-muted-foreground">until freedom!</p>
      </div>
  )
}
