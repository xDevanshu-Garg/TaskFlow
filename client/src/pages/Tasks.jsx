import { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import Loader from '../components/Loader'
import { Plus, Edit2, Trash2, Calendar, CheckSquare } from 'lucide-react'
import { formatDate, truncate } from '../utils/formatters'
import toast from 'react-hot-toast'
import styles from './Tasks.module.css'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]
const FILTER_TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

const emptyTask = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  dueDate: '',
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [formData, setFormData] = useState(emptyTask)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks')
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

  const filteredTasks = filter === 'all'
    ? tasks
    : tasks.filter((t) => t.status === filter)

  const openCreate = () => {
    setEditingTask(null)
    setFormData(emptyTask)
    setModalOpen(true)
  }

  const openEdit = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingTask(null)
    setFormData(emptyTask)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }

    setSaving(true)
    try {
      if (editingTask) {
        const { data } = await api.put(`/tasks/${editingTask._id}`, formData)
        setTasks((prev) =>
          prev.map((t) => (t._id === editingTask._id ? (data.task || data) : t))
        )
        toast.success('Task updated')
      } else {
        const { data } = await api.post('/tasks', formData)
        setTasks((prev) => [data.task || data, ...prev])
        toast.success('Task created')
      }
      closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/tasks/${deleteId}`)
      setTasks((prev) => prev.filter((t) => t._id !== deleteId))
      toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete task')
    } finally {
      setDeleteId(null)
    }
  }

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) return <Loader fullPage={false} />

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              className={`${styles.filterBtn} ${filter === tab.value ? styles.activeFilter : ''}`}
              onClick={() => setFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description={filter === 'all' ? "You haven't created any tasks yet" : `No ${filter} tasks`}
          action={filter === 'all' ? { label: 'Create Task', onClick: openCreate } : undefined}
        />
      ) : (
        <div className={styles.grid}>
          {filteredTasks.map((task) => (
            <div key={task._id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{task.title}</h3>
                <div className={styles.cardActions}>
                  <button className={styles.iconBtn} onClick={() => openEdit(task)} title="Edit">
                    <Edit2 size={14} />
                  </button>
                  <button
                    className={`${styles.iconBtn} ${styles.deleteBtn}`}
                    onClick={() => setDeleteId(task._id)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {task.description && (
                <p className={styles.cardDesc}>{truncate(task.description, 120)}</p>
              )}
              <div className={styles.cardMeta}>
                <div className={styles.badges}>
                  <StatusBadge status={task.status} />
                  <StatusBadge status={task.priority} />
                </div>
                {task.dueDate && (
                  <span className={styles.dueDate}>
                    <Calendar size={12} />
                    {formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <Modal
          title={editingTask ? 'Edit Task' : 'New Task'}
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingTask ? 'Update' : 'Create'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSave} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                className="input"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="What needs to be done?"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="textarea"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Add details..."
                rows={3}
              />
            </div>

            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="select"
                  value={formData.status}
                  onChange={(e) => updateField('status', e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="select"
                  value={formData.priority}
                  onChange={(e) => updateField('priority', e.target.value)}
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="input"
                value={formData.dueDate}
                onChange={(e) => updateField('dueDate', e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
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
