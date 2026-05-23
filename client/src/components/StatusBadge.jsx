import styles from './StatusBadge.module.css'

const colorMap = {
  'Pending': 'warning',
  'pending': 'warning',
  'In Progress': 'primary',
  'in-progress': 'primary',
  'Completed': 'success',
  'completed': 'success',
  'Active': 'success',
  'active': 'success',
  'Inactive': 'danger',
  'inactive': 'danger',
  'Low': 'success',
  'low': 'success',
  'Medium': 'warning',
  'medium': 'warning',
  'High': 'danger',
  'high': 'danger',
}

export default function StatusBadge({ status }) {
  const variant = colorMap[status] || 'primary'

  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {status}
    </span>
  )
}
