import { Link, useNavigate } from 'react-router-dom'

const isUserLoggedIn = () =>
  Boolean(
    localStorage.getItem('userId') ||
      localStorage.getItem('userEmail') ||
      localStorage.getItem('userName') ||
      localStorage.getItem('user') ||
      localStorage.getItem('token'),
  )

function Navbar() {
  const navigate = useNavigate()
  const userLoggedIn = isUserLoggedIn()
  const userName = localStorage.getItem('userName') || 'Your profile'
  const userInitial = userName.trim().charAt(0).toUpperCase() || 'A'

  const handleLogout = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <header className="navbar-shell app-navbar-shell">
      <nav className="navbar app-navbar" aria-label="Main navigation">
        <Link to={userLoggedIn ? '/home' : '/'} className="navbar-brand app-brand">
          <img
            className="navbar-brand-icon"
            src="/app/appointment-icon.png"
            alt=""
            aria-hidden="true"
            onError={(event) => {
              event.currentTarget.hidden = true
            }}
          />
          <span>Appointment</span>
        </Link>

        <div className="navbar-links app-header-actions">
          {userLoggedIn ? (
            <>
              <Link to="/profile" className="header-profile-link" aria-label={`Profile for ${userName}`}>
                <span className="header-profile-name">{userName}</span>
                <span className="header-profile-avatar" aria-hidden="true">{userInitial}</span>
              </Link>
              <button type="button" className="header-signout" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="header-login-link">
              Sign in <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
