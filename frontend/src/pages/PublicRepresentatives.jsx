import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const representativeTypes = [
  { title: 'MLA', icon: '🏛️', profession: 'MLA' },
  { title: 'MP', icon: '🧑‍⚖️', profession: 'MP' },
  { title: 'Municipal Representative', icon: '🏙️', profession: 'Municipal Representative' },
  { title: 'Public Official', icon: '📢', profession: 'Public Official' },
]

function PublicRepresentatives() {
  return (
    <main className="categories-page subcategories-page">
      <section className="categories-header">
        <span className="section-tag">Public Representatives</span>
        <h1>Public Representatives</h1>
        <p>Select a representative type to continue.</p>

        <div className="hero-actions">
          <Link to="/categories" className="secondary-btn">
            Back to Categories
          </Link>
        </div>
      </section>

      <div className="subcategory-grid">
        {representativeTypes.map((item) => (
          <article key={item.title} className="subcategory-card category-card">
            <div className="category-icon" aria-hidden="true">
              <span>{item.icon}</span>
            </div>

            <h2>{item.title}</h2>
            <p>Continue to offices and representatives for this category.</p>

            <Link
              to={`/public-representative-offices?profession=${encodeURIComponent(item.profession)}`}
              className="category-button"
            >
              Continue
            </Link>
          </article>
        ))}
      </div>
    </main>
  )
}

export default PublicRepresentatives
