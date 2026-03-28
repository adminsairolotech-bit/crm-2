import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, ArrowLeft, Send, Printer,
  CheckCircle2, User, Phone, Mail, Building2,
  Package, Loader2, RefreshCw, Upload, ChevronDown, ChevronUp
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
            <CheckCircle2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
            <span className="text-emerald-600 font-semibold">Quotation Ready!</span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">Ref: {q.quotationNo} · Valid till {q.validUntil}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onNew}
            aria-label="Create new quotation"
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Naya
          </button>
          <button
            onClick={onPrint}
            aria-label="Print or save quotation"
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            Print / Save
          </button>
        </div>
      </div>

      <div id="quotation-print" className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">SAI RoloTech</h2>
              <p className="text-blue-200 text-sm mt-0.5">Industrial Automation Solutions</p>
              <p className="text-blue-200 text-xs mt-2">MIDC Industrial Area, Pune, Maharashtra - 411019</p>
              <p className="text-blue-200 text-xs">📞 +91 98765 43210 · ✉ inquirysairolotech@gmail.com</p>
              <p className="text-blue-200 text-xs">GSTIN: 27AABCS1429B1Z1</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 rounded-xl px-4 py-3">
                <p className="text-xs text-blue-200 font-medium">QUOTATION</p>
                <p className="text-xl font-bold mt-0.5">{q.quotationNo}</p>
                <p className="text-xs text-blue-200 mt-1">Date: {q.date}</p>
                <p className="text-xs text-blue-200">Valid: {q.validUntil}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bill To</h3>
          <p className="font-bold text-gray-900 text-lg">{q.client.name}</p>
          {q.client.company !== "Individual" && <p className="text-gray-600 text-sm">{q.client.company}</p>}
          <p className="text-gray-600 text-sm">📞 {q.client.phone}</p>
          {q.client.email !== "N/A" && <p className="text-gray-600 text-sm">✉ {q.client.email}</p>}
        </div>

        <div className="p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100">
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
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
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
                <span>Subtotal</span><span>{formatINR(q.subtotal)}</span>
              </div>
              {q.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-700">
                  <span>Discount ({q.discount}%)</span><span>- {formatINR(q.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Taxable Amount</span><span>{formatINR(q.taxableAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>GST ({q.gstRate}%)</span><span>{formatINR(q.gstAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-gray-300 pt-2 text-gray-900">
                <span>Grand Total</span>
                <span className="text-blue-700">{formatINR(q.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="font-bold text-blue-800 mb-1">Payment Terms</p>
            <p className="text-blue-700">{q.paymentTerms}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3">
            <p className="font-bold text-emerald-800 mb-1">Delivery</p>
            <p className="text-emerald-700">{q.deliveryTerms}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3">
            <p className="font-bold text-amber-800 mb-1">Warranty</p>
            <p className="text-amber-700">{q.warranty}</p>
          </div>
        </div>

        {q.notes && (
          <div className="px-6 pb-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-gray-600">
              <p className="font-bold text-gray-800 mb-1">Notes</p>
              <p>{q.notes}</p>
            </div>
          </div>
        )}

        <div className="px-6 pb-6 flex items-end justify-between">
          <p className="text-xs text-gray-400">This is a computer-generated quotation.</p>
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

const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all";

export default function AIQuotePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #quotation-print, #quotation-print * { visibility: visible; }
          #quotation-print { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      {/* Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setLocation("/home")}
            aria-label="Go back"
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
            <Bot className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-slate-800 font-semibold text-sm">AI Quotation Maker</h1>
            <p className="text-slate-400 text-xs">SAI RoloTech · Powered by Gemini AI</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 mb-3">
                  <Bot className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                  <span className="text-blue-700 text-sm font-medium">AI se Instant Quotation Paayein</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Apni Requirements Batayein</h2>
                <p className="text-slate-500 text-sm mt-1">Kuch seconds mein professional quotation ready ho jayegi</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Details */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                  <h3 className="text-slate-800 font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" aria-hidden="true" /> Client Details
                  </h3>
                  <div>
                    <label htmlFor="q-client-name" className="block text-xs font-medium text-slate-600 mb-1">Aapka Naam *</label>
                    <input id="q-client-name" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })}
                      placeholder="Rahul Kumar" aria-required="true" className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="q-client-phone" className="block text-xs font-medium text-slate-600 mb-1">Phone Number *</label>
                    <input id="q-client-phone" value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })}
                      placeholder="+91 98765 43210" type="tel" aria-required="true" className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="q-client-email" className="block text-xs font-medium text-slate-600 mb-1">Email (optional)</label>
                    <input id="q-client-email" value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })}
                      placeholder="aapka@email.com" type="email" className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="q-client-company" className="block text-xs font-medium text-slate-600 mb-1">Company / Firm (optional)</label>
                    <input id="q-client-company" value={form.clientCompany} onChange={e => setForm({ ...form, clientCompany: e.target.value })}
                      placeholder="Jaise: ABC Industries" className={inputCls} />
                  </div>
                </div>

                {/* Product Requirements */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                  <h3 className="text-slate-800 font-semibold flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-500" aria-hidden="true" /> Product Requirements
                  </h3>
                  <div>
                    <label htmlFor="q-products" className="block text-xs font-medium text-slate-600 mb-1">Kya chahiye? (Products / Machines) *</label>
                    <textarea id="q-products" value={form.products} onChange={e => setForm({ ...form, products: e.target.value })}
                      placeholder="Jaise: 2x PLC Panel Siemens S7-1200, 1x HMI 7 inch, 1x VFD 5.5kW"
                      rows={3} aria-required="true" className={`${inputCls} resize-none`} />
                  </div>
                  <div>
                    <label htmlFor="q-budget" className="block text-xs font-medium text-slate-600 mb-1">Budget (approximate)</label>
                    <input id="q-budget" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}
                      placeholder="Jaise: ₹2,00,000 tak" className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="q-requirements" className="block text-xs font-medium text-slate-600 mb-1">Special Requirements</label>
                    <textarea id="q-requirements" value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })}
                      placeholder="Jaise: Urgent delivery chahiye, installation bhi chahiye, training chahiye"
                      rows={2} className={`${inputCls} resize-none`} />
                  </div>
                </div>
              </div>

              {/* Catalog Upload */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <button
                  onClick={() => setShowCatalog(!showCatalog)}
                  aria-expanded={showCatalog}
                  className="w-full flex items-center justify-between text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Upload className="w-4 h-4 text-slate-400" aria-hidden="true" />
                    Admin: Custom Product Catalog Upload (optional)
                  </span>
                  {showCatalog
                    ? <ChevronUp className="w-4 h-4" aria-hidden="true" />
                    : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
                </button>
                {showCatalog && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-3">
                      Product catalog JSON file upload karein. AI is data ko use karke accurate pricing ke saath quotation banayega.
                      {" "}<a href="/product-catalog.json" download className="text-blue-600 hover:underline">Default template download karein →</a>
                    </p>
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 border-dashed text-blue-700 rounded-xl text-sm cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" aria-hidden="true" />
                      {catalogFile ? "✅ Catalog uploaded" : "product-catalog.json choose karein"}
                      <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" aria-label="Upload product catalog JSON" />
                    </label>
                  </motion.div>
                )}
              </div>

              <button
                onClick={handleGenerate}
                aria-label="Generate AI quotation"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-2xl py-4 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 text-lg focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                <Bot className="w-5 h-5" aria-hidden="true" />
                AI se Quotation Generate Karein
                <Send className="w-4 h-4 ml-1" aria-hidden="true" />
              </button>
            </motion.div>
          )}

          {step === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-24 gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-200">
                  <Bot className="w-10 h-10 text-white" aria-hidden="true" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" aria-hidden="true" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-slate-800 text-xl font-bold">AI Quotation Bana Raha Hai...</h3>
                <p className="text-slate-500 mt-1">Aapki requirements analyse ho rahi hain</p>
              </div>
              <div className="flex flex-col gap-2 text-sm text-slate-400 text-center" aria-live="polite">
                {["Product catalog check kar raha hai...", "Pricing calculate kar raha hai...", "Professional format mein bana raha hai..."].map((msg, i) => (
                  <motion.p key={msg} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.6 }}>{msg}</motion.p>
                ))}
              </div>
            </motion.div>
          )}

          {step === "result" && quotation && (
            <QuotationPreview q={quotation} onPrint={() => window.print()} onNew={() => { setQuotation(null); setStep("form"); setForm({ ...form, products: "", budget: "", requirements: "" }); }} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
