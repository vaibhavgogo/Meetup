'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { MeetupMap } from '@/components/MeetupMap'
import { TransportPicker } from '@/components/TransportPicker'
import { ArrivalTimePicker } from '@/components/ArrivalTimePicker'
import { DepartureAlerts } from '@/components/DepartureAlerts'
import { useLiveParticipants } from '@/hooks/useLiveParticipants'
import { LiveLocationShare } from '@/components/LiveLocationShare'

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
const participants = useLiveParticipants(meetupId)
  const [centroid, setCentroid] = useState<Centroid | undefined>()
  const [copied, setCopied] = useState(false)
const [userId, setUserId] = useState<string>('')
const [inviteToken, setInviteToken] = useState<string>('')
const [myTransport, setMyTransport] = useState<string>('car')
const [meetup, setMeetup] = useState<{
  name: string
  created_by: string
  arrive_at: string | null
} | null>(null)

  useEffect(() => {
    const loadMeetup = async () => {
      const supabase = createClient()
      const {
  data: { user },
} = await supabase.auth.getUser()

if (!user) {
  console.log('User is not logged in')
  return
}

setUserId(user.id)
const { data: meetup, error: meetupError } = await supabase
  .from('meetups')
 .select('name, invite_token, created_by, arrive_at')
  .eq('id', meetupId)
  .single()

if (meetupError) {

  console.error('MEETUP FETCH ERROR')
  console.error('code:', meetupError.code)
  console.error('message:', meetupError.message)
  console.error('details:', meetupError.details)
  console.error('hint:', meetupError.hint)
  return

}

setInviteToken(meetup.invite_token || '')
      setMeetup({
  name: meetup.name,
  created_by: meetup.created_by,
  arrive_at: meetup.arrive_at,
})
document.title = `${meetup.name} — MeetUp`
    const { data: me } = await supabase
  .from('participants')
  .select('transport_mode')
  .eq('meetup_id', meetupId)
  .eq('user_id', user.id)
  .maybeSingle()

if (me) {
  setMyTransport(me.transport_mode ?? 'car')
}
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
  function copyLink() {
  navigator.clipboard.writeText(inviteUrl)
  setCopied(true)

  setTimeout(() => {
    setCopied(false)
  }, 2000)
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
  onClick={copyLink}
  className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
>
  {copied ? '✓ Copied!' : 'Copy'}
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

<div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
    {participants.length}
  </span>

  {participants.length === 1
    ? '1 person'
    : `${participants.length} people`}{' '}
  on the map
</div>
{participants.length === 0 && (
  <div className="text-center py-8 text-gray-400">
    <p className="text-3xl mb-2">📍</p>
    <p className="text-sm">
      No one has dropped a pin yet.
    </p>
    <p className="text-xs mt-1">
      Share the invite link to get started.
    </p>
  </div>
)}
<MeetupMap
  participants={participants}
  centroid={centroid}
  userId={userId}
/>
    {userId && (
  <div className="mt-6">
    <TransportPicker
      meetupId={meetupId}
      userId={userId}
      current={myTransport}
    />
  </div>
)}
{userId && (
  <div className="mt-4">
    <LiveLocationShare
      meetupId={meetupId}
      userId={userId}
    />
  </div>
)}
{userId && (
  <div className="mt-6">
    <DepartureAlerts meetupId={meetupId} />
  </div>
)}
{meetup && meetup.created_by === userId && (
  <ArrivalTimePicker
    meetupId={meetupId}
    current={meetup.arrive_at}
  />
)}
  </main>
  
)
}
