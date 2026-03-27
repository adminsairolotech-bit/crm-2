import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './ForgotPassword.module.css'

export default function ForgotPassword() {
  const { recoverPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus(null)
    if (!email.trim()) {
      setStatus({ type: 'error', message: 'Email likhna zaroori hai.' })
      return
    }
    setLoading(true)
    const result = await recoverPassword(email.trim())
    setLoading(false)
    if (result.success) {
      setStatus({ type: 'success', message: result.message })
    } else {
      setStatus({ type: 'error', message: result.error })
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>CRM</div>
          <span className={styles.betaBadge}>BETA</span>
        </div>
        <h1 className={styles.title}>Password Reset Karein</h1>
        <p className={styles.subtitle}>
          Apna Email likhein — Firebase aapke inbox mein reset link bhejega
        </p>

        {status?.type === 'success' ? (
          <div className={styles.successBox}>
            <div className={styles.successIcon}>✅</div>
            <p className={styles.successMsg}>{status.message}</p>
            <p className={styles.successHint}>Email nahi mila? Spam folder bhi check karein.</p>
            <Link to="/login" className={styles.backBtn}>
              Login par wapas jaayein
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="aapka@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {status?.type === 'error' && (
              <div className={styles.error}>⚠️ {status.message}</div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? '🔥 Bhej raha hai...' : '🔑 Reset Link Bhejein'}
            </button>

            <Link to="/login" className={styles.backLink}>
              ← Login par wapas jaayein
            </Link>
          </form>
        )}

        <div className={styles.firebaseNote}>
          <span>🔥 Firebase Password Reset Active</span>
        </div>
      </div>
    </div>
  )
}
