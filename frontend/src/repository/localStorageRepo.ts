import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'
import type { Enpa, KidProfile } from '../types'
import type { EnpaRepository, KidProfileRepository } from './types'

const KEYS = {
  kidProfile: 'enpale.kid_profile',
  enpas: 'enpale.enpas',
  enpaHtml: (id: string) => `enpale.enpa_html.${id}`,
} as const

// Minimal event emitter so hooks can re-render when repo data changes.
// Stored module-level so all instances of a hook share the same emitter.
type Listener = () => void
function makeEmitter() {
  const listeners = new Set<Listener>()
  return {
    subscribe(fn: Listener): () => void {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    emit(): void {
      listeners.forEach(fn => fn())
    },
  }
}

export const kidProfileEmitter = makeEmitter()
export const enpaCollectionEmitter = makeEmitter()

export const localKidProfileRepo: KidProfileRepository = {
  async get() {
    const raw = localStorage.getItem(KEYS.kidProfile)
    return raw ? (JSON.parse(raw) as KidProfile) : null
  },

  async save(profile) {
    localStorage.setItem(KEYS.kidProfile, JSON.stringify(profile))
    kidProfileEmitter.emit()
  },

  async update(patch) {
    const current = await localKidProfileRepo.get()
    if (!current) throw new Error('No KidProfile to update')
    const next = { ...current, ...patch }
    await localKidProfileRepo.save(next)
    return next
  },
}

export const localEnpaRepo: EnpaRepository = {
  async list() {
    const raw = localStorage.getItem(KEYS.enpas)
    return raw ? (JSON.parse(raw) as Enpa[]) : []
  },

  async get(enpaId) {
    const all = await localEnpaRepo.list()
    return all.find(e => e.enpaId === enpaId) ?? null
  },

  async create(enpa) {
    const all = await localEnpaRepo.list()
    localStorage.setItem(KEYS.enpas, JSON.stringify([...all, enpa]))
    enpaCollectionEmitter.emit()
  },

  async update(enpaId, patch) {
    const all = await localEnpaRepo.list()
    const idx = all.findIndex(e => e.enpaId === enpaId)
    if (idx === -1) throw new Error(`Enpa ${enpaId} not found`)
    const next = { ...all[idx], ...patch } as Enpa
    all[idx] = next
    localStorage.setItem(KEYS.enpas, JSON.stringify(all))
    enpaCollectionEmitter.emit()
    return next
  },

  async saveHtml(enpaId, html) {
    await idbSet(KEYS.enpaHtml(enpaId), html)
  },

  async loadHtml(enpaId) {
    return (await idbGet<string>(KEYS.enpaHtml(enpaId))) ?? null
  },

  async delete(enpaId) {
    const all = await localEnpaRepo.list()
    localStorage.setItem(
      KEYS.enpas,
      JSON.stringify(all.filter(e => e.enpaId !== enpaId)),
    )
    await idbDel(KEYS.enpaHtml(enpaId))
    enpaCollectionEmitter.emit()
  },
}
