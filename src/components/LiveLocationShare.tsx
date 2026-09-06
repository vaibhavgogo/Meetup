'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LiveLocationShare({
  meetupId,
  userId,
}: {
  meetupId: string
  userId: string
}) {
  const [sharing, setSharing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const watchRef = useRef<number | null>(null)
  const supabase = createClient()

  function startSharing() {
    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device')
      return
    }

    setSharing(true)
    setError(null)

    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { error } = await supabase
          .from('participants')
          .update({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          })
          .eq('meetup_id', meetupId)
          .eq('user_id', userId)

        if (error) {
          console.error('Live location update error:', error)
        }
      },
      (err) => {
        console.error('Location error:', err)
        setError('Location error: ' + err.message)
        setSharing(false)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    )
  }

  function stopSharing() {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current)
      watchRef.current = null
    }

    setSharing(false)
  }

  useEffect(() => {
    return () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-2">
      <button
        onClick={sharing ? stopSharing : startSharing}
        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
          sharing
            ? 'bg-red-500 text-white'
            : 'bg-green-600 text-white'
        }`}
      >
        {sharing
          ? '⏹ Stop sharing location'
          : '📍 Share live location'}
      </button>

      {sharing && (
        <p className="text-xs text-green-600 text-center">
          🟢 Live — your pin is moving on everyone&apos;s map
        </p>
      )}

      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}