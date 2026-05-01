// Single export point for the repository layer.
// To swap from localStorage to an API-backed implementation (Phase 2),
// change only this file — no UI code needs to change.
export {
  localKidProfileRepo as kidProfileRepo,
  localEnpaRepo as enpaRepo,
} from './localStorageRepo'

export type { KidProfileRepository, EnpaRepository } from './types'
