import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PLACES_KEY = process.env.GOOGLE_MAPS_SERVER_KEY!

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { searchParams } = new URL(request.url)
    const objective = searchParams.get('objective') || 'restaurant'

    const supabase = await createClient()

    // Get participant locations
    const { data: participants, error } = await supabase
      .from('participants')
      .select('latitude, longitude')
      .eq('meetup_id', id)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!participants || participants.length < 2) {
      return NextResponse.json(
        {
          error: 'At least 2 participants with locations are required.',
        },
        { status: 400 }
      )
    }

    // Calculate centroid
    const lat =
      participants.reduce(
        (sum, p) => sum + Number(p.latitude),
        0
      ) / participants.length

    const lng =
      participants.reduce(
        (sum, p) => sum + Number(p.longitude),
        0
      ) / participants.length

    // Google Places Nearby Search
    const placesUrl =
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
      `?location=${lat},${lng}` +
      `&radius=3000` +
      `&type=${encodeURIComponent(objective)}` +
      `&key=${PLACES_KEY}`

    const placesResponse = await fetch(placesUrl)

    if (!placesResponse.ok) {
      return NextResponse.json(
        { error: 'Google Places request failed' },
        { status: 500 }
      )
    }

    const placesData = await placesResponse.json()

    if (placesData.status !== 'OK' && placesData.status !== 'ZERO_RESULTS') {
      return NextResponse.json(
        {
          error: placesData.error_message || placesData.status,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      centroid: {
        lat,
        lng,
      },
      venues: placesData.results || [],
    })
  } catch (error) {
    console.error('Venue API error:', error)

    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}