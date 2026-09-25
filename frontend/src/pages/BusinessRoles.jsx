import { Link, useSearchParams } from 'react-router-dom'

const businessRoles = [
  { title: 'CEO', icon: '👔', profession: 'CEO' },
  { title: 'Founder', icon: '🚀', profession: 'Founder' },
  { title: 'Manager', icon: '📊', profession: 'Manager' },
  { title: 'Business Consultant', icon: '🧠', profession: 'Business Consultant' },
  { title: 'Business Executive', icon: '💡', profession: 'Business Executive' },
  { title: 'HR Manager', icon: '🧑‍💼', profession: 'HR Manager' },
  { title: 'Financial Consultant', icon: '💰', profession: 'Financial Consultant' },
  { title: 'Legal Consultant', icon: '⚖️', profession: 'Legal Consultant' },
  { title: 'Marketing Consultant', icon: '📣', profession: 'Marketing Consultant' },
]

function BusinessRoles() {
  const [searchParams] = useSearchParams()
  const organization = searchParams.get('organization') || 'Business Service'

  return (
    <main className="categories-page subcategories-page">
      <section className="categories-header">
        <span className="section-tag">Business Services</span>
        <h1>{organization}</h1>
        <p>Select a business role or service line.</p>

        <div className="hero-actions">
          <Link to="/business-services" className="secondary-btn">
            Back to Organizations
          </Link>
        </div>
      </section>

      <div className="subcategory-grid">
        {businessRoles.map((role) => (
          <article key={role.title} className="subcategory-card category-card">
            <div className="category-icon" aria-hidden="true">
              <span>{role.icon}</span>
            </div>

            <h2>{role.title}</h2>
            <p>Continue to available service options and matching professionals.</p>

            <Link
              to={`/business-providers?organization=${encodeURIComponent(organization)}&profession=${encodeURIComponent(role.profession)}`}
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

export default BusinessRoles
