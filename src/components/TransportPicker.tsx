'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const MODES = [
  { value: 'walking',  label: 'Walk',   icon: '🚶' },
  { value: 'cycling',  label: 'Cycle',  icon: '🚲' },
  { value: 'car',      label: 'Car',    icon: '🚗' },
  { value: 'bus',      label: 'Bus',    icon: '🚌' },
  { value: 'metro',    label: 'Metro',  icon: '🚇' },
]

type Props = {
  meetupId: string
  userId: string
  current: string
}

export function TransportPicker({ meetupId, userId, current }: Props) {
  const [selected, setSelected] = useState(current ?? 'car')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save(mode: string) {
    setSelected(mode)
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('participants')
      .update({ transport_mode: mode })
      .eq('meetup_id', meetupId)
      .eq('user_id', userId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">
        How are you getting there?
      </p>
      <div className="flex flex-wrap gap-2">
        {MODES.map(m => (
          <button
            key={m.value}
            onClick={() => save(m.value)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm
              transition-all ${selected === m.value
                ? 'bg-orange-500 text-white border-orange-500 font-medium'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>
      {saving && <p className="text-xs text-gray-400">Saving…</p>}
      {saved  && <p className="text-xs text-green-600">✓ Transport saved</p>}
    </div>
  )
}