import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const supabase = await createClient()

  const { data: meetup, error } = await supabase
    .from('meetups')
    .select('id')
    .eq('invite_token', token)
    .single()

  if (error || !meetup) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">
          Invalid Invite Link
        </h1>
        <p className="mt-2 text-gray-600">
          This meetup invite link is invalid or no longer exists.
        </p>
      </main>
    )
  }

  redirect(`/meetup/${meetup.id}`)
}