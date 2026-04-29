import { Link } from 'react-router-dom'

export function WelcomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-purple-950">
      <h1 className="text-5xl font-bold text-purple-900 dark:text-purple-200 mb-4">Enpale</h1>
      <p className="text-lg text-slate-700 dark:text-slate-300 mb-8 text-center max-w-md">
        Engagement + Passion + Learning. Hatch your village of personalized AI games.
      </p>
      <Link
        to="/village"
        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold shadow-lg transition"
      >
        Enter the village
      </Link>
      <p className="mt-12 text-xs text-slate-500">Phase 0 scaffold — pages stubbed for routing</p>
    </main>
  )
}
