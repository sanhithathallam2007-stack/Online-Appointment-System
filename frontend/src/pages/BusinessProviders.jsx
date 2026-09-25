import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

function BusinessProviders() {
  const [searchParams] = useSearchParams()
  const organization = searchParams.get('organization')
  const profession = searchParams.get('profession')
  const service = searchParams.get('service')
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch('http://localhost:8080/api/providers')

        if (!response.ok) {
          throw new Error('Unable to load business providers. Please make sure Spring Boot is running.')
        }

        const data = await response.json()
        const allProviders = Array.isArray(data) ? data : []

        let filteredProviders = allProviders.filter((provider) => String(provider.categoryId) === '4')

        if (organization) {
          filteredProviders = filteredProviders.filter(
            (provider) =>
              String(provider.organization || '').trim().toLowerCase() ===
              String(organization).trim().toLowerCase(),
          )
        }

        if (profession) {
          filteredProviders = filteredProviders.filter(
            (provider) =>
              String(provider.profession || '').trim().toLowerCase() ===
              String(profession).trim().toLowerCase(),
          )
        }

        setProviders(filteredProviders)
      } catch (err) {
        if (err instanceof TypeError) {
          setError('Unable to load business providers. Please make sure Spring Boot is running.')
        } else {
          setError(err.message || 'Unable to load business providers. Please make sure Spring Boot is running.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [organization, profession])

  return (
    <main className="providers-page">
      <section className="providers-header">
        <span className="section-tag">Business Services</span>
        <h1>
          {organization || 'Business Providers'}
          {profession ? ` — ${profession}` : ''}
          {service ? ` — ${service}` : ''}
        </h1>
        <p>Choose a business professional and continue to their details.</p>

        <div className="hero-actions">
          <Link to={`/business-roles?organization=${encodeURIComponent(organization || 'Business Service')}`} className="secondary-btn">
            Back to Roles
          </Link>
        </div>
      </section>

      {loading && <div className="status-message">Loading providers...</div>}

      {!loading && error && <div className="status-message error">{error}</div>}

      {!loading && !error && providers.length === 0 && (
        <div className="status-message">No providers are currently available for this selection.</div>
      )}

      {!loading && !error && providers.length > 0 && (
        <div className="providers-grid">
          {providers.map((provider) => (
            <article key={provider.id ?? provider.name} className="provider-card">
              <div className="provider-avatar" aria-hidden="true">
                <span>•</span>
              </div>

              <h2>{provider.name || 'Unknown Provider'}</h2>

              <div className="provider-meta">
                <p>
                  <strong>Profession:</strong> {provider.profession || 'Not specified'}
                </p>
                <p>
                  <strong>Organization:</strong> {provider.organization || 'Not specified'}
                </p>
              </div>

              <Link to={`/providers/${provider.id}`} className="provider-button">
                View Details
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

export default BusinessProviders
