import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { kidProfileRepo } from '../repository'
import type { AgeGroup, KidProfile } from '../types'

function ageToGroup(age: number): AgeGroup {
  if (age <= 8) return 'early_elementary'
  if (age <= 10) return 'late_elementary'
  return 'middle_school'
}

export function WelcomePage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Redirect straight to village if a profile already exists
  useEffect(() => {
    kidProfileRepo.get().then(p => {
      if (p) navigate('/village', { replace: true })
    })
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const parsedAge = parseInt(age, 10)

    if (!trimmedName) { setError('What\'s your name?'); return }
    if (isNaN(parsedAge) || parsedAge < 6 || parsedAge > 13) {
      setError('Age must be between 6 and 13.')
      return
    }

    setSaving(true)
    const profile: KidProfile = {
      id: crypto.randomUUID(),
      name: trimmedName,
      age: parsedAge,
      ageGroup: ageToGroup(parsedAge),
      totalXP: 0,
      enpasHatched: 0,
      legendaryCount: 0,
      createdAt: new Date().toISOString(),
    }
    await kidProfileRepo.save(profile)
    navigate('/village', { replace: true })
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-indigo-50 to-purple-100 dark:from-slate-900 dark:to-purple-950">
      <div className="w-full max-w-sm">
        <h1 className="text-5xl font-bold text-purple-900 dark:text-purple-200 text-center mb-2">
          Enpale
        </h1>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-10">
          Your village of AI-made games, built just for you.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              What's your name?
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alex"
              maxLength={32}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              How old are you?
            </label>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="6 – 13"
              min={6}
              max={13}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-2 w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white rounded-full font-semibold text-lg shadow-lg transition"
          >
            {saving ? 'Starting...' : 'Start my village →'}
          </button>
        </form>
      </div>
    </main>
  )
}
