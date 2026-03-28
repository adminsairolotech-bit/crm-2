import { useState } from 'react'
import Layout from '../components/Layout'
import styles from './Leads.module.css'

const INITIAL_LEADS = [
  { id: 1, name: 'Manoj Tiwari', phone: '9876501234', source: 'Website', product: 'PLC Panel', status: 'New', notes: 'Interested in 3-phase panel', date: '2024-04-01' },
  { id: 2, name: 'Deepika Rao', phone: '8765432109', source: 'WhatsApp', product: 'HMI', status: 'Contacted', notes: 'Follow up next week', date: '2024-04-03' },
  { id: 3, name: 'Ravi Kulkarni', phone: '7654321098', source: 'Referral', product: 'SCADA', status: 'Qualified', notes: 'Budget: 2 lakhs', date: '2024-04-05' },
  { id: 4, name: 'Neha Joshi', phone: '6543210987', source: 'Email', product: 'VFD', status: 'Follow Up', notes: 'Demo requested', date: '2024-04-07' },
]

const statusColors = {
  New: { bg: '#dbeafe', text: '#1d4ed8' },
  Contacted: { bg: '#fef3c7', text: '#92400e' },
  Qualified: { bg: '#d1fae5', text: '#065f46' },
  'Follow Up': { bg: '#ffedd5', text: '#c2410c' },
  Closed: { bg: '#f3f4f6', text: '#6b7280' },
}

export default function Leads() {
  const [leads, setLeads] = useState(INITIAL_LEADS)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', source: 'Website', product: '', status: 'New', notes: '' })

  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.product.toLowerCase().includes(search.toLowerCase()) ||
    l.source.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = () => {
    if (!form.name || !form.phone) return
    setLeads([...leads, { ...form, id: Date.now(), date: new Date().toISOString().slice(0, 10) }])
    setForm({ name: '', phone: '', source: 'Website', product: '', status: 'New', notes: '' })
    setShowForm(false)
  }

  const updateStatus = (id, status) => setLeads(leads.map(l => l.id === id ? { ...l, status } : l))
  const deleteLead = (id) => setLeads(leads.filter(l => l.id !== id))

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <span>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..." className={styles.searchInput} />
          </div>
          <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>+ Add Lead</button>
        </div>

        {showForm && (
          <div className={styles.formCard}>
            <h3 className={styles.formTitle}>New Lead</h3>
            <div className={styles.formGrid}>
              {[['name','Name *'],['phone','Phone *'],['product','Product/Interest'],['notes','Notes']].map(([key,label]) => (
                <div key={key} className={styles.formGroup}>
                  <label>{label}</label>
                  <input value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} className={styles.formInput} />
                </div>
              ))}
              <div className={styles.formGroup}>
                <label>Source</label>
                <select value={form.source} onChange={e => setForm({...form,source:e.target.value})} className={styles.formInput}>
                  {['Website','WhatsApp','Email','Phone','Referral','Exhibition'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({...form,status:e.target.value})} className={styles.formInput}>
                  {Object.keys(statusColors).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.formActions}>
              <button className={styles.saveBtn} onClick={handleAdd}>Save Lead</button>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className={styles.kanban}>
          {Object.keys(statusColors).map(status => (
            <div key={status} className={styles.kanbanCol}>
              <div className={styles.kanbanHeader} style={{ background: statusColors[status].bg, color: statusColors[status].text }}>
                {status} <span className={styles.kanbanCount}>{leads.filter(l=>l.status===status).length}</span>
              </div>
              {leads.filter(l => l.status === status && l.name.toLowerCase().includes(search.toLowerCase())).map(lead => (
                <div key={lead.id} className={styles.leadCard}>
                  <div className={styles.leadName}>{lead.name}</div>
                  <div className={styles.leadPhone}>📞 {lead.phone}</div>
                  <div className={styles.leadProduct}>🏷️ {lead.product}</div>
                  <div className={styles.leadSource}>📌 {lead.source}</div>
                  {lead.notes && <div className={styles.leadNotes}>{lead.notes}</div>}
                  <div className={styles.leadActions}>
                    <select value={lead.status} onChange={e => updateStatus(lead.id, e.target.value)} className={styles.statusSelect}>
                      {Object.keys(statusColors).map(s => <option key={s}>{s}</option>)}
                    </select>
                    <button className={styles.delBtn} onClick={() => deleteLead(lead.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
