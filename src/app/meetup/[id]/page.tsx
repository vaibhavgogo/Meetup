'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { MeetupMap } from '@/components/MeetupMap'

type Participant = {
  id: string
  latitude: number
  longitude: number
}

type Centroid = {
  lat: number
  lng: number
}

function getMyLocation() {
  return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      reject
    )
  })
}

export default function MeetupPage() {
  const params = useParams()
  const meetupId = params.id as string

  const [participants, setParticipants] = useState<Participant[]>([])
  const [centroid, setCentroid] = useState<Centroid | undefined>()

  useEffect(() => {
    const loadMeetup = async () => {
      const supabase = createClient()

      // Fetch participants
      const { data, error } = await supabase
        .from('participants')
        .select('id, latitude, longitude')
        .eq('meetup_id', meetupId)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      if (error) {
        console.error('Error fetching participants:', error)
        return
      }

      setParticipants(data || [])

      // Fetch centroid
      const centRes = await fetch(
        `/api/meetup/${meetupId}/centroid`
      )

      const centroidData = centRes.ok
  ? await centRes.json()
  : null



setCentroid(centroidData)
    }

    loadMeetup()
  }, [meetupId])

  const handleLocation = async () => {
    try {
      // Get current location
      const location = await getMyLocation()

      const supabase = createClient()

      // Get logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.log('User is not logged in')
        return
      }

      // Save location
      const { error } = await supabase
        .from('participants')
        .upsert(
          {
            meetup_id: meetupId,
            user_id: user.id,
            latitude: location.lat,
            longitude: location.lng,
          },
          {
            onConflict: 'meetup_id,user_id',
          }
        )

      if (error) {
        console.error('Error saving location:', error)
        return
      }

      console.log('Location saved successfully!')
      console.log(location)

      // Reload the data
      window.location.reload()
    } catch (error) {
      console.error('Location error:', error)
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Meetup
      </h1>

      <button
        onClick={handleLocation}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-6"
      >
        Share My Location
      </button>

      <MeetupMap
        participants={participants}
        centroid={centroid}
      />
    </main>
  )
}