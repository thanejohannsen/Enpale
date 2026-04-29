import { Link, useParams } from 'react-router-dom'
import { PageStub } from '../components/PageStub'

export function IncubationPage() {
  const { enpaId } = useParams()
  return (
    <PageStub title="Incubating..." subtitle={`Egg ${enpaId} is hatching. Pipeline + animation will live here.`}>
      <Link to={`/enpa/${enpaId}`} className="px-4 py-2 bg-purple-600 text-white rounded-full">Skip to detail →</Link>
    </PageStub>
  )
}
