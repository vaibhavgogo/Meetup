'use client'

import { useState } from 'react'

const MODE_ICONS: Record<string, string> = {
  walking: '🚶',
  cycling: '🚲',
  car: '🚗',
  bus: '🚌',
  metro: '🚇',
}

type Departure = {
  user_id: string
  transport: string
  distanceKm: number
  travelMins: number
  departLabel: string
}

export function DepartureAlerts({
  meetupId,
}: {
  meetupId: string
}) {
  const [departures, setDepartures] = useState<Departure[]>([])
  const [arriveAt, setArriveAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function calculate() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `/api/meetup/${meetupId}/departures`
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to calculate departures')
        return
      }

      setArriveAt(data.arriveAt)
      setDepartures(data.departures)
    } catch (err) {
      console.error(err)
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const arriveLabel = arriveAt
    ? new Date(arriveAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : null

  return (
    <div className="space-y-4 mt-6">
      <button
        onClick={calculate}
        disabled={loading}
        className="w-full py-2 bg-orange-500 text-white rounded-lg text-sm font-medium disabled:opacity-60"
      >
        {loading
          ? 'Calculating…'
          : '⏰ Calculate departure times'}
      </button>

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      {arriveLabel && (
        <p className="text-sm text-gray-500 text-center">
          Everyone arrives by{' '}
          <strong>{arriveLabel}</strong>
        </p>
      )}

      <div className="space-y-3">
        {departures.map((d, i) => (
          <div
            key={d.user_id}
            className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl"
          >
            <div className="text-2xl w-8 text-center flex-shrink-0">
              {MODE_ICONS[d.transport] ?? '🚗'}
            </div>

            <div className="flex-1">
              <div className="text-sm font-medium">
                Friend {i + 1}
              </div>

              <div className="text-xs text-gray-500 mt-0.5">
                {d.transport} · {d.distanceKm} km ·{' '}
                {d.travelMins} min ride
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-sm font-bold text-orange-500">
                Leave at {d.departLabel}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}