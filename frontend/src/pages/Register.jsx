import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../api'
import PasswordInput from '../components/PasswordInput'

function Register() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    return () => {
      if (window.__registerRedirectTimer) {
        clearTimeout(window.__registerRedirectTimer)
        delete window.__registerRedirectTimer
      }
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const { name, email, password, confirmPassword } = formData

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      setSuccess(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setSuccess(false)
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json().catch(() => null)

      // DEBUG INFORMATION
      console.log('REGISTER STATUS:', response.status)
      console.log('REGISTER RESPONSE:', data)

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            'Registration failed. Please try again.',
        )
      }

      setSuccess(true)

      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      })

      if (window.__registerRedirectTimer) {
        clearTimeout(window.__registerRedirectTimer)
      }

      window.__registerRedirectTimer = setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1200)
    } catch (err) {
      console.error('REGISTER ERROR:', err)
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page auth-screen register-page">
      <section className="auth-card register-card">
        <div className="auth-header register-header">
          <span className="eyebrow-label">CREATE ACCOUNT</span>

          <h1>Join Us</h1>

          <p>
            Create your account to book and manage appointments easily.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>

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

            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
            />
          </div>

          {error && (
            <div className="status-message error">
              {error}
            </div>
          )}

          {success && (
            <div className="success-box auth-success">
              <h3>Registration successful!</h3>

              <Link to="/login" className="primary-btn">
                Login
              </Link>
            </div>
          )}

          {!success && (
            <button
              type="submit"
              className="primary-btn auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Creating account...'
                : 'Create Account'}
            </button>
          )}
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  )
}

export default Register