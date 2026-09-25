import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../api'

const normalizeStatus = (value) => String(value || '').toUpperCase()

const formatAppointmentDate = (dateValue) => {
  if (!dateValue) return 'Date not available'

  const date = new Date(`${dateValue}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return dateValue
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const formatAppointmentTime = (timeValue) => {
  if (!timeValue) return 'Time not available'

  const matches = String(timeValue).trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i)

  if (!matches) {
    return timeValue
  }

  let hour = Number(matches[1])
  const minute = Number(matches[2])
  const period = (matches[3] || '').toUpperCase()

  if (period) {
    if (period === 'PM' && hour < 12) hour += 12
    if (period === 'AM' && hour === 12) hour = 0
  }

  const formattedHour = hour % 12 === 0 ? 12 : hour % 12
  const suffix = hour >= 12 ? 'PM' : 'AM'

  return `${formattedHour}:${String(minute).padStart(2, '0')} ${suffix}`
}

const isFutureAppointment = (appointment) => {
  const status = normalizeStatus(appointment?.status)

  if (status === 'CANCELLED' || status === 'REJECTED' || status === 'COMPLETED') {
    return false
  }

  const dateValue = appointment?.appointmentDate
  const timeValue = appointment?.appointmentTime

  if (!dateValue) {
    return status === 'PENDING' || status === 'APPROVED'
  }

  const dateTimeString = timeValue ? `${dateValue}T${timeValue}` : `${dateValue}T00:00:00`
  const appointmentDateTime = new Date(dateTimeString)

  if (Number.isNaN(appointmentDateTime.getTime())) {
    return status === 'PENDING' || status === 'APPROVED'
  }

  return appointmentDateTime > new Date()
}

function MyAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [detailsOpenId, setDetailsOpenId] = useState(null)
  const [cancelingAppointmentId, setCancelingAppointmentId] = useState(null)

  const userId = localStorage.getItem('userId')

  const loadAppointments = async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_BASE_URL}/api/appointments/user/${userId}`)

      if (!response.ok) {
        throw new Error('Unable to load your appointments. Please try again.')
      }

      const data = await response.json()
      setAppointments(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Unable to load your appointments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    loadAppointments()

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadAppointments()
      }
    }

    const handleWindowFocus = () => {
      loadAppointments()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleWindowFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [userId])

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
      })

      const responseText = await response.text()

      if (!response.ok) {
        setError(responseText || 'Unable to cancel this appointment. Please try again.')
        return
      }

      setSuccessMessage('Appointment cancelled successfully.')
      setCancelingAppointmentId(null)
      setError('')
      await loadAppointments()
    } catch (err) {
      setError('Unable to cancel this appointment. Please try again.')
    }
  }

  const canCancel = (status) => !['CANCELLED', 'COMPLETED', 'REJECTED'].includes(status)
  const canReschedule = (status) => ['PENDING', 'APPROVED'].includes(status)

  const upcomingAppointments = appointments.filter((appointment) => {
    const status = normalizeStatus(appointment?.status)
    return (status === 'PENDING' || status === 'APPROVED') && isFutureAppointment(appointment)
  })

  const pastCompletedAppointments = appointments.filter((appointment) => {
    const status = normalizeStatus(appointment?.status)
    return status === 'COMPLETED' || (!['PENDING', 'APPROVED', 'CANCELLED', 'REJECTED'].includes(status) && !isFutureAppointment(appointment))
  })

  const cancelledRejectedAppointments = appointments.filter((appointment) => {
    const status = normalizeStatus(appointment?.status)
    return status === 'CANCELLED' || status === 'REJECTED'
  })

  const allGroups = [
    { title: 'Upcoming Appointments', items: upcomingAppointments },
    { title: 'Past / Completed Appointments', items: pastCompletedAppointments },
    { title: 'Cancelled / Rejected Appointments', items: cancelledRejectedAppointments },
  ]

  if (!userId) {
    return (
      <main className="appointments-page">
        <div className="status-message error">Please login to view your appointments.</div>
        <div className="hero-actions">
          <Link to="/login" className="primary-btn">
            Login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="appointments-page">
      <h1>My Appointments</h1>

      {loading && <div className="status-message">Loading your appointments...</div>}

      {!loading && error && (
        <div className="status-message error">
          {error}
          <div className="hero-actions">
            <button type="button" className="secondary-btn" onClick={loadAppointments}>
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && successMessage && (
        <div className="status-message success">{successMessage}</div>
      )}

      {!loading && !error && appointments.length === 0 && (
        <div className="status-message">
          You don't have any appointments yet.
          <div className="hero-actions">
            <Link to="/categories" className="primary-btn">
              Browse Categories
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && appointments.length > 0 && (
        <>
          {allGroups.map((group) => {
            if (!group.items.length) {
              return null
            }

            return (
              <section key={group.title} style={{ marginTop: '2rem' }}>
                <h2>{group.title}</h2>
                <div className="appointments-grid">
                  {group.items.map((appointment) => {
                    const provider = appointment.provider || {}
                    const status = normalizeStatus(appointment.status)
                    const isExpanded = detailsOpenId === appointment.id

                    return (
                      <article key={appointment.id} className="appointment-card">
                        <div className="appointment-header">
                          <div>
                            <h3>{provider.name || 'Provider'}</h3>
                            <p>{provider.profession || 'Profession not available'}</p>
                          </div>
                          <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
                        </div>

                        <div className="appointment-details">
                          <p>
                            <strong>Organization:</strong> {provider.organization || 'Not available'}
                          </p>
                          <p>
                            <strong>Date:</strong> {formatAppointmentDate(appointment.appointmentDate)}
                          </p>
                          <p>
                            <strong>Time:</strong> {formatAppointmentTime(appointment.appointmentTime)}
                          </p>
                          <p>
                            <strong>Status:</strong> {status}
                          </p>
                        </div>

                        <div className="appointment-actions">
                          <button
                            type="button"
                            className="primary-btn"
                            onClick={() => setDetailsOpenId(isExpanded ? null : appointment.id)}
                          >
                            View Details
                          </button>

                          {canReschedule(status) && (
                            <Link to={`/reschedule/${appointment.id}`} className="secondary-btn">
                              Reschedule
                            </Link>
                          )}

                          {canCancel(status) && (
                            <button
                              type="button"
                              className="secondary-btn"
                              onClick={() => setCancelingAppointmentId(appointment.id)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>

                        {isExpanded && (
                          <div className="success-box" style={{ marginTop: '1rem' }}>
                            <h3>Appointment Details</h3>
                            <p>
                              <strong>Provider:</strong> {provider.name || 'Not available'}
                            </p>
                            <p>
                              <strong>Profession:</strong> {provider.profession || 'Not available'}
                            </p>
                            <p>
                              <strong>Organization:</strong> {provider.organization || 'Not available'}
                            </p>
                            <p>
                              <strong>Date:</strong> {formatAppointmentDate(appointment.appointmentDate)}
                            </p>
                            <p>
                              <strong>Time:</strong> {formatAppointmentTime(appointment.appointmentTime)}
                            </p>
                            <p>
                              <strong>Status:</strong> {status}
                            </p>
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

      {cancelingAppointmentId && (
        <div className="status-message error" style={{ marginTop: '1.5rem' }}>
          <div>Are you sure you want to cancel this appointment?</div>
          <div className="appointment-actions" style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="primary-btn"
              onClick={() => handleCancelAppointment(cancelingAppointmentId)}
            >
              Yes, Cancel Appointment
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setCancelingAppointmentId(null)}
            >
              Keep Appointment
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default MyAppointments
