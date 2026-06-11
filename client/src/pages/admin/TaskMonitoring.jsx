import { useEffect, useState, useCallback } from 'react'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import Loader from '../../components/Loader'
import { ListTodo, Trash2, Calendar } from 'lucide-react'
import { formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'
import styles from './TaskMonitoring.module.css'

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

export default function TaskMonitoring() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [deleteId, setDeleteId] = useState(null)

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/tasks')
      setTasks(data.tasks || data)
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/admin/tasks/${deleteId}`)
      setTasks((prev) => prev.filter((t) => t._id !== deleteId))
      toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete task')
    } finally {
      setDeleteId(null)
    }
  }

  const filtered = filter === 'all'
    ? tasks
    : tasks.filter((t) => t.status === filter)

  if (loading) return <Loader fullPage={false} />

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.filterBtn} ${filter === opt.value ? styles.activeFilter : ''}`}
              onClick={() => setFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className={styles.count}>{filtered.length} tasks</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks found"
          description={filter === 'all' ? 'No tasks in the system yet' : `No ${filter} tasks`}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr key={task._id}>
                  <td>
                    <span className={styles.taskTitle}>{task.title}</span>
                  </td>
                  <td>
                    <span className={styles.creator}>
                      {task.createdBy?.name || task.createdBy?.email || '—'}
                    </span>
                  </td>
                  <td><StatusBadge status={task.status} /></td>
                  <td><StatusBadge status={task.priority} /></td>
                  <td>
                    <span className={styles.date}>
                      {task.dueDate ? (
                        <>
                          <Calendar size={12} />
                          {formatDate(task.dueDate)}
                        </>
                      ) : '—'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => setDeleteId(task._id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && (
        <Modal
          title="Delete Task"
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
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  )
}
