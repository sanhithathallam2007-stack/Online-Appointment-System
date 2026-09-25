import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'

const subcategoriesByCategory = {
  1: [
    {
      name: 'Doctors',
      icon: '🩺',
      description: 'Consult experienced medical professionals for diagnosis and treatment plans.',
    },
    {
      name: 'Specialists',
      icon: '🧠',
      description: 'Book specialist consultations for focused care and advanced treatment support.',
    },
    {
      name: 'Nurses',
      icon: '👩‍⚕️',
      description: 'Connect with nursing professionals for regular care and patient guidance.',
    },
    {
      name: 'Hospital Administrators',
      icon: '🏥',
      description: 'Schedule appointments for administrative support and hospital services.',
    },
  ],
  2: [
    {
      name: 'Principals',
      icon: '🎓',
      description: 'Speak with school leaders regarding academic direction and institutional queries.',
    },
    {
      name: 'HODs',
      icon: '📚',
      description: 'Coordinate with department heads for curriculum and academic support.',
    },
    {
      name: 'Teachers',
      icon: '👩‍🏫',
      description: 'Book time with educators for student guidance and classroom support.',
    },
    {
      name: 'Administrative Staff',
      icon: '🧾',
      description: 'Reach out for enrollment, records, and school administration assistance.',
    },
    {
      name: 'Support Staff',
      icon: '🤝',
      description: 'Get help from support teams for school operations and student services.',
    },
  ],
  3: [
    {
      name: 'Government Officers',
      icon: '🧑‍💼',
      description: 'Connect with government officials for public service and administrative procedures.',
    },
    {
      name: 'Department Heads',
      icon: '🏛️',
      description: 'Schedule meetings with office leaders for department-level coordination.',
    },
    {
      name: 'Clerks',
      icon: '📄',
      description: 'Consult clerical staff for documentation, paperwork, and application support.',
    },
    {
      name: 'Public Service Staff',
      icon: '🛎️',
      description: 'Meet the support teams responsible for public service delivery and guidance.',
    },
  ],
  4: [
    {
      name: 'CEOs',
      icon: '💼',
      description: 'Book time with leadership for executive discussions and business decisions.',
    },
    {
      name: 'Managers',
      icon: '📊',
      description: 'Connect with operational managers for business planning and support.',
    },
    {
      name: 'Business Consultants',
      icon: '🧠',
      description: 'Consult experts for strategic planning, improvement, and advisory sessions.',
    },
    {
      name: 'Business Executives',
      icon: '🚀',
      description: 'Schedule meetings for executive support, growth planning, and business coordination.',
    },
  ],
  5: [
    {
      name: 'MLAs',
      icon: '🏛️',
      description: 'Request meetings with local representatives for community and civic matters.',
    },
    {
      name: 'MPs',
      icon: '🧑‍⚖️',
      description: 'Reach public representatives for regional and national constituency discussions.',
    },
    {
      name: 'Municipal Representatives',
      icon: '🏙️',
      description: 'Meet local civic leaders for municipal concerns and service requests.',
    },
    {
      name: 'Public Officials',
      icon: '📢',
      description: 'Connect with public officials for community support and governance assistance.',
    },
  ],
  6: [
    {
      name: 'Actors',
      icon: '🎭',
      description: 'Book sessions with performers for creative discussions and production inquiries.',
    },
    {
      name: 'Directors',
      icon: '🎬',
      description: 'Connect with creative leaders for film, media, and project coordination.',
    },
    {
      name: 'Producers',
      icon: '🎙️',
      description: 'Meet producers for project planning, production planning, and creative collaboration.',
    },
    {
      name: 'Artists',
      icon: '🎨',
      description: 'Schedule appointments with artists for creative work and event support.',
    },
  ],
}

function Subcategories() {
  const [searchParams] = useSearchParams()
  const categoryId = searchParams.get('categoryId')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const hasFetchedCategories = useRef(false)

  useEffect(() => {
    if (hasFetchedCategories.current) {
      return
    }

    hasFetchedCategories.current = true

    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch('http://localhost:8080/api/categories')

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

  const getCategoryName = (category) =>
    category?.categoryName || category?.name || category?.title || 'Unnamed Category'

  const category = categories.find((item) => String(item.id) === String(categoryId))
  const categoryName = category ? getCategoryName(category) : ''
  const subcategories = categoryId ? subcategoriesByCategory[categoryId] || [] : []

  if (String(categoryId) === '1') {
    return <Navigate to="/hospitals" replace />
  }

  if (String(categoryId) === '2') {
    return <Navigate to="/schools" replace />
  }

  const handleSubcategoryNavigation = (subcategoryName) =>
    `/providers?categoryId=${categoryId}&profession=${encodeURIComponent(subcategoryName)}`

  if (loading) {
    return (
      <main className="categories-page">
        <div className="status-message">Loading category details...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="categories-page">
        <div className="status-message error">{error}</div>
      </main>
    )
  }

  if (!categoryId || !category) {
    return (
      <main className="categories-page">
        <section className="categories-header">
          <span className="section-tag">Categories</span>
          <h1>Category not found</h1>
          <p>The selected category could not be found.</p>
          <div className="hero-actions">
            <Link to="/categories" className="primary-btn">
              Back to Categories
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="subcategories-page categories-page">
      <section className="categories-header">
        <span className="section-tag">Subcategories</span>
        <h1>{categoryName}</h1>
        <p>Select a role or specialty to find the right provider for your appointment needs.</p>

        <div className="hero-actions">
          <Link to="/categories" className="secondary-btn">
            Back to Categories
          </Link>
        </div>
      </section>

      <div className="subcategory-grid">
        {subcategories.map((subcategory) => (
          <article key={subcategory.name} className="subcategory-card category-card">
            <div className="category-icon" aria-hidden="true">
              <span>{subcategory.icon}</span>
            </div>

            <h2>{subcategory.name}</h2>
            <p>{subcategory.description}</p>

            <Link to={handleSubcategoryNavigation(subcategory.name)} className="category-button">
              {String(categoryId) === '1' ? 'Continue' : 'View Providers'}
            </Link>
          </article>
        ))}
      </div>
    </main>
  )
}

export default Subcategories
