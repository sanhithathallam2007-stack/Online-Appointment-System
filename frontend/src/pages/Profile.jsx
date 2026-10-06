import { Link, useNavigate } from 'react-router-dom'

function Profile() {
  const navigate = useNavigate()
  const name = localStorage.getItem('userName') || 'Appointment member'
  const email = localStorage.getItem('userEmail') || ''
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'A'

  const handleLogout = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  return (
    <main className="profile-screen">
      <header className="screen-heading">
        <span className="eyebrow-label">YOUR ACCOUNT</span>
        <h1>Profile</h1>
        <p>Your appointment details, all in one place.</p>
      </header>

      <section className="profile-card">
        <div className="profile-avatar" aria-hidden="true">{initials}</div>
        <div className="profile-identity">
          <h2>{name}</h2>
          <p>{email || 'Email not available'}</p>
          <span className="profile-member-label">MEMBER</span>
        </div>
      </section>

      <section className="profile-actions" aria-label="Account actions">
        <Link to="/my-appointments" className="profile-action-row">
          <span className="profile-action-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M16 3v4M8 3v4M3 10h18" />
            </svg>
          </span>
          <span><strong>My bookings</strong><small>View appointment history and status</small></span>
          <span className="profile-chevron" aria-hidden="true">›</span>
        </Link>
        <Link to="/categories" className="profile-action-row">
          <span className="profile-action-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4.2 4.2" />
            </svg>
          </span>
          <span><strong>Explore providers</strong><small>Find a service and available times</small></span>
          <span className="profile-chevron" aria-hidden="true">›</span>
        </Link>
      </section>

      <button type="button" className="profile-signout" onClick={handleLogout}>Sign out</button>
    </main>
  )
}

export default Profile
