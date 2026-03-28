import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Layout.module.css'

const navItems = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/customers', icon: '👥', label: 'Customers' },
  { path: '/leads', icon: '🎯', label: 'Leads' },
  { path: '/machine-report', icon: '⚙️', label: 'Machine Testing' },
  { path: '/plc-errors', icon: '🔴', label: 'PLC Error Codes' },
  { path: '/pnmg-loan', icon: '💳', label: 'PNMG Loan' },
  { path: '/ai-questions', icon: '🤖', label: 'AI Question Maker' },
  { path: '/buddy-bot', icon: '💬', label: 'Buddy Chatbot' },
  { path: '/inquiry', icon: '📋', label: 'Inquiry Form', external: true },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className={styles.root}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>CRM</div>
            {!collapsed && (
              <div className={styles.brandText}>
                <span className={styles.brandName}>SAI RoloTech</span>
                <span className={styles.betaBadge}>BETA</span>
              </div>
            )}
          </div>
          <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) =>
            item.external ? (
              <a
                key={item.path}
                href={item.path}
                target="_blank"
                rel="noreferrer"
                className={styles.navItem}
                title={item.label}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              </a>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
                title={item.label}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              </Link>
            )
          )}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>{user?.name?.charAt(0) || 'U'}</div>
            {!collapsed && (
              <div className={styles.userInfo}>
                <p className={styles.userName}>{user?.name}</p>
                <p className={styles.userRole}>{user?.role || 'User'}</p>
              </div>
            )}
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
            {collapsed ? '🚪' : '🚪 Logout'}
          </button>
        </div>
      </aside>

      <main className={styles.content}>
        <div className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <span className={styles.pageTitle}>
              {navItems.find((n) => n.path === location.pathname)?.label || 'CRM'}
            </span>
          </div>
          <div className={styles.topbarRight}>
            <div className={styles.firebaseChip}>🔥 Firebase Active</div>
            <div className={styles.userBadge}>
              <span className={styles.tAvatar}>{user?.name?.charAt(0) || 'U'}</span>
              <span className={styles.tName}>{user?.name}</span>
            </div>
          </div>
        </div>
        <div className={styles.pageArea}>{children}</div>
      </main>
    </div>
  )
}
