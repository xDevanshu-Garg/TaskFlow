import { useEffect, useState, useCallback } from 'react'
import api from '../../api/axios'
import EmptyState from '../../components/EmptyState'
import Loader from '../../components/Loader'
import { Activity, ChevronLeft, ChevronRight, User, Clock } from 'lucide-react'
import { formatDateTime } from '../../utils/formatters'
import toast from 'react-hot-toast'
import styles from './ActivityLogs.module.css'

const ACTION_FILTERS = ['All', 'login', 'task_create', 'task_update', 'task_delete', 'user_status_change', 'user_delete']

export default function ActivityLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionFilter, setActionFilter] = useState('All')
  const limit = 20

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit }
      if (actionFilter !== 'All') params.action = actionFilter

      const { data } = await api.get('/activity-logs', { params })
      setLogs(data.logs || data.activityLogs || data)

      // try to extract pagination info
      const total = data.pagination?.pages || data.totalPages || Math.ceil((data.pagination?.total || 0) / limit) || 1
      setTotalPages(total)
    } catch {
      toast.error('Failed to load activity logs')
    } finally {
      setLoading(false)
    }
  }, [page, actionFilter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // reset to page 1 when filter changes
  useEffect(() => {
    setPage(1)
  }, [actionFilter])

  const getActionColor = (action) => {
    const map = {
      login: 'var(--primary)',
      task_create: 'var(--success)',
      task_update: 'var(--warning)',
      task_delete: 'var(--danger)',
      user_status_change: 'var(--secondary)',
      user_delete: 'var(--danger)',
    }
    return map[action] || 'var(--text-dim)'
  }

  const formatAction = (action) => {
    return action?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || action
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Filter by action:</label>
          <select
            className="select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{ width: 'auto', minWidth: 160 }}
          >
            {ACTION_FILTERS.map((a) => (
              <option key={a} value={a}>
                {a === 'All' ? 'All Actions' : formatAction(a)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <Loader fullPage={false} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity logs"
          description="Activity will appear here as users interact with the system"
        />
      ) : (
        <>
          <div className={styles.timeline}>
            {logs.map((log) => (
              <div key={log._id} className={styles.logItem}>
                <div
                  className={styles.dot}
                  style={{ background: getActionColor(log.action) }}
                />
                <div className={styles.logContent}>
                  <div className={styles.logHeader}>
                    <span
                      className={styles.actionTag}
                      style={{ color: getActionColor(log.action) }}
                    >
                      {formatAction(log.action)}
                    </span>
                    <span className={styles.timestamp}>
                      <Clock size={12} />
                      {formatDateTime(log.createdAt)}
                    </span>
                  </div>
                  <div className={styles.logUser}>
                    <User size={13} />
                    <span>{log.user?.name || log.user?.email || 'Unknown'}</span>
                  </div>
                  {log.details && (
                    <p className={styles.logDetails}>{log.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.pagination}>
            <button
              className="btn btn-ghost btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span className={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-ghost btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
