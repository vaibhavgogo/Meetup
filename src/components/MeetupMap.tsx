'use client'
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps'

type LatLng = { lat: number; lng: number }
type Participant = { id: string; latitude: number; longitude: number }

export function MeetupMap({
  participants,
  centroid,
}: {
  participants: Participant[]
  centroid?: LatLng
}) {
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
        {participants.map((p) => (
          <AdvancedMarker
            key={p.id}
            position={{ lat: p.latitude, lng: p.longitude }}
          >
            <Pin background="#378ADD" borderColor="#0C447C" glyphColor="#fff" />
          </AdvancedMarker>
        ))}

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