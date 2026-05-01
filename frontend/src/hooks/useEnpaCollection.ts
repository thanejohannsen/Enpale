import { useEffect, useState } from 'react'
import { enpaRepo } from '../repository'
import { enpaCollectionEmitter } from '../repository/localStorageRepo'
import type { Enpa } from '../types'

export function useEnpaCollection() {
  const [enpas, setEnpas] = useState<Enpa[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const all = await enpaRepo.list()
    setEnpas(all)
    setLoading(false)
  }

  useEffect(() => {
    load()
    return enpaCollectionEmitter.subscribe(load)
  }, [])

  return { enpas, loading }
}
