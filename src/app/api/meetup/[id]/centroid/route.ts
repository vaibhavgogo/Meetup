import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await createClient()

    const { data: participants, error } = await supabase
      .from('participants')
      .select('latitude, longitude')
      .eq('meetup_id', id)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    if (error) {
      console.error('Supabase error:', error)

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!participants || participants.length === 0) {
      return NextResponse.json(
        { error: 'No participant locations found' },
        { status: 404 }
      )
    }

    const lat =
      participants.reduce(
        (sum, participant) => sum + participant.latitude,
        0
      ) / participants.length

    const lng =
      participants.reduce(
        (sum, participant) => sum + participant.longitude,
        0
      ) / participants.length

    return NextResponse.json({
      lat,
      lng,
    })
  } catch (error) {
    console.error('Centroid error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}