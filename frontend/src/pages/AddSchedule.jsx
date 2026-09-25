import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../api'

function AddSchedule() {
  const navigate = useNavigate()
  const providerId = localStorage.getItem('providerId')
  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!providerId) {
      setError('Please login as a provider to add a slot.')
      return
    }

    if (!formData.appointmentDate || !formData.appointmentTime) {
      setError('Please select a valid date and time.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId: Number(providerId),
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
        }),
      })

      if (!response.ok) {
        const responseText = await response.text()
        throw new Error(responseText || 'Unable to add the new slot.')
      }

      localStorage.setItem('providerDashboardMessage', 'New available slot added.')
      navigate('/provider-dashboard')
    } catch (err) {
      setError(err.message || 'Unable to add the new slot.')
    } finally {
      setSubmitting(false)
    }
  }

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
    <main className="appointments-page">
      <section className="dashboard-header">
        <div>
          <span className="section-tag">Manage Available Slots</span>
          <h1>Add New Slot</h1>
        </div>
      </section>

      <div className="auth-card">
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="appointmentDate">Date</label>
            <input
              id="appointmentDate"
              type="date"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="appointmentTime">Time</label>
            <input
              id="appointmentTime"
              type="time"
              name="appointmentTime"
              value={formData.appointmentTime}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="status-message error">{error}</div>}

          <div className="appointment-actions">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? 'Adding slot...' : 'Add Slot'}
            </button>
            <Link to="/provider-dashboard" className="secondary-btn">
              Back to Dashboard
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}

export default AddSchedule
