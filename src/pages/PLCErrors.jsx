import { useState } from 'react'
import Layout from '../components/Layout'
import styles from './PLCErrors.module.css'

const PLC_ERRORS = [
  { code: 'E001', brand: 'Siemens', series: 'S7-1200', category: 'Hardware', description: 'CPU stopped – Hardware fault', cause: 'Defective CPU module or power supply issue', solution: 'Check power supply voltage (24V DC), replace CPU if voltage is OK', severity: 'Critical' },
  { code: 'E002', brand: 'Siemens', series: 'S7-1200', category: 'Communication', description: 'Profinet communication lost', cause: 'Network cable disconnected or IP conflict', solution: 'Check Ethernet cable, verify IP address configuration in TIA Portal', severity: 'High' },
  { code: 'E003', brand: 'Siemens', series: 'S7-300', category: 'Memory', description: 'Memory card error', cause: 'Corrupted or incompatible memory card', solution: 'Format memory card and reload program, check card compatibility', severity: 'High' },
  { code: 'E004', brand: 'Allen Bradley', series: 'Micrologix 1100', category: 'I/O', description: 'Input module fault', cause: 'Open wire or overload on input channel', solution: 'Check input wiring, verify signal voltage levels (5V/24V)', severity: 'Medium' },
  { code: 'E005', brand: 'Allen Bradley', series: 'CompactLogix', category: 'Communication', description: 'EtherNet/IP connection timeout', cause: 'Network congestion or device offline', solution: 'Ping device IP, check switch configuration, reduce scan rate', severity: 'High' },
  { code: 'E006', brand: 'Mitsubishi', series: 'FX3U', category: 'Hardware', description: 'Battery voltage low', cause: 'Internal battery discharged', solution: 'Replace Q6BAT battery, backup program before replacement', severity: 'Medium' },
  { code: 'E007', brand: 'Mitsubishi', series: 'Q Series', category: 'CPU', description: 'WDT (Watchdog Timer) error', cause: 'Scan time exceeded, infinite loop in program', solution: 'Check program logic for infinite loops, increase WDT timer value', severity: 'Critical' },
  { code: 'E008', brand: 'Omron', series: 'CP1H', category: 'Memory', description: 'Program memory error', cause: 'Program data corrupted due to power loss', solution: 'Clear memory and reload program from backup, add UPS', severity: 'High' },
  { code: 'E009', brand: 'Omron', series: 'CJ2M', category: 'I/O', description: 'Output short circuit', cause: 'Load short circuit or overcurrent on output', solution: 'Disconnect all outputs, test each individually, replace blown fuse', severity: 'Critical' },
  { code: 'E010', brand: 'Delta', series: 'DVP Series', category: 'Communication', description: 'RS485 Modbus communication error', cause: 'Incorrect baud rate, parity settings or cable issue', solution: 'Match baud rate & parity on both sides, check A/B polarity, add termination resistor', severity: 'Medium' },
  { code: 'E011', brand: 'Siemens', series: 'S7-400', category: 'CPU', description: 'STOP mode – DB not found', cause: 'Data block number referenced in code does not exist', solution: 'Create the missing DB in TIA Portal or fix wrong DB number in OB/FC/FB', severity: 'High' },
  { code: 'E012', brand: 'Allen Bradley', series: 'PLC-5', category: 'Hardware', description: 'I/O rack communication fault', cause: 'Loose backplane connector or rack power failure', solution: 'Reseat all modules, check backplane voltage, replace rack if needed', severity: 'High' },
  { code: 'E013', brand: 'Mitsubishi', series: 'iQ-R', category: 'Network', description: 'CC-Link IE network error', cause: 'Station disconnect or cable break in ring topology', solution: 'Check all CC-Link IE cables, verify station numbers, use network diagnostics', severity: 'High' },
  { code: 'E014', brand: 'Schneider', series: 'M340', category: 'Software', description: 'Task overrun', cause: 'Periodic task taking longer than configured period', solution: 'Increase task period, optimize code, split into multiple tasks', severity: 'Medium' },
  { code: 'E015', brand: 'Schneider', series: 'Premium', category: 'Hardware', description: 'Analog input out of range', cause: 'Sensor signal below 4mA or above 20mA', solution: 'Check sensor wiring, calibrate sensor, verify input range settings', severity: 'Medium' },
  { code: 'E016', brand: 'ABB', series: 'AC500', category: 'Safety', description: 'Safety PLC divergence error', cause: 'Discrepancy between redundant safety channels', solution: 'Test both safety channels separately, check cross-monitoring wiring', severity: 'Critical' },
  { code: 'E017', brand: 'Keyence', series: 'KV-8000', category: 'Communication', description: 'EtherCAT slave device error', cause: 'Slave device in INIT state or cabling issue', solution: 'Check EtherCAT cable order, verify slave configuration in KV Studio', severity: 'High' },
  { code: 'E018', brand: 'Delta', series: 'AS Series', category: 'CPU', description: 'CPU temperature high', cause: 'Ambient temperature > 55°C or cooling fan failure', solution: 'Improve panel ventilation, install cooling fan, clean dust filters', severity: 'High' },
  { code: 'E019', brand: 'Siemens', series: 'Logo!', category: 'Programming', description: 'Program limit exceeded', cause: 'Program uses more than 200 blocks (basic version)', solution: 'Upgrade to Logo! 0BA8 or optimize program logic, remove unused blocks', severity: 'Low' },
  { code: 'E020', brand: 'Omron', series: 'NX Series', category: 'Motion', description: 'Servo axis position error overflow', cause: 'Actual position deviated from command beyond error tolerance', solution: 'Check servo gain tuning, reduce acceleration, verify encoder feedback', severity: 'Critical' },
]

const BRANDS = ['All', ...new Set(PLC_ERRORS.map(e => e.brand))]
const CATEGORIES = ['All', ...new Set(PLC_ERRORS.map(e => e.category))]
const SEVERITIES = ['All', 'Critical', 'High', 'Medium', 'Low']

const severityColor = { Critical: '#ef4444', High: '#f59e0b', Medium: '#3b82f6', Low: '#10b981' }

export default function PLCErrors() {
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('All')
  const [category, setCategory] = useState('All')
  const [severity, setSeverity] = useState('All')
  const [selected, setSelected] = useState(null)

  const filtered = PLC_ERRORS.filter(e => {
    const q = search.toLowerCase()
    return (
      (brand === 'All' || e.brand === brand) &&
      (category === 'All' || e.category === category) &&
      (severity === 'All' || e.severity === severity) &&
      (e.code.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.brand.toLowerCase().includes(q))
    )
  })

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>🔴 PLC Error Code Database</h2>
          <p className={styles.pageSub}>{PLC_ERRORS.length} error codes — Siemens, Allen Bradley, Mitsubishi, Omron, Delta, Schneider, ABB</p>
        </div>

        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <span>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search error code or description..." className={styles.searchInput} />
          </div>
          <select value={brand} onChange={e=>setBrand(e.target.value)} className={styles.filterSelect}>
            {BRANDS.map(b=><option key={b}>{b}</option>)}
          </select>
          <select value={category} onChange={e=>setCategory(e.target.value)} className={styles.filterSelect}>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
          <select value={severity} onChange={e=>setSeverity(e.target.value)} className={styles.filterSelect}>
            {SEVERITIES.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>

        <div className={styles.resultCount}>{filtered.length} errors found</div>

        {selected && (
          <div className={styles.detailCard}>
            <div className={styles.detailHeader}>
              <div>
                <span className={styles.detailCode}>{selected.code}</span>
                <span className={styles.detailBrand}>{selected.brand} {selected.series}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span className={styles.severityBadge} style={{background:severityColor[selected.severity]+'22',color:severityColor[selected.severity]}}>{selected.severity}</span>
                <button className={styles.closeBtn} onClick={()=>setSelected(null)}>✕</button>
              </div>
            </div>
            <div className={styles.detailBody}>
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>Description</div>
                <div className={styles.detailValue}>{selected.description}</div>
              </div>
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>⚠️ Probable Cause</div>
                <div className={styles.detailValue}>{selected.cause}</div>
              </div>
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>✅ Solution / Action</div>
                <div className={styles.detailValue} style={{color:'#065f46',background:'#f0fdf4',borderRadius:8,padding:'10px 14px'}}>{selected.solution}</div>
              </div>
            </div>
          </div>
        )}

        <div className={styles.errorGrid}>
          {filtered.map(e => (
            <div key={e.code} className={`${styles.errorCard} ${selected?.code === e.code ? styles.active : ''}`} onClick={() => setSelected(e)}>
              <div className={styles.errorTop}>
                <span className={styles.errorCode}>{e.code}</span>
                <span className={styles.severityDot} style={{background: severityColor[e.severity]}} title={e.severity}></span>
              </div>
              <div className={styles.errorBrand}>{e.brand} · {e.series}</div>
              <div className={styles.errorDesc}>{e.description}</div>
              <div className={styles.errorCat}>{e.category}</div>
            </div>
          ))}
          {filtered.length === 0 && <div className={styles.empty}>Koi error code nahi mila. Search badlein.</div>}
        </div>
      </div>
    </Layout>
  )
}
