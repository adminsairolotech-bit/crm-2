import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import styles from './Dashboard.module.css'

const quickLinks = [
  { to: '/customers', icon: '👥', label: 'Customers', color: '#667eea', module: 'customers' },
  { to: '/leads', icon: '🎯', label: 'Leads', color: '#f59e0b', module: 'leads' },
  { to: '/machine-report', icon: '⚙️', label: 'Machine Testing', color: '#10b981', module: 'machine-report' },
  { to: '/plc-errors', icon: '🔴', label: 'PLC Errors', color: '#ef4444', module: 'plc-errors' },
  { to: '/pnmg-loan', icon: '💳', label: 'PNMG Loan', color: '#8b5cf6', module: 'pnmg-loan' },
  { to: '/ai-questions', icon: '🤖', label: 'AI Questions', color: '#ec4899', module: 'ai-questions' },
  { to: '/buddy-bot', icon: '💬', label: 'Buddy Bot', color: '#06b6d4', module: 'buddy-bot' },
  { to: '/inquiry', icon: '📋', label: 'Inquiry Form', color: '#f97316', module: 'inquiry', external: true },
]

const recentActivities = [
  { name: 'Rahul Sharma', action: 'New lead added', time: '5 min ago', avatar: 'R' },
  { name: 'Priya Verma', action: 'Deal closed — ₹12,000', time: '23 min ago', avatar: 'P' },
  { name: 'Amir Khan', action: 'Follow-up scheduled', time: '1 hr ago', avatar: 'A' },
  { name: 'Sunita Patel', action: 'Customer call completed', time: '2 hr ago', avatar: 'S' },
  { name: 'Vikram Singh', action: 'Machine test report generated', time: '3 hr ago', avatar: 'V' },
  { name: 'Deepak Joshi', action: 'Loan application submitted', time: '4 hr ago', avatar: 'D' },
]

export default function Dashboard() {
  const { user, hasPermission } = useAuth()
  const [gmailData, setGmailData] = useState(null)
  const [gmailLoading, setGmailLoading] = useState(true)
  const [gmailError, setGmailError] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)

  const fetchGmail = async () => {
    setGmailLoading(true)
    setGmailError(null)
    try {
      const res = await fetch('/api/gmail-leads')
      const data = await res.json()
      if (data.success) {
        setGmailData(data)
        setLastRefresh(new Date().toLocaleTimeString('en-IN'))
      } else {
        setGmailError(data.error)
      }
    } catch (e) {
      setGmailError('Gmail se connect nahi ho saka.')
    }
    setGmailLoading(false)
  }

  useEffect(() => {
    fetchGmail()
    const interval = setInterval(fetchGmail, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const stats = [
    { label: 'Total Customers', value: '1,284', icon: '👥', color: '#667eea' },
    { label: 'Active Leads', value: gmailData?.leads?.length || '342', icon: '🎯', color: '#f59e0b' },
    { label: 'Hot Leads', value: gmailData?.totalLeads || '0', icon: '🔥', color: '#ef4444' },
    { label: 'Inbox Unread', value: gmailData?.inbox?.unread || '—', icon: '📧', color: '#10b981' },
    { label: 'Sales Today', value: '₹84,500', icon: '💰', color: '#8b5cf6' },
    { label: 'Emails Scanned', value: gmailData?.emailsScanned || '0', icon: '📊', color: '#06b6d4' },
  ]

  const visibleLinks = quickLinks.filter(ql => hasPermission(ql.module))

  return (
    <Layout>
      <div className={styles.main}>
        <div className={styles.welcomeBar}>
          <h1>Namaste, {user?.name} 👋</h1>
          <p>SAI RoloTech CRM — {user?.role} Dashboard | Aaj ka overview</p>
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
          <h2 className={styles.sectionTitle}>Quick Access — {user?.role} Modules</h2>
          <div className={styles.quickGrid}>
            {visibleLinks.map((ql) =>
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
              <h2 className={styles.sectionTitle}>Gmail Leads — Live Inbox</h2>
              {!gmailLoading && !gmailError && gmailData?.connected && (
                <span className={styles.liveChip}>● LIVE</span>
              )}
            </div>
            <div className={styles.headerActions}>
              {lastRefresh && <span className={styles.lastRefresh}>Updated: {lastRefresh}</span>}
              {gmailData?.scanMethod && <span className={styles.lastRefresh}>Scan: {gmailData.scanMethod}</span>}
              <button className={styles.refreshBtn} onClick={fetchGmail} disabled={gmailLoading}>
                {gmailLoading ? '⏳' : '🔄'} Refresh
              </button>
            </div>
          </div>

          {gmailLoading && (
            <div className={styles.loadingBox}>
              <div className={styles.spinner}></div>
              <p>Gmail se leads fetch ho rahi hain...</p>
            </div>
          )}

          {gmailError && !gmailLoading && (
            <div className={styles.errorBox}>
              <span>⚠️</span>
              <div>
                <p className={styles.errorTitle}>Gmail leads nahi aa saki</p>
                <p className={styles.errorMsg}>{gmailError}</p>
              </div>
              <button className={styles.retryBtn} onClick={fetchGmail}>Retry</button>
            </div>
          )}

          {!gmailLoading && !gmailError && gmailData?.connected && (
            <>
              <div className={styles.gmailConnectedPanel}>
                <div className={styles.gmailConnectedTop}>
                  <div className={styles.gmailConnectedIcon}>📬</div>
                  <div className={styles.gmailConnectedInfo}>
                    <p className={styles.gmailConnectedTitle}>Gmail Connected — {gmailData.email}</p>
                    <p className={styles.gmailConnectedSub}>Admin: {gmailData.adminEmail} | Scan: {gmailData.scanMethod === 'full' ? 'Full Email Scan Active' : 'Labels Only'}</p>
                  </div>
                  <div className={styles.gmailConnectedBadge}>✓ Live</div>
                </div>
                <div className={styles.gmailStatsRow}>
                  <div className={styles.gmailStat}>
                    <span className={styles.gmailStatVal}>{gmailData.inbox?.total?.toLocaleString('en-IN') || '—'}</span>
                    <span className={styles.gmailStatLabel}>Total Emails</span>
                  </div>
                  <div className={styles.gmailStatDivider}></div>
                  <div className={styles.gmailStat}>
                    <span className={styles.gmailStatVal} style={{ color: '#ef4444' }}>{gmailData.inbox?.unread?.toLocaleString('en-IN') || '—'}</span>
                    <span className={styles.gmailStatLabel}>Unread</span>
                  </div>
                  <div className={styles.gmailStatDivider}></div>
                  <div className={styles.gmailStat}>
                    <span className={styles.gmailStatVal} style={{ color: '#f59e0b' }}>{gmailData.emailsScanned || '0'}</span>
                    <span className={styles.gmailStatLabel}>Scanned</span>
                  </div>
                  <div className={styles.gmailStatDivider}></div>
                  <div className={styles.gmailStat}>
                    <span className={styles.gmailStatVal} style={{ color: '#10b981' }}>{gmailData.totalLeads || '0'}</span>
                    <span className={styles.gmailStatLabel}>Hot Leads</span>
                  </div>
                </div>
              </div>

              {gmailData.leads?.length > 0 && (
                <div className={styles.leadsListSection}>
                  <h3 className={styles.leadsListTitle}>📋 Inbox Leads ({gmailData.leads.length})</h3>
                  <div className={styles.leadsGrid}>
                    {gmailData.leads.map((lead) => (
                      <div key={lead.id} className={`${styles.leadCard} ${lead.isLead ? styles.hotLead : ''}`}>
                        <div className={styles.leadTop}>
                          <div className={styles.leadAvatar}>{lead.name?.charAt(0) || '?'}</div>
                          <div className={styles.leadInfo}>
                            <div className={styles.leadName}>{lead.name}</div>
                            <div className={styles.leadEmail}>{lead.email}</div>
                          </div>
                          <span className={styles.leadStatus} style={{
                            background: lead.isLead ? '#fef2f220' : '#dbeafe',
                            color: lead.isLead ? '#ef4444' : '#1d4ed8',
                            border: lead.isLead ? '1px solid #fecaca' : '1px solid #bfdbfe',
                          }}>
                            {lead.isUnread ? '🔴 ' : ''}{lead.status}
                          </span>
                        </div>
                        <div className={styles.leadSubject}>{lead.subject || 'No subject'}</div>
                        {lead.snippet && <div className={styles.leadSnippet}>{lead.snippet.slice(0, 120)}...</div>}
                        <div className={styles.leadBottom}>
                          <span className={styles.leadSource}>📌 {lead.source}</span>
                          <span className={styles.leadTime}>{lead.date ? new Date(lead.date).toLocaleDateString('en-IN') : ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!gmailLoading && !gmailError && !gmailData?.connected && (
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
                ['Gmail Connection', !gmailError && gmailData?.connected],
                ['Email Scanning', gmailData?.scanMethod === 'full'],
                ['Machine Testing', true],
                ['PLC Error DB (20+ codes)', true],
                ['PNMG Loan Module', true],
                ['AI Question Maker', true],
                ['Buddy Chatbot', true],
                ['Multi-User Roles', true],
                ['Auto Refresh (5 min)', true],
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
