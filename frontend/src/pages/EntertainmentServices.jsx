import { Link, useSearchParams } from 'react-router-dom'

const entertainmentServices = [
  'Professional Meeting',
  'Collaboration',
  'Audition',
  'Project Discussion',
  'Consultation',
  'Interview',
  'Event Discussion',
]

function EntertainmentServices() {
  const [searchParams] = useSearchParams()
  const profession = searchParams.get('profession') || 'Actor'

  return (
    <main className="categories-page subcategories-page">
      <section className="categories-header">
        <span className="section-tag">Entertainment</span>
        <h1>{profession}</h1>
        <p>Select a service or meeting type.</p>

        <div className="hero-actions">
          <Link to="/entertainment" className="secondary-btn">
            Back to Professions
          </Link>
        </div>
      </section>

      <div className="subcategory-grid">
        {entertainmentServices.map((service) => (
          <article key={service} className="subcategory-card category-card">
            <div className="category-icon" aria-hidden="true">
              <span>🎯</span>
            </div>

            <h2>{service}</h2>
            <p>Continue to available entertainment professionals for this request.</p>

            <Link
              to={`/entertainment-providers?profession=${encodeURIComponent(profession)}&service=${encodeURIComponent(service)}`}
              className="category-button"
            >
              Continue
            </Link>
          </article>
        ))}
      </div>
    </main>
  )
}

export default EntertainmentServices
