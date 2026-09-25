import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const entertainmentProfessions = [
  { title: 'Actor', icon: '🎭', profession: 'Actor' },
  { title: 'Director', icon: '🎬', profession: 'Director' },
  { title: 'Producer', icon: '🎙️', profession: 'Producer' },
  { title: 'Singer', icon: '🎤', profession: 'Singer' },
  { title: 'Artist', icon: '🎨', profession: 'Artist' },
  { title: 'Musician', icon: '🎻', profession: 'Musician' },
  { title: 'Content Creator', icon: '📹', profession: 'Content Creator' },
  { title: 'Photographer', icon: '📸', profession: 'Photographer' },
]

function Entertainment() {
  return (
    <main className="categories-page subcategories-page">
      <section className="categories-header">
        <span className="section-tag">Entertainment</span>
        <h1>Entertainment</h1>
        <p>Select a profession to continue.</p>

        <div className="hero-actions">
          <Link to="/categories" className="secondary-btn">
            Back to Categories
          </Link>
        </div>
      </section>

      <div className="subcategory-grid">
        {entertainmentProfessions.map((item) => (
          <article key={item.title} className="subcategory-card category-card">
            <div className="category-icon" aria-hidden="true">
              <span>{item.icon}</span>
            </div>

            <h2>{item.title}</h2>
            <p>Choose a service or meeting type for this professional.</p>

            <Link
              to={`/entertainment-services?profession=${encodeURIComponent(item.profession)}`}
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

export default Entertainment
