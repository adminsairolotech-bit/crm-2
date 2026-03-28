import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, DEMO_USERS } from '../context/AuthContext'
import { isFirebaseConfigured } from '../firebase'
import styles from './Login.module.css'

const roleIcons = { Admin: '👑', Sales: '🎯', Service: '🔧', Manager: '📊', Technician: '⚙️', Finance: '💳', User: '👤' }
const roleColors = { Admin: '#667eea', Sales: '#f59e0b', Service: '#10b981', Manager: '#8b5cf6', Technician: '#06b6d4', Finance: '#ec4899', User: '#6b7280' }

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

  const quickLogin = (u) => {
    setEmail(u.email)
    setPassword(u.password)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>CRM</div>
          <span className={styles.betaBadge}>BETA</span>
        </div>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>SAI RoloTech CRM — Login karein</p>

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

          {error && <div className={styles.error}>{error}</div>}

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
          <div className={styles.demoSection}>
            <p className={styles.demoTitle}>Quick Login — Select Role:</p>
            <div className={styles.demoGrid}>
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  className={styles.demoCard}
                  onClick={() => quickLogin(u)}
                  style={{ borderColor: roleColors[u.role] + '44' }}
                >
                  <span className={styles.demoIcon} style={{ background: roleColors[u.role] + '20', color: roleColors[u.role] }}>
                    {roleIcons[u.role]}
                  </span>
                  <div className={styles.demoInfo}>
                    <span className={styles.demoRole} style={{ color: roleColors[u.role] }}>{u.role}</span>
                    <span className={styles.demoEmail}>{u.email.split('@')[0]}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
