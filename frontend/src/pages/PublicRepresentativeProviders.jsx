import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import API_BASE_URL from '../api'

const purposeOptions = [
  'Public Grievance',
  'Development Issue',
  'Government Scheme',
  'Local Issue',
  'Constituency Request',
  'General Meeting',
]

function PublicRepresentativeProviders() {
  const [searchParams] = useSearchParams()
  const profession = searchParams.get('profession') || 'MLA'
  const organization = searchParams.get('organization')
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
          throw new Error('Unable to load public representatives. Please make sure Spring Boot is running.')
        }

        const data = await response.json()
        const allProviders = Array.isArray(data) ? data : []

        let filteredProviders = allProviders.filter((provider) => String(provider.categoryId) === '5')

        if (profession) {
          filteredProviders = filteredProviders.filter(
            (provider) =>
              String(provider.profession || '').trim().toLowerCase() ===
              String(profession).trim().toLowerCase(),
          )
        }

        if (organization) {
          filteredProviders = filteredProviders.filter(
            (provider) =>
              String(provider.organization || '').trim().toLowerCase() ===
              String(organization).trim().toLowerCase(),
          )
        }

        setProviders(filteredProviders)
      } catch (err) {
        if (err instanceof TypeError) {
          setError('Unable to load public representatives. Please make sure Spring Boot is running.')
        } else {
          setError(err.message || 'Unable to load public representatives. Please make sure Spring Boot is running.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [profession, organization])

  return (
    <main className="categories-page">
      <section className="categories-header">
        <span className="section-tag">Public Representatives</span>
        <h1>
          {profession}
          {organization ? ` — ${organization}` : ''}
        </h1>
        <p>Select the appointment purpose.</p>

        <div className="hero-actions">
          <Link
            to={`/public-representative-offices?profession=${encodeURIComponent(profession)}`}
            className="secondary-btn"
          >
            Back to Offices
          </Link>
        </div>
      </section>

      {loading && <div className="status-message">Loading representatives...</div>}

      {!loading && error && <div className="status-message error">{error}</div>}

      {!loading && !error && providers.length === 0 && (
        <div className="status-message">No representatives are currently available for this selection.</div>
      )}

      {!loading && !error && providers.length > 0 && (
        <>
          <div className="subcategory-grid">
            {purposeOptions.map((purpose) => (
              <article key={purpose} className="subcategory-card category-card">
                <div className="category-icon" aria-hidden="true">
                  <span>📝</span>
                </div>

                <h2>{purpose}</h2>
                <p>Continue with this appointment purpose for available booking slots.</p>

                <Link
                  to={`/providers?categoryId=5&profession=${encodeURIComponent(profession)}&organization=${encodeURIComponent(organization || '')}&specialization=${encodeURIComponent(purpose)}`}
                  className="category-button"
                >
                  Continue
                </Link>
              </article>
            ))}
          </div>

          <div className="providers-grid" style={{ marginTop: '2rem' }}>
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
                    <strong>Office:</strong> {provider.organization || 'Not specified'}
                  </p>
                </div>

                <Link to={`/providers/${provider.id}`} className="provider-button">
                  View Details
                </Link>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  )
}

export default PublicRepresentativeProviders
