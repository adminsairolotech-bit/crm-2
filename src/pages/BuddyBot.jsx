import { useState, useRef, useEffect } from 'react'
import Layout from '../components/Layout'
import styles from './BuddyBot.module.css'

const BUDDY_KNOWLEDGE = {
  greetings: ['hello', 'hi', 'namaste', 'helo', 'hey', 'namaskar'],
  sales: ['sale', 'sell', 'customer', 'lead', 'product', 'price', 'quotation', 'quote', 'offer', 'discount', 'buy', 'purchase', 'order'],
  service: ['service', 'repair', 'maintenance', 'breakdown', 'fault', 'error', 'not working', 'problem', 'issue', 'support', 'help'],
  automation: ['plc', 'hmi', 'scada', 'vfd', 'servo', 'automation', 'control', 'programming', 'ladder', 'modbus', 'profinet'],
  loan: ['loan', 'finance', 'emi', 'payment', 'credit', 'pnmg', 'interest'],
  machine: ['machine', 'panel', 'testing', 'commissioning', 'report', 'inspection'],
  inquiry: ['inquiry', 'enquiry', 'contact', 'email', 'form', 'submit'],
}

const RESPONSES = {
  greetings: [
    '🙏 Namaste! Main Buddy Chatbot hoon — SAI RoloTech ka AI assistant. Aap Sales, Service, ya Automation ke baare mein kuch puchh sakte hain!',
    'Hello! Main aapki madad karne ke liye taiyaar hoon. Sales ke liye "1", Service ke liye "2", Automation ke liye "3" type karein.',
  ],
  sales: [
    '🎯 **Sales Support:**\n\n• **Products:** PLC Panels, HMI Systems, SCADA, VFD Drives, Servo Motors\n• **Quotation:** Leads section mein ja kar new lead add karein\n• **Follow-up:** Dashboard > Recent Activity se track karein\n• **Inquiry:** Inquiry form bhejein customer ke liye\n\nKya aapko specific product ka quotation chahiye?',
    '💰 **Sales Process:**\n1. Lead capture karein (Leads page)\n2. Follow-up schedule karein\n3. Demo arrange karein\n4. Quotation bhejein\n5. Deal close karein\n\nAapke paas koi specific lead hai jiske liye help chahiye?',
  ],
  service: [
    '🔧 **Service Support:**\n\n• **PLC Errors:** PLC Error Code page pe error code search karein\n• **Machine Testing:** Machine Testing Report se test karein\n• **Emergency:** 📞 +91-9667146889\n• **Email:** admin.sairolotech@gmail.com\n\nKya machine mein koi specific error aa raha hai? Error code batayein.',
    '⚙️ **Troubleshooting Steps:**\n1. Error code note karein (PLC display se)\n2. PLC Errors database mein search karein\n3. Cause aur solution padhen\n4. Step-by-step follow karein\n5. Agar phir bhi problem ho to engineer ko call karein\n\nKaun sa PLC brand hai aapka? (Siemens/AB/Mitsubishi/Omron)',
  ],
  automation: [
    '🤖 **Automation Solutions — SAI RoloTech:**\n\n• **PLC Programming:** Siemens S7, Allen Bradley, Mitsubishi FX/Q/iQ-R\n• **HMI Design:** Weintek, Siemens, Delta HMI panels\n• **SCADA:** WinCC, Ignition, InTouch\n• **VFD:** ABB, Siemens, Mitsubishi VFD programming\n• **Communication:** Modbus RTU/TCP, Profinet, EtherCAT\n\nKaunsa automation project hai aapka?',
    '⚡ **PLC Programming Help:**\n\nSiemens TIA Portal:\n• OB1 main program\n• FB/FC function blocks\n• DB data blocks\n\nAllen Bradley Studio 5000:\n• Task/Program/Routine structure\n• AOI (Add-On Instructions)\n\nAI Question Maker se PLC training bhi kar sakte hain!',
  ],
  loan: [
    '💳 **PNMG Loan Schemes:**\n\n• Personal Loan: 10.5% | Max 5L | 60 months\n• Business Loan: 12% | Max 50L | 84 months\n• Machinery Loan: 9% | Max 20L | 84 months\n• Home Loan: 8.5% | Max 1Cr | 240 months\n\nEMI calculator ke liye PNMG Loan page pe jayein.\nApplication submit karne ke liye "Apply for Loan" tab use karein.',
  ],
  machine: [
    '⚙️ **Machine Testing Process:**\n\n1. Machine Testing Report page pe jayein\n2. Machine ID aur naam enter karein\n3. 15 test parameters check karein:\n   • Voltage/Current check\n   • Insulation resistance\n   • Control circuit\n   • PLC I/O check\n   • Functional test\n4. OK/FAIL mark karein\n5. Report generate karein\n\nHar test ka record digital rahega!',
  ],
  inquiry: [
    '📋 **Inquiry Bhejne ke liye:**\n\n1. Header mein "Inquiry Form" click karein\n2. Customer ka naam, email, phone bharein\n3. Message likhen\n4. Submit karein\n\n✅ Form submit hone ke baad email jayegi inquirysairolotech@gmail.com par.\n\nKya aap kisi customer ke liye inquiry submit karna chahte hain?',
  ],
  default: [
    '🤔 Mujhe samajh nahi aaya. Kya aap in topics mein se kuch puchh rahe hain?\n\n• **Sales** — Leads, customers, quotation\n• **Service** — Repairs, troubleshooting, PLC errors\n• **Automation** — PLC, HMI, SCADA, VFD\n• **Loan** — PNMG loan schemes, EMI\n• **Machine** — Testing report, commissioning\n• **Inquiry** — Customer inquiry form\n\nPlease specific question puchhen!',
  ],
}

const QUICK_BUTTONS = [
  { label: '🎯 Sales Help', msg: 'Sales process kya hai?' },
  { label: '🔧 Service Support', msg: 'Machine mein problem hai, help chahiye' },
  { label: '🤖 Automation', msg: 'PLC programming ke baare mein batao' },
  { label: '💳 Loan Schemes', msg: 'PNMG loan schemes kya hain?' },
  { label: '⚙️ Machine Testing', msg: 'Machine testing report kaise banate hain?' },
  { label: '📋 Inquiry Form', msg: 'Customer inquiry kaise submit karein?' },
]

function getBotResponse(message) {
  const msg = message.toLowerCase()
  for (const [key, keywords] of Object.entries(BUDDY_KNOWLEDGE)) {
    if (keywords.some(k => msg.includes(k))) {
      const responses = RESPONSES[key] || RESPONSES.default
      return responses[Math.floor(Math.random() * responses.length)]
    }
  }
  return RESPONSES.default[0]
}

export default function BuddyBot() {
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: '🙏 Namaste! Main **Buddy** hoon — SAI RoloTech ka AI chatbot!\n\nMain aapki help kar sakta hoon:\n• 🎯 Sales & Lead Management\n• 🔧 Service & Troubleshooting\n• 🤖 Automation & PLC\n• 💳 PNMG Loan Schemes\n• ⚙️ Machine Testing\n\nKuch bhi puchhen!', time: new Date().toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'}) }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [mode, setMode] = useState('General')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = (text) => {
    if (!text.trim()) return
    const userMsg = { id: Date.now(), from: 'user', text: text.trim(), time: new Date().toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'}) }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const response = getBotResponse(text)
      const botMsg = { id: Date.now() + 1, from: 'bot', text: response, time: new Date().toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'}) }
      setMessages(prev => [...prev, botMsg])
      setTyping(false)
    }, 800 + Math.random() * 600)
  }

  const clearChat = () => {
    setMessages([{ id: Date.now(), from: 'bot', text: '🔄 Chat clear ho gaya! Main phir se ready hoon. Kya puchhna hai?', time: new Date().toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'}) }])
  }

  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`)
      return <div key={i} dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} />
    })
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.chatContainer}>
          <div className={styles.chatHeader}>
            <div className={styles.botInfo}>
              <div className={styles.botAvatar}>🤖</div>
              <div>
                <div className={styles.botName}>Buddy — SAI RoloTech Assistant</div>
                <div className={styles.botStatus}><span className={styles.statusDot}></span> Online • Sales | Service | Automation</div>
              </div>
            </div>
            <div className={styles.headerActions}>
              <select value={mode} onChange={e=>setMode(e.target.value)} className={styles.modeSelect}>
                <option>General</option><option>Sales</option><option>Service</option><option>Automation</option>
              </select>
              <button className={styles.clearBtn} onClick={clearChat}>🗑️ Clear</button>
            </div>
          </div>

          <div className={styles.quickBtns}>
            {QUICK_BUTTONS.map((b, i) => (
              <button key={i} className={styles.quickBtn} onClick={() => sendMessage(b.msg)}>{b.label}</button>
            ))}
          </div>

          <div className={styles.chatMessages}>
            {messages.map(msg => (
              <div key={msg.id} className={`${styles.message} ${msg.from === 'user' ? styles.userMsg : styles.botMsg}`}>
                {msg.from === 'bot' && <div className={styles.msgAvatar}>🤖</div>}
                <div className={styles.msgBubble}>
                  <div className={styles.msgText}>{formatText(msg.text)}</div>
                  <div className={styles.msgTime}>{msg.time}</div>
                </div>
              </div>
            ))}
            {typing && (
              <div className={`${styles.message} ${styles.botMsg}`}>
                <div className={styles.msgAvatar}>🤖</div>
                <div className={styles.msgBubble}>
                  <div className={styles.typingIndicator}><span></span><span></span><span></span></div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className={styles.chatInput}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Kuch bhi puchhen — Sales, Service, PLC, Loan..."
              className={styles.inputField}
            />
            <button className={styles.sendBtn} onClick={() => sendMessage(input)} disabled={!input.trim() || typing}>
              {typing ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
