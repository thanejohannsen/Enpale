import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TOPIC_CARDS } from '../data/topicCards'
import { useKidProfile } from '../hooks/useKidProfile'
import { useInterestChat } from '../hooks/useInterestChat'
import { useSessionStore } from '../store/sessionStore'

const MIN_PICKS = 1
const MAX_PICKS = 4

export function TopicSelectPage() {
  const navigate = useNavigate()
  const { profile, loading } = useKidProfile()
  const setSelectedTopicIds = useSessionStore(s => s.setSelectedTopicIds)
  const reset = useSessionStore(s => s.reset)
  const { startSession, sending, error } = useInterestChat()

  const [picked, setPicked] = useState<Set<string>>(new Set())

  // Guard: send to welcome if no profile
  useEffect(() => {
    if (!loading && !profile) navigate('/', { replace: true })
  }, [profile, loading, navigate])

  // Reset any stale session state on entry
  useEffect(() => {
    reset()
  }, [reset])

  const togglePick = (id: string) => {
    setPicked(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < MAX_PICKS) {
        next.add(id)
      }
      return next
    })
  }

  const handleContinue = async () => {
    if (picked.size < MIN_PICKS) return
    const ids = Array.from(picked)
    setSelectedTopicIds(ids)
    try {
      await startSession(ids)
      navigate('/chat')
    } catch {
      // error displayed below; stay on page
    }
  }

  if (loading) return null

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-slate-900 dark:to-slate-950 pb-32">
      <header className="px-6 pt-6 max-w-2xl mx-auto">
        <Link to="/village" className="text-sm text-purple-600 hover:underline">← village</Link>
        <h1 className="text-3xl font-bold text-purple-900 dark:text-purple-200 mt-3">
          What do you love?
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Pick {MIN_PICKS}–{MAX_PICKS} things. Don't overthink it!
        </p>
      </header>

      <section className="px-6 mt-6 max-w-2xl mx-auto">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {TOPIC_CARDS.map(card => {
            const isPicked = picked.has(card.id)
            const atLimit = picked.size >= MAX_PICKS && !isPicked
            return (
              <button
                key={card.id}
                onClick={() => togglePick(card.id)}
                disabled={atLimit}
                className={[
                  'aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center transition shadow-sm',
                  'border-2',
                  isPicked
                    ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/40 ring-2 ring-purple-400'
                    : 'border-transparent bg-white dark:bg-slate-800 hover:border-purple-200',
                  atLimit ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
              >
                <span className="text-3xl">{card.emoji}</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1 leading-tight">
                  {card.label}
                </span>
              </button>
            )
          })}
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </section>

      <div className="fixed bottom-8 left-0 right-0 flex justify-center px-6">
        <button
          onClick={handleContinue}
          disabled={picked.size < MIN_PICKS || sending}
          className="px-8 py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-full font-semibold text-lg shadow-xl transition"
        >
          {sending
            ? 'Talking to Sparky...'
            : picked.size === 0
              ? 'Pick at least 1 to continue'
              : `Continue (${picked.size}) →`}
        </button>
      </div>
    </main>
  )
}
