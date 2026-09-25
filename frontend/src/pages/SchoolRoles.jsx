import { Link, useSearchParams } from 'react-router-dom'
import API_BASE_URL from '../api'

const schoolRoles = [
  {
    key: 'principal',
    title: 'Principal',
    icon: '🎓',
    description: 'Meet the school leader for academic and institutional queries.',
    profession: 'Principal',
  },
  {
    key: 'hod',
    title: 'HOD',
    icon: '📚',
    description: 'Choose a department and connect with the relevant department head.',
    profession: 'HOD',
  },
  {
    key: 'teacher',
    title: 'Teacher',
    icon: '👩‍🏫',
    description: 'Choose a subject and meet the right teacher for support.',
    profession: 'Teacher',
  },
  {
    key: 'administrative-staff',
    title: 'Administrative Staff',
    icon: '🧾',
    description: 'Speak with administrative team members for enrollment and support.',
    profession: 'Administrative Staff',
  },
  {
    key: 'support-staff',
    title: 'Support Staff',
    icon: '🤝',
    description: 'Reach out to support teams for school services and assistance.',
    profession: 'Support Staff',
  },
]

function SchoolRoles() {
  const [searchParams] = useSearchParams()
  const organization = searchParams.get('organization') || 'School'

  return (
    <main className="categories-page subcategories-page">
      <section className="categories-header">
        <span className="section-tag">Schools</span>
        <h1>{organization}</h1>
        <p>Who would you like to meet?</p>

        <div className="hero-actions">
          <Link to="/schools" className="secondary-btn">
            Back to Schools
          </Link>
        </div>
      </section>

      <div className="subcategory-grid">
        {schoolRoles.map((role) => {
          const nextRoute =
            role.key === 'principal'
              ? `/school-providers?organization=${encodeURIComponent(organization)}&profession=${encodeURIComponent(role.profession)}`
              : role.key === 'hod'
                ? `/school-subcategories?organization=${encodeURIComponent(organization)}&profession=${encodeURIComponent(role.profession)}`
                : role.key === 'teacher'
                  ? `/school-subcategories?organization=${encodeURIComponent(organization)}&profession=${encodeURIComponent(role.profession)}`
                  : `/school-providers?organization=${encodeURIComponent(organization)}&profession=${encodeURIComponent(role.profession)}`

          return (
            <article key={role.key} className="subcategory-card category-card">
              <div className="category-icon" aria-hidden="true">
                <span>{role.icon}</span>
              </div>

              <h2>{role.title}</h2>
              <p>{role.description}</p>

              <Link to={nextRoute} className="category-button">
                Continue
              </Link>
            </article>
          )
        })}
      </div>
    </main>
  )
}

export default SchoolRoles
