'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { nanoid } from 'nanoid'
export default function NewMeetupPage() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleCreateMeetup = async () => {
    if (!name.trim()) {
      alert('Please enter a meetup name')
      return
    }

    setLoading(true)

    // Get logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('Please login first')
      setLoading(false)
      return
    }

    // Create meetup
    const { data, error } = await supabase
      .from('meetups')
      .insert({
        name: name,
        created_by: user.id,
        invite_token: nanoid(10), 
      })
      .select()
      .single()

    if (error) {
  console.error('Error creating meetup:', error)
  console.error('Message:', error.message)
  console.error('Details:', error.details)
  console.error('Hint:', error.hint)
  console.error('Code:', error.code)

  alert(
    `Error: ${error.message}\nCode: ${error.code}`
  )

  setLoading(false)
  return
}

    // Go to the newly created meetup
    router.push(`/meetup/${data.id}`)
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">
        Create a Meetup
      </h1>

      <input
        type="text"
        placeholder="Enter meetup name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded mr-2"
      />

      <button
        onClick={handleCreateMeetup}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Creating...' : 'Create Meetup'}
      </button>
    </main>
  )
}