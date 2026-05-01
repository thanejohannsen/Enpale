import { create } from 'zustand'
import type { ChatMessage, InterestProfile } from '../types'

// Ephemeral pipeline state — never persisted, cleared on refresh.
// Persistent data (KidProfile, Enpa collection) lives in the repository layer.
interface SessionState {
  sessionId: string | null
  selectedTopicIds: string[]
  history: ChatMessage[]
  openingMessage: string | null
  interestProfile: InterestProfile | null
  incubatingEnpaId: string | null

  setSession: (id: string, opening: string) => void
  setSelectedTopicIds: (ids: string[]) => void
  appendMessage: (msg: ChatMessage) => void
  setHistory: (history: ChatMessage[]) => void
  setInterestProfile: (profile: InterestProfile) => void
  setIncubatingEnpaId: (id: string | null) => void
  reset: () => void
}

const initial = {
  sessionId: null,
  selectedTopicIds: [],
  history: [] as ChatMessage[],
  openingMessage: null,
  interestProfile: null,
  incubatingEnpaId: null,
}

export const useSessionStore = create<SessionState>(set => ({
  ...initial,

  setSession: (id, opening) =>
    set({
      sessionId: id,
      openingMessage: opening,
      history: [{ role: 'assistant', content: opening }],
    }),
  setSelectedTopicIds: ids => set({ selectedTopicIds: ids }),
  appendMessage: msg => set(state => ({ history: [...state.history, msg] })),
  setHistory: history => set({ history }),
  setInterestProfile: profile => set({ interestProfile: profile }),
  setIncubatingEnpaId: id => set({ incubatingEnpaId: id }),
  reset: () => set(initial),
}))
