import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import StatCard from '../components/StatCard'
import Loader from '../components/Loader'
import {
  CheckSquare,
  Clock,
  Loader as LoaderIcon,
  ListTodo,
} from 'lucide-react'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks')
      const tasks = data.tasks || data
      setStats({
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === 'completed').length,
        pendingTasks: tasks.filter((t) => t.status === 'pending').length,
        inProgressTasks: tasks.filter((t) => t.status === 'in-progress').length,
      })
    } catch (err) {
      console.error('Failed to load dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (loading) return <Loader fullPage={false} />

  const cards = [
    { icon: ListTodo, label: 'My Tasks', value: stats?.totalTasks, color: 'var(--primary)' },
    { icon: CheckSquare, label: 'Completed', value: stats?.completedTasks, color: 'var(--success)' },
    { icon: Clock, label: 'Pending', value: stats?.pendingTasks, color: 'var(--warning)' },
    { icon: LoaderIcon, label: 'In Progress', value: stats?.inProgressTasks, color: 'var(--secondary)' },
  ]

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcome}>
        <h2 className={styles.greeting}>
          Welcome back, <span className={styles.name}>{user?.name?.split(' ')[0]}</span>
        </h2>
        <p className={styles.sub}>Here's how your tasks are looking</p>
      </div>

      <div className={styles.grid}>
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  )
}
