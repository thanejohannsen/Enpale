import { Link } from 'react-router-dom'
import { PageStub } from '../components/PageStub'

export function ChatPage() {
  return (
    <PageStub title="Talk with Sparky" subtitle="3–5 turns. Sparky figures out what to build for you.">
      <Link to="/incubate/demo" className="px-4 py-2 bg-purple-600 text-white rounded-full">Start incubation →</Link>
    </PageStub>
  )
}
