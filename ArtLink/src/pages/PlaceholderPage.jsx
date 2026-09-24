import { Link } from 'react-router-dom'
import SectionHeading from '../components/SectionHeading'

export default function PlaceholderPage({ title, description }) {
  return (
    <section className="placeholder" aria-labelledby="page-title">
      <div id="page-title">
        <SectionHeading eyebrow="ArtLink / etapa inicial" title={title} />
      </div>
      <p>{description}</p>
      <Link className="button" to="/explorar">Explorar artistas</Link>
    </section>
  )
}
