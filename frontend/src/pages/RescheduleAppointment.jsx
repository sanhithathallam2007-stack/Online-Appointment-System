import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API_BASE_URL from '../api'

function RescheduleAppointment() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [appointment, setAppointment] = useState(null)
  const [allAvailableSchedules, setAllAvailableSchedules] = useState([])
  const [availableSchedules, setAvailableSchedules] = useState([])
  const [selectedScheduleId, setSelectedScheduleId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const getScheduleDateValue = (schedule) =>
    schedule?.date || schedule?.appointmentDate || schedule?.scheduleDate || ''

  const getScheduleTimeValue = (schedule) =>
    schedule?.time || schedule?.appointmentTime || schedule?.scheduleTime || ''

  const parseTimeToMinutes = (value) => {
    if (value === null || value === undefined || value === '') {
      return null
    }

    const trimmed = String(value).trim()

    const normalized = trimmed.replace(/\s+/g, ' ')
    const meridiemMatch = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)

    if (meridiemMatch) {
      let hours = Number(meridiemMatch[1])
      const minutes = Number(meridiemMatch[2])
      const suffix = meridiemMatch[3].toUpperCase()

      if (suffix === 'AM' && hours === 12) hours = 0
      if (suffix === 'PM' && hours < 12) hours += 12

      if (minutes >= 0 && minutes < 60 && hours >= 0 && hours <= 23) {
        return hours * 60 + minutes
      }

      return null
    }

    const timeMatch = normalized.match(/^(\d{1,2}):(\d{2})$/)

    if (timeMatch) {
      const hours = Number(timeMatch[1])
      const minutes = Number(timeMatch[2])

      if (minutes >= 0 && minutes < 60 && hours >= 0 && hours <= 23) {
        return hours * 60 + minutes
      }
    }

    return null
  }

  const getScheduleDateTime = (schedule) => {
    const dateValue = getScheduleDateValue(schedule)
    const timeValue = getScheduleTimeValue(schedule)

    if (!dateValue) {
      return null
    }

    const timeMinutes = parseTimeToMinutes(timeValue)

    if (timeMinutes === null) {
      return null
    }

    const [year, month, day] = dateValue.split('-').map(Number)

    if (!year || !month || !day) {
      return null
    }

    return new Date(year, month - 1, day, Math.floor(timeMinutes / 60), timeMinutes % 60)
  }

  const getFutureSchedules = (schedules, now = new Date()) => {
    const futureSchedules = Array.isArray(schedules)
      ? schedules.filter((schedule) => {
          if (schedule?.available !== true) {
            return false
          }

          const scheduleDateTime = getScheduleDateTime(schedule)

          if (!scheduleDateTime || Number.isNaN(scheduleDateTime.getTime())) {
            return false
          }

          return scheduleDateTime > now
        })
      : []

    return futureSchedules.sort((a, b) => {
      const aDateTime = getScheduleDateTime(a)
      const bDateTime = getScheduleDateTime(b)

      if (!aDateTime || !bDateTime) return 0

      return aDateTime.getTime() - bDateTime.getTime()
    })
  }

  const refreshSchedules = async () => {
    if (!id) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${id}`)

      if (!response.ok) {
        throw new Error('Unable to load appointment details.')
      }

      const data = await response.json()
      setAppointment(data)

      const providerId = data?.provider?.id

      if (!providerId) {
        throw new Error('Unable to load provider schedules.')
      }

      const schedulesResponse = await fetch(
        `${API_BASE_URL}/api/schedules/provider/${providerId}`,
      )

      if (!schedulesResponse.ok) {
        throw new Error('Unable to load available schedules.')
      }

      const schedulesData = await schedulesResponse.json()
      const availableOnly = Array.isArray(schedulesData)
        ? schedulesData.filter((schedule) => schedule?.available === true)
        : []

      setAllAvailableSchedules(availableOnly)
      setAvailableSchedules(getFutureSchedules(availableOnly, new Date()))
    } catch (err) {
      setError(err.message || 'Unable to load appointment details.')
    }
  }

  useEffect(() => {
    if (!id) return

    const fetchAppointment = async () => {
      try {
        setLoading(true)
        setError('')

        await refreshSchedules()
      } catch (err) {
        setError(err.message || 'Unable to load appointment details.')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointment()
  }, [id])

  useEffect(() => {
    if (!allAvailableSchedules.length) {
      return undefined
    }

    const timer = setInterval(() => {
      setAvailableSchedules(getFutureSchedules(allAvailableSchedules, new Date()))
    }, 30000)

    return () => clearInterval(timer)
  }, [allAvailableSchedules])

  useEffect(() => {
    const timer = setInterval(() => {
      refreshSchedules()
    }, 60000)

    return () => clearInterval(timer)
  }, [id])

  useEffect(() => {
    if (selectedScheduleId && !availableSchedules.some((schedule) => {
      const scheduleId = schedule.id ?? schedule.scheduleId
      return String(scheduleId) === String(selectedScheduleId)
    })) {
      setSelectedScheduleId('')
    }
  }, [availableSchedules, selectedScheduleId])

  const handleReschedule = async (e) => {
    e.preventDefault()

    if (!id || !selectedScheduleId) {
      setError('Please select a new schedule.')
      return
    }

    const selectedSchedule = availableSchedules.find((schedule) => {
      const scheduleId = schedule.id ?? schedule.scheduleId
      return String(scheduleId) === String(selectedScheduleId)
    })

    if (!selectedSchedule) {
      setError('This appointment slot has expired. Please select another available slot.')
      return
    }

    const selectedDateTime = getScheduleDateTime(selectedSchedule)

    if (!selectedDateTime || selectedDateTime <= new Date()) {
      setError('This appointment slot has expired. Please select another available slot.')
      setSelectedScheduleId('')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const response = await fetch(
        `${API_BASE_URL}/api/appointments/${id}/reschedule?scheduleId=${selectedScheduleId}`,
        {
          method: 'PUT',
        },
      )

      const responseText = await response.text()

      if (!response.ok) {
        throw new Error(responseText || 'Unable to reschedule appointment.')
      }

      setSuccessMessage('Appointment rescheduled successfully')
      setError('')

      setTimeout(() => {
        navigate('/my-appointments')
      }, 800)
    } catch (err) {
      setError(err.message || 'Unable to reschedule appointment.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!id) {
    return <div className="status-message error">Appointment not found.</div>
  }

  return (
    <main className="appointments-page">
      <h1>Reschedule Appointment</h1>

      {loading && <div className="status-message">Loading appointment details...</div>}

      {!loading && error && <div className="status-message error">{error}</div>}

      {!loading && !error && appointment && (
        <div className="auth-card">
          <p>
            <strong>Current date:</strong> {appointment.appointmentDate}
          </p>
          <p>
            <strong>Current time:</strong> {appointment.appointmentTime}
          </p>

          <form onSubmit={handleReschedule} className="auth-form">
            {availableSchedules.length === 0 ? (
              <div className="status-message">No future available schedules.</div>
            ) : (
              <div className="form-group">
                <label>Available Schedules</label>
                <div className="slots-grid">
                  {availableSchedules.map((schedule) => {
                    const scheduleId = schedule.id ?? schedule.scheduleId
                    const isSelected = selectedScheduleId === String(scheduleId)

                    return (
                      <button
                        key={scheduleId}
                        type="button"
                        className={`slot-button ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedScheduleId(String(scheduleId))}
                      >
                        <span>{getScheduleDateValue(schedule) || 'Date unavailable'}</span>
                        <br />
                        <span>{getScheduleTimeValue(schedule) || 'Time unavailable'}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <button type="submit" className="primary-btn" disabled={submitting || !selectedScheduleId}>
              {submitting ? 'Rescheduling...' : 'Reschedule Appointment'}
            </button>
          </form>
        </div>
      )}

      {successMessage && <div className="status-message success">{successMessage}</div>}
    </main>
  )
}

export default RescheduleAppointment
