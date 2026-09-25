import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const normalizeStatus = (value) => String(value || '').toUpperCase()

const formatDisplayDate = (dateValue) => {
  if (!dateValue) return 'Date not available'

  const parsedDate = new Date(`${dateValue}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate)
}

const formatDisplayTime = (timeValue) => {
  if (!timeValue) return 'Time not available'

  const match = String(timeValue).trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i)

  if (!match) {
    return timeValue
  }

  let hour = Number(match[1])
  const minute = Number(match[2])
  const period = (match[3] || '').toUpperCase()

  if (period) {
    if (period === 'PM' && hour < 12) hour += 12
    if (period === 'AM' && hour === 12) hour = 0
  }

  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  const suffix = hour >= 12 ? 'PM' : 'AM'

  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`
}

function ProviderDashboard() {
  const navigate = useNavigate()
  const [providerDetails, setProviderDetails] = useState(null)
  const providerId = localStorage.getItem('providerId')

  const getStoredProvider = () => {
    const rawValue = localStorage.getItem('provider') || sessionStorage.getItem('provider')

    if (!rawValue) {
      return null
    }

    try {
      const parsedValue = JSON.parse(rawValue)
      if (parsedValue && typeof parsedValue === 'object') {
        return parsedValue
      }
    } catch (err) {
      // Ignore malformed provider data; the dashboard will rely on the fallback values.
    }

    return null
  }

  const storedProvider = getStoredProvider()
  const resolvedProvider = providerDetails || storedProvider || {}
  const providerName = resolvedProvider.name || localStorage.getItem('providerName') || 'Provider'
  const providerEmail = resolvedProvider.email || localStorage.getItem('providerEmail') || 'No email provided'
  const providerProfession =
    resolvedProvider.profession ||
    resolvedProvider.role ||
    localStorage.getItem('providerProfession') ||
    'Profession not available'
  const providerOrganization =
    resolvedProvider.organization ||
    resolvedProvider.company ||
    resolvedProvider.hospital ||
    localStorage.getItem('providerOrganization') ||
    'Organization not available'

  const handleLogout = () => {
    localStorage.removeItem('provider')
    localStorage.removeItem('providerId')
    localStorage.removeItem('providerName')
    localStorage.removeItem('providerEmail')
    localStorage.removeItem('providerProfession')
    localStorage.removeItem('providerOrganization')

    navigate('/provider-login')
  }

  const [appointments, setAppointments] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  const [loadingSchedules, setLoadingSchedules] = useState(true)
  const [errorAppointments, setErrorAppointments] = useState('')
  const [errorSchedules, setErrorSchedules] = useState('')
  const [filter, setFilter] = useState('All')
  const [successMessage, setSuccessMessage] = useState('')
  const [rejectingAppointmentId, setRejectingAppointmentId] = useState(null)

  const loadAppointments = async () => {
    if (!providerId) return

    try {
      setLoadingAppointments(true)
      setErrorAppointments('')

      const response = await fetch(`http://localhost:8080/api/appointments/provider/${providerId}`)

      if (!response.ok) {
        throw new Error('Unable to load appointments. Please try again.')
      }

      const data = await response.json()
      setAppointments(Array.isArray(data) ? data : [])
    } catch (err) {
      setErrorAppointments('Unable to load appointments. Please try again.')
    } finally {
      setLoadingAppointments(false)
    }
  }

  const loadSchedules = async () => {
    if (!providerId) return

    try {
      setLoadingSchedules(true)
      setErrorSchedules('')

      const response = await fetch(`http://localhost:8080/api/schedules/provider/${providerId}`)

      if (!response.ok) {
        throw new Error('Unable to load schedules. Please try again.')
      }

      const data = await response.json()
      setSchedules(Array.isArray(data) ? data : [])
    } catch (err) {
      setErrorSchedules('Unable to load schedules. Please try again.')
    } finally {
      setLoadingSchedules(false)
    }
  }

  useEffect(() => {
    if (!providerId) {
      return
    }

    const needsProfileRefresh =
      !storedProvider ||
      (!storedProvider.profession && !storedProvider.role) ||
      (!storedProvider.organization && !storedProvider.company && !storedProvider.hospital)

    if (needsProfileRefresh) {
      fetch(`http://localhost:8080/api/providers/${providerId}`)
        .then((response) => {
          if (!response.ok) {
            return
          }

          return response.json()
        })
        .then((provider) => {
          if (provider && typeof provider === 'object') {
            setProviderDetails(provider)
          }
        })
        .catch(() => {
          // Keep existing provider fallback values if the profile request fails.
        })
    }

    loadAppointments()
    loadSchedules()

    const handleVisibility = () => {
      if (!document.hidden) {
        loadAppointments()
        loadSchedules()
      }
    }

    const handleFocus = () => {
      loadAppointments()
      loadSchedules()
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', handleFocus)
    }
  }, [providerId])

  const handleStatusUpdate = async (appointmentId, action) => {
    if (action === 'reject') {
      const confirmed = window.confirm('Are you sure you want to reject this appointment?')
      if (!confirmed) {
        return
      }
    }

    try {
      const response = await fetch(`http://localhost:8080/api/appointments/${appointmentId}/${action}`, {
        method: 'PUT',
      })

      const responseText = await response.text()

      if (!response.ok) {
        throw new Error(responseText || 'Unable to update appointment status.')
      }

      setRejectingAppointmentId(null)
      setSuccessMessage(
        action === 'approve'
          ? 'Appointment approved successfully.'
          : action === 'reject'
            ? 'Appointment rejected.'
            : 'Appointment marked as completed.',
      )

      await loadAppointments()
      await loadSchedules()
    } catch (err) {
      setSuccessMessage('')
      setErrorAppointments(err.message || 'Unable to update appointment status.')
    }
  }

  const statusCounts = {
    PENDING: appointments.filter((appointment) => normalizeStatus(appointment.status) === 'PENDING').length,
    APPROVED: appointments.filter((appointment) => normalizeStatus(appointment.status) === 'APPROVED').length,
    COMPLETED: appointments.filter((appointment) => normalizeStatus(appointment.status) === 'COMPLETED').length,
    REJECTED: appointments.filter((appointment) => normalizeStatus(appointment.status) === 'REJECTED').length,
    CANCELLED: appointments.filter((appointment) => normalizeStatus(appointment.status) === 'CANCELLED').length,
  }

  const visibleAppointments =
    filter === 'All'
      ? appointments
      : appointments.filter((appointment) => normalizeStatus(appointment.status) === filter)

  const appointmentGroups = [
    { key: 'PENDING', title: 'Pending Appointments' },
    { key: 'APPROVED', title: 'Approved Appointments' },
    { key: 'COMPLETED', title: 'Completed Appointments' },
    { key: 'REJECTED', title: 'Rejected Appointments' },
    { key: 'CANCELLED', title: 'Cancelled Appointments' },
  ]

  const statusOrder = ['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED']

  const filteredGroups =
    filter === 'All'
      ? appointmentGroups
      : [{ key: filter, title: `${filter.charAt(0).toUpperCase()}${filter.slice(1).toLowerCase()} Appointments` }]

  if (!providerId) {
    return (
      <main className="appointments-page">
        <div className="status-message error">Please login as a provider.</div>
        <div className="hero-actions">
          <Link to="/provider-login" className="primary-btn">
            Provider Login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="appointments-page provider-dashboard-page">
      <section className="dashboard-header">
        <div>
          <span className="section-tag">Provider Dashboard</span>
          <h1>Provider Dashboard</h1>
          <p>Provider: {providerName}</p>
          <p>Profession: {providerProfession}</p>
          <p>Organization: {providerOrganization}</p>
        </div>

        <div className="dashboard-profile-card">
          <div className="provider-avatar large" aria-hidden="true">
            {providerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3>{providerName}</h3>
            <p>{providerEmail}</p>
            <button type="button" className="secondary-btn" onClick={handleLogout} style={{ marginTop: '0.75rem' }}>
              Logout
            </button>
          </div>
        </div>
      </section>

      <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {statusOrder.map((status) => (
          <div key={status} className="appointment-card" style={{ minHeight: '110px' }}>
            <h3>{status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}</h3>
            <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem' }}>{statusCounts[status] || 0}</p>
          </div>
        ))}
      </div>

      <div className="filter-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
        {['All', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED'].map((option) => (
          <button
            key={option}
            type="button"
            className={filter === option ? 'primary-btn' : 'secondary-btn'}
            onClick={() => setFilter(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {successMessage && <div className="status-message success">{successMessage}</div>}

      {loadingAppointments && <div className="status-message">Loading appointments...</div>}

      {!loadingAppointments && errorAppointments && (
        <div className="status-message error">
          {errorAppointments}
          <div className="hero-actions">
            <button type="button" className="secondary-btn" onClick={loadAppointments}>
              Retry
            </button>
          </div>
        </div>
      )}

      {!loadingAppointments && !errorAppointments && visibleAppointments.length === 0 && (
        <div className="status-message">No appointments found for this filter.</div>
      )}

      {!loadingAppointments && !errorAppointments && visibleAppointments.length > 0 && (
        <>
          {filteredGroups.map((group) => {
            const groupItems = visibleAppointments.filter(
              (appointment) => normalizeStatus(appointment.status) === group.key,
            )

            if (!groupItems.length) {
              return null
            }

            return (
              <section key={group.key} style={{ marginBottom: '2rem' }}>
                <h2>{group.title}</h2>
                <div className="appointments-grid">
                  {groupItems.map((appointment) => {
                    const user = appointment.user || {}
                    const status = normalizeStatus(appointment.status)

                    return (
                      <article key={appointment.id} className="appointment-card">
                        <div className="appointment-header">
                          <div>
                            <h3>{user.name || 'Customer'}</h3>
                            <p>{user.email || 'No email provided'}</p>
                          </div>
                          <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
                        </div>

                        <div className="appointment-details">
                          <p>
                            <strong>Date:</strong> {formatDisplayDate(appointment.appointmentDate)}
                          </p>
                          <p>
                            <strong>Time:</strong> {formatDisplayTime(appointment.appointmentTime)}
                          </p>
                          <p>
                            <strong>Status:</strong> {status}
                          </p>
                        </div>

                        {status === 'PENDING' && (
                          <div className="appointment-actions">
                            <button
                              type="button"
                              className="primary-btn"
                              onClick={() => handleStatusUpdate(appointment.id, 'approve')}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="secondary-btn"
                              onClick={() => setRejectingAppointmentId(appointment.id)}
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {status === 'APPROVED' && (
                          <div className="appointment-actions">
                            <button
                              type="button"
                              className="primary-btn"
                              onClick={() => handleStatusUpdate(appointment.id, 'complete')}
                            >
                              Mark Completed
                            </button>
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </>
      )}

      <section className="booking-section" style={{ marginTop: '2rem' }}>
        <h2>Manage Available Slots</h2>

        {loadingSchedules && <div className="status-message">Loading schedules...</div>}

        {!loadingSchedules && errorSchedules && (
          <div className="status-message error">
            {errorSchedules}
            <div className="hero-actions">
              <button type="button" className="secondary-btn" onClick={loadSchedules}>
                Retry
              </button>
            </div>
          </div>
        )}

        {!loadingSchedules && !errorSchedules && (
          <>
            <div className="appointment-actions" style={{ marginBottom: '1.5rem' }}>
              <Link to="/add-schedule" className="primary-btn">
                Add New Slot
              </Link>
            </div>

            {schedules.length === 0 ? (
              <div className="status-message">No schedules available.</div>
            ) : (
              <div className="appointments-grid">
                {schedules.map((schedule) => (
                  <article key={schedule.id ?? schedule.scheduleId} className="appointment-card">
                    <div className="appointment-header">
                      <div>
                        <h3>{formatDisplayDate(schedule.appointmentDate || schedule.date || schedule.scheduleDate)}</h3>
                      </div>
                      <span className={`status-badge ${schedule.available === true ? 'available' : 'booked'}`}>
                        {schedule.available === true ? 'Available' : 'Booked'}
                      </span>
                    </div>

                    <div className="appointment-details">
                      <p>
                        <strong>Time:</strong> {formatDisplayTime(schedule.appointmentTime || schedule.time || schedule.scheduleTime)}
                      </p>
                      <p>
                        <strong>Status:</strong> {schedule.available === true ? 'Available' : 'Booked'}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {rejectingAppointmentId && (
        <div className="status-message error" style={{ marginTop: '1.5rem' }}>
          <div>Are you sure you want to reject this appointment?</div>
          <div className="appointment-actions" style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                handleStatusUpdate(rejectingAppointmentId, 'reject')
              }}
            >
              Reject Appointment
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setRejectingAppointmentId(null)}
            >
              Keep Appointment
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default ProviderDashboard
