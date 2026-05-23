import styles from './StatCard.module.css'

export default function StatCard({ icon: Icon, label, value, color = 'var(--primary)' }) {
  return (
    <div className={styles.card} style={{ '--accent': color }}>
      <div className={styles.iconWrap}>
        <Icon size={22} />
      </div>
      <div className={styles.info}>
        <span className={styles.value}>{value ?? '—'}</span>
        <span className={styles.label}>{label}</span>
      </div>
    </div>
  )
}
