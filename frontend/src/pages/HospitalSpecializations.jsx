import { Link, useSearchParams } from 'react-router-dom'

const specializationsByType = {
  doctor: [
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'ENT',
    'Gynecology',
    'Ophthalmology',
  ],
  specialist: [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Dermatology',
    'Pediatrics',
    'ENT',
    'Gynecology',
    'Ophthalmology',
  ],
  nurse: [
    'General Nursing',
    'ICU Nursing',
    'Emergency Nursing',
    'Pediatric Nursing',
    'Surgical Nursing',
  ],
  'hospital-administration': ['Hospital Administration'],
}

const typeTitles = {
  doctor: 'Doctors',
  specialist: 'Specialists',
  nurse: 'Nurses',
  'hospital-administration': 'Hospital Administration',
}

function HospitalSpecializations() {
  const [searchParams] = useSearchParams()
  const profession = searchParams.get('profession') || 'Doctor'
  const organization = searchParams.get('organization') || 'Hospital'
  const type = searchParams.get('profession') ?
    String(searchParams.get('profession')).toLowerCase().includes('admin') ? 'hospital-administration' :
    String(searchParams.get('profession')).toLowerCase() === 'doctor' ? 'doctor' :
    String(searchParams.get('profession')).toLowerCase() === 'specialist' ? 'specialist' :
    String(searchParams.get('profession')).toLowerCase() === 'nurse' ? 'nurse' : 'doctor' : 'doctor'

  const items = specializationsByType[type] || []

  if (type === 'hospital-administration') {
    return (
      <main className="categories-page subcategories-page">
        <section className="categories-header">
          <span className="section-tag">Hospitals</span>
          <h1>{organization}</h1>
          <p>Categories → Hospitals → {organization} → Hospital Administration</p>

          <div className="hero-actions">
            <Link to={`/hospital-roles?organization=${encodeURIComponent(organization)}`} className="secondary-btn">
              Back
            </Link>
          </div>
        </section>

        <div className="hero-actions">
          <Link
            to={`/providers?categoryId=1&organization=${encodeURIComponent(organization)}&profession=${encodeURIComponent(profession)}`}
            className="primary-btn"
          >
            View Providers
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="categories-page subcategories-page">
      <section className="categories-header">
        <span className="section-tag">Hospitals</span>
        <h1>{typeTitles[type] || 'Hospital Service'}</h1>
        <p>
          Categories → Hospitals → {organization} → {typeTitles[type] || 'Hospital Service'}
        </p>

        <div className="hero-actions">
          <Link to={`/hospital-roles?organization=${encodeURIComponent(organization)}`} className="secondary-btn">
            Back
          </Link>
        </div>
      </section>

      <div className="subcategory-grid hospital-grid">
        {items.map((item) => (
          <article key={item} className="subcategory-card category-card">
            <div className="category-icon" aria-hidden="true">
              <span>{type === 'nurse' ? '🩺' : type === 'hospital-administration' ? '🏥' : '🩺'}</span>
            </div>

            <h2>{item}</h2>
            <p>
              {type === 'doctor' && 'Medical specialty selection for doctor appointments.'}
              {type === 'specialist' && 'Specialist area selection for focused consultations.'}
              {type === 'nurse' && 'Nursing service selection for patient care support.'}
            </p>

            <Link
              to={`/providers?categoryId=1&organization=${encodeURIComponent(organization)}&profession=${encodeURIComponent(profession)}&specialization=${encodeURIComponent(item)}`}
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

export default HospitalSpecializations
