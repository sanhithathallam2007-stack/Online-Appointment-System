
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../api'
import PasswordInput from '../components/PasswordInput'

function Login() {
  const navigate = useNavigate()
  const [loginType, setLoginType] = useState('user')

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
      const isProviderLogin = loginType === 'provider'
      const endpoint = isProviderLogin
        ? '/api/auth/provider-login'
        : '/api/auth/login'

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

      if (isProviderLogin) {
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
      } else {
        localStorage.removeItem('providerId')
        localStorage.removeItem('providerName')
        localStorage.removeItem('providerEmail')
        localStorage.removeItem('providerRole')
        localStorage.removeItem('providerProfession')
        localStorage.removeItem('providerOrganization')
        localStorage.removeItem('provider')
        sessionStorage.removeItem('provider')

        localStorage.setItem('userId', String(data.id))
        localStorage.setItem('userName', data.name || '')
        localStorage.setItem('userEmail', data.email)
      }

      setFormData({ email: '', password: '' })
      navigate(isProviderLogin ? '/provider-dashboard' : '/categories')
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          'Unable to connect to the server. Please make sure Spring Boot is running.',
        )
      } else {
        setError('Invalid email or password')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page auth-screen login-page">
      <section className="auth-card login-card">
        <div className="auth-header login-header">
          <span className="eyebrow-label">WELCOME BACK</span>

          <h1>{loginType === 'provider' ? 'Provider Login' : 'User Login'}</h1>

          <p>
            {loginType === 'provider'
              ? 'Sign in to manage your appointments and available slots.'
              : 'Sign in to find and manage your appointments.'}
          </p>
        </div>

        <div
          className="appointment-actions login-type-actions"
          role="group"
          aria-label="Login type"
        >
          <button
            type="button"
            className={loginType === 'user' ? 'primary-btn' : 'secondary-btn'}
            aria-pressed={loginType === 'user'}
            onClick={() => setLoginType('user')}
          >
            User Login
          </button>

          <button
            type="button"
            className={
              loginType === 'provider' ? 'primary-btn' : 'secondary-btn'
            }
            aria-pressed={loginType === 'provider'}
            onClick={() => setLoginType('provider')}
          >
            Provider Login
          </button>
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
            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="status-message error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary-btn auth-submit"
            disabled={isSubmitting}
          >
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