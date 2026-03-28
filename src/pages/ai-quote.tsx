import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, ArrowLeft, FileText, Send, Printer, Download,
  CheckCircle2, IndianRupee, User, Phone, Mail, Building2,
  Package, MessageSquare, Loader2, RefreshCw, Upload, ChevronDown, ChevronUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface QuotationItem {
  sno: number;
  description: string;
  hsn: string;
  qty: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

interface Quotation {
  quotationNo: string;
  date: string;
  validUntil: string;
  client: { name: string; phone: string; email: string; company: string };
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  grandTotal: number;
  paymentTerms: string;
  deliveryTerms: string;
  warranty: string;
  notes: string;
  executiveName: string;
}

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function QuotationPreview({ q, onPrint, onNew }: { q: Quotation; onPrint: () => void; onNew: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-semibold">Quotation Ready!</span>
          </div>
          <p className="text-slate-400 text-sm mt-0.5">Ref: {q.quotationNo} · Valid till {q.validUntil}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onNew}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 rounded-lg text-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Naya
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save
          </button>
        </div>
      </div>

      <div id="quotation-print" className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-violet-700 to-blue-700 text-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">SAI RoloTech</h1>
              <p className="text-violet-200 text-sm mt-0.5">Industrial Automation Solutions</p>
              <p className="text-violet-200 text-xs mt-2">MIDC Industrial Area, Pune, Maharashtra - 411019</p>
              <p className="text-violet-200 text-xs">📞 +91 98765 43210 · ✉ inquirysairolotech@gmail.com</p>
              <p className="text-violet-200 text-xs">GSTIN: 27AABCS1429B1Z1</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 rounded-xl px-4 py-3">
                <p className="text-xs text-violet-200 font-medium">QUOTATION</p>
                <p className="text-xl font-bold mt-0.5">{q.quotationNo}</p>
                <p className="text-xs text-violet-200 mt-1">Date: {q.date}</p>
                <p className="text-xs text-violet-200">Valid: {q.validUntil}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-b">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bill To</h3>
          <p className="font-bold text-gray-900 text-lg">{q.client.name}</p>
          {q.client.company !== "Individual" && <p className="text-gray-600 text-sm">{q.client.company}</p>}
          <p className="text-gray-600 text-sm">📞 {q.client.phone}</p>
          {q.client.email !== "N/A" && <p className="text-gray-600 text-sm">✉ {q.client.email}</p>}
        </div>

        <div className="p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2 text-xs font-bold text-gray-600 rounded-l">#</th>
                <th className="text-left p-2 text-xs font-bold text-gray-600">Description</th>
                <th className="text-center p-2 text-xs font-bold text-gray-600">HSN</th>
                <th className="text-center p-2 text-xs font-bold text-gray-600">Qty</th>
                <th className="text-center p-2 text-xs font-bold text-gray-600">Unit</th>
                <th className="text-right p-2 text-xs font-bold text-gray-600">Rate (₹)</th>
                <th className="text-right p-2 text-xs font-bold text-gray-600 rounded-r">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {q.items.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-2 text-gray-600">{item.sno}</td>
                  <td className="p-2 text-gray-800 font-medium">{item.description}</td>
                  <td className="p-2 text-center text-gray-600">{item.hsn}</td>
                  <td className="p-2 text-center text-gray-800">{item.qty}</td>
                  <td className="p-2 text-center text-gray-600">{item.unit}</td>
                  <td className="p-2 text-right text-gray-800">{item.unitPrice.toLocaleString("en-IN")}</td>
                  <td className="p-2 text-right font-semibold text-gray-900">{item.amount.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end">
            <div className="w-72 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatINR(q.subtotal)}</span>
              </div>
              {q.discount > 0 && (
                <div className="flex justify-between text-sm text-green-700">
                  <span>Discount ({q.discount}%)</span>
                  <span>- {formatINR(q.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Taxable Amount</span>
                <span>{formatINR(q.taxableAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>GST ({q.gstRate}%)</span>
                <span>{formatINR(q.gstAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-gray-300 pt-2 text-gray-900">
                <span>Grand Total</span>
                <span className="text-violet-700">{formatINR(q.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="font-bold text-blue-800 mb-1">Payment Terms</p>
            <p className="text-blue-700">{q.paymentTerms}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <p className="font-bold text-green-800 mb-1">Delivery</p>
            <p className="text-green-700">{q.deliveryTerms}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3">
            <p className="font-bold text-amber-800 mb-1">Warranty</p>
            <p className="text-amber-700">{q.warranty}</p>
          </div>
        </div>

        {q.notes && (
          <div className="px-6 pb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-600">
              <p className="font-bold text-gray-800 mb-1">Notes</p>
              <p>{q.notes}</p>
            </div>
          </div>
        )}

        <div className="px-6 pb-6 flex items-end justify-between">
          <p className="text-xs text-gray-500">This is a computer-generated quotation.</p>
          <div className="text-right">
            <div className="h-12 border-b border-gray-400 w-40" />
            <p className="text-xs text-gray-600 mt-1">Authorised Signatory</p>
            <p className="text-xs font-semibold text-gray-800">SAI RoloTech</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AIQuotePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<"form" | "loading" | "result">("form");
  const [quotation, setQuotation] = useState<Quotation | null>(null);

  const [form, setForm] = useState({
    clientName: user?.name || "",
    clientPhone: "",
    clientEmail: user?.email || "",
    clientCompany: "",
    products: "",
    budget: "",
    requirements: "",
  });

  const [catalogFile, setCatalogFile] = useState<string | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        JSON.parse(text);
        setCatalogFile(text);
        localStorage.setItem("sai_product_catalog", text);
        toast({ title: "Catalog Upload Hua!", description: "AI ab aapke product data se quotation banayega." });
      } catch {
        toast({ title: "Invalid File", description: "Valid JSON product catalog file chahiye.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (!form.clientName.trim() || !form.clientPhone.trim() || !form.products.trim()) {
      toast({ title: "Zaroori fields bharen", description: "Naam, phone aur product details chahiye.", variant: "destructive" });
      return;
    }

    setStep("loading");

    let catalogData = null;
    try {
      const stored = catalogFile || localStorage.getItem("sai_product_catalog");
      if (stored) catalogData = JSON.parse(stored);
      else {
        const res = await fetch("/product-catalog.json");
        if (res.ok) catalogData = await res.json();
      }
    } catch { /* use default */ }

    try {
      const res = await fetch("/api/ai-quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, catalogData }),
      });
      const data = await res.json();
      if (data.success && data.quotation) {
        setQuotation(data.quotation);
        setStep("result");
      } else {
        throw new Error(data.error || "AI response error");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Quotation Generate Nahi Hua", description: msg, variant: "destructive" });
      setStep("form");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNew = () => {
    setQuotation(null);
    setStep("form");
    setForm({ ...form, products: "", budget: "", requirements: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #quotation-print, #quotation-print * { visibility: visible; }
          #quotation-print { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <header className="relative border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => setLocation("/home")} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm">AI Quotation Maker</h1>
            <p className="text-slate-500 text-xs">SAI RoloTech · Powered by Gemini AI</p>
          </div>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-3">
                  <Bot className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-violet-300 text-sm">AI se Instant Quotation Paayein</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Apni Requirements Batayein</h2>
                <p className="text-slate-400 text-sm mt-1">Kuch seconds mein professional quotation ready ho jayegi</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-violet-400" /> Client Details
                  </h3>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Aapka Naam *</label>
                    <input value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })}
                      placeholder="Rahul Kumar" className="w-full bg-slate-900/70 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number *</label>
                    <input value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })}
                      placeholder="+91 98765 43210" type="tel" className="w-full bg-slate-900/70 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Email (optional)</label>
                    <input value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })}
                      placeholder="aapka@email.com" type="email" className="w-full bg-slate-900/70 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Company / Firm (optional)</label>
                    <input value={form.clientCompany} onChange={e => setForm({ ...form, clientCompany: e.target.value })}
                      placeholder="Jaise: ABC Industries" className="w-full bg-slate-900/70 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors" />
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-400" /> Product Requirements
                  </h3>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Kya chahiye? (Products / Machines) *</label>
                    <textarea value={form.products} onChange={e => setForm({ ...form, products: e.target.value })}
                      placeholder="Jaise: 2x PLC Panel Siemens S7-1200, 1x HMI 7 inch, 1x VFD 5.5kW"
                      rows={3} className="w-full bg-slate-900/70 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Budget (approximate)</label>
                    <input value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}
                      placeholder="Jaise: ₹2,00,000 tak" className="w-full bg-slate-900/70 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Special Requirements</label>
                    <textarea value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })}
                      placeholder="Jaise: Urgent delivery chahiye, installation bhi chahiye, training chahiye"
                      rows={2} className="w-full bg-slate-900/70 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-4">
                <button onClick={() => setShowCatalog(!showCatalog)} className="w-full flex items-center justify-between text-slate-300 hover:text-white transition-colors">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Upload className="w-4 h-4 text-slate-400" />
                    Admin: Custom Product Catalog Upload (optional)
                  </span>
                  {showCatalog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showCatalog && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 pt-3 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500 mb-3">
                      Product catalog JSON file upload karein. AI is data ko use karke accurate pricing ke saath quotation banayega.
                      {" "}<a href="/product-catalog.json" download className="text-violet-400 hover:underline">Default template download karein →</a>
                    </p>
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 border-dashed text-violet-300 rounded-xl text-sm cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      {catalogFile ? "✅ Catalog uploaded" : "product-catalog.json choose karein"}
                      <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </motion.div>
                )}
              </div>

              <button
                onClick={handleGenerate}
                className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-2xl py-4 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 text-lg"
              >
                <Bot className="w-5 h-5" />
                AI se Quotation Generate Karein
                <Send className="w-4 h-4 ml-1" />
              </button>
            </motion.div>
          )}

          {step === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-24 gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/40">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-white text-xl font-bold">AI Quotation Bana Raha Hai...</h3>
                <p className="text-slate-400 mt-1">Aapki requirements analyse ho rahi hain</p>
              </div>
              <div className="flex flex-col gap-2 text-sm text-slate-500 text-center">
                {["Product catalog check kar raha hai...", "Pricing calculate kar raha hai...", "Professional format mein bana raha hai..."].map((msg, i) => (
                  <motion.p key={msg} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.6 }}>{msg}</motion.p>
                ))}
              </div>
            </motion.div>
          )}

          {step === "result" && quotation && (
            <QuotationPreview q={quotation} onPrint={handlePrint} onNew={handleNew} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
