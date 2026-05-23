import { Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/formatters'
import styles from './Header.module.css'

export default function Header({ title, onMenuToggle }) {
  const { user } = useAuth()

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuToggle}>
          <Menu size={20} />
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>
      <div className={styles.right}>
        <div className={styles.userChip}>
          <div className={styles.avatar}>{getInitials(user?.name)}</div>
          <span className={styles.name}>{user?.name}</span>
        </div>
      </div>
    </header>
  )
}
