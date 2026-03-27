import { useState } from 'react'
import styles from './InquiryForm.module.css'

export default function InquiryForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', source: 'Website Form', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/send-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setForm({ name: '', email: '', phone: '', source: 'Website Form', message: '' })
      } else {
        setError(data.error || 'Kuch galat hua, dobara try karein.')
      }
    } catch {
      setError('Server se connect nahi ho saka. Dobara try karein.')
    }
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>CRM</div>
          <span className={styles.beta}>BETA</span>
        </div>

        <h1 className={styles.title}>Inquiry / Lead Form</h1>
        <p className={styles.sub}>SAI RoloTech — Apni query bhejein, hum jald reply karenge</p>

        {success && (
          <div className={styles.successBox}>
            <span style={{ fontSize: 24 }}>✅</span>
            <div>
              <p className={styles.successTitle}>Inquiry Successfully Bhej Di!</p>
              <p className={styles.successSub}>
                Aapki inquiry <strong>inquirysairolotech@gmail.com</strong> pe pahunch gayi hai
                aur <strong>admin.sairolotech@gmail.com</strong> ko bhi notify kiya gaya.
                Hamare team se jald contact hoga.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className={styles.errorBox}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Aapka Naam *</label>
            <input
              name="name" value={form.name} onChange={handleChange}
              placeholder="Poora naam likhein" required
            />
          </div>

          <div className={styles.field}>
            <label>Email Address *</label>
            <input
              name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="aapka@email.com" required
            />
          </div>

          <div className={styles.field}>
            <label>Phone Number</label>
            <input
              name="phone" value={form.phone} onChange={handleChange}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className={styles.field}>
            <label>Inquiry Source</label>
            <select name="source" value={form.source} onChange={handleChange}>
              <option>Website Form</option>
              <option>Google Ads</option>
              <option>Social Media</option>
              <option>Referral</option>
              <option>Phone Call</option>
              <option>Other</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Aapka Message / Query</label>
            <textarea
              name="message" value={form.message} onChange={handleChange}
              placeholder="Apni query yahan likhein..." rows={4}
            />
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? '⏳ Bhej raha hai...' : '📤 Inquiry Bhejein'}
          </button>
        </form>

        <p className={styles.footer}>
          SAI RoloTech CRM • inquirysairolotech@gmail.com • admin.sairolotech@gmail.com
        </p>
      </div>
    </div>
  )
}
