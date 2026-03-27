import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isFirebaseConfigured } from '../firebase'
import styles from './Login.module.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Email aur Password zaroori hai.')
      return
    }
    setLoading(true)
    const result = await login(email.trim(), password)
    setLoading(false)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>CRM</div>
          <span className={styles.betaBadge}>BETA</span>
        </div>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Apne account mein login karein</p>

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
          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <div className={styles.passWrapper}>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Apna Password likhein"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass((v) => !v)}
                aria-label="Toggle password"
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && <div className={styles.error}>⚠️ {error}</div>}

          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? 'Login ho raha hai...' : 'Login Karein'}
          </button>
        </form>

        <div className={styles.forgotLink}>
          <Link to="/forgot-password">🔑 Password bhul gaye?</Link>
        </div>

        {isFirebaseConfigured ? (
          <div className={styles.firebaseNote}>
            <span className={styles.firebaseIcon}>🔥</span>
            <span>Firebase Authentication Active</span>
          </div>
        ) : (
          <div className={styles.demoInfo}>
            <p><strong>Demo Login Credentials:</strong></p>
            <button
              type="button"
              className={styles.demoFill}
              onClick={() => { setEmail('admin.sairolotech@gmail.com'); setPassword('v9667146889V') }}
            >
              👤 admin.sairolotech@gmail.com / v9667146889V
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
