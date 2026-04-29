import { Link } from 'react-router-dom'
import { PageStub } from '../components/PageStub'

export function VillagePage() {
  return (
    <PageStub title="Village" subtitle="Home — your Enpa collection grid lives here">
      <Link to="/topics" className="px-4 py-2 bg-purple-600 text-white rounded-full">+ Hatch a new Enpa</Link>
      <Link to="/leaderboard" className="px-4 py-2 border rounded-full">Leaderboard</Link>
    </PageStub>
  )
}
