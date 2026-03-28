import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
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

const quickLinks = [
  { to: '/customers', icon: '👥', label: 'Customers', color: '#667eea' },
  { to: '/leads', icon: '🎯', label: 'Leads', color: '#f59e0b' },
  { to: '/machine-report', icon: '⚙️', label: 'Machine Testing', color: '#10b981' },
  { to: '/plc-errors', icon: '🔴', label: 'PLC Errors', color: '#ef4444' },
  { to: '/pnmg-loan', icon: '💳', label: 'PNMG Loan', color: '#8b5cf6' },
  { to: '/ai-questions', icon: '🤖', label: 'AI Questions', color: '#ec4899' },
  { to: '/buddy-bot', icon: '💬', label: 'Buddy Bot', color: '#06b6d4' },
  { to: '/inquiry', icon: '📋', label: 'Inquiry Form', color: '#f97316', external: true },
]

export default function Dashboard() {
  const { user } = useAuth()
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

  return (
    <Layout>
      <div className={styles.main}>
        <div className={styles.welcomeBar}>
          <h1>Namaste, {user?.name} 👋</h1>
          <p>SAI RoloTech CRM — Aaj ka overview</p>
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

        <div className={styles.quickLinksSection}>
          <h2 className={styles.sectionTitle}>Quick Access</h2>
          <div className={styles.quickGrid}>
            {quickLinks.map((ql) =>
              ql.external ? (
                <a key={ql.to} href={ql.to} target="_blank" rel="noreferrer" className={styles.quickCard}>
                  <div className={styles.quickIcon} style={{ background: ql.color + '20', color: ql.color }}>{ql.icon}</div>
                  <span className={styles.quickLabel}>{ql.label}</span>
                </a>
              ) : (
                <Link key={ql.to} to={ql.to} className={styles.quickCard}>
                  <div className={styles.quickIcon} style={{ background: ql.color + '20', color: ql.color }}>{ql.icon}</div>
                  <span className={styles.quickLabel}>{ql.label}</span>
                </Link>
              )
            )}
          </div>
        </div>

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
              {lastRefresh && <span className={styles.lastRefresh}>Updated: {lastRefresh}</span>}
              <button className={styles.refreshBtn} onClick={fetchLeads} disabled={leadsLoading}>
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
                  <p className={styles.gmailConnectedSub}>inquirysairolotech@gmail.com &amp; admin.sairolotech@gmail.com — Active</p>
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
            </div>
          )}

          {!leadsLoading && !leadsError && !gmailInfo?.connected && (
            <div className={styles.emptyBox}>
              <span>📭</span>
              <p>Gmail connected nahi hai. Replit Gmail connector se connect karein.</p>
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
              {[
                ['Firebase Auth', true],
                ['Firebase Password Reset', true],
                ['Gmail Connection', !leadsError && gmailInfo?.connected],
                ['Auto Refresh (5 min)', true],
                ['Machine Testing', true],
                ['PLC Error DB', true],
                ['PNMG Loan Module', true],
                ['Buddy Chatbot', true],
              ].map(([label, active]) => (
                <div key={label} className={styles.fbItem}>
                  <span className={styles.fbDot} style={{ background: active ? '#10b981' : '#f59e0b' }}></span>
                  <span>{label}</span>
                  <span className={active ? styles.fbActive : styles.fbPending}>{active ? 'Active ✓' : 'Pending'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
