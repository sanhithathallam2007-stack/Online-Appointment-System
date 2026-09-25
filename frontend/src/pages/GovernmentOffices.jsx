import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../api'

function GovernmentOffices() {
  const [offices, setOffices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_BASE_URL}/api/providers`)

        if (!response.ok) {
          throw new Error('Unable to load government offices. Please make sure Spring Boot is running.')
        }

        const data = await response.json()
        const allProviders = Array.isArray(data) ? data : []

        const uniqueOrganizations = Array.from(
          new Map(
            allProviders
              .filter((provider) => String(provider.categoryId) === '3' && provider.organization)
              .map((provider) => [
                String(provider.organization).trim().toLowerCase(),
                String(provider.organization).trim(),
              ]),
          ).values(),
        )

        setOffices(uniqueOrganizations)
      } catch (err) {
        if (err instanceof TypeError) {
          setError('Unable to load government offices. Please make sure Spring Boot is running.')
        } else {
          setError(err.message || 'Unable to load government offices. Please make sure Spring Boot is running.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOffices()
  }, [])

  return (
    <main className="categories-page">
      <section className="categories-header">
        <span className="section-tag">Government Offices</span>
        <h1>Government Offices</h1>
        <p>Select a department or office to continue.</p>

        <div className="hero-actions">
          <Link to="/categories" className="secondary-btn">
            Back to Categories
          </Link>
        </div>
      </section>

      {loading && <div className="status-message">Loading government offices...</div>}

      {!loading && error && <div className="status-message error">{error}</div>}

      {!loading && !error && offices.length === 0 && (
        <div className="status-message">No government offices available.</div>
      )}

      {!loading && !error && offices.length > 0 && (
        <div className="categories-grid">
          {offices.map((office) => (
            <article key={office} className="category-card">
              <div className="category-icon" aria-hidden="true">
                <span>🏛️</span>
              </div>

              <h2>{office}</h2>
              <p>Select this office to browse relevant public services and staff.</p>

              <Link to={`/government-services?organization=${encodeURIComponent(office)}`} className="category-button">
                View Office
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

export default GovernmentOffices
