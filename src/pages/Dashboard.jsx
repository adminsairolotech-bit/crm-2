import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import styles from './Dashboard.module.css'

const stats = [
  { label: 'Total Customers', value: '1,284', icon: '👥', color: '#667eea' },
  { label: 'Active Leads', value: '342', icon: '🎯', color: '#f59e0b' },
  { label: 'Sales Today', value: '₹84,500', icon: '💰', color: '#10b981' },
  { label: 'Pending Tasks', value: '27', icon: '📋', color: '#ef4444' },
]

const recentActivities = [
  { name: 'Rahul Sharma', action: 'New lead added', time: '5 min ago', avatar: 'R' },
  { name: 'Priya Verma', action: 'Deal closed — ₹12,000', time: '23 min ago', avatar: 'P' },
  { name: 'Amir Khan', action: 'Follow-up scheduled', time: '1 hr ago', avatar: 'A' },
  { name: 'Sunita Patel', action: 'Customer call completed', time: '2 hr ago', avatar: 'S' },
]

const statusColors = {
  New: { bg: '#dbeafe', text: '#1d4ed8' },
  Contacted: { bg: '#fef3c7', text: '#92400e' },
  Qualified: { bg: '#d1fae5', text: '#065f46' },
  'Follow Up': { bg: '#ffedd5', text: '#c2410c' },
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [gmailLeads, setGmailLeads] = useState([])
  const [leadsLoading, setLeadsLoading] = useState(true)
  const [leadsError, setLeadsError] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)

  const [gmailInfo, setGmailInfo] = useState(null)

  const fetchLeads = async () => {
    setLeadsLoading(true)
    setLeadsError(null)
    try {
      const res = await fetch('/api/gmail-leads')
      const data = await res.json()
      if (data.success) {
        setGmailLeads(data.leads || [])
        setGmailInfo(data)
        setLastRefresh(new Date().toLocaleTimeString('en-IN'))
      } else {
        setLeadsError(data.error)
      }
    } catch (e) {
      setLeadsError('Gmail se connect nahi ho saka.')
    }
    setLeadsLoading(false)
  }

  useEffect(() => {
    fetchLeads()
    const interval = setInterval(fetchLeads, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logoIcon}>CRM</div>
          <span className={styles.betaBadge}>BETA</span>
        </div>
        <div className={styles.headerRight}>
          <Link to="/inquiry" target="_blank" className={styles.inquiryLink}>📋 Inquiry Form</Link>
          <div className={styles.firebaseChip}>🔥 Firebase Active</div>
          <div className={styles.userInfo}>
            <span className={styles.avatar}>{user?.name?.charAt(0)}</span>
            <div>
              <p className={styles.userName}>{user?.name}</p>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.welcomeBar}>
          <h1>Namaste, {user?.name} 👋</h1>
          <p>Aaj ka overview dekhein</p>
        </div>

        <div className={styles.statsGrid}>
          {stats.map((s) => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: s.color + '20', color: s.color }}>
                {s.icon}
              </div>
              <div>
                <p className={styles.statValue}>{s.value}</p>
                <p className={styles.statLabel}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Gmail Leads Section */}
        <div className={styles.googleLeadsSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleRow}>
              <span>📧</span>
              <h2 className={styles.sectionTitle}>Gmail Leads</h2>
              {!leadsLoading && !leadsError && (
                <span className={styles.liveChip}>● LIVE</span>
              )}
            </div>
            <div className={styles.headerActions}>
              {lastRefresh && (
                <span className={styles.lastRefresh}>Updated: {lastRefresh}</span>
              )}
              <button
                className={styles.refreshBtn}
                onClick={fetchLeads}
                disabled={leadsLoading}
              >
                {leadsLoading ? '⏳' : '🔄'} Refresh
              </button>
            </div>
          </div>

          {leadsLoading && (
            <div className={styles.loadingBox}>
              <div className={styles.spinner}></div>
              <p>Gmail se leads fetch ho rahi hain...</p>
            </div>
          )}

          {leadsError && !leadsLoading && (
            <div className={styles.errorBox}>
              <span>⚠️</span>
              <div>
                <p className={styles.errorTitle}>Gmail leads nahi aa saki</p>
                <p className={styles.errorMsg}>{leadsError}</p>
              </div>
              <button className={styles.retryBtn} onClick={fetchLeads}>Retry</button>
            </div>
          )}

          {!leadsLoading && !leadsError && gmailInfo?.connected && (
            <div className={styles.gmailConnectedPanel}>
              <div className={styles.gmailConnectedTop}>
                <div className={styles.gmailConnectedIcon}>📬</div>
                <div className={styles.gmailConnectedInfo}>
                  <p className={styles.gmailConnectedTitle}>Gmail Successfully Connected!</p>
                  <p className={styles.gmailConnectedSub}>
                    inquirysairolotech@gmail.com &amp; admin.sairolotech@gmail.com — Active
                  </p>
                </div>
                <div className={styles.gmailConnectedBadge}>✓ Live</div>
              </div>
              <div className={styles.gmailStatsRow}>
                <div className={styles.gmailStat}>
                  <span className={styles.gmailStatVal}>{gmailInfo.inbox?.total?.toLocaleString('en-IN') || '—'}</span>
                  <span className={styles.gmailStatLabel}>Total Emails</span>
                </div>
                <div className={styles.gmailStatDivider}></div>
                <div className={styles.gmailStat}>
                  <span className={styles.gmailStatVal} style={{ color: '#ef4444' }}>{gmailInfo.inbox?.unread?.toLocaleString('en-IN') || '—'}</span>
                  <span className={styles.gmailStatLabel}>Unread</span>
                </div>
                <div className={styles.gmailStatDivider}></div>
                <div className={styles.gmailStat}>
                  <span className={styles.gmailStatVal}>{gmailInfo.labels?.filter(l => !l.id.startsWith('CATEGORY_') && !['CHAT','TRASH','DRAFT','SPAM','IMPORTANT','STARRED','UNREAD'].includes(l.id)).length || '—'}</span>
                  <span className={styles.gmailStatLabel}>Labels</span>
                </div>
              </div>
              <div className={styles.gmailUpgradeNotice}>
                <span>🔑</span>
                <div>
                  <p className={styles.gmailUpgradeTitle}>Lead Scanning ke liye gmail.readonly permission chahiye</p>
                  <p className={styles.gmailUpgradeSub}>Abhi labels aur inbox stats access ho rahe hain. Full email scan ke liye Gmail app permissions upgrade karein.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.twoCol}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Recent Activity</h2>
            <div className={styles.activityList}>
              {recentActivities.map((a, i) => (
                <div key={i} className={styles.activityItem}>
                  <div className={styles.activityAvatar}>{a.avatar}</div>
                  <div className={styles.activityInfo}>
                    <p className={styles.activityName}>{a.name}</p>
                    <p className={styles.activityAction}>{a.action}</p>
                  </div>
                  <span className={styles.activityTime}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>🔥 System Status</h2>
            <div className={styles.firebaseStatus}>
              <div className={styles.fbItem}>
                <span className={styles.fbDot} style={{ background: '#10b981' }}></span>
                <span>Firebase Auth</span>
                <span className={styles.fbActive}>Active ✓</span>
              </div>
              <div className={styles.fbItem}>
                <span className={styles.fbDot} style={{ background: '#10b981' }}></span>
                <span>Firebase Password Reset</span>
                <span className={styles.fbActive}>Active ✓</span>
              </div>
              <div className={styles.fbItem}>
                <span className={styles.fbDot} style={{ background: leadsError ? '#ef4444' : gmailInfo?.connected ? '#10b981' : '#f59e0b' }}></span>
                <span>Gmail Connection</span>
                <span className={leadsError ? styles.fbError : gmailInfo?.connected ? styles.fbActive : styles.fbPending}>
                  {leadsError ? 'Error ✗' : gmailInfo?.connected ? `Connected ✓` : 'Pending'}
                </span>
              </div>
              <div className={styles.fbItem}>
                <span className={styles.fbDot} style={{ background: gmailInfo?.inbox ? '#10b981' : '#9ca3af' }}></span>
                <span>Inbox Stats</span>
                <span className={gmailInfo?.inbox ? styles.fbActive : styles.fbPending}>
                  {gmailInfo?.inbox ? `${gmailInfo.inbox.unread?.toLocaleString('en-IN')} unread` : '—'}
                </span>
              </div>
              <div className={styles.fbItem}>
                <span className={styles.fbDot} style={{ background: '#10b981' }}></span>
                <span>Auto Refresh (5 min)</span>
                <span className={styles.fbActive}>Active ✓</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
