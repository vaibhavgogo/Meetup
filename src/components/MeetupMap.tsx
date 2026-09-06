'use client'
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps'
import { useEffect, useState } from 'react'
type LatLng = { lat: number; lng: number }
type Participant = {
  id: string
  user_id: string
  latitude: number
  longitude: number
  transport_mode: string
  depart_at: string | null
}
function etaLabel(departAt: string | null): string {
  if (!departAt) return ''

  const diff = new Date(departAt).getTime() - Date.now()

  if (diff <= 0) return '🏃 On the way'

  const mins = Math.ceil(diff / 60000)

  if (mins < 60) {
    return `Leave in ${mins}m`
  }

  return `Leave in ${Math.floor(mins / 60)}h ${mins % 60}m`
}
export function MeetupMap({
  participants,
  centroid,
  userId,
}: {
  participants: Participant[]
  centroid?: LatLng
  userId?: string
}) {
  const [, setNow] = useState(Date.now())

useEffect(() => {
  const timer = setInterval(() => {
    setNow(Date.now())
  }, 60000)

  return () => clearInterval(timer)
}, [])
  const center = centroid ?? (
  participants.length > 0
    ? {
        lat:
          participants.reduce(
            (s, p) => s + p.latitude,
            0
          ) / participants.length,
        lng:
          participants.reduce(
            (s, p) => s + p.longitude,
            0
          ) / participants.length,
      }
    : {
        lat: 28.6139,
        lng: 77.209,
      }
)
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <Map
        style={{ width: '100%', height: '420px' }}
        defaultCenter={center}
        defaultZoom={11}
        mapId="meetup-map"
      >
        {participants.map((p) => {
  const label = etaLabel(p.depart_at)
  const isMe = p.user_id === userId

  return (
    <AdvancedMarker
      key={p.id}
      position={{ lat: p.latitude, lng: p.longitude }}
    >
      <div className="flex flex-col items-center">
        {label && (
          <div
            className={`text-white text-xs px-2 py-1 rounded-full shadow font-medium whitespace-nowrap ${
              isMe ? 'bg-green-600' : 'bg-blue-600'
            }`}
          >
            {label}
          </div>
        )}

        <div
          className={`w-3 h-3 rotate-45 -mt-1 shadow ${
            isMe ? 'bg-green-600' : 'bg-blue-600'
          }`}
        />
      </div>
    </AdvancedMarker>
  )
})}

        {centroid && (
          <AdvancedMarker position={centroid}>
            <Pin
              background="#1D9E75"
              borderColor="#085041"
              glyph="★"
              glyphColor="#fff"
              scale={1.4}
            />
          </AdvancedMarker>
        )}
      </Map>
    </APIProvider>
  )
}