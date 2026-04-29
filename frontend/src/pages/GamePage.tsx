import { useParams } from 'react-router-dom'
import { PageStub } from '../components/PageStub'

export function GamePage() {
  const { enpaId } = useParams()
  return (
    <PageStub title="Play" subtitle={`Game iframe + checkpoint listener will live here for Enpa ${enpaId}.`} />
  )
}
