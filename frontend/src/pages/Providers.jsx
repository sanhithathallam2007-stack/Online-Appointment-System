import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import API_BASE_URL from '../api'

function Providers() {
  const [searchParams] = useSearchParams()
  const categoryId = searchParams.get('categoryId')
  const organization = searchParams.get('organization')
  const profession = searchParams.get('profession')
  const specialization = searchParams.get('specialization')
  const subject = searchParams.get('subject')
  const department = searchParams.get('department')

  const normalizeProfessionValue = (value) => {
    if (!value) return ''

    const professionMap = {
      principals: 'Principal',
      hods: 'HOD',
      teachers: 'Teacher',
      doctors: 'Doctor',
      specialists: 'Specialist',
      nurses: 'Nurse',
      'administrative staff': 'Administrative Staff',
      'support staff': 'Support Staff',
      'hospital administrators': 'Hospital Administrator',
      'government officers': 'Government Officer',
      'department heads': 'Department Head',
      clerks: 'Clerk',
      'public service staff': 'Public Service Staff',
      ceos: 'CEO',
      managers: 'Manager',
      'business consultants': 'Business Consultant',
      'business executives': 'Business Executive',
      mlas: 'MLA',
      mps: 'MP',
      'municipal representatives': 'Municipal Representative',
      'public officials': 'Public Official',
      actors: 'Actor',
      directors: 'Director',
      producers: 'Producer',
      artists: 'Artist',
    }

    const normalizedKey = String(value).trim().replace(/\s+/g, ' ').toLowerCase()
    return professionMap[normalizedKey] || String(value).trim()
  }

  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const showCategoryPrompt = !categoryId && !organization && !profession && !specialization && !subject && !department

  useEffect(() => {
    if (showCategoryPrompt) {
      setProviders([])
      setLoading(false)
      setError('')
      return
    }

    const fetchProviders = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_BASE_URL}/api/providers`)

        if (!response.ok) {
          throw new Error('Unable to load providers. Please make sure Spring Boot is running.')
        }

        const data = await response.json()
        const allProviders = Array.isArray(data) ? data : []

        let filteredProviders = allProviders

        if (categoryId) {
          filteredProviders = filteredProviders.filter(
            (provider) => String(provider.categoryId) === String(categoryId),
          )
        }

        if (organization) {
          filteredProviders = filteredProviders.filter(
            (provider) =>
              String(provider.organization || '').trim().toLowerCase() ===
              String(organization).trim().toLowerCase(),
          )
        }

        if (profession) {
          const normalizedProfession = normalizeProfessionValue(profession)

          filteredProviders = filteredProviders.filter(
            (provider) =>
              String(provider.profession || '').trim().toLowerCase() ===
              String(normalizedProfession).trim().toLowerCase(),
          )
        }

        if (subject) {
          filteredProviders = filteredProviders.filter(
            (provider) =>
              String(provider.subject || '').trim().toLowerCase() ===
              String(subject).trim().toLowerCase(),
          )
        }

        if (department) {
          filteredProviders = filteredProviders.filter(
            (provider) =>
              String(provider.department || '').trim().toLowerCase() ===
              String(department).trim().toLowerCase(),
          )
        }

        setProviders(filteredProviders)
      } catch (err) {
        if (err instanceof TypeError) {
          setError('Unable to load providers. Please make sure Spring Boot is running.')
        } else {
          setError(err.message || 'Unable to load providers. Please make sure Spring Boot is running.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [categoryId, organization, profession, specialization, subject, department])

  const categoryTitles = {
    1: 'Hospital Providers',
    2: 'Education Providers',
    3: 'Government Service Providers',
    4: 'Business Service Providers',
    5: 'Public Representatives',
    6: 'Entertainment Providers',
  }

  const getProviderName = (provider) => provider?.name || 'Unknown Provider'
  const getProfession = (provider) => provider?.profession || 'Not specified'
  const getOrganization = (provider) => provider?.organization || 'Not specified'
  const getProviderId = (provider) => provider?.id

  const selectedCategoryHeading = categoryId ? categoryTitles[categoryId] || 'Filtered Providers' : 'Find a Provider'
  const selectedOrganizationLabel = organization ? ` — ${organization}` : ''
  const selectedProfessionLabel = profession ? ` — ${profession}` : ''
  const selectedSpecializationLabel = specialization ? ` — ${specialization}` : ''

  return (
    <main className="providers-page">
      <section className="providers-header">
        <span className="section-tag">Providers</span>
        <h1>{selectedCategoryHeading}{selectedOrganizationLabel}{selectedProfessionLabel}{selectedSpecializationLabel}</h1>
        <p>Choose a provider and book an appointment at a convenient time.</p>
      </section>

      {showCategoryPrompt && (
        <div className="status-message info-box">
          <strong>Please choose a category first.</strong>
          <div className="hero-actions">
            <Link to="/categories" className="primary-btn">
              Go to Categories
            </Link>
          </div>
        </div>
      )}

      {loading && <div className="status-message">Loading providers...</div>}

      {!loading && error && <div className="status-message error">{error}</div>}

      {!loading && !error && providers.length === 0 && !showCategoryPrompt && (
        <div className="status-message">No providers available.</div>
      )}

      {!loading && !error && providers.length > 0 && (
        <div className="providers-grid">
          {providers.map((provider) => {
            const providerId = getProviderId(provider)
            const providerName = getProviderName(provider)

            return (
              <article key={providerId ?? providerName} className="provider-card">
                <div className="provider-avatar" aria-hidden="true">
                  <span>•</span>
                </div>

                <h2>{providerName}</h2>

                <div className="provider-meta">
                  <p>
                    <strong>Profession:</strong> {getProfession(provider)}
                  </p>
                  <p>
                    <strong>Organization:</strong> {getOrganization(provider)}
                  </p>
                </div>

                <Link to={providerId ? `/providers/${providerId}` : '/providers'} className="provider-button">
                  View Details
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}

export default Providers
