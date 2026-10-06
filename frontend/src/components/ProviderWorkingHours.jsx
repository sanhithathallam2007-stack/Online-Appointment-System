
import { useEffect, useState } from 'react'
import API_BASE_URL from '../api'

const DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

function ProviderWorkingHours({ providerId, onSaved }) {
  const [formData, setFormData] = useState({
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '17:00',
    breakStart: '',
    breakEnd: '',
    slotDurationMinutes: 30,
  })

  const [workingHours, setWorkingHours] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadWorkingHours = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${API_BASE_URL}/api/providers/${providerId}/working-hours`,
      )

      if (!response.ok) {
        throw new Error('Unable to load working hours.')
      }

      const data = await response.json()
      setWorkingHours(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Unable to load working hours.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (providerId) {
      loadWorkingHours()
    }
  }, [providerId])

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (Boolean(formData.breakStart) !== Boolean(formData.breakEnd)) {
      setError('Please enter both break start and break end, or leave both empty.')
      return
    }

    setSaving(true)

    try {
      const payload = {
        ...formData,
        slotDurationMinutes: Number(formData.slotDurationMinutes),
        breakStart: formData.breakStart || null,
        breakEnd: formData.breakEnd || null,
      }

      const response = await fetch(
        `${API_BASE_URL}/api/providers/${providerId}/working-hours`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      )

      const responseText = await response.text()
      let result

      try {
        result = JSON.parse(responseText)
      } catch {
        result = { error: responseText }
      }

      if (!response.ok) {
        throw new Error(result?.error || result?.message || 'Unable to save working hours.')
      }

      await loadWorkingHours()
      setSuccess(`${formData.dayOfWeek} working hours saved. Upcoming slots are being generated.`)

      if (onSaved) {
        await onSaved()
      }
    } catch (err) {
      setError(err.message || 'Unable to save working hours.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="booking-section" style={{ marginTop: '2rem' }}>
      <h2>Set Your Working Hours</h2>
      <p>Choose your working day and time. Your available appointment slots will be generated automatically.</p>

      <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: '600px' }}>
        <div className="form-group">
          <label htmlFor="dayOfWeek">Working day</label>
          <select
            id="dayOfWeek"
            name="dayOfWeek"
            value={formData.dayOfWeek}
            onChange={handleChange}
            required
          >
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {day.charAt(0) + day.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="startTime">Start time</label>
          <input
            id="startTime"
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="endTime">End time</label>
          <input
            id="endTime"
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="breakStart">Break start (optional)</label>
          <input
            id="breakStart"
            type="time"
            name="breakStart"
            value={formData.breakStart}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="breakEnd">Break end (optional)</label>
          <input
            id="breakEnd"
            type="time"
            name="breakEnd"
            value={formData.breakEnd}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="slotDurationMinutes">Appointment duration</label>
          <select
            id="slotDurationMinutes"
            name="slotDurationMinutes"
            value={formData.slotDurationMinutes}
            onChange={handleChange}
            required
          >
            <option value={15}>15 minutes</option>
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
        </div>

        {error && <div className="status-message error">{error}</div>}
        {success && <div className="status-message success">{success}</div>}

        <button type="submit" className="primary-btn" disabled={saving}>
          {saving ? 'Saving...' : 'Save Working Hours'}
        </button>
      </form>

      <div style={{ marginTop: '2rem' }}>
        <h3>Your Saved Working Days</h3>

        {loading && <div className="status-message">Loading working hours...</div>}

        {!loading && workingHours.length === 0 && (
          <div className="status-message">You have not set any working hours yet.</div>
        )}

        {!loading && workingHours.length > 0 && (
          <div className="appointments-grid">
            {workingHours.map((hours) => (
              <article className="appointment-card" key={hours.id}>
                <h3>{hours.dayOfWeek}</h3>
                <p>
                  <strong>Time:</strong> {hours.startTime} – {hours.endTime}
                </p>
                <p>
                  <strong>Break:</strong>{' '}
                  {hours.breakStart && hours.breakEnd
                    ? `${hours.breakStart} – ${hours.breakEnd}`
                    : 'No break'}
                </p>
                <p>
                  <strong>Slot duration:</strong> {hours.slotDurationMinutes} minutes
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default ProviderWorkingHours