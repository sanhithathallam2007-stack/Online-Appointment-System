import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import API_BASE_URL from '../api'

function PublicRepresentativeOffices() {
  const [searchParams] = useSearchParams()
  const profession = searchParams.get('profession') || 'MLA'
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
          throw new Error('Unable to load representative offices. Please make sure Spring Boot is running.')
        }

        const data = await response.json()
        const allProviders = Array.isArray(data) ? data : []

        const uniqueOrganizations = Array.from(
          new Map(
            allProviders
              .filter(
                (provider) =>
                  String(provider.categoryId) === '5' &&
                  String(provider.profession || '').trim().toLowerCase() ===
                    String(profession).trim().toLowerCase() &&
                  provider.organization,
              )
              .map((provider) => [
                String(provider.organization).trim().toLowerCase(),
                String(provider.organization).trim(),
              ]),
          ).values(),
        )

        setOffices(uniqueOrganizations)
      } catch (err) {
        if (err instanceof TypeError) {
          setError('Unable to load representative offices. Please make sure Spring Boot is running.')
        } else {
          setError(err.message || 'Unable to load representative offices. Please make sure Spring Boot is running.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOffices()
  }, [profession])

  return (
    <main className="categories-page">
      <section className="categories-header">
        <span className="section-tag">Public Representatives</span>
        <h1>{profession}</h1>
        <p>Select a constituency or office.</p>

        <div className="hero-actions">
          <Link to="/public-representatives" className="secondary-btn">
            Back to Types
          </Link>
        </div>
      </section>

      {loading && <div className="status-message">Loading offices...</div>}

      {!loading && error && <div className="status-message error">{error}</div>}

      {!loading && !error && offices.length === 0 && (
        <div className="status-message">No offices are available for this representative type.</div>
      )}

      {!loading && !error && offices.length > 0 && (
        <div className="categories-grid">
          {offices.map((office) => (
            <article key={office} className="category-card">
              <div className="category-icon" aria-hidden="true">
                <span>📍</span>
              </div>

              <h2>{office}</h2>
              <p>Select this office to continue to representative availability and purpose options.</p>

              <Link
                to={`/public-representative-providers?profession=${encodeURIComponent(profession)}&organization=${encodeURIComponent(office)}`}
                className="category-button"
              >
                View Representatives
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

export default PublicRepresentativeOffices
