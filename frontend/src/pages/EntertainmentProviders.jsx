import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import API_BASE_URL from '../api'

function EntertainmentProviders() {
  const [searchParams] = useSearchParams()
  const profession = searchParams.get('profession') || 'Actor'
  const service = searchParams.get('service')
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_BASE_URL}/api/providers`)

        if (!response.ok) {
          throw new Error('Unable to load entertainment providers. Please make sure Spring Boot is running.')
        }

        const data = await response.json()
        const allProviders = Array.isArray(data) ? data : []

        let filteredProviders = allProviders.filter((provider) => String(provider.categoryId) === '6')

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
          setError('Unable to load entertainment providers. Please make sure Spring Boot is running.')
        } else {
          setError(err.message || 'Unable to load entertainment providers. Please make sure Spring Boot is running.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [profession])

  return (
    <main className="providers-page">
      <section className="providers-header">
        <span className="section-tag">Entertainment</span>
        <h1>
          {profession}
          {service ? ` — ${service}` : ''}
        </h1>
        <p>Choose a professional and continue to the details page.</p>

        <div className="hero-actions">
          <Link to={`/entertainment-services?profession=${encodeURIComponent(profession)}`} className="secondary-btn">
            Back to Services
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

export default EntertainmentProviders
