import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import styles from './AppLayout.module.css'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/tasks': 'My Tasks',
  '/admin/users': 'User Management',
  '/admin/tasks': 'All Tasks',
  '/admin/activity-logs': 'Activity Logs',
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const title = pageTitles[location.pathname] || 'Dashboard'

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.main}>
        <Header
          title={title}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
