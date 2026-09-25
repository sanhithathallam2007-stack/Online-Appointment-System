import { Link } from 'react-router-dom'
import API_BASE_URL from '../api'

function NotFound() {
  return (
    <main className="auth-page">
      <div className="auth-card not-found-card">
        <span className="section-tag">404</span>
        <h1>Page Not Found</h1>
        <p>The page you are looking for does not exist or may have moved.</p>
        <Link to="/home" className="primary-btn not-found-button">
          Back to Home
        </Link>
      </div>
    </main>
  )
}

export default NotFound
