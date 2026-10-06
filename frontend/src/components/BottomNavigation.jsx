import { NavLink, useLocation } from 'react-router-dom'

const navigationItems = [
  {
    label: 'Home',
    path: '/home',
    matches: (pathname) => pathname === '/' || pathname === '/home',
    icon: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9" /><path d="M9 20v-6h6v6" /></>,
  },
  {
    label: 'Explore',
    path: '/categories',
    matches: (pathname) => ['/categories', '/subcategories', '/hospitals', '/hospital-roles', '/hospital-specializations', '/schools', '/school-roles', '/school-subcategories', '/school-providers', '/government-offices', '/government-services', '/government-roles', '/government-providers', '/business-services', '/business-roles', '/business-providers', '/public-representatives', '/public-representative-offices', '/public-representative-providers', '/entertainment', '/entertainment-services', '/entertainment-providers', '/providers'].includes(pathname) || pathname.startsWith('/providers/'),
    icon: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.2 4.2" /></>,
  },
  {
    label: 'Bookings',
    path: '/my-appointments',
    matches: (pathname) => ['/my-appointments', '/bookings'].includes(pathname) || pathname.startsWith('/reschedule/'),
    icon: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /><path d="m9 15 2 2 4-4" /></>,
  },
  {
    label: 'Profile',
    path: '/profile',
    matches: (pathname) => pathname === '/profile',
    icon: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.2 3.1-5 7-5s6.2 1.8 7 5" /></>,
  },
]

const hiddenPaths = ['/login', '/register', '/provider-login', '/provider-dashboard', '/admin-login', '/admin-dashboard']

function BottomNavigation() {
  const { pathname } = useLocation()

  if (hiddenPaths.includes(pathname) || pathname.startsWith('/admin/')) {
    return null
  }

  return (
    <nav className="bottom-navigation" aria-label="Main navigation">
      {navigationItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={`bottom-navigation-link${item.matches(pathname) ? ' is-active' : ''}`}
          aria-current={item.matches(pathname) ? 'page' : undefined}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            {item.icon}
          </svg>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNavigation
