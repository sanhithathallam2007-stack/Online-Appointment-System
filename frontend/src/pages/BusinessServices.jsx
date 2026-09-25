import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../api'

function BusinessServices() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_BASE_URL}/api/providers`)

        if (!response.ok) {
          throw new Error('Unable to load business services. Please make sure Spring Boot is running.')
        }

        const data = await response.json()
        const allProviders = Array.isArray(data) ? data : []

        const uniqueOrganizations = Array.from(
          new Map(
            allProviders
              .filter((provider) => String(provider.categoryId) === '4' && provider.organization)
              .map((provider) => [
                String(provider.organization).trim().toLowerCase(),
                String(provider.organization).trim(),
              ]),
          ).values(),
        )

        setBusinesses(uniqueOrganizations)
      } catch (err) {
        if (err instanceof TypeError) {
          setError('Unable to load business services. Please make sure Spring Boot is running.')
        } else {
          setError(err.message || 'Unable to load business services. Please make sure Spring Boot is running.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchBusinesses()
  }, [])

  return (
    <main className="categories-page">
      <section className="categories-header">
        <span className="section-tag">Business Services</span>
        <h1>Business Services</h1>
        <p>Select a company or organization to continue.</p>

        <div className="hero-actions">
          <Link to="/categories" className="secondary-btn">
            Back to Categories
          </Link>
        </div>
      </section>

      {loading && <div className="status-message">Loading businesses...</div>}

      {!loading && error && <div className="status-message error">{error}</div>}

      {!loading && !error && businesses.length === 0 && (
        <div className="status-message">No business organizations available.</div>
      )}

      {!loading && !error && businesses.length > 0 && (
        <div className="categories-grid">
          {businesses.map((business) => (
            <article key={business} className="category-card">
              <div className="category-icon" aria-hidden="true">
                <span>💼</span>
              </div>

              <h2>{business}</h2>
              <p>Select this organization to continue to the relevant role and service flow.</p>

              <Link to={`/business-roles?organization=${encodeURIComponent(business)}`} className="category-button">
                View Organization
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

export default BusinessServices
