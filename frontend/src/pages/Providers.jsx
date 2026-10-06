
import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import API_BASE_URL from '../api'

function Providers() {
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()

  const categoryId = searchParams.get('categoryId')
  const organization = searchParams.get('organization')
  const profession = searchParams.get('profession')
  const specialization = searchParams.get('specialization')
  const subject = searchParams.get('subject')
  const department = searchParams.get('department')

  const selectedCategoryId =
    categoryId || (pathname === '/school-providers' ? '2' : '')

  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchText, setSearchText] = useState('')

  const normalize = (value) =>
    String(value || '').trim().replace(/\s+/g, ' ').toLowerCase()

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

    const key = normalize(value)
    return professionMap[key] || String(value).trim()
  }

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_BASE_URL}/api/providers`)

        if (!response.ok) {
          throw new Error(
            'Unable to load providers. Please make sure Spring Boot is running.',
          )
        }

        const data = await response.json()
        const allProviders = Array.isArray(data) ? data : []

        let filteredProviders = allProviders

        if (selectedCategoryId) {
          filteredProviders = filteredProviders.filter(
            (provider) =>
              String(provider.categoryId) === String(selectedCategoryId),
          )
        }

        if (organization) {
          filteredProviders = filteredProviders.filter(
            (provider) =>
              normalize(provider.organization) === normalize(organization),
          )
        }

        if (profession) {
          const requestedProfession = normalize(
            normalizeProfessionValue(profession),
          )

          filteredProviders = filteredProviders.filter(
            (provider) =>
              normalize(provider.profession) === requestedProfession,
          )
        }

        if (specialization) {
          filteredProviders = filteredProviders.filter(
            (provider) =>
              normalize(provider.specialization) === normalize(specialization),
          )
        }

        // Education subjects and departments are stored in specialization.
        if (subject) {
          filteredProviders = filteredProviders.filter(
            (provider) =>
              normalize(provider.specialization) === normalize(subject),
          )
        }

        if (department) {
          filteredProviders = filteredProviders.filter(
            (provider) =>
              normalize(provider.specialization) === normalize(department),
          )
        }

        setProviders(filteredProviders)
      } catch (err) {
        setError(
          err.message ||
            'Unable to load providers. Please make sure Spring Boot is running.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [
    selectedCategoryId,
    organization,
    profession,
    specialization,
    subject,
    department,
  ])

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
  const getOrganization = (provider) =>
    provider?.organization || 'Not specified'

  const selectedCategoryHeading = selectedCategoryId
    ? categoryTitles[selectedCategoryId] || 'Filtered Providers'
    : 'All Providers'

  const selectedOrganizationLabel = organization ? ` — ${organization}` : ''
  const selectedProfessionLabel = profession ? ` — ${profession}` : ''
  const selectedSpecializationLabel = specialization
    ? ` — ${specialization}`
    : ''

  const searchedProviders = providers.filter((provider) => {
    const query = normalize(searchText)
    if (!query) return true

    return [
      provider.name,
      provider.profession,
      provider.organization,
      provider.specialization,
      provider.subject,
      provider.department,
    ].some((value) => normalize(value).includes(query))
  })

  return (
    <main className="providers-page explore-screen">
      <section className="providers-header explore-heading">
        <div>
          <span className="section-tag">Explore</span>
          <h1>
            {selectedCategoryHeading}
            {selectedOrganizationLabel}
            {selectedProfessionLabel}
            {selectedSpecializationLabel}
          </h1>
          <p>
            Browse providers from the live directory and choose someone to view
            availability.
          </p>
        </div>

        <label className="provider-search">
          <span className="sr-only">
            Search by provider name, specialty, or organization
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 4.2 4.2" />
          </svg>
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search providers"
          />
        </label>
      </section>

      {loading && <div className="status-message">Loading providers...</div>}

      {!loading && error && (
        <div className="status-message error">{error}</div>
      )}

      {!loading && !error && providers.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon" aria-hidden="true">
            ⌕
          </span>
          <h2>No providers match this selection</h2>
          <p>Try clearing a category, organization, or profession filter.</p>
          <Link to="/providers" className="secondary-btn">
            View all providers
          </Link>
        </div>
      )}

      {!loading &&
        !error &&
        providers.length > 0 &&
        searchedProviders.length === 0 && (
          <div className="empty-state">
            <h2>No providers found</h2>
            <p>Try another name, specialty, or organization.</p>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setSearchText('')}
            >
              Clear search
            </button>
          </div>
        )}

      {!loading && !error && searchedProviders.length > 0 && (
        <div className="providers-grid">
          {searchedProviders.map((provider) => {
            const providerId = provider?.id
            const providerName = getProviderName(provider)

            return (
              <article
                key={providerId ?? providerName}
                className="provider-card provider-card-premium"
              >
                <div className="provider-avatar" aria-hidden="true">
                  <span>{providerName.charAt(0).toUpperCase()}</span>
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

                <Link
                  to={providerId ? `/providers/${providerId}` : '/providers'}
                  className="provider-button"
                >
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