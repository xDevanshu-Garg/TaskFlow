import styles from './EmptyState.module.css'
import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description, action }) {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrap}>
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <button className="btn btn-primary" onClick={action.onClick} style={{ marginTop: 16 }}>
          {action.label}
        </button>
      )}
    </div>
  )
}
