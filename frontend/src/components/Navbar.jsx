import { NavLink, useNavigate } from 'react-router-dom'

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

  const handleLogout = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    navigate('/login')
  }

  const navItems = userLoggedIn
    ? [
        { label: 'Home', path: '/home' },
        { label: 'Categories', path: '/categories' },
        { label: 'My Appointments', path: '/my-appointments' },
      ]
    : [
        { label: 'Login', path: '/login' },
        { label: 'Register', path: '/register' },
      ]

  return (
    <header className="navbar-shell">
      <nav className="navbar" aria-label="Main navigation">
        <NavLink to={userLoggedIn ? '/home' : '/login'} className="navbar-brand" end>
          ONLINE APPOINTMENT SYSTEM
        </NavLink>

        <div className="navbar-links">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/home' || item.path === '/login'}
              className={({ isActive }) =>
                `nav-link${isActive ? ' active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {userLoggedIn && (
            <button type="button" className="nav-link nav-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
