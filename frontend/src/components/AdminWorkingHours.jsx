
import { useEffect, useState } from 'react'
import API_BASE_URL from '../api'

const EMPTY_FORM = {
  dayOfWeek: 'MONDAY',
  startTime: '09:00',
  endTime: '17:00',
  breakStart: '',
  breakEnd: '',
  slotDurationMinutes: 30,
}

function AdminWorkingHours() {
  const [providers, setProviders] = useState([])
  const [selectedProviderId, setSelectedProviderId] = useState('')
  const [workingHours, setWorkingHours] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadProviders()
  }, [])

  useEffect(() => {
    if (selectedProviderId) {
      loadWorkingHours(selectedProviderId)
    } else {
      setWorkingHours([])
    }
  }, [selectedProviderId])

  async function loadProviders() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_BASE_URL}/api/providers`)

      if (!response.ok) {
        throw new Error('Could not load providers.')
      }

      const data = await response.json()
      setProviders(data)

      if (data.length > 0) {
        setSelectedProviderId(String(data[0].id))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadWorkingHours(providerId) {
    try {
      setError('')
      setMessage('')

      const response = await fetch(
        `${API_BASE_URL}/api/providers/${providerId}/working-hours`
      )

      if (!response.ok) {
        throw new Error('Could not load this provider’s working hours.')
      }

      const data = await response.json()
      setWorkingHours(data)
    } catch (err) {
      setError(err.message)
    }
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleSave(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!selectedProviderId) {
      setError('Please select a provider.')
      return
    }

    if (Boolean(form.breakStart) !== Boolean(form.breakEnd)) {
      setError('Please enter both break start and break end, or leave both empty.')
      return
    }

    try {
      setSaving(true)

      const requestBody = {
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
        breakStart: form.breakStart || null,
        breakEnd: form.breakEnd || null,
        slotDurationMinutes: Number(form.slotDurationMinutes),
      }

      const response = await fetch(
        `${API_BASE_URL}/api/providers/${selectedProviderId}/working-hours`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      )

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(result?.error || 'Could not save working hours.')
      }

      setMessage(
        `${form.dayOfWeek} working hours saved. Upcoming slots are being generated.`
      )

      await loadWorkingHours(selectedProviderId)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const selectedProvider = providers.find(
    (provider) => String(provider.id) === selectedProviderId
  )

  if (loading) {
    return <p>Loading providers...</p>
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Manage Provider Working Hours</h2>
      <p style={styles.description}>
        Select a provider and set their working hours. Each provider can have
        different timings.
      </p>

      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.success}>{message}</p>}

      {providers.length === 0 ? (
        <p>No providers found.</p>
      ) : (
        <>
          <label style={styles.label}>Select provider</label>
          <select
            value={selectedProviderId}
            onChange={(event) => setSelectedProviderId(event.target.value)}
            style={styles.input}
          >
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name} — {provider.profession || provider.specialization || 'Provider'}
              </option>
            ))}
          </select>

          {selectedProvider && (
            <div style={styles.providerInfo}>
              <strong>{selectedProvider.name}</strong>
              <span>{selectedProvider.email}</span>
              <span>
                {selectedProvider.organization || selectedProvider.profession || ''}
              </span>
            </div>
          )}

          <form onSubmit={handleSave} style={styles.form}>
            <label style={styles.label}>Day</label>
            <select
              name="dayOfWeek"
              value={form.dayOfWeek}
              onChange={handleChange}
              style={styles.input}
            >
              {[
                'MONDAY',
                'TUESDAY',
                'WEDNESDAY',
                'THURSDAY',
                'FRIDAY',
                'SATURDAY',
                'SUNDAY',
              ].map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Start time</label>
                <input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>End time</label>
                <input
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <p style={styles.note}>Break time is optional.</p>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Break start</label>
                <input
                  type="time"
                  name="breakStart"
                  value={form.breakStart}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Break end</label>
                <input
                  type="time"
                  name="breakEnd"
                  value={form.breakEnd}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <label style={styles.label}>Appointment duration</label>
            <select
              name="slotDurationMinutes"
              value={form.slotDurationMinutes}
              onChange={handleChange}
              style={styles.input}
            >
              <option value={15}>15 minutes</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>

            <button type="submit" disabled={saving} style={styles.button}>
              {saving ? 'Saving...' : 'Save working hours'}
            </button>
          </form>

          <h3 style={styles.subheading}>Saved working hours</h3>

          {workingHours.length === 0 ? (
            <p>No working hours saved for this provider yet.</p>
          ) : (
            <div style={styles.savedList}>
              {workingHours.map((hours) => (
                <div key={hours.id} style={styles.savedItem}>
                  <strong>{hours.dayOfWeek}</strong>
                  <span>
                    {hours.startTime} – {hours.endTime}
                  </span>
                  <span>
                    Break:{' '}
                    {hours.breakStart && hours.breakEnd
                      ? `${hours.breakStart} – ${hours.breakEnd}`
                      : 'None'}
                  </span>
                  <span>{hours.slotDurationMinutes} minutes per appointment</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: 760,
    margin: '24px auto',
    padding: 24,
    background: '#ffffff',
    borderRadius: 16,
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    color: '#222',
  },
  heading: {
    marginTop: 0,
    marginBottom: 8,
  },
  description: {
    color: '#666',
    marginBottom: 24,
  },
  label: {
    display: 'block',
    fontWeight: 600,
    marginBottom: 7,
  },
  input: {
    width: '100%',
    padding: 11,
    marginBottom: 18,
    border: '1px solid #ccc',
    borderRadius: 8,
    fontSize: 15,
    boxSizing: 'border-box',
  },
  row: {
    display: 'flex',
    gap: 16,
  },
  field: {
    flex: 1,
    minWidth: 0,
  },
  note: {
    color: '#666',
    marginBottom: 10,
  },
  providerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    padding: 14,
    marginBottom: 22,
    background: '#f5f7fb',
    borderRadius: 10,
  },
  form: {
    marginTop: 20,
  },
  button: {
    width: '100%',
    padding: 13,
    border: 'none',
    borderRadius: 8,
    background: '#2563eb',
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: {
    padding: 12,
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: 8,
  },
  success: {
    padding: 12,
    background: '#dcfce7',
    color: '#166534',
    borderRadius: 8,
  },
  subheading: {
    marginTop: 30,
  },
  savedList: {
    display: 'grid',
    gap: 10,
  },
  savedItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    padding: 12,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
  },
}

export default AdminWorkingHours