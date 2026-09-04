'use client'

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'

type Participant = {
  id: string
  latitude: number
  longitude: number
}

export function MeetupMap({
  participants,
}: {
  participants: Participant[]
}) {
  const center = participants.length
    ? {
        lat:
          participants.reduce((sum, p) => sum + p.latitude, 0) /
          participants.length,
        lng:
          participants.reduce((sum, p) => sum + p.longitude, 0) /
          participants.length,
      }
    : { lat: 28.6139, lng: 77.209 }

  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
    >
      <Map
        style={{ width: '100%', height: '400px' }}
        defaultCenter={center}
        defaultZoom={11}
        mapId="meetup-map"
      >
        {participants.map((p) => (
          <AdvancedMarker
            key={p.id}
            position={{
              lat: p.latitude,
              lng: p.longitude,
            }}
          />
        ))}
      </Map>
    </APIProvider>
  )
}