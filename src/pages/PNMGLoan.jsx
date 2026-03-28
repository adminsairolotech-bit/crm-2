import { useState } from 'react'
import Layout from '../components/Layout'
import styles from './PNMGLoan.module.css'

const LOAN_SCHEMES = [
  { id: 'pl', name: 'Personal Loan', rate: 10.5, maxAmt: 500000, maxTenure: 60 },
  { id: 'bl', name: 'Business Loan', rate: 12, maxAmt: 5000000, maxTenure: 84 },
  { id: 'ml', name: 'Machinery Loan', rate: 9, maxAmt: 2000000, maxTenure: 84 },
  { id: 'hl', name: 'Home Loan', rate: 8.5, maxAmt: 10000000, maxTenure: 240 },
  { id: 'el', name: 'Education Loan', rate: 7.5, maxAmt: 1500000, maxTenure: 120 },
]

const INITIAL_APPLICATIONS = [
  { id: 1, name: 'Suresh Kumar', phone: '9876543210', scheme: 'Business Loan', amount: 500000, tenure: 36, status: 'Approved', date: '2024-03-10', emi: 16607 },
  { id: 2, name: 'Anita Sharma', phone: '8765432109', scheme: 'Machinery Loan', amount: 200000, tenure: 24, status: 'Pending', date: '2024-03-25', emi: 9174 },
  { id: 3, name: 'Ramesh Patel', phone: '7654321098', scheme: 'Personal Loan', amount: 100000, tenure: 12, status: 'Under Review', date: '2024-04-01', emi: 8792 },
]

function calcEMI(principal, annualRate, months) {
  if (!principal || !annualRate || !months) return 0
  const r = annualRate / 12 / 100
  return Math.round(principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1))
}

const statusColors = { Approved: '#10b981', Pending: '#f59e0b', 'Under Review': '#3b82f6', Rejected: '#ef4444' }

export default function PNMGLoan() {
  const [tab, setTab] = useState('calculator')
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS)
  const [scheme, setScheme] = useState(LOAN_SCHEMES[0])
  const [amount, setAmount] = useState(100000)
  const [tenure, setTenure] = useState(12)
  const [form, setForm] = useState({ name:'', phone:'', email:'', scheme:'Personal Loan', amount:'', tenure:'', income:'', purpose:'' })

  const emi = calcEMI(amount, scheme.rate, tenure)
  const totalPayment = emi * tenure
  const totalInterest = totalPayment - amount

  const handleApply = () => {
    if (!form.name || !form.phone || !form.amount) return alert('Name, Phone aur Amount bharna zaroori hai!')
    const s = LOAN_SCHEMES.find(l => l.name === form.scheme)
    const e = calcEMI(Number(form.amount), s?.rate || 10.5, Number(form.tenure) || 12)
    setApplications(prev => [{
      id: Date.now(), name: form.name, phone: form.phone, scheme: form.scheme,
      amount: Number(form.amount), tenure: Number(form.tenure) || 12,
      status: 'Pending', date: new Date().toISOString().slice(0, 10), emi: e
    }, ...prev])
    setForm({ name:'',phone:'',email:'',scheme:'Personal Loan',amount:'',tenure:'',income:'',purpose:'' })
    setTab('applications')
  }

  const updateStatus = (id, status) => setApplications(apps => apps.map(a => a.id === id ? {...a, status} : a))

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>💳 PNMG Loan Management</h2>
          <p className={styles.pageSub}>Loan calculator, applications & approvals — SAI RoloTech Finance</p>
        </div>

        <div className={styles.tabs}>
          {[['calculator','🧮 Calculator'],['apply','📝 Apply for Loan'],['applications','📂 Applications']].map(([key,label]) => (
            <button key={key} className={`${styles.tab} ${tab===key?styles.activeTab:''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {tab === 'calculator' && (
          <div className={styles.calcSection}>
            <div className={styles.calcLeft}>
              <div className={styles.formGroup}>
                <label>Loan Scheme</label>
                <select className={styles.formInput} value={scheme.id} onChange={e => setScheme(LOAN_SCHEMES.find(l=>l.id===e.target.value))}>
                  {LOAN_SCHEMES.map(l => <option key={l.id} value={l.id}>{l.name} ({l.rate}% p.a.)</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Loan Amount: <strong>₹{amount.toLocaleString('en-IN')}</strong></label>
                <input type="range" min={10000} max={scheme.maxAmt} step={10000} value={amount} onChange={e=>setAmount(Number(e.target.value))} className={styles.slider} />
                <div className={styles.sliderLabels}><span>₹10,000</span><span>₹{(scheme.maxAmt/100000).toFixed(0)}L</span></div>
              </div>
              <div className={styles.formGroup}>
                <label>Tenure: <strong>{tenure} months ({(tenure/12).toFixed(1)} years)</strong></label>
                <input type="range" min={6} max={scheme.maxTenure} step={6} value={tenure} onChange={e=>setTenure(Number(e.target.value))} className={styles.slider} />
                <div className={styles.sliderLabels}><span>6 mo</span><span>{scheme.maxTenure} mo</span></div>
              </div>
              <div className={styles.rateInfo}>Interest Rate: <strong>{scheme.rate}% per annum</strong></div>
            </div>
            <div className={styles.calcRight}>
              <div className={styles.emiCard}>
                <div className={styles.emiLabel}>Monthly EMI</div>
                <div className={styles.emiAmount}>₹{emi.toLocaleString('en-IN')}</div>
              </div>
              <div className={styles.breakdown}>
                <div className={styles.bRow}><span>Principal Amount</span><span>₹{amount.toLocaleString('en-IN')}</span></div>
                <div className={styles.bRow}><span>Total Interest</span><span className={styles.interestVal}>₹{totalInterest.toLocaleString('en-IN')}</span></div>
                <div className={styles.bRow} style={{fontWeight:700}}><span>Total Payment</span><span>₹{totalPayment.toLocaleString('en-IN')}</span></div>
              </div>
              <div className={styles.pie}>
                <div className={styles.pieBar}>
                  <div className={styles.piePrincipal} style={{width: `${Math.round(amount/totalPayment*100)}%`}}></div>
                  <div className={styles.pieInterest} style={{width: `${Math.round(totalInterest/totalPayment*100)}%`}}></div>
                </div>
                <div className={styles.pieLegend}>
                  <div><span className={styles.legendDot} style={{background:'#667eea'}}></span>Principal {Math.round(amount/totalPayment*100)}%</div>
                  <div><span className={styles.legendDot} style={{background:'#ef4444'}}></span>Interest {Math.round(totalInterest/totalPayment*100)}%</div>
                </div>
              </div>
              <button className={styles.applyBtn} onClick={()=>setTab('apply')}>Apply for This Loan →</button>
            </div>
          </div>
        )}

        {tab === 'apply' && (
          <div className={styles.applySection}>
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>Loan Application Form</h3>
              <div className={styles.formGrid}>
                {[['name','Full Name *'],['phone','Phone Number *'],['email','Email Address'],['income','Monthly Income (₹)'],['purpose','Loan Purpose']].map(([key,label])=>(
                  <div key={key} className={styles.formGroup}>
                    <label>{label}</label>
                    <input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} className={styles.formInput} />
                  </div>
                ))}
                <div className={styles.formGroup}>
                  <label>Loan Scheme *</label>
                  <select value={form.scheme} onChange={e=>setForm({...form,scheme:e.target.value})} className={styles.formInput}>
                    {LOAN_SCHEMES.map(l=><option key={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Loan Amount (₹) *</label>
                  <input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label>Tenure (months)</label>
                  <input type="number" value={form.tenure} onChange={e=>setForm({...form,tenure:e.target.value})} className={styles.formInput} placeholder="e.g. 24" />
                </div>
              </div>
              <button className={styles.saveBtn} onClick={handleApply}>Submit Application</button>
            </div>
          </div>
        )}

        {tab === 'applications' && (
          <div className={styles.appsList}>
            <div className={styles.appsStats}>
              {['Approved','Pending','Under Review','Rejected'].map(s => (
                <div key={s} className={styles.appsStat}>
                  <span className={styles.asNum} style={{color:statusColors[s]}}>{applications.filter(a=>a.status===s).length}</span>
                  <span className={styles.asLab}>{s}</span>
                </div>
              ))}
            </div>
            {applications.map(app => (
              <div key={app.id} className={styles.appCard}>
                <div className={styles.appLeft}>
                  <div className={styles.appName}>{app.name}</div>
                  <div className={styles.appMeta}>{app.phone} | {app.scheme} | {app.date}</div>
                  <div className={styles.appFin}>
                    <span>Amount: <strong>₹{app.amount.toLocaleString('en-IN')}</strong></span>
                    <span>Tenure: <strong>{app.tenure} mo</strong></span>
                    <span>EMI: <strong>₹{app.emi.toLocaleString('en-IN')}</strong></span>
                  </div>
                </div>
                <div className={styles.appRight}>
                  <span className={styles.statusBadge} style={{background:statusColors[app.status]+'22',color:statusColors[app.status]}}>{app.status}</span>
                  <select value={app.status} onChange={e=>updateStatus(app.id,e.target.value)} className={styles.statusSelect}>
                    {Object.keys(statusColors).map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
