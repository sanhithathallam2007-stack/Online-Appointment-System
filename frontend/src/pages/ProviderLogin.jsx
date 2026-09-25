import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ProviderLogin() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8080/api/provider-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data?.message || 'Invalid provider email or password.')
        return
      }

      const providerData = {
        id: data.id,
        name: data.name,
        email: data.email,
        profession: data.profession || data.role || data.specialty || '',
        organization: data.organization || data.company || data.hospital || '',
      }

      localStorage.setItem('provider', JSON.stringify(providerData))
      localStorage.setItem('providerId', String(data.id))
      localStorage.setItem('providerName', data.name)
      localStorage.setItem('providerEmail', data.email)
      if (data.profession || data.role) {
        localStorage.setItem('providerProfession', data.profession || data.role)
      }
      if (data.organization || data.company || data.hospital) {
        localStorage.setItem('providerOrganization', data.organization || data.company || data.hospital)
      }

      navigate('/provider-dashboard')
    } catch (err) {
      setError(err.message || 'Provider login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Provider Login</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter provider email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          {error && <div className="status-message error">{error}</div>}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default ProviderLogin
