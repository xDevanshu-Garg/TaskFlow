import { useEffect, useState, useCallback } from 'react'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import Loader from '../../components/Loader'
import { Users, Trash2, Search, Shield, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './UserManagement.module.css'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/users')
      setUsers(data.users || data)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const toggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active'
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus })
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
      )
      toast.success(`User ${newStatus === 'Active' ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/admin/users/${deleteId}`)
      setUsers((prev) => prev.filter((u) => u._id !== deleteId))
      toast.success('User deleted')
    } catch {
      toast.error('Failed to delete user')
    } finally {
      setDeleteId(null)
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
  })

  if (loading) return <Loader fullPage={false} />

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={`input ${styles.searchInput}`}
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className={styles.count}>{filtered.length} users</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description={search ? 'Try a different search term' : 'No users registered yet'}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th className={styles.emailCol}>Email</th>
                <th className={styles.roleCol}>Role</th>
                <th>Status</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className={styles.userName}>{user.name}</span>
                    </div>
                  </td>
                  <td className={styles.emailCol}>
                    <span className={styles.email}>{user.email}</span>
                  </td>
                  <td className={styles.roleCol}>
                    <div className={styles.roleChip}>
                      {user.role === 'Admin' && <Shield size={12} />}
                      {user.role}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={user.status || 'Active'} />
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.toggleBtn}
                        onClick={() => toggleStatus(user._id, user.status || 'Active')}
                        title={user.status === 'Active' ? 'Deactivate' : 'Activate'}
                      >
                        {user.status === 'Inactive' ? (
                          <ToggleLeft size={18} />
                        ) : (
                          <ToggleRight size={18} className={styles.activeToggle} />
                        )}
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setDeleteId(user._id)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && (
        <Modal
          title="Delete User"
          onClose={() => setDeleteId(null)}
          width={400}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </>
          }
        >
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Are you sure you want to delete this user? All their data will be permanently removed.
          </p>
        </Modal>
      )}
    </div>
  )
}
