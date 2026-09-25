import { Link, useSearchParams } from 'react-router-dom'

const hospitalServices = [
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

function HospitalServices() {
  const [searchParams] = useSearchParams()
  const selectedType = searchParams.get('type')
  const selectedService = hospitalServices.find((service) => service.key === selectedType)

  return (
    <main className="categories-page subcategories-page">
      <section className="categories-header">
        <span className="section-tag">Hospitals</span>
        <h1>Hospital Services</h1>
        <p>
          {selectedService
            ? `You selected ${selectedService.title}. Choose a specialty or service to continue.`
            : 'Choose the type of hospital service you need before selecting a provider.'}
        </p>

        <div className="hero-actions">
          <Link to="/subcategories?categoryId=1" className="secondary-btn">
            Back to Hospitals
          </Link>
        </div>
      </section>

      <div className="subcategory-grid hospital-grid">
        {hospitalServices.map((service) => (
          <article key={service.key} className="subcategory-card category-card">
            <div className="category-icon" aria-hidden="true">
              <span>{service.icon}</span>
            </div>

            <h2>{service.title}</h2>
            <p>{service.description}</p>

            <Link
              to={`/hospital-specializations?type=${service.key}&profession=${encodeURIComponent(service.profession)}`}
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

export default HospitalServices
