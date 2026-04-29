import { Link } from 'react-router-dom'
import { PageStub } from '../components/PageStub'

export function TopicSelectPage() {
  return (
    <PageStub title="Pick your topics" subtitle="24 cards — pick 1–4 things you love">
      <Link to="/chat" className="px-4 py-2 bg-purple-600 text-white rounded-full">Continue to Sparky chat →</Link>
    </PageStub>
  )
}
