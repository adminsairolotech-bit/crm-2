import { useLocation } from "wouter";
import { ArrowLeft, Shield, Eye, Database, Bell, Lock, Trash2, Mail } from "lucide-react";

const Section = ({ icon: Icon, title, color, children }: { icon: any; title: string; color: string; children: React.ReactNode }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-4 h-4 text-white" aria-hidden="true" />
      </div>
      <h2 className="text-slate-800 font-semibold text-base">{title}</h2>
    </div>
    <div className="text-slate-600 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function PrivacyPolicyPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => window.history.back()} aria-label="Go back"
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-slate-800 font-semibold text-sm">Privacy Policy</h1>
            <p className="text-slate-400 text-xs">SAI RoloTech · Last updated: March 2025</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">

        {/* Intro */}
        <div className="bg-blue-600 rounded-2xl p-5 text-white">
          <h2 className="text-lg font-bold mb-2">Aapki Privacy Hamari Zimmedari Hai</h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            SAI RoloTech ("hum", "hamare") aapki personal information ki suraksha ko bahut gambheerta se leta hai.
            Ye Privacy Policy explain karti hai ki hum kaunsa data collect karte hain, kyun, aur kaise use karte hain.
          </p>
        </div>

        <Section icon={Database} title="1. Kaunsa Data Collect Karte Hain" color="bg-blue-600">
          <p><strong>Account Data:</strong> Name, email address, phone number (jab aap register karte hain)</p>
          <p><strong>Usage Data:</strong> App features jo aapne use kiye (quotation, maintenance guide, quality check)</p>
          <p><strong>Device Data:</strong> Device type, OS version, app version (crash reporting ke liye)</p>
          <p><strong>Communication Data:</strong> Hamare saath aapka contact (email, WhatsApp — sirf aapki permission se)</p>
          <p className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-green-700">
            ✅ Hum aapka financial data, bank details, ya sensitive personal information <strong>kabhi collect nahi karte</strong>.
          </p>
        </Section>

        <Section icon={Eye} title="2. Data Ka Use Kaise Karte Hain" color="bg-indigo-600">
          <ul className="space-y-1 list-none">
            <li>✔️ Aapko relevant machine quotes aur recommendations bhejne ke liye</li>
            <li>✔️ App features improve karne ke liye (anonymized usage stats)</li>
            <li>✔️ Technical support provide karne ke liye</li>
            <li>✔️ Important updates aur security alerts bhejne ke liye</li>
            <li>✔️ Aapki inquiry ka response dene ke liye</li>
          </ul>
          <p className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 mt-3">
            ❌ Hum aapka data <strong>kabhi third parties ko nahi bechte</strong> ya share nahi karte (court order ke alawa).
          </p>
        </Section>

        <Section icon={Bell} title="3. Notifications aur Marketing" color="bg-amber-500">
          <p>Hum aapko notifications tab hi bhejte hain jab:</p>
          <ul className="space-y-1 list-none mt-2">
            <li>✔️ Aapne notification permission di ho</li>
            <li>✔️ Content genuinely useful ho (machine updates, quote status)</li>
            <li>✔️ Maximum 1-2 notifications per day</li>
          </ul>
          <p className="mt-2"><strong>Opt-out:</strong> Kabhi bhi "STOP" reply karein ya app settings se notifications band karein. Hum turant band kar denge.</p>
        </Section>

        <Section icon={Lock} title="4. Data Security" color="bg-green-600">
          <p>Aapka data protect karne ke liye hum ye use karte hain:</p>
          <ul className="space-y-1 list-none mt-2">
            <li>✔️ SHA-256 password hashing (passwords kabhi plain text mein save nahi)</li>
            <li>✔️ HTTPS encryption (saare data transfer encrypted hain)</li>
            <li>✔️ Rate limiting (brute force attacks se protection)</li>
            <li>✔️ Session tokens (secure aur time-limited)</li>
          </ul>
        </Section>

        <Section icon={Trash2} title="5. Aapke Rights" color="bg-rose-500">
          <p>Aapko ye rights hain:</p>
          <ul className="space-y-1 list-none mt-2">
            <li>✔️ <strong>Access:</strong> Apna data dekhne ka haq</li>
            <li>✔️ <strong>Correction:</strong> Galat information fix karwana</li>
            <li>✔️ <strong>Deletion:</strong> Apna account aur data delete karwana</li>
            <li>✔️ <strong>Portability:</strong> Apna data export karna</li>
            <li>✔️ <strong>Opt-out:</strong> Marketing communications se bahar nikalna</li>
          </ul>
          <p className="mt-2">Request ke liye email karein: <strong>sairolotech@gmail.com</strong></p>
        </Section>

        <Section icon={Mail} title="6. Contact Us" color="bg-slate-600">
          <p>Privacy se related koi bhi sawaal ke liye:</p>
          <div className="bg-slate-50 rounded-xl p-3 mt-2 space-y-1">
            <p>📧 <strong>Email:</strong> sairolotech@gmail.com</p>
            <p>📞 <strong>Phone:</strong> +91-9899925274</p>
            <p>📍 <strong>Address:</strong> Plot No 575/1 G.F, Mundka Industrial Area, New Delhi 110041</p>
          </div>
        </Section>

        {/* Consent note */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
          <p className="text-slate-500 text-xs leading-relaxed">
            Is app ka use karke aap is Privacy Policy se agree karte hain.
            Policy mein changes hone par aapko notify kiya jaayega.
            <br />
            <strong className="text-slate-700">Effective Date: March 1, 2025</strong>
          </p>
        </div>

      </main>

      <footer className="text-center py-6 text-slate-400 text-xs">
        © 2025 SAI RoloTech · New Delhi · India
      </footer>
    </div>
  );
}
