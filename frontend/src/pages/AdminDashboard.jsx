import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../api'

const DEFAULT_STATS = {
  totalUsers: 0,
  totalProviders: 0,
  totalAppointments: 0,
  totalCategories: 0,
}

const getStoredAdmin = () => {
  const rawAdmin = localStorage.getItem('admin')

  if (!rawAdmin) {
    return null
  }

  try {
    const parsedAdmin = JSON.parse(rawAdmin)
    return parsedAdmin && typeof parsedAdmin === 'object' ? parsedAdmin : null
  } catch (err) {
    return null
  }
}

function AdminDashboard() {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(() => getStoredAdmin())
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [loadingStats, setLoadingStats] = useState(true)
  const [statsError, setStatsError] = useState('')

  const loadAdminStats = async () => {
    try {
      setLoadingStats(true)
      setStatsError('')

      const response = await fetch(`${API_BASE_URL}/api/admin/stats`)

      if (!response.ok) {
        throw new Error('Unable to load dashboard statistics.')
      }

      const data = await response.json()

      setStats({
        totalUsers: Number(data?.totalUsers ?? 0),
        totalProviders: Number(data?.totalProviders ?? 0),
        totalAppointments: Number(data?.totalAppointments ?? 0),
        totalCategories: Number(data?.totalCategories ?? 0),
      })
    } catch (error) {
      setStatsError('Unable to load dashboard statistics.')
    } finally {
      setLoadingStats(false)
    }
  }

  useEffect(() => {
    const storedAdmin = getStoredAdmin()

    if (!storedAdmin) {
      navigate('/admin-login', { replace: true })
      return
    }

    setAdmin(storedAdmin)
    loadAdminStats()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('admin')
    navigate('/admin-login', { replace: true })
  }

  if (!admin) {
    return <Navigate to="/admin-login" replace />
  }

  const summaryCards = [
    { title: 'Total Users', value: stats.totalUsers },
    { title: 'Total Providers', value: stats.totalProviders },
    { title: 'Total Appointments', value: stats.totalAppointments },
    { title: 'Total Categories', value: stats.totalCategories },
  ]

  const managementSections = [
    'Manage Users',
    'Manage Providers',
    'Manage Categories',
    'Manage Appointments',
    'Manage Schedules',
  ]

  return (
    <main className="appointments-page admin-dashboard-page">
      <section className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <span className="section-tag">Administration</span>
          <h1>Admin Dashboard</h1>
          <p>Admin email: {admin.email}</p>
        </div>

        <button type="button" className="secondary-btn" onClick={handleLogout}>
          Logout
        </button>
      </section>

      {loadingStats && <div className="status-message">Loading dashboard statistics...</div>}

      {!loadingStats && statsError && (
        <div className="status-message error">
          {statsError}
          <div className="hero-actions" style={{ marginTop: '0.75rem' }}>
            <button type="button" className="secondary-btn" onClick={loadAdminStats}>
              Retry
            </button>
          </div>
        </div>
      )}

      {!loadingStats && !statsError && (
        <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', margin: '2rem 0' }}>
          {summaryCards.map((card) => (
            <div key={card.title} className="appointment-card">
              <h3>{card.title}</h3>
              <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem' }}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      <section>
        <h2>Management</h2>
        <div className="appointments-grid">
          {managementSections.map((section) => (
            <div key={section} className="appointment-card">
              <div className="appointment-header">
                <div>
                  <h3>{section}</h3>
                  <p>Available for management</p>
                </div>
              </div>
              <div className="appointment-actions">
                <button type="button" className="primary-btn" disabled>
                  {section}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ marginTop: '2rem' }}>
        <Link to="/" className="secondary-btn">
          Back to Home
        </Link>
      </div>
    </main>
  )
}

export default AdminDashboard
