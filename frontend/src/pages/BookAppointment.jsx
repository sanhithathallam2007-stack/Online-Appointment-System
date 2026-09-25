import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const parseTimeToMinutes = (value) => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const text = String(value).trim()

  if (!text) {
    return null
  }

  const twelveHourMatch = text.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
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

  const twentyFourHourMatch = text.match(/^(\d{1,2}):(\d{2})$/)
  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1])
    const minute = Number(twentyFourHourMatch[2])
    return hour * 60 + minute
  }

  return null
}

const getScheduleDate = (slot) =>
  slot?.appointmentDate || slot?.date || slot?.scheduleDate || 'Not specified'

const getScheduleTime = (slot) =>
  slot?.appointmentTime || slot?.time || slot?.scheduleTime || 'Not specified'

const sortSlots = (slots) => {
  const sorted = [...slots]

  return sorted.sort((firstSlot, secondSlot) => {
    const firstDate = getScheduleDate(firstSlot)
    const secondDate = getScheduleDate(secondSlot)

    if (firstDate !== secondDate) {
      return new Date(`${firstDate}T00:00:00`) - new Date(`${secondDate}T00:00:00`)
    }

    const firstTime = parseTimeToMinutes(getScheduleTime(firstSlot)) ?? 0
    const secondTime = parseTimeToMinutes(getScheduleTime(secondSlot)) ?? 0

    return firstTime - secondTime
  })
}

const isFutureSlot = (slot, now = new Date()) => {
  const dateString = getScheduleDate(slot)
  const timeString = getScheduleTime(slot)

  if (!dateString || dateString === 'Not specified') {
    return false
  }

  const dateOnly = new Date(`${dateString}T00:00:00`)

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
  const scheduleMinutes = parseTimeToMinutes(timeString)

  if (scheduleMinutes === null) {
    return false
  }

  return scheduleMinutes > currentMinutes
}

const filterFutureSlots = (slots, now = new Date()) =>
  sortSlots(
    Array.isArray(slots)
      ? slots.filter((slot) => slot.available === true && isFutureSlot(slot, now))
      : [],
  )

function BookAppointment() {
  const { providerId } = useParams()

  const [provider, setProvider] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [selectedScheduleId, setSelectedScheduleId] = useState(null)
  const [providerLoading, setProviderLoading] = useState(true)
  const [scheduleLoading, setScheduleLoading] = useState(true)
  const [providerError, setProviderError] = useState('')
  const [scheduleError, setScheduleError] = useState('')
  const [booking, setBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const loadSchedules = async () => {
    if (!providerId) return

    try {
      setScheduleLoading(true)
      setScheduleError('')

      const response = await fetch(`http://localhost:8080/api/schedules/provider/${providerId}`)

      if (!response.ok) {
        throw new Error('Unable to load available slots.')
      }

      const data = await response.json()
      const availableSlots = Array.isArray(data)
        ? data.filter((slot) => slot.available === true)
        : []

      setSchedules(filterFutureSlots(availableSlots, new Date()))
    } catch (err) {
      setScheduleError(err.message || 'Unable to load available slots.')
    } finally {
      setScheduleLoading(false)
    }
  }

  useEffect(() => {
    const fetchProvider = async () => {
      if (!providerId) return

      try {
        setProviderLoading(true)
        setProviderError('')

        const response = await fetch(`http://localhost:8080/api/providers/${providerId}`)

        if (!response.ok) {
          throw new Error('Unable to load provider details.')
        }

        const data = await response.json()
        setProvider(data)
      } catch (err) {
        setProviderError(err.message || 'Unable to load provider details.')
      } finally {
        setProviderLoading(false)
      }
    }

    fetchProvider()
    loadSchedules()

    const expirationCheckTimer = window.setInterval(() => {
      setSchedules((currentSchedules) => filterFutureSlots(currentSchedules, new Date()))
    }, 30000)

    const backendRefreshTimer = window.setInterval(() => {
      loadSchedules()
    }, 60000)

    return () => {
      window.clearInterval(expirationCheckTimer)
      window.clearInterval(backendRefreshTimer)
    }
  }, [providerId])

  useEffect(() => {
    if (selectedScheduleId && !schedules.some((slot) => String(slot.id ?? slot.scheduleId) === String(selectedScheduleId))) {
      setSelectedScheduleId(null)
    }
  }, [selectedScheduleId, schedules])

  const getProviderName = (value) =>
    value?.providerName || value?.name || value?.fullName || 'Unknown Provider'

  const handleSelectSchedule = (slot) => {
    if (booking) return

    const scheduleId = slot.id ?? slot.scheduleId

    if (!isFutureSlot(slot, new Date())) {
      setBookingError('This appointment slot has expired. Please select another available slot.')
      setSelectedScheduleId(null)
      return
    }

    setSelectedScheduleId(scheduleId)
    setBookingError('')
  }

  const handleConfirmBooking = async () => {
    if (!selectedScheduleId || booking) {
      return
    }

    const userId = localStorage.getItem('userId')

    if (!userId) {
      setBookingError('Please login before booking an appointment.')
      return
    }

    const selectedSlot = schedules.find(
      (slot) => String(slot.id ?? slot.scheduleId) === String(selectedScheduleId),
    )

    if (!selectedSlot || !isFutureSlot(selectedSlot, new Date())) {
      setBookingError('This appointment slot has expired. Please select another available slot.')
      setSelectedScheduleId(null)
      return
    }

    setBooking(true)
    setBookingError('')
    setBookingSuccess(false)

    try {
      const response = await fetch(
        `http://localhost:8080/api/appointments/book?userId=${userId}&providerId=${providerId}&scheduleId=${selectedScheduleId}`,
        {
          method: 'POST',
        },
      )

      const responseText = await response.text()

      if (!response.ok) {
        setBookingError(responseText || 'Unable to book appointment.')
        return
      }

      setSelectedScheduleId(null)
      setBookingSuccess(true)
      setBookingError('')
      await loadSchedules()
    } catch (err) {
      setBookingError(err.message || 'Unable to book appointment.')
    } finally {
      setBooking(false)
    }
  }

  if (!providerId) {
    return <div className="status-message error">Provider not found.</div>
  }

  const userId = localStorage.getItem('userId')

  if (!userId) {
    return (
      <main className="booking-page">
        <div className="status-message error">Please login before booking an appointment.</div>
        <div className="login-action-box">
          <Link to="/login" className="primary-btn">
            Login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="booking-page">
      {providerLoading && <div className="status-message">Loading provider details...</div>}

      {!providerLoading && providerError && (
        <div className="status-message error">{providerError}</div>
      )}

      {!providerLoading && !providerError && provider && (
        <section className="booking-provider-card">
          <div className="provider-avatar large" aria-hidden="true">
            {getProviderName(provider).charAt(0).toUpperCase()}
          </div>

          <div className="booking-provider-info">
            <span className="section-tag">Book Appointment</span>
            <h1>{getProviderName(provider)}</h1>
          </div>
        </section>
      )}

      <section className="booking-section">
        <h2>Available Appointment Slots</h2>

        {scheduleLoading && <div className="status-message">Loading available slots...</div>}

        {!scheduleLoading && scheduleError && (
          <div className="status-message error">{scheduleError}</div>
        )}

        {!scheduleLoading && !scheduleError && schedules.length === 0 && (
          <div className="status-message">No available appointment slots at the moment.</div>
        )}

        {!scheduleLoading && !scheduleError && schedules.length > 0 && (
          <div className="slots-grid">
            {schedules.map((slot) => {
              const scheduleId = slot.id ?? slot.scheduleId
              const isSelected = String(selectedScheduleId) === String(scheduleId)

              return (
                <div key={scheduleId} className="slot-card">
                  <div className="slot-header">
                    <h3>{getScheduleDate(slot)}</h3>
                    <span className="slot-status available">Available</span>
                  </div>

                  <p>
                    <strong>Time:</strong> {getScheduleTime(slot)}
                  </p>

                  <p>
                    <strong>Available:</strong> {slot.available === true ? 'Yes' : 'No'}
                  </p>

                  <button
                    type="button"
                    className={`slot-button ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectSchedule(slot)}
                    disabled={booking}
                  >
                    {isSelected ? 'Selected Slot' : 'Book This Slot'}
                  </button>

                  {isSelected && (
                    <button
                      type="button"
                      onClick={handleConfirmBooking}
                      disabled={booking}
                    >
                      {booking ? 'Booking appointment...' : 'Confirm Booking'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {bookingError && <div className="status-message error">{bookingError}</div>}

        {bookingSuccess && (
          <div className="success-box">
            <h3>Appointment booked successfully!</h3>
            <Link to="/my-appointments" className="primary-btn">
              View My Appointments
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}

export default BookAppointment
