import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../api'

function AdminLogin() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin')

    if (storedAdmin) {
      navigate('/admin-dashboard', { replace: true })
    }
  }, [navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Invalid admin email or password.')
      }

      const adminData = {
        email: data.email || formData.email.trim(),
        role: data.role || 'ADMIN',
      }

      localStorage.setItem('admin', JSON.stringify(adminData))
      navigate('/admin-dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid admin email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Admin Login</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter admin email"
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
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && <div className="status-message error">{error}</div>}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-links" style={{ marginTop: '1rem' }}>
          <Link to="/" className="secondary-btn" style={{ display: 'inline-block', textAlign: 'center' }}>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}

export default AdminLogin
