import { Link, useSearchParams } from 'react-router-dom'
import API_BASE_URL from '../api'

const governmentRoles = [
  {
    key: 'government-officer',
    title: 'Government Officer',
    icon: '🧑‍💼',
    description: 'Speak with an officer for official guidance and service support.',
    profession: 'Government Officer',
  },
  {
    key: 'department-head',
    title: 'Department Head',
    icon: '🏛️',
    description: 'Connect with a department leader for approvals and escalations.',
    profession: 'Department Head',
  },
  {
    key: 'clerk',
    title: 'Clerk',
    icon: '📄',
    description: 'Book time with clerical staff for forms, documentation, and support.',
    profession: 'Clerk',
  },
  {
    key: 'public-service-staff',
    title: 'Public Service Staff',
    icon: '🛎️',
    description: 'Reach public service staff for enquiries and assistance.',
    profession: 'Public Service Staff',
  },
]

function GovernmentRoles() {
  const [searchParams] = useSearchParams()
  const organization = searchParams.get('organization') || 'Government Office'
  const service = searchParams.get('service') || 'General Enquiry'

  return (
    <main className="categories-page subcategories-page">
      <section className="categories-header">
        <span className="section-tag">Government Offices</span>
        <h1>{organization}</h1>
        <p>{service}</p>

        <div className="hero-actions">
          <Link to={`/government-services?organization=${encodeURIComponent(organization)}`} className="secondary-btn">
            Back to Services
          </Link>
        </div>
      </section>

      <div className="subcategory-grid">
        {governmentRoles.map((role) => (
          <article key={role.key} className="subcategory-card category-card">
            <div className="category-icon" aria-hidden="true">
              <span>{role.icon}</span>
            </div>

            <h2>{role.title}</h2>
            <p>{role.description}</p>

            <Link
              to={`/government-providers?organization=${encodeURIComponent(organization)}&profession=${encodeURIComponent(role.profession)}&service=${encodeURIComponent(service)}`}
              className="category-button"
            >
              View Providers
            </Link>
          </article>
        ))}
      </div>
    </main>
  )
}

export default GovernmentRoles
