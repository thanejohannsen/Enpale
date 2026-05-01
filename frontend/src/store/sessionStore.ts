import { create } from 'zustand'

// Ephemeral pipeline state — never persisted, cleared on refresh.
// Persistent data (KidProfile, Enpa collection) lives in the repository layer.
interface SessionState {
  // Set when the interest pipeline starts; cleared on completion or error
  sessionId: string | null
  // Set during incubation so the village can show a loading egg
  incubatingEnpaId: string | null

  setSessionId: (id: string) => void
  setIncubatingEnpaId: (id: string | null) => void
  reset: () => void
}

export const useSessionStore = create<SessionState>(set => ({
  sessionId: null,
  incubatingEnpaId: null,

  setSessionId: id => set({ sessionId: id }),
  setIncubatingEnpaId: id => set({ incubatingEnpaId: id }),
  reset: () => set({ sessionId: null, incubatingEnpaId: null }),
}))
