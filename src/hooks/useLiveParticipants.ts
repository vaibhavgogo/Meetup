'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type LiveParticipant = {
  id: string
  user_id: string
  latitude: number
  longitude: number
  transport_mode: string
  depart_at: string | null
}

export function useLiveParticipants(meetupId: string) {
  const [participants, setParticipants] = useState<LiveParticipant[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    supabase
      .from('participants')
      .select('id,user_id,latitude,longitude,transport_mode,depart_at')
      .eq('meetup_id', meetupId)
      .not('latitude','is',null)
      .then(({ data }) => {
        if (data) setParticipants(data as LiveParticipant[])
      })

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`meetup-${meetupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `meetup_id=eq.${meetupId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setParticipants(prev => [...prev, payload.new as LiveParticipant])
          }
          if (payload.eventType === 'UPDATE') {
            setParticipants(prev =>
              prev.map(p =>
                p.id === (payload.new as LiveParticipant).id
                  ? (payload.new as LiveParticipant)
                  : p
              )
            )
          }
          if (payload.eventType === 'DELETE') {
            setParticipants(prev =>
              prev.filter(p => p.id !== (payload.old as LiveParticipant).id)
            )
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [meetupId])

  return participants
}