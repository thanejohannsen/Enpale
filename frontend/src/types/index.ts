export type AgeGroup = 'early_elementary' | 'late_elementary' | 'middle_school'
export type RarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type EnpaStatus = 'incubating' | 'hatched' | 'leveled'

export interface KidProfile {
  id: string
  name: string
  age: number
  ageGroup: AgeGroup
  totalXP: number
  enpasHatched: number
  legendaryCount: number
  createdAt: string
}

export interface EggColorPalette {
  primary: string
  secondary: string
  accent: string
}

export interface Checkpoint {
  id: string
  name: string
  description: string
  completed: boolean
  completedAt?: string
}

export interface Enpa {
  enpaId: string
  sessionId: string
  status: EnpaStatus
  level: 1 | 2 | 3
  xp: number
  title: string
  tagline: string
  eggColor: EggColorPalette
  comboRarityScore: number   // 0–60, from backend GDD
  earnedBoost: number        // accrued client-side from checkpoints/leveling
  rarityTier: RarityTier     // computed from comboRarityScore + earnedBoost
  conceptsCovered: string[]
  learningSummary: string
  checkpoints: Checkpoint[]
  createdAt: string
  hatchedAt?: string
  lastPlayedAt?: string
}
