import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterestChat } from '../hooks/useInterestChat'
import { useSessionStore } from '../store/sessionStore'

export function ChatPage() {
  const navigate = useNavigate()
  const sessionActive = useSessionStore(s => s.sessionId !== null)
  const { history, sending, readyToBuild, error, sendMessage, finalize } = useInterestChat()

  const [draft, setDraft] = useState('')
  const [finalizing, setFinalizing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // If user lands here without a session (refresh, deep link), bounce back
  useEffect(() => {
    if (!sessionActive) navigate('/topics', { replace: true })
  }, [sessionActive, navigate])

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [history.length, sending])

  const handleSend = async () => {
    const text = draft.trim()
    if (!text || sending) return
    setDraft('')
    try {
      await sendMessage(text)
    } catch {
      // error shown below
    }
  }

  const handleFinalize = async () => {
    setFinalizing(true)
    try {
      const profile = await finalize()
      // Phase 2 stops here — show the profile so we can verify the pipeline.
      // Phase 3 will create an Enpa record and navigate to /incubate/:enpaId.
      // Use console + alert so the dev can grab the JSON.
      console.log('InterestProfile:', profile)
      alert(
        `Phase 2 complete!\n\nPrimary interest: ${profile.primary_interest}\nGame style: ${profile.preferred_game_style}\nAttention span: ${profile.attention_span_signal}\n\n(Full profile logged to console.)`,
      )
      navigate('/village')
    } catch {
      // error shown
    } finally {
      setFinalizing(false)
    }
  }

  if (!sessionActive) return null

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-purple-950">
      <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">Sparky</p>
            <p className="text-xs text-slate-500">your egg-hatching sidekick</p>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {history.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={[
                  'max-w-[80%] px-4 py-2 rounded-2xl whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm border border-slate-200 dark:border-slate-700',
                ].join(' ')}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce">·</span>
                  <span className="animate-bounce [animation-delay:0.15s]">·</span>
                  <span className="animate-bounce [animation-delay:0.3s]">·</span>
                </span>
              </div>
            </div>
          )}
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </div>
      </div>

      <footer className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur">
        <div className="max-w-2xl mx-auto">
          {readyToBuild ? (
            <button
              onClick={handleFinalize}
              disabled={finalizing}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-60 text-white rounded-full font-semibold text-lg shadow-lg transition"
            >
              {finalizing ? 'Hatching your egg...' : '🥚 Hatch my egg!'}
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Type to Sparky..."
                disabled={sending}
                maxLength={500}
                className="flex-1 px-4 py-3 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSend}
                disabled={!draft.trim() || sending}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-full font-semibold transition"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </footer>
    </main>
  )
}
