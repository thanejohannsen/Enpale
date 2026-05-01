import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useKidProfile } from '../hooks/useKidProfile'
import { useEnpaCollection } from '../hooks/useEnpaCollection'

export function VillagePage() {
  const navigate = useNavigate()
  const { profile, loading: profileLoading } = useKidProfile()
  const { enpas, loading: enpasLoading } = useEnpaCollection()

  // Redirect to welcome if no profile (e.g. fresh browser / cleared storage)
  useEffect(() => {
    if (!profileLoading && !profile) {
      navigate('/', { replace: true })
    }
  }, [profile, profileLoading, navigate])

  if (profileLoading || enpasLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>
  }

  if (!profile) return null

  const incubating = enpas.filter(e => e.status === 'incubating')

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 max-w-2xl mx-auto">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-900 dark:text-purple-200">
              Hi, {profile.name}!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {profile.totalXP} XP · {profile.enpasHatched} Enpas hatched
              {profile.legendaryCount > 0 && ` · 🏆 ${profile.legendaryCount} legendary`}
            </p>
          </div>
          {incubating.length > 0 && (
            <span className="text-sm text-amber-600 dark:text-amber-400 font-medium mt-1">
              🥚 {incubating.length} incubating
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-6 border-b border-slate-200 dark:border-slate-700">
          <span className="px-4 py-2 text-sm font-semibold text-purple-700 dark:text-purple-300 border-b-2 border-purple-600">
            My Village
          </span>
          <Link
            to="/leaderboard"
            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Leaderboard
          </Link>
        </div>
      </header>

      {/* Enpa grid */}
      <section className="px-6 py-4 max-w-2xl mx-auto">
        {enpas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🥚</div>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
              Your village is empty
            </p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-1 mb-8">
              Hatch your first Enpa to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {enpas.map(enpa => (
              <div
                key={enpa.enpaId}
                className="aspect-square rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-3 shadow-sm"
              >
                <span className="text-2xl">🥚</span>
                <p className="text-xs font-semibold mt-2 text-center text-slate-700 dark:text-slate-300 truncate w-full text-center">
                  {enpa.title}
                </p>
                <span className="text-xs text-slate-400 mt-1">L{enpa.level}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Floating hatch button */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center px-6">
        <Link
          to="/topics"
          className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold text-lg shadow-xl transition"
        >
          + Hatch a new Enpa
        </Link>
      </div>
    </main>
  )
}
