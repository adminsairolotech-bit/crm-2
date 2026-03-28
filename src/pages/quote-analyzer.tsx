import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, Loader2, CheckCircle, XCircle, AlertTriangle,
  TrendingUp, TrendingDown, Minus, Star, Upload, FileText,
  ThumbsUp, ThumbsDown, IndianRupee, ShieldAlert, Lightbulb,
  ClipboardList, RefreshCw, ChevronRight, Sparkles, Eye
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProItem { point: string; detail: string; }
interface ConItem { point: string; detail: string; severity: "High" | "Medium" | "Low"; }
interface Analysis {
  companyName: string;
  quotationRef: string;
  totalAmount: string;
  overallScore: number;
  overallVerdict: "Excellent" | "Good" | "Average" | "Below Average" | "Poor";
  summary: string;
  pros: ProItem[];
  cons: ConItem[];
  priceAnalysis: { verdict: string; detail: string; savingOpportunity: string };
  missingItems: string[];
  redFlags: string[];
  recommendations: string[];
  sairolotech_advantage: string;
}

const SAMPLE_QUOTE = `Quotation from: XYZ Automation Solutions
Quotation No: XYZ-2025-0892
Date: 15/03/2025

Client: Ravi Industries, Pune

Items:
1. Siemens S7-1200 PLC - Qty: 2 - Rate: 65,000 - Amount: 1,30,000
2. Delta HMI 7 inch - Qty: 1 - Rate: 25,000 - Amount: 25,000
3. Delta VFD 5.5kW - Qty: 3 - Rate: 18,000 - Amount: 54,000
4. Panel Manufacturing (MS) - Qty: 1 - Rate: 35,000 - Amount: 35,000

Subtotal: 2,44,000
GST 18%: 43,920
Grand Total: 2,87,920

Payment: 100% advance
Delivery: 30 days
Warranty: 6 months`;

function ScoreRing({ score }: { score: number }) {
  const color = score >= 8 ? "#22c55e" : score >= 6 ? "#f59e0b" : score >= 4 ? "#f97316" : "#ef4444";
  const circumference = 2 * Math.PI * 38;
  const strokeDashoffset = circumference - (score / 10) * circumference;
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="38" fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle cx="50" cy="50" r="38" fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold text-white">{score}</div>
        <div className="text-xs text-slate-400">/10</div>
      </div>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const map: Record<string, string> = {
    "Excellent": "bg-green-500/20 border-green-500/40 text-green-300",
    "Good": "bg-blue-500/20 border-blue-500/40 text-blue-300",
    "Average": "bg-yellow-500/20 border-yellow-500/40 text-yellow-300",
    "Below Average": "bg-orange-500/20 border-orange-500/40 text-orange-300",
    "Poor": "bg-red-500/20 border-red-500/40 text-red-300",
  };
  return <span className={`px-3 py-1 rounded-full border text-sm font-semibold ${map[verdict] || map["Average"]}`}>{verdict}</span>;
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    "High": "bg-red-500/20 text-red-300 border border-red-500/30",
    "Medium": "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
    "Low": "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[severity] || map["Low"]}`}>{severity}</span>;
}

function PriceVerdictIcon({ verdict }: { verdict: string }) {
  if (verdict === "Overpriced") return <TrendingUp className="w-5 h-5 text-red-400" />;
  if (verdict === "Competitive") return <TrendingDown className="w-5 h-5 text-green-400" />;
  if (verdict === "Fair") return <Minus className="w-5 h-5 text-yellow-400" />;
  return <AlertTriangle className="w-5 h-5 text-orange-400" />;
}

export default function QuoteAnalyzerPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"input" | "loading" | "result">("input");
  const [quotationText, setQuotationText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setQuotationText(text);
      toast({ title: "File loaded!", description: `${file.name} ka content paste ho gaya.` });
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!quotationText.trim() || quotationText.trim().length < 30) {
      toast({ title: "Quotation paste karein", description: "Analyze karne ke liye quotation text chahiye.", variant: "destructive" });
      return;
    }

    setStep("loading");

    let catalogData = null;
    try {
      const stored = localStorage.getItem("sai_product_catalog");
      if (stored) catalogData = JSON.parse(stored);
      else {
        const res = await fetch("/product-catalog.json");
        if (res.ok) catalogData = await res.json();
      }
    } catch { /* ok */ }

    try {
      const res = await fetch("/api/analyze-quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotationText, catalogData }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        setStep("result");
      } else {
        throw new Error(data.error || "AI response error");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Analysis Failed", description: msg, variant: "destructive" });
      setStep("input");
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setStep("input");
    setQuotationText("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-violet-600/8 blur-3xl" />
      </div>

      <header className="relative border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => setLocation("/home")} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
            <Search className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm">AI Quotation Analyzer</h1>
            <p className="text-slate-500 text-xs">Kisi bhi company ki quotation check karein · Powered by Gemini AI</p>
          </div>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === "input" && (
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-blue-300 text-sm">AI Quotation Analyzer</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Kisi Bhi Quotation Ko Analyze Karein</h2>
                <p className="text-slate-400 text-sm mt-1">Competitor ya kisi bhi company ki quotation paste karein — AI batayega kya sahi hai, kya galat hai</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: ThumbsUp, label: "Kya Acha Hai", desc: "Pros & strong points", color: "text-green-400 bg-green-500/10 border-green-500/20" },
                  { icon: ThumbsDown, label: "Kya Bura Hai", desc: "Cons & red flags", color: "text-red-400 bg-red-500/10 border-red-500/20" },
                  { icon: IndianRupee, label: "Price Analysis", desc: "Overpriced ya fair?", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className={`rounded-xl border p-3 flex items-center gap-3 ${item.color}`}>
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-white">{item.label}</div>
                        <div className="text-xs opacity-70">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    Quotation Text Paste Karein
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setQuotationText(SAMPLE_QUOTE)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 rounded-lg text-xs transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      Sample Load
                    </button>
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer">
                      <Upload className="w-3 h-3" />
                      File Upload
                      <input type="file" accept=".txt,.csv" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <textarea
                  value={quotationText}
                  onChange={e => setQuotationText(e.target.value)}
                  placeholder={`Yahan kisi bhi company ki quotation paste karein...\n\nJaise:\nQuotation from: ABC Company\nItem: PLC Panel - ₹75,000\nItem: HMI 7" - ₹30,000\nGST 18%: ₹18,900\nTotal: ₹1,23,900\n\n...ya upar "Sample Load" button click karein demo dekhne ke liye`}
                  rows={14}
                  className="w-full bg-slate-900/70 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none font-mono"
                />

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{quotationText.length} characters</span>
                  {quotationText.length > 0 && (
                    <button onClick={() => setQuotationText("")} className="text-slate-500 hover:text-red-400 transition-colors">Clear</button>
                  )}
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-2xl py-4 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 text-lg"
              >
                <Search className="w-5 h-5" />
                AI se Analyze Karein
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-24 gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/40">
                  <Search className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-white text-xl font-bold">AI Analyze Kar Raha Hai...</h3>
                <p className="text-slate-400 mt-1">Quotation ki har line check ho rahi hai</p>
              </div>
              <div className="flex flex-col gap-2 text-sm text-slate-500 text-center">
                {[
                  "Products aur pricing identify kar raha hai...",
                  "Market rates se compare kar raha hai...",
                  "Hidden issues dhundh raha hai...",
                  "Professional report bana raha hai...",
                ].map((msg, i) => (
                  <motion.p key={msg} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.5 }}>{msg}</motion.p>
                ))}
              </div>
            </motion.div>
          )}

          {step === "result" && analysis && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-semibold">Analysis Complete!</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-0.5">{analysis.companyName} · Ref: {analysis.quotationRef}</p>
                </div>
                <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 rounded-lg text-sm transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Naya
                </button>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <ScoreRing score={analysis.overallScore} />
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                      <VerdictBadge verdict={analysis.overallVerdict} />
                      {analysis.totalAmount !== "N/A" && (
                        <span className="bg-slate-700 border border-slate-600 text-slate-200 px-3 py-1 rounded-full text-sm font-semibold">
                          {analysis.totalAmount}
                        </span>
                      )}
                    </div>
                    <h3 className="text-white text-lg font-bold">{analysis.companyName}</h3>
                    <p className="text-slate-400 text-sm mt-1">{analysis.summary}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5 space-y-3">
                  <h4 className="text-green-400 font-semibold flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4" /> Kya Acha Hai ({analysis.pros?.length || 0})
                  </h4>
                  {(analysis.pros || []).map((pro, i) => (
                    <div key={i} className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white text-sm font-medium">{pro.point}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{pro.detail}</p>
                      </div>
                    </div>
                  ))}
                  {(!analysis.pros || analysis.pros.length === 0) && (
                    <p className="text-slate-500 text-sm">Koi visible pros nahi mile.</p>
                  )}
                </div>

                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 space-y-3">
                  <h4 className="text-red-400 font-semibold flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4" /> Kya Bura Hai ({analysis.cons?.length || 0})
                  </h4>
                  {(analysis.cons || []).map((con, i) => (
                    <div key={i} className="flex gap-2">
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white text-sm font-medium">{con.point}</p>
                          <SeverityBadge severity={con.severity} />
                        </div>
                        <p className="text-slate-400 text-xs mt-0.5">{con.detail}</p>
                      </div>
                    </div>
                  ))}
                  {(!analysis.cons || analysis.cons.length === 0) && (
                    <p className="text-slate-500 text-sm">Koi major cons nahi mile.</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
                <h4 className="text-white font-semibold flex items-center gap-2 mb-3">
                  <IndianRupee className="w-4 h-4 text-yellow-400" /> Price Analysis
                </h4>
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2">
                    <PriceVerdictIcon verdict={analysis.priceAnalysis?.verdict} />
                    <span className={`font-bold text-sm ${
                      analysis.priceAnalysis?.verdict === "Overpriced" ? "text-red-400" :
                      analysis.priceAnalysis?.verdict === "Competitive" ? "text-green-400" :
                      analysis.priceAnalysis?.verdict === "Fair" ? "text-yellow-400" : "text-orange-400"
                    }`}>{analysis.priceAnalysis?.verdict}</span>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mt-2">{analysis.priceAnalysis?.detail}</p>
                {analysis.priceAnalysis?.savingOpportunity && (
                  <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
                    <p className="text-green-300 text-sm">💡 {analysis.priceAnalysis.savingOpportunity}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.missingItems && analysis.missingItems.length > 0 && (
                  <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-5">
                    <h4 className="text-orange-400 font-semibold flex items-center gap-2 mb-3">
                      <ClipboardList className="w-4 h-4" /> Jo Missing Hai
                    </h4>
                    <div className="space-y-1.5">
                      {analysis.missingItems.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                          <p className="text-slate-300 text-sm">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.redFlags && analysis.redFlags.length > 0 && (
                  <div className="bg-red-500/5 border border-red-500/30 rounded-2xl p-5">
                    <h4 className="text-red-400 font-semibold flex items-center gap-2 mb-3">
                      <ShieldAlert className="w-4 h-4" /> Red Flags ⚠️
                    </h4>
                    <div className="space-y-1.5">
                      {analysis.redFlags.map((flag, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                          <p className="text-slate-300 text-sm">{flag}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-5">
                  <h4 className="text-violet-400 font-semibold flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4" /> AI Recommendations
                  </h4>
                  <div className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-bold flex-shrink-0 flex items-center justify-center mt-0.5">{i + 1}</span>
                        <p className="text-slate-300 text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.sairolotech_advantage && (
                <div className="bg-gradient-to-r from-violet-600/15 to-blue-600/15 border border-violet-500/30 rounded-2xl p-5 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">SAI RoloTech Advantage</h4>
                    <p className="text-slate-300 text-sm">{analysis.sairolotech_advantage}</p>
                    <button
                      onClick={() => setLocation("/ai-quote")}
                      className="mt-3 flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
                    >
                      SAI RoloTech se quotation mangwayein <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
