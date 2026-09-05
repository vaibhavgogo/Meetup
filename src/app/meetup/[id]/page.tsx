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
  const [inviteToken, setInviteToken] = useState<string>('')

  useEffect(() => {
    const loadMeetup = async () => {
      const supabase = createClient()
      
const { data: meetup, error: meetupError } = await supabase
  .from('meetups')
  .select('invite_token')
  .eq('id', meetupId)
  .single()

if (meetupError) {
  console.error('Error fetching meetup:', meetupError)
  return
}

setInviteToken(meetup.invite_token || '')
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
      const {
  data: { session },
} = await supabase.auth.getSession()

console.log('SESSION USER:', session?.user?.id)

console.log('User ID:', user.id)
console.log('Meetup ID:', meetupId)
console.log('Location:', location)
  const { data: existingParticipant, error: findError } = await supabase
  .from('participants')
  .select('id')
  .eq('meetup_id', meetupId)
  .eq('user_id', user.id)
  .maybeSingle()

if (findError) {
  console.error('Error checking participant:', findError)
  return
}

let error

if (existingParticipant) {
  // Update existing participant
  const result = await supabase
    .from('participants')
    .update({
      latitude: location.lat,
      longitude: location.lng,
    })
    .eq('id', existingParticipant.id)

  error = result.error
} else {
  // Insert new participant
  const result = await supabase
    .from('participants')
    .insert({
      meetup_id: meetupId,
      user_id: user.id,
      latitude: location.lat,
      longitude: location.lng,
    })

  error = result.error
}

if (error) {
  console.log('LOCATION ERROR')
  console.log(JSON.stringify(error, null, 2))
  return
}

console.log('Location saved successfully!')

if (error) {
  console.log('INSERT ERROR')
  console.log(JSON.stringify(error, null, 2))
  return
}

console.log('Location saved successfully!')

      console.log('Location saved successfully!')
      console.log(location)

      // Reload the data
      window.location.reload()
    } catch (error) {
  
  console.error('Location error:', error)
}
  }
  const inviteUrl = inviteToken
  ? `${window.location.origin}/join/${inviteToken}`
  : ''
 return (
  <main className="p-8">
    <h1 className="text-3xl font-bold mb-6">
      Meetup
    </h1>

    {inviteUrl && (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">
          Invite Friends
        </h2>

        <div className="flex items-center gap-2">
          <input
            value={inviteUrl}
            readOnly
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />

          <button
            onClick={() => navigator.clipboard.writeText(inviteUrl)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            Copy
          </button>
        </div>
      </div>
    )}

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
