import { useState } from 'react'
import { apiPost } from '../api/client'
import { useKidProfile } from './useKidProfile'
import { useSessionStore } from '../store/sessionStore'
import type { ChatMessage, InterestProfile } from '../types'

interface ChatResponse {
  reply: string
  ready_to_build: boolean
}

interface TopicSelectResponse {
  session_id: string
  opening_message: string
}

export function useInterestChat() {
  const { profile } = useKidProfile()
  const sessionId = useSessionStore(s => s.sessionId)
  const selectedTopicIds = useSessionStore(s => s.selectedTopicIds)
  const history = useSessionStore(s => s.history)
  const setSession = useSessionStore(s => s.setSession)
  const appendMessage = useSessionStore(s => s.appendMessage)
  const setInterestProfile = useSessionStore(s => s.setInterestProfile)

  const [sending, setSending] = useState(false)
  const [readyToBuild, setReadyToBuild] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startSession = async (topicIds: string[]) => {
    if (!profile) throw new Error('No kid profile')
    setSending(true)
    setError(null)
    try {
      const res = await apiPost<TopicSelectResponse>('/interest/topics', {
        topic_ids: topicIds,
        kid_name: profile.name,
        age: profile.age,
      })
      setSession(res.session_id, res.opening_message)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start session')
      throw e
    } finally {
      setSending(false)
    }
  }

  const sendMessage = async (text: string) => {
    if (!profile) throw new Error('No kid profile')
    if (!sessionId) throw new Error('No active session')
    const userMsg: ChatMessage = { role: 'user', content: text }
    appendMessage(userMsg)
    const newHistory = [...history, userMsg]

    setSending(true)
    setError(null)
    try {
      const res = await apiPost<ChatResponse>('/interest/chat', {
        session_id: sessionId,
        topic_ids: selectedTopicIds,
        kid_name: profile.name,
        age: profile.age,
        history: newHistory,
      })
      appendMessage({ role: 'assistant', content: res.reply })
      if (res.ready_to_build) setReadyToBuild(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send message')
      throw e
    } finally {
      setSending(false)
    }
  }

  const finalize = async (): Promise<InterestProfile> => {
    if (!profile) throw new Error('No kid profile')
    if (!sessionId) throw new Error('No active session')
    setSending(true)
    setError(null)
    try {
      const profileRes = await apiPost<InterestProfile>('/interest/finalize', {
        session_id: sessionId,
        topic_ids: selectedTopicIds,
        kid_name: profile.name,
        age: profile.age,
        age_group: profile.ageGroup,
        history,
      })
      setInterestProfile(profileRes)
      return profileRes
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to finalize')
      throw e
    } finally {
      setSending(false)
    }
  }

  return {
    history,
    sending,
    readyToBuild,
    error,
    sessionActive: sessionId !== null,
    startSession,
    sendMessage,
    finalize,
  }
}
