import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  haversineKm,
  estimateTravelMins,
  calcDepartAt,
} from '@/lib/centroid'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()

  // 1. Get meetup arrival time
  const { data: meetup, error: meetupError } = await supabase
    .from('meetups')
    .select('arrive_at')
    .eq('id', id)
    .single()

  if (meetupError || !meetup?.arrive_at) {
    return NextResponse.json(
      { error: 'Arrival time not set yet' },
      { status: 400 }
    )
  }

  // 2. Get participants with locations
  const { data: participants, error: participantError } = await supabase
    .from('participants')
    .select(
      'id, user_id, latitude, longitude, transport_mode'
    )
    .eq('meetup_id', id)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)

  if (participantError) {
    return NextResponse.json(
      { error: participantError.message },
      { status: 500 }
    )
  }

  // 3. Get selected venue
  const { data: venue, error: venueError } = await supabase
    .from('selected_venue')
    .select('latitude, longitude, name')
    .eq('meetup_id', id)
    .single()

  if (venueError || !venue) {
    return NextResponse.json(
      { error: 'No venue selected yet' },
      { status: 400 }
    )
  }

  const arriveAt = new Date(meetup.arrive_at)

  const venueLocation = {
    lat: venue.latitude,
    lng: venue.longitude,
  }

  // 4. Calculate departure time for every participant
  const departures = (participants ?? []).map((p) => {
    const distanceKm = haversineKm(
      {
        lat: p.latitude,
        lng: p.longitude,
      },
      venueLocation
    )

    const travelMins = estimateTravelMins(
      distanceKm,
      p.transport_mode ?? 'car'
    )

    const departAt = calcDepartAt(
      arriveAt,
      travelMins
    )

    return {
      user_id: p.user_id,
      transport: p.transport_mode ?? 'car',
      distanceKm: Math.round(distanceKm * 10) / 10,
      travelMins,
      departAt: departAt.toISOString(),
      departLabel: departAt.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    }
  })

  // 5. Save calculated values
  await Promise.all(
    departures.map((d) =>
      supabase
        .from('participants')
        .update({
          travel_time_mins: d.travelMins,
          depart_at: d.departAt,
        })
        .eq('meetup_id', id)
        .eq('user_id', d.user_id)
    )
  )

  // 6. Return result
  return NextResponse.json({
    arriveAt: meetup.arrive_at,
    venue: {
      name: venue.name,
      latitude: venue.latitude,
      longitude: venue.longitude,
    },
    departures,
  })
}