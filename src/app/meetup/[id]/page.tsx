'use client'

import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'

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

  const handleLocation = async () => {
    try {
      // 1. Get current location
      const location = await getMyLocation()

      // 2. Create Supabase client
      const supabase = createClient()

      // 3. Get logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.log('User is not logged in')
        return
      }

      // 4. Save location
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
    } catch (error) {
      console.error('Location error:', error)
    }
  }

  return (
    <main>
      <h1>Meetup</h1>

      <button onClick={handleLocation}>
        Share My Location
      </button>
    </main>
  )
}