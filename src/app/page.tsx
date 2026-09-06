import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl">
          📍
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          MeetUp
        </h1>

        <p className="mt-4 max-w-xl text-lg text-gray-600">
          Find the fairest place to meet your friends.
          Share your location, compare distances, and choose a
          convenient meeting point for everyone.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/meetup/new"
            className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            Create a Meetup
          </Link>

          <a
            href="#how-it-works"
            className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            How it works
          </a>
        </div>

        <div
          id="how-it-works"
          className="mt-16 grid max-w-4xl gap-6 text-left sm:grid-cols-3"
        >
          <div className="rounded-2xl border p-6">
            <div className="text-2xl">📍</div>
            <h2 className="mt-3 font-semibold text-gray-900">
              Share locations
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Everyone adds their location to the meetup.
            </p>
          </div>

          <div className="rounded-2xl border p-6">
            <div className="text-2xl">⚖️</div>
            <h2 className="mt-3 font-semibold text-gray-900">
              Find a fair place
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              MeetUp compares locations and suggests a fair venue.
            </p>
          </div>

          <div className="rounded-2xl border p-6">
            <div className="text-2xl">🚗</div>
            <h2 className="mt-3 font-semibold text-gray-900">
              Arrive together
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Get transport-aware departure times so everyone can arrive together.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}