import { Link, useParams } from 'react-router-dom'
import { PageStub } from '../components/PageStub'

export function EnpaDetailPage() {
  const { enpaId } = useParams()
  return (
    <PageStub title="Enpa detail" subtitle={`Enpa ${enpaId} — checkpoints, level, XP, big Play button.`}>
      <Link to={`/play/${enpaId}`} className="px-4 py-2 bg-purple-600 text-white rounded-full">Play</Link>
    </PageStub>
  )
}
