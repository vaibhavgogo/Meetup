export type LatLng = { lat: number; lng: number }

export function calcCentroid(points: LatLng[]): LatLng {
  if (points.length === 0) return { lat: 28.6139, lng: 77.209 }
  const lat = points.reduce((s, p) => s + p.lat, 0) / points.length
  const lng = points.reduce((s, p) => s + p.lng, 0) / points.length
  return { lat, lng }
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
    Math.cos((b.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

export function fairnessScore(venue: LatLng, participants: LatLng[]): number {
  const distances = participants.map(p => haversineKm(p, venue))
  const total = distances.reduce((s, d) => s + d, 0)
  const maxDist = Math.max(...distances)
  return total + 2 * maxDist
}