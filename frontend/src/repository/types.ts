import type { Enpa, KidProfile } from '../types'

export interface KidProfileRepository {
  get(): Promise<KidProfile | null>
  save(profile: KidProfile): Promise<void>
  update(patch: Partial<KidProfile>): Promise<KidProfile>
}

export interface EnpaRepository {
  list(): Promise<Enpa[]>
  get(enpaId: string): Promise<Enpa | null>
  create(enpa: Enpa): Promise<void>
  update(enpaId: string, patch: Partial<Enpa>): Promise<Enpa>
  saveHtml(enpaId: string, html: string): Promise<void>
  loadHtml(enpaId: string): Promise<string | null>
  delete(enpaId: string): Promise<void>
}
