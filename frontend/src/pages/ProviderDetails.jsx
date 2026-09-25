import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

const parseTimeToMinutes = (value) => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const text = String(value).trim()

  if (!text) {
    return null
  }

  const twelveHourMatch = text.match(/^\s*(\d{1,2}):(\d{2})\s*(AM|PM)?\s*$/i)
  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1])
    const minute = Number(twelveHourMatch[2])
    const amPm = (twelveHourMatch[3] || '').toUpperCase()

    if (amPm === 'PM' && hour !== 12) {
      hour += 12
    }

    if (amPm === 'AM' && hour === 12) {
      hour = 0
    }

    return hour * 60 + minute
  }

  const twentyFourHourMatch = text.match(/^\s*(\d{1,2}):(\d{2})\s*$/)
  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1])
    const minute = Number(twentyFourHourMatch[2])
    return hour * 60 + minute
  }

  return null
}

const getScheduleDate = (slot) => slot?.appointmentDate || slot?.date || slot?.scheduleDate || 'Not specified'
const getScheduleTime = (slot) => slot?.appointmentTime || slot?.time || slot?.scheduleTime || 'Not specified'

const formatDisplayDate = (dateString) => {
  if (!dateString || dateString === 'Not specified') {
    return 'Date not specified'
  }

  const parsedDate = new Date(`${dateString}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Date not specified'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate)
}

const formatDisplayTime = (timeValue) => {
  if (!timeValue || timeValue === 'Not specified') {
    return 'Time not specified'
  }

  const minutes = parseTimeToMinutes(timeValue)

  if (minutes === null) {
    return String(timeValue)
  }

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 === 0 ? 12 : hours % 12

  return `${hour12}:${String(mins).padStart(2, '0')} ${suffix}`
}

const sortSlots = (slots) => [...slots].sort((firstSlot, secondSlot) => {
  const firstDate = getScheduleDate(firstSlot)
  const secondDate = getScheduleDate(secondSlot)

  if (firstDate !== secondDate) {
    return new Date(`${firstDate}T00:00:00`) - new Date(`${secondDate}T00:00:00`)
  }

  const firstMinutes = parseTimeToMinutes(getScheduleTime(firstSlot)) ?? 0
  const secondMinutes = parseTimeToMinutes(getScheduleTime(secondSlot)) ?? 0

  return firstMinutes - secondMinutes
})

const isFutureSlot = (slot, now = new Date()) => {
  const dateValue = getScheduleDate(slot)
  const timeValue = getScheduleTime(slot)

  if (!dateValue || dateValue === 'Not specified') {
    return false
  }

  const dateOnly = new Date(`${dateValue}T00:00:00`)

  if (Number.isNaN(dateOnly.getTime())) {
    return false
  }

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (dateOnly.getTime() < todayStart.getTime()) {
    return false
  }

  if (dateOnly.getTime() > todayStart.getTime()) {
    return true
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const slotMinutes = parseTimeToMinutes(timeValue)

  if (slotMinutes === null) {
    return false
  }

  return slotMinutes > currentMinutes
}

const getCategoryLabel = (categoryId) => {
  const categoryMap = {
    1: 'Hospital',
    2: 'School',
    3: 'Government Offices',
    4: 'Business Services',
    5: 'Public Representatives',
    6: 'Entertainment',
  }

  return categoryMap[categoryId] || `Category ${categoryId}`
}

function ProviderDetails() {
  const { id: providerId } = useParams()
  const navigate = useNavigate()

  const [provider, setProvider] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [providerLoading, setProviderLoading] = useState(true)
  const [scheduleLoading, setScheduleLoading] = useState(true)
  const [providerError, setProviderError] = useState('')
  const [scheduleError, setScheduleError] = useState('')
  const [bookingMessage, setBookingMessage] = useState('')

  const fetchProvider = async () => {
    if (!providerId) {
      return
    }

    try {
      setProviderLoading(true)
      setProviderError('')

      const response = await fetch(`http://localhost:8080/api/providers/${providerId}`)

      if (!response.ok) {
        if (response.status === 404) {
          setProvider(null)
          return
        }

        throw new Error('Unable to load provider information. Please try again.')
      }

      const data = await response.json()
      setProvider(data)
    } catch (err) {
      if (err instanceof TypeError) {
        setProviderError('Unable to load provider information. Please try again.')
      } else {
        setProviderError(err.message || 'Unable to load provider information. Please try again.')
      }
    } finally {
      setProviderLoading(false)
    }
  }

  const fetchSchedules = async () => {
    if (!providerId) {
      return
    }

    try {
      setScheduleLoading(true)
      setScheduleError('')

      const response = await fetch(`http://localhost:8080/api/schedules/provider/${providerId}`)

      if (!response.ok) {
        throw new Error('Unable to load available slots. Please try again.')
      }

      const data = await response.json()
      const availableSlots = Array.isArray(data)
        ? data.filter((slot) => slot.available === true)
        : []

      const futureSlots = sortSlots(
        availableSlots.filter((slot) => isFutureSlot(slot, new Date())),
      )

      setSchedules(futureSlots)
    } catch (err) {
      if (err instanceof TypeError) {
        setScheduleError('Unable to load available slots. Please try again.')
      } else {
        setScheduleError(err.message || 'Unable to load available slots. Please try again.')
      }
    } finally {
      setScheduleLoading(false)
    }
  }

  useEffect(() => {
    if (providerId) {
      fetchProvider()
      fetchSchedules()
    }
  }, [providerId])

  const handleBookAppointment = (scheduleId) => {
    const userId = localStorage.getItem('userId')

    if (!userId) {
      setBookingMessage('Please login to book an appointment.')
      return
    }

    const targetUrl = scheduleId
      ? `/book/${providerId}?scheduleId=${encodeURIComponent(scheduleId)}`
      : `/book/${providerId}`

    navigate(targetUrl)
  }

  const providerDescription =
    provider?.description ||
    provider?.professionalDescription ||
    provider?.profile ||
    provider?.bio ||
    provider?.about ||
    'No professional description provided.'

  const appointmentInformation =
    provider?.appointmentInformation ||
    provider?.appointmentInfo ||
    provider?.availability ||
    provider?.consultationInfo ||
    'Appointment information is not available.'

  const shouldShowProvider = !providerLoading && !providerError && provider

  return (
    <main className="provider-details-page">
      {providerLoading && <div className="status-message">Loading provider details...</div>}

      {!providerLoading && providerError && (
        <div className="status-message error">
          {providerError}
          <div className="hero-actions">
            <button type="button" className="secondary-btn" onClick={fetchProvider}>
              Retry
            </button>
          </div>
        </div>
      )}

      {!providerLoading && !providerError && !provider && (
        <div className="status-message error">Provider not found.</div>
      )}

      {shouldShowProvider && (
        <>
          <section className="provider-profile-card">
            <div className="provider-avatar large" aria-hidden="true">
              {provider.name ? provider.name.charAt(0).toUpperCase() : 'P'}
            </div>

            <div className="provider-details-content">
              <span className="section-tag">Provider Profile</span>
              <h1>{provider.name || 'Unknown Provider'}</h1>

              <div className="provider-info-grid">
                <p>
                  <strong>Profession:</strong> {provider.profession || 'Not available'}
                </p>
                <p>
                  <strong>Organization:</strong> {provider.organization || 'Not available'}
                </p>
                <p>
                  <strong>Category:</strong> {getCategoryLabel(provider.categoryId)}
                </p>
                <p>
                  <strong>Professional Description:</strong> {providerDescription}
                </p>
                <p>
                  <strong>Appointment Information:</strong> {appointmentInformation}
                </p>
              </div>

              <div className="provider-actions hero-actions">
                <button type="button" className="primary-btn" onClick={() => handleBookAppointment()}>
                  Book Appointment
                </button>
                <Link to="/providers" className="secondary-btn">
                  Back to Providers
                </Link>
              </div>
            </div>
          </section>

          <section className="availability-section">
            <h2>Available Appointment Slots</h2>

            {scheduleLoading && <div className="status-message">Loading available slots...</div>}

            {!scheduleLoading && scheduleError && (
              <div className="status-message error">
                {scheduleError}
                <div className="hero-actions">
                  <button type="button" className="secondary-btn" onClick={fetchSchedules}>
                    Retry
                  </button>
                </div>
              </div>
            )}

            {!scheduleLoading && !scheduleError && schedules.length === 0 && (
              <div className="status-message">
                No available appointment slots at the moment.
                <div>Please check again later.</div>
              </div>
            )}

            {!scheduleLoading && !scheduleError && schedules.length > 0 && (
              <div className="slots-grid">
                {schedules.map((slot) => {
                  const scheduleId = slot.id ?? slot.scheduleId

                  return (
                    <article key={scheduleId} className="slot-card">
                      <div className="slot-header">
                        <h3>{formatDisplayDate(getScheduleDate(slot))}</h3>
                        <span className="slot-status available">Available</span>
                      </div>

                      <p>
                        <strong>Time:</strong> {formatDisplayTime(getScheduleTime(slot))}
                      </p>

                      <p>
                        <strong>Available:</strong> Yes
                      </p>

                      <button
                        type="button"
                        className="slot-button"
                        onClick={() => handleBookAppointment(scheduleId)}
                      >
                        Book Appointment
                      </button>
                    </article>
                  )
                })}
              </div>
            )}

            {bookingMessage && (
              <div className="status-message error">
                {bookingMessage}
                <div className="hero-actions">
                  <Link to="/login" className="primary-btn">
                    Login
                  </Link>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  )
}

export default ProviderDetails
