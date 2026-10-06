
import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../api'
import AdminWorkingHours from '../components/AdminWorkingHours'

const DEFAULT_STATS = {
  totalUsers: 0,
  totalProviders: 0,
  totalAppointments: 0,
  totalCategories: 0,
}

const getStoredAdmin = () => {
  try {
    const savedAdmin = localStorage.getItem('admin')
    return savedAdmin ? JSON.parse(savedAdmin) : null
  } catch {
    return null
  }
}

function AdminDashboard() {
  const navigate = useNavigate()

  const [admin, setAdmin] = useState(() => getStoredAdmin())
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [loadingStats, setLoadingStats] = useState(true)
  const [statsError, setStatsError] = useState('')
  const [showWorkingHours, setShowWorkingHours] = useState(false)

  useEffect(() => {
    const storedAdmin = getStoredAdmin()

    if (!storedAdmin) {
      navigate('/admin-login', { replace: true })
      return
    }

    setAdmin(storedAdmin)
    loadAdminStats()
  }, [navigate])

  async function loadAdminStats() {
    try {
      setLoadingStats(true)
      setStatsError('')

      const response = await fetch(`${API_BASE_URL}/api/admin/stats`)

      if (!response.ok) {
        throw new Error('Could not load admin statistics.')
      }

      const data = await response.json()
      setStats({ ...DEFAULT_STATS, ...data })
    } catch (error) {
      setStatsError(error.message)
    } finally {
      setLoadingStats(false)
    }
  }

  function handleLogout() {
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

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.welcome}>
            Welcome, {admin.name || admin.email || 'Admin'}
          </p>
        </div>

        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </header>

      {!showWorkingHours ? (
        <>
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Dashboard Overview</h2>

            {statsError && <p style={styles.error}>{statsError}</p>}

            <div style={styles.statsGrid}>
              {summaryCards.map((card) => (
                <div key={card.title} style={styles.statCard}>
                  <p style={styles.statTitle}>{card.title}</p>
                  <h2 style={styles.statValue}>
                    {loadingStats ? '...' : card.value}
                  </h2>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Management</h2>

            <div style={styles.managementGrid}>
              <div style={styles.managementCard}>
                <h3>Manage Users</h3>
                <p>View and manage registered users.</p>
                <button disabled style={styles.disabledButton}>
                  Coming Soon
                </button>
              </div>

              <div style={styles.managementCard}>
                <h3>Manage Providers</h3>
                <p>View and manage service providers.</p>
                <button disabled style={styles.disabledButton}>
                  Coming Soon
                </button>
              </div>

              <div style={styles.managementCard}>
                <h3>Manage Categories</h3>
                <p>View and manage appointment categories.</p>
                <button disabled style={styles.disabledButton}>
                  Coming Soon
                </button>
              </div>

              <div style={styles.managementCard}>
                <h3>Manage Appointments</h3>
                <p>View and manage appointments.</p>
                <button disabled style={styles.disabledButton}>
                  Coming Soon
                </button>
              </div>

              <div style={styles.managementCard}>
                <h3>Manage Schedules</h3>
                <p>Set different working hours for each provider.</p>
                <button
                  onClick={() => setShowWorkingHours(true)}
                  style={styles.primaryButton}
                >
                  Manage Working Hours
                </button>
              </div>
            </div>
          </section>

          <Link to="/" style={styles.homeLink}>
            ← Back to Home
          </Link>
        </>
      ) : (
        <section style={styles.workingHoursSection}>
          <button
            onClick={() => setShowWorkingHours(false)}
            style={styles.backButton}
          >
            ← Back to Admin Dashboard
          </button>

          <AdminWorkingHours />
        </section>
      )}
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    padding: '30px',
    background: '#f4f6fb',
    color: '#1f2937',
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    maxWidth: 1100,
    margin: '0 auto 30px',
    padding: 24,
    background: '#ffffff',
    borderRadius: 14,
    boxShadow: '0 3px 14px rgba(0,0,0,0.06)',
  },
  title: {
    margin: 0,
    fontSize: 28,
  },
  welcome: {
    marginBottom: 0,
    color: '#64748b',
  },
  logoutButton: {
    padding: '10px 18px',
    border: 'none',
    borderRadius: 8,
    background: '#dc2626',
    color: '#ffffff',
    cursor: 'pointer',
  },
  section: {
    maxWidth: 1100,
    margin: '0 auto 30px',
  },
  sectionTitle: {
    marginBottom: 18,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: 16,
  },
  statCard: {
    padding: 22,
    background: '#ffffff',
    borderRadius: 12,
    boxShadow: '0 3px 14px rgba(0,0,0,0.05)',
  },
  statTitle: {
    margin: 0,
    color: '#64748b',
  },
  statValue: {
    marginBottom: 0,
    fontSize: 30,
  },
  managementGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: 16,
  },
  managementCard: {
    padding: 20,
    background: '#ffffff',
    borderRadius: 12,
    boxShadow: '0 3px 14px rgba(0,0,0,0.05)',
  },
  primaryButton: {
    width: '100%',
    padding: 12,
    border: 'none',
    borderRadius: 8,
    background: '#2563eb',
    color: '#ffffff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  disabledButton: {
    width: '100%',
    padding: 12,
    border: 'none',
    borderRadius: 8,
    background: '#e5e7eb',
    color: '#64748b',
    cursor: 'not-allowed',
  },
  homeLink: {
    display: 'block',
    maxWidth: 1100,
    margin: '0 auto',
    color: '#2563eb',
    textDecoration: 'none',
  },
  workingHoursSection: {
    maxWidth: 1100,
    margin: '0 auto',
  },
  backButton: {
    padding: '11px 16px',
    marginBottom: 10,
    border: 'none',
    borderRadius: 8,
    background: '#334155',
    color: '#ffffff',
    cursor: 'pointer',
  },
  error: {
    padding: 12,
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: 8,
  },
}

export default AdminDashboard