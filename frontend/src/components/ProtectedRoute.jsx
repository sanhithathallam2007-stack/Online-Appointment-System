import { Navigate } from 'react-router-dom'

const getStoredProvider = () => {
  const rawProvider = localStorage.getItem('provider')

  if (!rawProvider) {
    return null
  }

  try {
    const parsedProvider = JSON.parse(rawProvider)
    return parsedProvider && typeof parsedProvider === 'object' ? parsedProvider : null
  } catch (err) {
    return null
  }
}

const getStoredAdmin = () => {
  const rawAdmin = localStorage.getItem('admin')

  if (!rawAdmin) {
    return null
  }

  try {
    const parsedAdmin = JSON.parse(rawAdmin)
    return parsedAdmin && typeof parsedAdmin === 'object' ? parsedAdmin : null
  } catch (err) {
    return null
  }
}

const isUserLoggedIn = () => {
  if (localStorage.getItem('userId')) return true
  if (localStorage.getItem('userEmail')) return true
  if (localStorage.getItem('userName')) return true
  if (localStorage.getItem('user')) return true
  if (localStorage.getItem('token')) return true
  return false
}

export function UserProtectedRoute({ children }) {
  if (!isUserLoggedIn()) {
    return <Navigate to="/login" replace />
  }

  return children
}

export function ProviderProtectedRoute({ children }) {
  const provider = getStoredProvider()

  if (!provider || (!provider.id && !provider.email && !provider.name)) {
    return <Navigate to="/provider-login" replace />
  }

  return children
}

export function AdminProtectedRoute({ children }) {
  const admin = getStoredAdmin()

  if (!admin || (!admin.email && !admin.role)) {
    return <Navigate to="/admin-login" replace />
  }

  return children
}

export default function ProtectedRoute({ children, redirectPath = '/login' }) {
  if (!isUserLoggedIn()) {
    return <Navigate to={redirectPath} replace />
  }

  return children
}
