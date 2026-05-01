import { useEffect, useState } from 'react'
import { kidProfileRepo } from '../repository'
import { kidProfileEmitter } from '../repository/localStorageRepo'
import type { KidProfile } from '../types'

export function useKidProfile() {
  const [profile, setProfile] = useState<KidProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const p = await kidProfileRepo.get()
    setProfile(p)
    setLoading(false)
  }

  useEffect(() => {
    load()
    return kidProfileEmitter.subscribe(load)
  }, [])

  return { profile, loading }
}
