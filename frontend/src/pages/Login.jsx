import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../api'

function Login() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const { email, password } = formData

    if (!email || !password) {
      setError('Invalid email or password')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok || !data || !data.id || !data.email) {
        throw new Error('Invalid email or password')
      }

      localStorage.setItem('userId', String(data.id))
      localStorage.setItem('userName', data.name || '')
      localStorage.setItem('userEmail', data.email)

      setFormData({ email: '', password: '' })
      navigate('/categories')
    } catch (err) {
      if (err instanceof TypeError) {
        setError('Unable to connect to the server. Please make sure Spring Boot is running.')
      } else {
        setError('Invalid email or password')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <span className="section-tag">Welcome Back</span>
          <h1>Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="status-message error">{error}</div>}

          <button type="submit" className="primary-btn auth-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </section>
    </main>
  )
}

export default Login
