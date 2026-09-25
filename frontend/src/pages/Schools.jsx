import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function Schools() {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch('http://localhost:8080/api/providers')

        if (!response.ok) {
          throw new Error('Unable to load schools. Please make sure Spring Boot is running.')
        }

        const data = await response.json()
        const allProviders = Array.isArray(data) ? data : []

        const uniqueOrganizations = Array.from(
          new Map(
            allProviders
              .filter((provider) => String(provider.categoryId) === '2' && provider.organization)
              .map((provider) => [String(provider.organization).trim().toLowerCase(), provider.organization.trim()]),
          ).values(),
        )

        setSchools(uniqueOrganizations)
      } catch (err) {
        if (err instanceof TypeError) {
          setError('Unable to load schools. Please make sure Spring Boot is running.')
        } else {
          setError(err.message || 'Unable to load schools. Please make sure Spring Boot is running.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSchools()
  }, [])

  return (
    <main className="categories-page">
      <section className="categories-header">
        <span className="section-tag">Schools</span>
        <h1>Schools</h1>
        <p>Select a school to continue.</p>

        <div className="hero-actions">
          <Link to="/categories" className="secondary-btn">
            Back to Categories
          </Link>
        </div>
      </section>

      {loading && <div className="status-message">Loading schools...</div>}

      {!loading && error && <div className="status-message error">{error}</div>}

      {!loading && !error && schools.length === 0 && (
        <div className="status-message">No schools available.</div>
      )}

      {!loading && !error && schools.length > 0 && (
        <div className="categories-grid">
          {schools.map((school) => (
            <article key={school} className="category-card">
              <div className="category-icon" aria-hidden="true">
                <span>🏫</span>
              </div>

              <h2>{school}</h2>
              <p>Select this school to continue to the available roles and providers.</p>

              <Link to={`/school-roles?organization=${encodeURIComponent(school)}`} className="category-button">
                View School
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

export default Schools
