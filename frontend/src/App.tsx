import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WelcomePage } from './pages/WelcomePage'
import { VillagePage } from './pages/VillagePage'
import { TopicSelectPage } from './pages/TopicSelectPage'
import { ChatPage } from './pages/ChatPage'
import { IncubationPage } from './pages/IncubationPage'
import { EnpaDetailPage } from './pages/EnpaDetailPage'
import { GamePage } from './pages/GamePage'
import { LeaderboardPage } from './pages/LeaderboardPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/village" element={<VillagePage />} />
        <Route path="/topics" element={<TopicSelectPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/incubate/:enpaId" element={<IncubationPage />} />
        <Route path="/enpa/:enpaId" element={<EnpaDetailPage />} />
        <Route path="/play/:enpaId" element={<GamePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
