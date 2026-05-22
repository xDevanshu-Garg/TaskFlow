import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from './Loader'

export default function ProtectedRoute({ requireAdmin = false }) {
  const { user, loading } = useAuth()

  if (loading) return <Loader />

  if (!user) return <Navigate to="/login" replace />

  if (requireAdmin && user.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
