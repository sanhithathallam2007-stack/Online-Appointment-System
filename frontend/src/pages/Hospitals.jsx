import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function Hospitals() {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch('http://localhost:8080/api/providers')

        if (!response.ok) {
          throw new Error('Unable to load hospitals. Please make sure Spring Boot is running.')
        }

        const data = await response.json()
        const allProviders = Array.isArray(data) ? data : []

        const uniqueOrganizations = Array.from(
          new Map(
            allProviders
              .filter((provider) => String(provider.categoryId) === '1' && provider.organization)
              .map((provider) => [String(provider.organization).trim().toLowerCase(), provider.organization.trim()]),
          ).values(),
        )

        setHospitals(uniqueOrganizations)
      } catch (err) {
        if (err instanceof TypeError) {
          setError('Unable to load hospitals. Please make sure Spring Boot is running.')
        } else {
          setError(err.message || 'Unable to load hospitals. Please make sure Spring Boot is running.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchHospitals()
  }, [])

  return (
    <main className="categories-page">
      <section className="categories-header">
        <span className="section-tag">Hospitals</span>
        <h1>Hospitals</h1>
        <p>Select a hospital to continue.</p>

        <div className="hero-actions">
          <Link to="/categories" className="secondary-btn">
            Back to Categories
          </Link>
        </div>
      </section>

      {loading && <div className="status-message">Loading hospitals...</div>}

      {!loading && error && <div className="status-message error">{error}</div>}

      {!loading && !error && hospitals.length === 0 && (
        <div className="status-message">No hospitals available.</div>
      )}

      {!loading && !error && hospitals.length > 0 && (
        <div className="categories-grid">
          {hospitals.map((hospital) => (
            <article key={hospital} className="category-card">
              <div className="category-icon" aria-hidden="true">
                <span>🏥</span>
              </div>

              <h2>{hospital}</h2>
              <p>Select this hospital to continue to the available roles and providers.</p>

              <Link to={`/hospital-roles?organization=${encodeURIComponent(hospital)}`} className="category-button">
                View Hospital
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

export default Hospitals
