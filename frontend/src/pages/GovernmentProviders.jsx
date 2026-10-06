
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import API_BASE_URL from '../api'

function GovernmentProviders() {
  const [searchParams] = useSearchParams()

  const organization = searchParams.get('organization')
  const profession = searchParams.get('profession')
  const service = searchParams.get('service')

  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const normalize = (value) =>
    String(value || '').trim().replace(/\s+/g, ' ').toLowerCase()

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_BASE_URL}/api/providers`)

        if (!response.ok) {
          throw new Error(
            'Unable to load government providers. Please make sure Spring Boot is running.',
          )
        }

        const data = await response.json()
        let filteredProviders = Array.isArray(data) ? data : []

        filteredProviders = filteredProviders.filter(
          (provider) => String(provider.categoryId) === '3',
        )

        if (organization) {
          filteredProviders = filteredProviders.filter(
            (provider) =>
              normalize(provider.organization) === normalize(organization),
          )
        }

        if (profession) {
          filteredProviders = filteredProviders.filter(
            (provider) =>
              normalize(provider.profession) === normalize(profession),
          )
        }

        // Government services are stored in the specialization field.
        if (service) {
          filteredProviders = filteredProviders.filter(
            (provider) =>
              normalize(provider.specialization) === normalize(service),
          )
        }

        setProviders(filteredProviders)
      } catch (err) {
        setError(
          err.message ||
            'Unable to load government providers. Please make sure Spring Boot is running.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [organization, profession, service])

  return (
    <main className="providers-page">
      <section className="providers-header">
        <span className="section-tag">Government Offices</span>

        <h1>
          {organization || 'Government Providers'}
          {profession ? ` — ${profession}` : ''}
          {service ? ` — ${service}` : ''}
        </h1>

        <p>Choose a provider and continue to the appointment schedule.</p>

        <div className="hero-actions">
          <Link
            to={`/government-roles?organization=${encodeURIComponent(
              organization || 'Government Office',
            )}&service=${encodeURIComponent(service || 'General Enquiry')}`}
            className="secondary-btn"
          >
            Back to Roles
          </Link>
        </div>
      </section>

      {loading && <div className="status-message">Loading providers...</div>}

      {!loading && error && (
        <div className="status-message error">{error}</div>
      )}

      {!loading && !error && providers.length === 0 && (
        <div className="status-message">
          No providers are currently available for this selection.
        </div>
      )}

      {!loading && !error && providers.length > 0 && (
        <div className="providers-grid">
          {providers.map((provider) => (
            <article
              key={provider.id ?? provider.name}
              className="provider-card"
            >
              <div className="provider-avatar" aria-hidden="true">
                <span>•</span>
              </div>

              <h2>{provider.name || 'Unknown Provider'}</h2>

              <div className="provider-meta">
                <p>
                  <strong>Profession:</strong>{' '}
                  {provider.profession || 'Not specified'}
                </p>

                <p>
                  <strong>Organization:</strong>{' '}
                  {provider.organization || 'Not specified'}
                </p>

                <p>
                  <strong>Service:</strong>{' '}
                  {provider.specialization || 'Not specified'}
                </p>
              </div>

              <Link
                to={`/providers/${provider.id}`}
                className="provider-button"
              >
                View Details
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

export default GovernmentProviders