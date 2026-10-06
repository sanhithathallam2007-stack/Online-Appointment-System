import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../api'
import PasswordInput from '../components/PasswordInput'

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
      const response = await fetch(`${API_BASE_URL}/api/auth/provider-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const responseText = await response.text()
      let data = null
      try {
        data = JSON.parse(responseText)
      } catch {
        data = { message: responseText }
      }

      if (!response.ok) {
        setError(data?.message || 'Invalid provider email or password.')
        return
      }

      if (!data?.id || !data?.email) {
        throw new Error('Invalid provider email or password.')
      }

      localStorage.removeItem('userId')
      localStorage.removeItem('userName')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('provider')
      sessionStorage.removeItem('provider')
      localStorage.setItem('providerId', String(data.id))
      localStorage.setItem('providerName', data.name || '')
      localStorage.setItem('providerEmail', data.email)
      localStorage.setItem('providerRole', data.role || 'PROVIDER')
      if (data.profession) {
        localStorage.setItem('providerProfession', data.profession)
      } else {
        localStorage.removeItem('providerProfession')
      }
      if (data.organization) {
        localStorage.setItem('providerOrganization', data.organization)
      } else {
        localStorage.removeItem('providerOrganization')
      }

      navigate('/provider-dashboard')
    } catch (err) {
      setError(err.message || 'Provider login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page auth-screen">
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
            <PasswordInput
              id="password"
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
