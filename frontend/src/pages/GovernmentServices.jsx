import { Link, useSearchParams } from 'react-router-dom'

const governmentServices = [
  'Certificates',
  'Land / Property',
  'Licenses',
  'Applications',
  'Public Grievance',
  'Document Verification',
  'General Enquiry',
]

function GovernmentServices() {
  const [searchParams] = useSearchParams()
  const organization = searchParams.get('organization') || 'Government Office'

  return (
    <main className="categories-page subcategories-page">
      <section className="categories-header">
        <span className="section-tag">Government Offices</span>
        <h1>{organization}</h1>
        <p>Select a service or purpose.</p>

        <div className="hero-actions">
          <Link to="/government-offices" className="secondary-btn">
            Back to Offices
          </Link>
        </div>
      </section>

      <div className="subcategory-grid">
        {governmentServices.map((service) => (
          <article key={service} className="subcategory-card category-card">
            <div className="category-icon" aria-hidden="true">
              <span>📄</span>
            </div>

            <h2>{service}</h2>
            <p>Continue to officers and staff available for this service purpose.</p>

            <Link
              to={`/government-roles?organization=${encodeURIComponent(organization)}&service=${encodeURIComponent(service)}`}
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

export default GovernmentServices
