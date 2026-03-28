import { useState } from 'react'
import Layout from '../components/Layout'
import styles from './Customers.module.css'

const INITIAL = [
  { id: 1, name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@example.com', city: 'Pune', status: 'Active', product: 'PLC Panel', date: '2024-01-10' },
  { id: 2, name: 'Priya Verma', phone: '9123456780', email: 'priya@example.com', city: 'Mumbai', status: 'Active', product: 'HMI System', date: '2024-02-15' },
  { id: 3, name: 'Amir Khan', phone: '9988776655', email: 'amir@example.com', city: 'Nagpur', status: 'Inactive', product: 'VFD Drive', date: '2024-03-05' },
  { id: 4, name: 'Sunita Patel', phone: '8877665544', email: 'sunita@example.com', city: 'Nashik', status: 'Active', product: 'SCADA System', date: '2024-03-20' },
  { id: 5, name: 'Vikram Singh', phone: '7766554433', email: 'vikram@example.com', city: 'Aurangabad', status: 'Pending', product: 'Servo Motor', date: '2024-04-01' },
]

export default function Customers() {
  const [customers, setCustomers] = useState(INITIAL)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', status: 'Active', product: '' })

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase()) ||
    c.product.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = () => {
    if (!form.name || !form.phone) return
    setCustomers([...customers, { ...form, id: Date.now(), date: new Date().toISOString().slice(0, 10) }])
    setForm({ name: '', phone: '', email: '', city: '', status: 'Active', product: '' })
    setShowForm(false)
  }

  const handleDelete = (id) => setCustomers(customers.filter(c => c.id !== id))

  const statusColor = { Active: '#10b981', Inactive: '#6b7280', Pending: '#f59e0b' }

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <span>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className={styles.searchInput} />
          </div>
          <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>+ Add Customer</button>
        </div>

        {showForm && (
          <div className={styles.formCard}>
            <h3 className={styles.formTitle}>New Customer</h3>
            <div className={styles.formGrid}>
              {[['name','Name *'],['phone','Phone *'],['email','Email'],['city','City'],['product','Product/Service']].map(([key, label]) => (
                <div key={key} className={styles.formGroup}>
                  <label>{label}</label>
                  <input value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} className={styles.formInput} />
                </div>
              ))}
              <div className={styles.formGroup}>
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({...form,status:e.target.value})} className={styles.formInput}>
                  <option>Active</option><option>Inactive</option><option>Pending</option>
                </select>
              </div>
            </div>
            <div className={styles.formActions}>
              <button className={styles.saveBtn} onClick={handleAdd}>Save Customer</button>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className={styles.summary}>
          <div className={styles.summaryCard}><span className={styles.sNum}>{customers.length}</span><span className={styles.sLab}>Total</span></div>
          <div className={styles.summaryCard}><span className={styles.sNum} style={{color:'#10b981'}}>{customers.filter(c=>c.status==='Active').length}</span><span className={styles.sLab}>Active</span></div>
          <div className={styles.summaryCard}><span className={styles.sNum} style={{color:'#f59e0b'}}>{customers.filter(c=>c.status==='Pending').length}</span><span className={styles.sLab}>Pending</span></div>
          <div className={styles.summaryCard}><span className={styles.sNum} style={{color:'#6b7280'}}>{customers.filter(c=>c.status==='Inactive').length}</span><span className={styles.sLab}>Inactive</span></div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>{['Name','Phone','Email','City','Product','Status','Date','Action'].map(h=><th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td><div className={styles.nameCell}><div className={styles.avatar}>{c.name.charAt(0)}</div>{c.name}</div></td>
                  <td>{c.phone}</td>
                  <td>{c.email}</td>
                  <td>{c.city}</td>
                  <td>{c.product}</td>
                  <td><span className={styles.statusBadge} style={{background: statusColor[c.status]+'20', color: statusColor[c.status]}}>{c.status}</span></td>
                  <td>{c.date}</td>
                  <td><button className={styles.delBtn} onClick={() => handleDelete(c.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className={styles.empty}>No customers found.</p>}
        </div>
      </div>
    </Layout>
  )
}
