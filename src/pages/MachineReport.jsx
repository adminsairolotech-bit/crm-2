import { useState } from 'react'
import Layout from '../components/Layout'
import styles from './MachineReport.module.css'

const TEST_PARAMS = [
  'Voltage Check (L1-L2-L3)',
  'Current Check (L1-L2-L3)',
  'Insulation Resistance',
  'Earth Leakage',
  'Temperature Rise',
  'Control Circuit',
  'Interlock Function',
  'Emergency Stop',
  'Contactor Operation',
  'Timer Function',
  'PLC I/O Check',
  'HMI Communication',
  'Overload Setting',
  'Phase Sequence',
  'Final Functional Test',
]

const initialForm = {
  machineId: '', machineName: '', location: '', engineer: '',
  date: new Date().toISOString().slice(0, 10), remarks: '',
}

export default function MachineReport() {
  const [reports, setReports] = useState([])
  const [form, setForm] = useState(initialForm)
  const [results, setResults] = useState(() => Object.fromEntries(TEST_PARAMS.map(p => [p, { status: '', value: '', ok: null }])))
  const [showForm, setShowForm] = useState(true)
  const [viewReport, setViewReport] = useState(null)

  const updateResult = (param, field, value) => {
    setResults(prev => ({ ...prev, [param]: { ...prev[param], [field]: value } }))
  }

  const handleSubmit = () => {
    if (!form.machineId || !form.machineName) return alert('Machine ID aur Name bharna zaroori hai!')
    const allTested = TEST_PARAMS.filter(p => results[p].status)
    const passed = allTested.filter(p => results[p].ok === true).length
    const failed = allTested.filter(p => results[p].ok === false).length
    const report = {
      id: Date.now(),
      ...form,
      results: { ...results },
      summary: { total: TEST_PARAMS.length, tested: allTested.length, passed, failed },
      status: failed > 0 ? 'FAIL' : passed >= 10 ? 'PASS' : 'PARTIAL',
      createdAt: new Date().toLocaleString('en-IN'),
    }
    setReports(prev => [report, ...prev])
    setForm(initialForm)
    setResults(Object.fromEntries(TEST_PARAMS.map(p => [p, { status: '', value: '', ok: null }])))
    setShowForm(false)
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h2 className={styles.pageTitle}>⚙️ Machine Testing Report</h2>
            <p className={styles.pageSub}>Industrial machine & panel test records — SAI RoloTech</p>
          </div>
          <button className={styles.newBtn} onClick={() => { setShowForm(true); setViewReport(null) }}>+ New Test Report</button>
        </div>

        {viewReport && (
          <div className={styles.reportView}>
            <div className={styles.reportViewHeader}>
              <div>
                <h3>Test Report — {viewReport.machineName}</h3>
                <p>ID: {viewReport.machineId} | Location: {viewReport.location} | Engineer: {viewReport.engineer}</p>
                <p>Date: {viewReport.date} | Generated: {viewReport.createdAt}</p>
              </div>
              <span className={`${styles.overallBadge} ${styles['badge_' + viewReport.status]}`}>{viewReport.status}</span>
            </div>
            <div className={styles.resultsTable}>
              <table className={styles.table}>
                <thead><tr><th>#</th><th>Test Parameter</th><th>Measured Value</th><th>Result</th></tr></thead>
                <tbody>
                  {TEST_PARAMS.map((p, i) => {
                    const r = viewReport.results[p]
                    return (
                      <tr key={p} className={r.ok === false ? styles.failRow : r.ok === true ? styles.passRow : ''}>
                        <td>{i + 1}</td>
                        <td>{p}</td>
                        <td>{r.value || '—'}</td>
                        <td>{r.ok === true ? '✅ OK' : r.ok === false ? '❌ FAIL' : r.status || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {viewReport.remarks && <div className={styles.remarks}><strong>Remarks:</strong> {viewReport.remarks}</div>}
            <button className={styles.closeBtn} onClick={() => setViewReport(null)}>← Back to List</button>
          </div>
        )}

        {showForm && !viewReport && (
          <div className={styles.formCard}>
            <h3 className={styles.formTitle}>Machine Information</h3>
            <div className={styles.formGrid}>
              {[['machineId','Machine ID *'],['machineName','Machine/Panel Name *'],['location','Location/Site'],['engineer','Test Engineer']].map(([key,label]) => (
                <div key={key} className={styles.formGroup}>
                  <label>{label}</label>
                  <input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} className={styles.formInput} placeholder={label.replace(' *','')} />
                </div>
              ))}
              <div className={styles.formGroup}>
                <label>Test Date</label>
                <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className={styles.formInput} />
              </div>
            </div>

            <h3 className={styles.formTitle} style={{marginTop:20}}>Test Parameters</h3>
            <div className={styles.testGrid}>
              {TEST_PARAMS.map((param, i) => (
                <div key={param} className={styles.testRow}>
                  <span className={styles.testNum}>{i + 1}</span>
                  <span className={styles.testName}>{param}</span>
                  <input
                    placeholder="Value / Reading"
                    value={results[param].value}
                    onChange={e => updateResult(param, 'value', e.target.value)}
                    className={styles.testInput}
                  />
                  <div className={styles.testBtns}>
                    <button
                      className={`${styles.okBtn} ${results[param].ok === true ? styles.active : ''}`}
                      onClick={() => updateResult(param, 'ok', results[param].ok === true ? null : true)}
                    >OK</button>
                    <button
                      className={`${styles.failBtn} ${results[param].ok === false ? styles.active : ''}`}
                      onClick={() => updateResult(param, 'ok', results[param].ok === false ? null : false)}
                    >FAIL</button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.formGroup} style={{marginTop:16}}>
              <label>Remarks / Observations</label>
              <textarea value={form.remarks} onChange={e=>setForm({...form,remarks:e.target.value})} className={styles.formTextarea} rows={3} placeholder="Any additional notes..." />
            </div>

            <div className={styles.formActions}>
              <button className={styles.saveBtn} onClick={handleSubmit}>Generate Report</button>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {!showForm && !viewReport && (
          <div className={styles.reportsList}>
            <h3 className={styles.listTitle}>Previous Reports ({reports.length})</h3>
            {reports.length === 0 ? (
              <div className={styles.empty}>Koi report nahi hai. Pehle ek test report banayein.</div>
            ) : (
              reports.map(r => (
                <div key={r.id} className={styles.reportItem} onClick={() => setViewReport(r)}>
                  <div className={styles.riLeft}>
                    <div className={styles.riName}>{r.machineName}</div>
                    <div className={styles.riMeta}>{r.machineId} | {r.location} | {r.date}</div>
                    <div className={styles.riStats}>
                      <span className={styles.riStat}>Tested: {r.summary.tested}/{r.summary.total}</span>
                      <span className={styles.riStat} style={{color:'#10b981'}}>Pass: {r.summary.passed}</span>
                      <span className={styles.riStat} style={{color:'#ef4444'}}>Fail: {r.summary.failed}</span>
                    </div>
                  </div>
                  <span className={`${styles.overallBadge} ${styles['badge_' + r.status]}`}>{r.status}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
