'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ArrivalTimePicker({
  meetupId,
  current,
}: {
  meetupId: string
  current: string | null
}) {
  const [time, setTime] = useState(() => {
    if (!current) return ''

    const date = new Date(current)

    if (isNaN(date.getTime())) return ''

    const pad = (n: number) => String(n).padStart(2, '0')

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  })

  const [saved, setSaved] = useState(false)

  async function save() {
    if (!time) {
      console.error('Please select an arrival time')
      return
    }

    const date = new Date(time)

    if (isNaN(date.getTime())) {
      console.error('Invalid arrival time:', time)
      return
    }

    const supabase = createClient()

    const { error } = await supabase
      .from('meetups')
      .update({
        arrive_at: date.toISOString(),
      })
      .eq('id', meetupId)

    if (error) {
      console.error('Arrival time error:', error)
      return
    }
    const { data: check, error: checkError } = await supabase
  .from('meetups')
  .select('id, arrive_at')
  .eq('id', meetupId)
  .single()

console.log('MEETUP ID:', meetupId)
console.log('SAVED ARRIVAL TIME:', check?.arrive_at)
console.log('READ BACK ERROR:', checkError)
console.log('===== DEBUG =====')

console.log('TIME:', time)
console.log('ISO:', date.toISOString())
    console.log('Arrival time saved successfully!')

    setSaved(true)

    setTimeout(() => {
      setSaved(false)
    }, 2000)
  }

  return (
    <div className="space-y-2 mt-6">
      <p className="text-sm font-medium text-gray-700">
        When should everyone arrive?
      </p>

      <div className="flex gap-2">
        <input
          type="datetime-local"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          min="2026-01-01T00:00"
          max="2035-12-31T23:59"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />

        <button
          onClick={save}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium"
        >
          Set time
        </button>
      </div>

      {saved && (
        <p className="text-xs text-green-600">
          ✓ Arrival time saved
        </p>
      )}
    </div>
  )
}