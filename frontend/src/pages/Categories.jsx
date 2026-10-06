import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../api'

function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_BASE_URL}/api/categories`)

        if (!response.ok) {
          throw new Error('Unable to load categories. Please make sure Spring Boot is running.')
        }

        const data = await response.json()
        setCategories(Array.isArray(data) ? data : [])
      } catch (err) {
        if (err instanceof TypeError) {
          setError('Unable to load categories. Please make sure Spring Boot is running.')
        } else {
          setError(err.message || 'Unable to load categories. Please make sure Spring Boot is running.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const categoryIcons = ['🏥', '🏫', '🏛️', '💼', '👥', '🎭', '🩺', '📚']

  const getCategoryName = (category) =>
    category?.categoryName || category?.name || category?.title || 'Unnamed Category'

  const getCategoryDescription = (category) =>
    category?.description ||
    category?.categoryDescription ||
    category?.details ||
    'No description available.'

  return (
    <main className="categories-page categories-screen">
      <section className="categories-header screen-heading">
        <span className="eyebrow-label">EXPLORE</span>
        <h1>What can we help with?</h1>
        <p>Choose a service area to see the providers and availability.</p>
      </section>

      {loading && <div className="status-message">Loading categories...</div>}

      {!loading && error && <div className="status-message error">{error}</div>}

      {!loading && !error && categories.length === 0 && (
        <div className="status-message">No categories available.</div>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="categories-grid">
          {categories.map((category, index) => (
            <article key={category.id || getCategoryName(category)} className="category-card category-card-premium">
              <div className="category-icon" aria-hidden="true">
                <span>{categoryIcons[index % categoryIcons.length]}</span>
              </div>

              <h2>{getCategoryName(category)}</h2>
              <p>{getCategoryDescription(category)}</p>

              <Link
                to={
                  String(category.id) === '1'
                    ? '/hospitals'
                    : String(category.id) === '2'
                      ? '/schools'
                      : `/subcategories?categoryId=${category.id}`
                }
                className="category-button"
              >
                Explore <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

export default Categories
