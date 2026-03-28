import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import styles from './BuddyBot.module.css'

const BUDDY_KNOWLEDGE = {
  greetings: ['hello', 'hi', 'namaste', 'helo', 'hey', 'namaskar', 'kaise', 'good morning', 'good evening'],
  sales: ['sale', 'sell', 'customer', 'lead', 'product', 'price', 'quotation', 'quote', 'offer', 'discount', 'buy', 'purchase', 'order', 'deal', 'revenue', 'target'],
  service: ['service', 'repair', 'maintenance', 'breakdown', 'fault', 'error', 'not working', 'problem', 'issue', 'support', 'help', 'troubleshoot', 'fix'],
  automation: ['plc', 'hmi', 'scada', 'vfd', 'servo', 'automation', 'control', 'programming', 'ladder', 'modbus', 'profinet', 'tia portal', 'siemens', 'allen bradley', 'mitsubishi'],
  loan: ['loan', 'finance', 'emi', 'payment', 'credit', 'pnmg', 'interest', 'installment', 'amount'],
  machine: ['machine', 'panel', 'testing', 'commissioning', 'report', 'inspection', 'test'],
  inquiry: ['inquiry', 'enquiry', 'contact', 'email', 'form', 'submit', 'message'],
  navigate: ['open', 'go to', 'show', 'navigate', 'take me', 'page', 'module', 'chalo', 'dikhao', 'kholo'],
  dashboard: ['dashboard', 'home', 'overview', 'status', 'main'],
  buddy: ['buddy', 'bot', 'chatbot', 'tum kaun', 'who are you', 'kya kar sakte', 'features', 'kya kya'],
}

const NAV_COMMANDS = {
  dashboard: '/dashboard',
  customer: '/customers',
  lead: '/leads',
  machine: '/machine-report',
  plc: '/plc-errors',
  loan: '/pnmg-loan',
  question: '/ai-questions',
  quiz: '/ai-questions',
  inquiry: '/inquiry',
}

const RESPONSES = {
  greetings: [
    '🙏 Namaste! Main **Buddy** hoon — SAI RoloTech CRM ka AI assistant.\n\nMain ready hoon Sales, Service, aur Automation ke liye!\n\n**Quick Commands:**\n• "Open customers" — Customer page khulega\n• "Show leads" — Leads dikhenge\n• "PLC error E001" — Error details milenge\n• "EMI calculate karo" — Loan page khulega\n\nKya help chahiye?',
  ],
  buddy: [
    '🤖 Main **Buddy** hoon — SAI RoloTech ka CRM Assistant!\n\n**Main yeh kar sakta hoon:**\n\n🎯 **Sales** — Lead tracking, customer management, quotation help\n🔧 **Service** — PLC troubleshooting, machine testing, error codes\n🤖 **Automation** — PLC, HMI, SCADA, VFD technical help\n💳 **Finance** — PNMG loan schemes, EMI calculation\n📋 **Navigation** — "Open customers", "Go to leads", "Show PLC errors"\n🎓 **Training** — AI questions, quiz, technical learning\n\n**Try karein:** "Show me PLC errors" ya "Sales help chahiye"',
  ],
  sales: [
    '🎯 **Sales Support — SAI RoloTech:**\n\n**Products:**\n• PLC Panels (Siemens, AB, Mitsubishi)\n• HMI Systems (Weintek, Delta)\n• SCADA Solutions\n• VFD Drives (ABB, Siemens)\n• Servo Motor Systems\n• Custom Control Panels\n\n**Sales Process:**\n1. Lead capture → Leads page\n2. Customer record → Customers page\n3. Follow-up tracking\n4. Quotation generation\n5. Deal closure tracking\n\n**Quick:** "Open leads" ya "Open customers" type karein!',
    '💰 **Sales Tips:**\n\n• Cold calling best time: Tue-Thu, 10am-12pm\n• Follow-up within 24 hours of first contact\n• Demo always helps close deals faster\n• Use inquiry form to capture website leads\n• Track all leads in CRM — koi bhi lead miss nahi honi chahiye!\n\n**Revenue Targets:**\n• Monthly: ₹5L+\n• Quarterly: ₹15L+\n• Key metric: 25% conversion rate',
  ],
  service: [
    '🔧 **Service Support — SAI RoloTech:**\n\n**Troubleshooting Steps:**\n1. Error code note karein (PLC display se)\n2. **"Open PLC errors"** type karein — full database khulega\n3. Cause aur solution padhen\n4. Step-by-step follow karein\n5. Machine test report banayein — **"Open machine testing"**\n\n**Emergency Contacts:**\n📞 +91-9667146889\n📧 admin.sairolotech@gmail.com\n\n**Common Issues:**\n• PLC CPU stop → Power supply check\n• Communication lost → Cable/IP check\n• Output fault → Load short circuit check\n• HMI blank → Backlight/cable check',
  ],
  automation: [
    '🤖 **Automation Solutions — SAI RoloTech:**\n\n**PLC Programming:**\n• Siemens TIA Portal (S7-1200/1500)\n• Allen Bradley Studio 5000\n• Mitsubishi GX Works\n• Omron CX-Programmer\n• Delta ISPSoft\n\n**Communication Protocols:**\n• Modbus RTU (RS485) / TCP (Ethernet)\n• Profinet / Profibus\n• EtherCAT / EtherNet/IP\n• CC-Link IE\n\n**Services:**\n• PLC programming & commissioning\n• HMI design & development\n• SCADA system setup\n• VFD parameter setting\n• Panel wiring & testing\n\n**Training:** "Open AI questions" type karein quiz ke liye!',
  ],
  loan: [
    '💳 **PNMG Loan Schemes — SAI RoloTech Finance:**\n\n| Scheme | Rate | Max Amount | Max Tenure |\n|--------|------|-----------|------------|\n| Personal | 10.5% | ₹5L | 60 months |\n| Business | 12% | ₹50L | 84 months |\n| Machinery | 9% | ₹20L | 84 months |\n| Home | 8.5% | ₹1Cr | 240 months |\n| Education | 7.5% | ₹15L | 120 months |\n\n**Quick:** "Open loan" type karein EMI calculator ke liye!\n\n**Documents Required:**\n• Aadhaar card\n• PAN card\n• Income proof (3 months salary slip)\n• Bank statement (6 months)\n• Address proof',
  ],
  machine: [
    '⚙️ **Machine Testing — SAI RoloTech:**\n\n**15 Test Parameters:**\n1. Voltage Check (L1-L2-L3)\n2. Current Check (L1-L2-L3)\n3. Insulation Resistance\n4. Earth Leakage\n5. Temperature Rise\n6. Control Circuit\n7. Interlock Function\n8. Emergency Stop\n9. Contactor Operation\n10. Timer Function\n11. PLC I/O Check\n12. HMI Communication\n13. Overload Setting\n14. Phase Sequence\n15. Final Functional Test\n\n**Quick:** "Open machine testing" type karein report banane ke liye!',
  ],
  inquiry: [
    '📋 **Customer Inquiry System:**\n\n**Process:**\n1. Customer ka naam, email, phone bharein\n2. Message/requirement likhen\n3. Source select karein (Website/WhatsApp/Phone)\n4. Submit karein\n\n**Email jayegi:**\n• To: inquirysairolotech@gmail.com\n• CC: admin.sairolotech@gmail.com\n\n**Quick:** "Open inquiry" type karein form ke liye!\n\n**Note:** Har inquiry automatically CRM mein record hoti hai.',
  ],
  navigate: [
    '📍 **Main aapko le chalta hoon! Yeh pages available hain:**\n\n• "Open dashboard" → Dashboard\n• "Open customers" → Customer Management\n• "Open leads" → Lead Tracking\n• "Open machine testing" → Machine Test Report\n• "Open PLC errors" → PLC Error Database\n• "Open loan" → PNMG Loan Calculator\n• "Open AI questions" → Training Quiz\n• "Open inquiry" → Inquiry Form\n\nBas page ka naam likho, main khol dunga! 🚀',
  ],
  dashboard: [
    '🏠 **Dashboard pe available hai:**\n\n• 📊 Stats overview (Customers, Leads, Sales, Gmail)\n• 📧 Gmail Leads — Live inbox scanning\n• 🔗 Quick Access — Sabhi modules ke shortcuts\n• 📋 Recent Activity feed\n• 🔥 System Status — Sabhi services ka status\n\nAap abhi dashboard pe hain ya main le chalun? "Open dashboard" likhein.',
  ],
  default: [
    '🤔 Samjha nahi! Kya aap in topics ke baare mein puchh rahe hain?\n\n• **"Sales help"** — Lead & customer management\n• **"Service support"** — Troubleshooting & repairs\n• **"PLC error"** — Error code lookup\n• **"Loan info"** — PNMG loan schemes\n• **"Machine test"** — Testing report\n• **"Open [page]"** — Navigate to any module\n\nYa seedha apna sawal likhein!',
  ],
}

const QUICK_BUTTONS = [
  { label: '🎯 Sales Help', msg: 'Sales process kya hai?' },
  { label: '🔧 Service', msg: 'Machine mein problem hai, help chahiye' },
  { label: '🤖 Automation', msg: 'PLC programming ke baare mein batao' },
  { label: '💳 Loan Info', msg: 'PNMG loan schemes kya hain?' },
  { label: '⚙️ Machine Test', msg: 'Machine testing report kaise banate hain?' },
  { label: '🔴 PLC Errors', msg: 'Open PLC errors' },
  { label: '📋 Inquiry', msg: 'Open inquiry' },
  { label: '❓ Buddy Help', msg: 'Tum kya kya kar sakte ho?' },
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

function detectNavigation(message) {
  const msg = message.toLowerCase()
  if (!/open|go to|show|navigate|take|chalo|dikhao|kholo/i.test(msg)) return null
  for (const [keyword, path] of Object.entries(NAV_COMMANDS)) {
    if (msg.includes(keyword)) return path
  }
  return null
}

export default function BuddyBot() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    {
      id: 1, from: 'bot',
      text: `🙏 Namaste ${user?.name || ''}! Main **Buddy** hoon — SAI RoloTech CRM ka AI assistant.\n\n**Aapka Role:** ${user?.role || 'User'}\n\nMain ready hoon:\n• 🎯 Sales & Lead Management\n• 🔧 Service & Troubleshooting\n• 🤖 Automation & PLC Help\n• 💳 PNMG Loan Schemes\n• ⚙️ Machine Testing\n\n**Navigation:** "Open customers" ya "Go to leads" likh kar directly page khulega!\n\nKuch bhi puchhen!`,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = (text) => {
    if (!text.trim()) return
    const userMsg = { id: Date.now(), from: 'user', text: text.trim(), time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    const navPath = detectNavigation(text)

    setTimeout(() => {
      let response = getBotResponse(text)

      if (navPath) {
        response += `\n\n🚀 **Navigating...** "${navPath}" page khul raha hai!`
        setTimeout(() => navigate(navPath), 1200)
      }

      const botMsg = { id: Date.now() + 1, from: 'bot', text: response, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }
      setMessages(prev => [...prev, botMsg])
      setTyping(false)
    }, 600 + Math.random() * 500)
  }

  const clearChat = () => {
    setMessages([{ id: Date.now(), from: 'bot', text: '🔄 Chat clear! Main phir se ready hoon. Kuch bhi puchhen ya "Open [page]" likhein!', time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }])
  }

  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      let formatted = line
        .replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`)
        .replace(/\|(.*?)\|/g, (_, m) => `<span style="padding:0 4px;border-right:1px solid #d1d5db">${m}</span>`)
      return <div key={i} dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }} />
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
                <div className={styles.botName}>Buddy — SAI RoloTech AI Assistant</div>
                <div className={styles.botStatus}><span className={styles.statusDot}></span> Online | Sales | Service | Automation | Navigation</div>
              </div>
            </div>
            <div className={styles.headerActions}>
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
              placeholder={`${user?.name}, kuch bhi puchhen ya "Open [page]" likhein...`}
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
