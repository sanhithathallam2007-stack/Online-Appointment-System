import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../api'

function Home() {
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categoriesError, setCategoriesError] = useState('')
  const userName = localStorage.getItem('userName') || ''
  const firstName = userName.trim().split(/\s+/)[0]

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesError('')
        const response = await fetch(`${API_BASE_URL}/api/categories`)
        if (!response.ok) throw new Error('Unable to load categories.')
        const data = await response.json()
        setCategories(Array.isArray(data) ? data : [])
      } catch (error) {
        setCategoriesError(error.message || 'Unable to load categories.')
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  const getCategoryName = (category) =>
    category?.categoryName || category?.name || category?.title || 'Service'

  const getCategoryPath = (category) => {
    if (String(category.id) === '1') return '/hospitals'
    if (String(category.id) === '2') return '/schools'
    return `/subcategories?categoryId=${category.id}`
  }

  const categoryIcons = { 1: '✳', 2: '⌂', 3: '◈', 4: '▤', 5: '◎', 6: '✦' }

  return (
    <main className="home-screen">
      <section className="home-welcome">
        <span className="eyebrow-label">YOUR APPOINTMENT SPACE</span>
        <h1>{firstName ? `Good to see you, ${firstName}.` : 'Appointments, at your pace.'}</h1>
        <p>Find the right provider, choose a time, and keep your plans in one place.</p>
        <div className="home-actions">
          <Link to="/categories" className="primary-btn">Explore services <span aria-hidden="true">→</span></Link>
          <Link to="/my-appointments" className="home-secondary-link">View bookings</Link>
        </div>
      </section>

      <section className="home-category-section">
        <div className="home-section-heading">
          <div>
            <span className="eyebrow-label">FIND YOUR SERVICE</span>
            <h2>Explore categories</h2>
          </div>
          <Link to="/categories" className="text-link">See all <span aria-hidden="true">→</span></Link>
        </div>

        {loadingCategories && <div className="status-message">Loading categories...</div>}
        {!loadingCategories && categoriesError && (
          <div className="status-message error" role="alert">
            {categoriesError}
            <button type="button" className="secondary-btn" onClick={() => window.location.reload()}>Try again</button>
          </div>
        )}
        {!loadingCategories && !categoriesError && categories.length === 0 && (
          <div className="status-message">No categories are available right now.</div>
        )}

        {!loadingCategories && !categoriesError && categories.length > 0 && (
          <div className="home-category-grid">
            {categories.slice(0, 6).map((category) => (
              <Link key={category.id || getCategoryName(category)} to={getCategoryPath(category)} className="home-category-link">
                <span className="home-category-icon" aria-hidden="true">{categoryIcons[category.id] || '✳'}</span>
                <span className="home-category-name">{getCategoryName(category)}</span>
                <span className="home-category-arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="home-booking-prompt">
        <div className="home-prompt-mark" aria-hidden="true">✳</div>
        <div>
          <span className="eyebrow-label">READY WHEN YOU ARE</span>
          <h2>Already have a visit planned?</h2>
          <p>Check its time and status, or make changes to an eligible booking.</p>
          <Link to="/my-appointments" className="prompt-link">Go to bookings <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </main>
  )
}

export default Home
