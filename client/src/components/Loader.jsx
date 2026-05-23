import styles from './Loader.module.css'

export default function Loader({ size = 40, fullPage = true }) {
  const spinner = (
    <div
      className={styles.spinner}
      style={{ width: size, height: size }}
    />
  )

  if (fullPage) {
    return <div className={styles.fullPage}>{spinner}</div>
  }

  return spinner
}
