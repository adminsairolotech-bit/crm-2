import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Send, Loader2, Settings2, AlertTriangle,
  ChevronRight, RefreshCw, Bot, Mic, Volume2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "master";
  text: string;
  ts: number;
}

const QUICK_PROBLEMS = [
  { emoji: "⬅️", label: "Strip Left Ja Rahi Hai", desc: "Edge camber / alignment", query: "Meri roll forming machine mein strip left side mein ja rahi hai. Kya karna chahiye?" },
  { emoji: "➡️", label: "Strip Right Ja Rahi Hai", desc: "Edge deviation", query: "Strip right side mein continuously ja rahi hai. Solution batao." },
  { emoji: "⬆️", label: "Strip Upar Ja Rahi Hai", desc: "Bow up / spring back", query: "Strip machine se nikalte waqt upar ki taraf bow ho rahi hai. Kaise theek karein?" },
  { emoji: "⬇️", label: "Strip Neeche Ja Rahi Hai", desc: "Bow down", query: "Profile neeche ki taraf bend ho rahi hai, flat nahi aa rahi. Kya karna chahiye?" },
  { emoji: "🌀", label: "Profile Mein Twist", desc: "Profile twisting", query: "Profile mein twist aa raha hai, seedhi nahi nikal rahi. Reason aur solution batao." },
  { emoji: "📐", label: "End Mein Flare", desc: "Bell mouth / flaring", query: "Profile ke end pe flare aa raha hai ya bell mouth shape ban rahi hai. Kaise theek karein?" },
  { emoji: "🌊", label: "Wave / Buckle", desc: "Tarangein profile mein", query: "Profile mein wave ya buckle aa raha hai, smooth nahi hai. Solution chahiye." },
  { emoji: "📏", label: "Cut Length Galat", desc: "Dimension error", query: "Machine ka cut length galat aa raha hai, required dimension se alag hai. Kya check karein?" },
  { emoji: "🔩", label: "Punching Galat Jagah", desc: "Punch misalignment", query: "Punching galat position pe ho rahi hai drawing se match nahi kar rahi. Kaise fix karein?" },
  { emoji: "😵", label: "Surface Marks", desc: "Scratches on profile", query: "Profile pe marks ya scratches aa rahe hain. Kya problem hai aur kaise theek karein?" },
  { emoji: "⚡", label: "Motor Trip / Overload", desc: "Motor overcurrent", query: "Machine ka motor baar baar trip ho raha hai ya overload dikhata hai. Kya karna chahiye?" },
  { emoji: "📡", label: "Straightener Problem", desc: "Material seedha nahi", query: "Straightener se material seedha nahi nikal raha, coil set bahut hai. Solution batao." },
];

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isUser ? "bg-violet-600" : "bg-gradient-to-br from-orange-500 to-red-600"}`}>
        {isUser ? <span className="text-white text-xs font-bold">YOU</span> : <Settings2 className="w-4 h-4 text-white" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${isUser
        ? "bg-violet-600/30 border border-violet-500/40 text-white"
        : "bg-slate-800/80 border border-slate-700/50 text-slate-100"
      }`}>
        {msg.role === "master" ? (
          <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
        ) : (
          <p className="leading-relaxed">{msg.text}</p>
        )}
        <p className={`text-xs mt-1.5 ${isUser ? "text-violet-300/60" : "text-slate-500"}`}>
          {new Date(msg.ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}

export default function MachineGuidePage() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "master",
      text: `🔧 Namaste! Main hoon MASTER — SAI RoloTech ka Roll Forming Machine Expert AI.

20+ saal ka experience hai mujhe roll forming machines mein. Aap koi bhi machine problem batayein, main step-by-step guide karunga.

Aap ya toh neeche se apni problem select karein, ya seedha type karein! ⚙️`,
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", text: text.trim(), ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setShowQuick(false);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role === "user" ? "user" : "model", text: m.text }));
      const res = await fetch("/api/machine-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), history }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: "master", text: data.reply, ts: Date.now() }]);
      } else {
        throw new Error(data.error || "AI error");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      toast({ title: "Error", description: msg, variant: "destructive" });
      setMessages(prev => [...prev, { role: "master", text: "⚠️ Sorry, abhi connection issue hai. Thodi der baad dobara try karein.", ts: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([{ role: "master", text: `🔧 Namaste! Main hoon MASTER — SAI RoloTech ka Roll Forming Machine Expert AI.\n\n20+ saal ka experience hai mujhe roll forming machines mein. Aap koi bhi machine problem batayein, main step-by-step guide karunga.\n\nAap ya toh neeche se apni problem select karein, ya seedha type karein! ⚙️`, ts: Date.now() }]);
    setInput("");
    setShowQuick(true);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex flex-col">
      <header className="border-b border-slate-700/50 bg-slate-900/90 backdrop-blur-sm z-10 flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => setLocation("/home")} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Settings2 className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
          </div>
          <div className="flex-1">
            <h1 className="text-white font-bold text-sm">MASTER — AI Machine Expert</h1>
            <p className="text-green-400 text-xs">Online · Roll Forming Troubleshooter</p>
          </div>
          <button onClick={handleReset} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Naya conversation">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}

          {showQuick && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
              <p className="text-slate-500 text-xs text-center">— Apni problem select karein —</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_PROBLEMS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => sendMessage(p.query)}
                    className="flex items-center gap-3 p-3 bg-slate-800/60 border border-slate-700/50 hover:border-orange-500/40 hover:bg-slate-700/60 rounded-xl text-left transition-all group"
                  >
                    <span className="text-2xl flex-shrink-0">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{p.label}</p>
                      <p className="text-slate-500 text-xs truncate">{p.desc}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-orange-400 flex-shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowQuick(false)}
                className="w-full text-center text-slate-500 hover:text-slate-300 text-xs py-2 transition-colors"
              >
                Ya neeche type karein apni problem ↓
              </button>
            </motion.div>
          )}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                <Settings2 className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                  <span className="text-slate-400 text-sm">MASTER analyze kar raha hai...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {!showQuick && messages.length > 1 && (
        <div className="border-t border-slate-700/30 flex-shrink-0 bg-slate-900/50">
          <div className="max-w-3xl mx-auto px-3 py-2">
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {QUICK_PROBLEMS.slice(0, 6).map(p => (
                <button
                  key={p.label}
                  onClick={() => sendMessage(p.query)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-orange-500/40 rounded-full text-xs text-slate-300 transition-all whitespace-nowrap"
                >
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1 bg-slate-800 border border-slate-600 rounded-2xl px-4 py-3 focus-within:border-orange-500/60 transition-colors">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder="Machine problem batayein... (Jaise: Strip left ja rahi hai)"
                className="w-full bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none"
                disabled={loading}
              />
            </div>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-11 h-11 flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all flex-shrink-0 shadow-lg shadow-orange-500/30"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-slate-600 text-xs text-center mt-2">
            MASTER · SAI RoloTech Roll Forming AI Expert · 20+ Years Experience
          </p>
        </div>
      </div>
    </div>
  );
}
