import { useState } from 'react'
import Layout from '../components/Layout'
import styles from './AIQuestions.module.css'

const QUESTION_BANK = {
  'PLC Basics': [
    { q: 'PLC ka full form kya hai?', a: 'Programmable Logic Controller', type: 'MCQ', options: ['Programmable Logic Controller', 'Power Logic Circuit', 'Program Level Control', 'Process Logic Computer'] },
    { q: 'PLC mein CPU ka main kaam kya hai?', a: 'Program execute karna aur I/O monitor karna', type: 'Short' },
    { q: 'Ladder Logic mein normally open contact ka symbol kya hota hai?', a: '—| |—', type: 'MCQ', options: ['—| |—', '—|/|—', '—( )—', '—[  ]—'] },
    { q: 'PLC scan cycle ke kitne steps hote hain?', a: '3 steps: Input scan, Program execution, Output scan', type: 'Short' },
    { q: 'PLC mein Timer ka use kyon kiya jata hai?', a: 'Time-based operations ke liye — jaise koi output 5 second ke baad ON karna', type: 'Short' },
    { q: 'Siemens PLC mein OB1 kya hota hai?', a: 'Organization Block 1 — main cyclic program', type: 'MCQ', options: ['Main cyclic program block', 'Output block', 'Object base 1', 'Operator block'] },
    { q: 'Counter type TON ka matlab kya hai?', a: 'Timer On Delay — coil energize hone ke baad timer start hota hai', type: 'Short' },
  ],
  'Electrical Safety': [
    { q: 'Lockout Tagout (LOTO) procedure kyon use kiya jata hai?', a: 'Electrical work ke dauran machine accidentally ON na ho is liye', type: 'Short' },
    { q: 'Earth leakage protection ke liye konsa device use hota hai?', a: 'ELCB (Earth Leakage Circuit Breaker) ya RCCB', type: 'MCQ', options: ['ELCB/RCCB', 'MCB', 'Fuse', 'Contactor'] },
    { q: 'Electric shock ke first aid mein pehla kadam kya hai?', a: 'Power supply immediately switch off karna', type: 'Short' },
    { q: '415V 3-phase supply mein phase-to-phase voltage kitna hota hai?', a: '415V', type: 'MCQ', options: ['415V', '230V', '440V', '380V'] },
    { q: 'Safety color coding mein GREEN wire kya represent karta hai?', a: 'Earth/Ground connection', type: 'Short' },
  ],
  'CRM & Sales': [
    { q: 'CRM ka full form kya hai?', a: 'Customer Relationship Management', type: 'MCQ', options: ['Customer Relationship Management', 'Customer Revenue Model', 'Client Record Module', 'Core Relation Matrix'] },
    { q: 'Sales funnel ke main stages kaun se hain?', a: 'Awareness → Interest → Consideration → Intent → Purchase → Loyalty', type: 'Short' },
    { q: 'Lead conversion rate kaise calculate karte hain?', a: '(Converted Leads / Total Leads) × 100', type: 'Short' },
    { q: 'Cold calling mein sabse important skill kya hai?', a: 'Effective opening statement aur active listening', type: 'Short' },
    { q: 'Follow-up call ka best time kya hota hai?', a: 'Tuesday-Thursday, 10am-12pm ya 2pm-4pm', type: 'Short' },
  ],
  'Machine Maintenance': [
    { q: 'Preventive maintenance ka main benefit kya hai?', a: 'Unexpected breakdowns reduce hote hain aur machine life badhti hai', type: 'Short' },
    { q: 'MTBF ka full form kya hai?', a: 'Mean Time Between Failures', type: 'MCQ', options: ['Mean Time Between Failures', 'Machine Test Before Function', 'Maximum Time Before Fix', 'Mean Total Between Faults'] },
    { q: 'Vibration analysis se kya detect kiya ja sakta hai?', a: 'Bearing wear, imbalance, misalignment, looseness', type: 'Short' },
    { q: 'Thermal imaging (thermography) maintenance mein kyon use hoti hai?', a: 'Hot spots detect karne ke liye jo future failure indicate karte hain', type: 'Short' },
  ],
  'Automation': [
    { q: 'SCADA ka full form kya hai?', a: 'Supervisory Control and Data Acquisition', type: 'MCQ', options: ['Supervisory Control and Data Acquisition', 'System Control and Data Analysis', 'Smart Control and Data Access', 'Supervisory Control and Direct Action'] },
    { q: 'Modbus RTU aur Modbus TCP mein kya fark hai?', a: 'RTU serial (RS485) communication use karta hai, TCP Ethernet pe chal ta hai', type: 'Short' },
    { q: 'PID controller ke 3 components kaun se hain?', a: 'Proportional (P), Integral (I), Derivative (D)', type: 'Short' },
    { q: 'VFD ka use kyon kiya jata hai?', a: 'Motor speed control karne ke liye, energy saving aur smooth starting', type: 'Short' },
    { q: 'HMI ka kaam kya hota hai automation system mein?', a: 'Operator interface provide karna — process data display aur control karna', type: 'Short' },
  ],
}

const TOPICS = Object.keys(QUESTION_BANK)

export default function AIQuestions() {
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(5)
  const [qType, setQType] = useState('All')
  const [generated, setGenerated] = useState([])
  const [quizMode, setQuizMode] = useState(false)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [savedSets, setSavedSets] = useState([])

  const generateQuestions = () => {
    let pool = topic ? QUESTION_BANK[topic] : Object.values(QUESTION_BANK).flat()
    if (qType !== 'All') pool = pool.filter(q => q.type === qType)
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    setGenerated(shuffled.slice(0, Math.min(count, shuffled.length)))
    setAnswers({})
    setSubmitted(false)
    setQuizMode(false)
  }

  const startQuiz = () => {
    setQuizMode(true)
    setAnswers({})
    setSubmitted(false)
  }

  const submitQuiz = () => setSubmitted(true)

  const score = Object.entries(answers).filter(([i, a]) => {
    const q = generated[Number(i)]
    return a?.toLowerCase().trim() === q?.a?.toLowerCase().trim() || (q?.options && a === q.a)
  }).length

  const saveSet = () => {
    if (generated.length === 0) return
    setSavedSets(prev => [{
      id: Date.now(), topic: topic || 'Mixed', count: generated.length,
      qs: generated, date: new Date().toLocaleString('en-IN')
    }, ...prev])
    alert('Question set save ho gaya!')
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>🤖 AI Question Maker</h2>
          <p className={styles.pageSub}>Training, assessment aur quiz questions generate karein — PLC, Electrical, CRM, Automation</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label>Topic</label>
            <select value={topic} onChange={e=>setTopic(e.target.value)} className={styles.select}>
              <option value="">All Topics (Mixed)</option>
              {TOPICS.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div className={styles.controlGroup}>
            <label>Question Type</label>
            <select value={qType} onChange={e=>setQType(e.target.value)} className={styles.select}>
              <option>All</option><option>MCQ</option><option>Short</option>
            </select>
          </div>
          <div className={styles.controlGroup}>
            <label>Number of Questions</label>
            <select value={count} onChange={e=>setCount(Number(e.target.value))} className={styles.select}>
              {[3,5,7,10,15,20].map(n=><option key={n}>{n}</option>)}
            </select>
          </div>
          <button className={styles.generateBtn} onClick={generateQuestions}>⚡ Generate Questions</button>
        </div>

        {generated.length > 0 && (
          <>
            <div className={styles.actionBar}>
              <span className={styles.genCount}>{generated.length} questions generated</span>
              <div className={styles.actionBtns}>
                <button className={styles.quizBtn} onClick={startQuiz} disabled={quizMode}>🎯 Start Quiz</button>
                <button className={styles.saveBtn2} onClick={saveSet}>💾 Save Set</button>
              </div>
            </div>

            <div className={styles.questionsList}>
              {generated.map((q, i) => (
                <div key={i} className={styles.questionCard}>
                  <div className={styles.qHeader}>
                    <span className={styles.qNum}>Q{i + 1}</span>
                    <span className={styles.qType}>{q.type}</span>
                  </div>
                  <div className={styles.qText}>{q.q}</div>

                  {quizMode ? (
                    <div className={styles.quizAnswer}>
                      {q.options ? (
                        <div className={styles.options}>
                          {q.options.map((opt, oi) => (
                            <label key={oi} className={`${styles.option} ${submitted ? (opt === q.a ? styles.correct : answers[i] === opt ? styles.wrong : '') : answers[i] === opt ? styles.selected : ''}`}>
                              <input type="radio" name={`q${i}`} value={opt} checked={answers[i] === opt} onChange={e=>setAnswers({...answers,[i]:e.target.value})} disabled={submitted} />
                              {opt}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input
                          className={styles.ansInput}
                          placeholder="Apna jawab likhein..."
                          value={answers[i] || ''}
                          onChange={e => setAnswers({...answers,[i]:e.target.value})}
                          disabled={submitted}
                        />
                      )}
                      {submitted && <div className={styles.answerReveal}>✅ Sahi jawab: <strong>{q.a}</strong></div>}
                    </div>
                  ) : (
                    <div className={styles.answerBox}>
                      {q.options && <div className={styles.optionList}>{q.options.map((o,oi)=><span key={oi} className={`${styles.optChip} ${o===q.a?styles.correctChip:''}`}>{o}</span>)}</div>}
                      <div className={styles.answer}>💡 {q.a}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {quizMode && !submitted && (
              <button className={styles.submitBtn} onClick={submitQuiz}>Submit Quiz</button>
            )}
            {submitted && (
              <div className={styles.scoreCard}>
                <div className={styles.scoreNum}>{score}/{generated.length}</div>
                <div className={styles.scoreLabel}>{score >= generated.length * 0.8 ? '🏆 Excellent!' : score >= generated.length * 0.6 ? '👍 Good job!' : '📚 More practice needed'}</div>
                <button className={styles.retryBtn} onClick={startQuiz}>🔄 Retry Quiz</button>
              </div>
            )}
          </>
        )}

        {savedSets.length > 0 && (
          <div className={styles.savedSection}>
            <h3 className={styles.savedTitle}>💾 Saved Question Sets</h3>
            {savedSets.map(s=>(
              <div key={s.id} className={styles.savedCard}>
                <span className={styles.savedTopic}>{s.topic}</span>
                <span className={styles.savedCount}>{s.count} questions</span>
                <span className={styles.savedDate}>{s.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
