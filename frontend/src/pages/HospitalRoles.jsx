import { Link, useSearchParams } from 'react-router-dom'

const hospitalRoles = [
  {
    key: 'doctor',
    title: 'Doctors',
    icon: '🩺',
    description: 'Book an appointment with a doctor based on medical specialty.',
    profession: 'Doctor',
  },
  {
    key: 'specialist',
    title: 'Specialists',
    icon: '🧠',
    description: 'Find specialists based on their medical specialty.',
    profession: 'Specialist',
  },
  {
    key: 'nurse',
    title: 'Nurses',
    icon: '👩‍⚕️',
    description: 'Find nursing services based on the type of care required.',
    profession: 'Nurse',
  },
  {
    key: 'hospital-administration',
    title: 'Hospital Administration',
    icon: '🏥',
    description: 'Book an appointment with hospital administrative staff.',
    profession: 'Hospital Administrator',
  },
]

function HospitalRoles() {
  const [searchParams] = useSearchParams()
  const organization = searchParams.get('organization') || 'Hospital'

  return (
    <main className="categories-page subcategories-page">
      <section className="categories-header">
        <span className="section-tag">Hospitals</span>
        <h1>{organization}</h1>
        <p>Who would you like to meet?</p>

        <div className="hero-actions">
          <Link to="/hospitals" className="secondary-btn">
            Back to Hospitals
          </Link>
        </div>
      </section>

      <div className="subcategory-grid">
        {hospitalRoles.map((role) => (
          <article key={role.key} className="subcategory-card category-card">
            <div className="category-icon" aria-hidden="true">
              <span>{role.icon}</span>
            </div>

            <h2>{role.title}</h2>
            <p>{role.description}</p>

            <Link
              to={`/hospital-specializations?organization=${encodeURIComponent(organization)}&profession=${encodeURIComponent(role.profession)}`}
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

export default HospitalRoles
