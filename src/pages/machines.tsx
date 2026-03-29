/**
 * SAI RoloTech — Machine Catalog
 * Categories: Shutter Plant | False Ceiling
 * Shutter Patti Machine: Live with pricing wizard
 * Others: Coming Soon
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useLocation } from "wouter";
import {
  ChevronRight, Play, X, CheckCircle2, ArrowRight, IndianRupee,
  Plus, Minus, Zap, Settings, Star, Clock, Package, Layers,
  ShoppingCart, ExternalLink, Info, Image as ImageIcon, ChevronDown,
} from "lucide-react";

/* ─── YouTube embed helper ───────────────────────────────── */
function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([^?&\s]+)/,
    /youtube\.com\/watch\?v=([^&\s]+)/,
    /youtube\.com\/shorts\/([^?&\s]+)/,
    /youtube\.com\/embed\/([^?&\s]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function YouTubeEmbed({ url, title }: { url: string; title: string }) {
  const id = getYouTubeId(url);
  if (!id) return null;
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ paddingBottom: "56.25%" }}>
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

/* ─── Pricing constants ──────────────────────────────────── */
const PER_STATION: Record<string, number> = { Basic: 45000, Medium: 55000, Advance: 65000 };
const AUTO_ADDON:  Record<string, number> = { Basic: 180000, Medium: 200000, Advance: 225000 };

function calcPrice(grade: string, stations: number, autoType: "semi" | "auto" | "combo"): number {
  const base = PER_STATION[grade] * stations;
  if (autoType === "semi")  return base;
  if (autoType === "auto")  return base + AUTO_ADDON[grade];
  return base + (base + AUTO_ADDON[grade]); // combo = semi + auto
}

function fmtINR(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

/* ─── Product Data ───────────────────────────────────────── */
const SHUTTER_PRODUCTS = [
  {
    id: "shutter-patti",
    name: "Shutter Patti Machine",
    tagline: "Roll Forming Machine for Shutter Strips",
    status: "live" as const,
    gradient: "from-blue-600 to-indigo-700",
    icon: "🏭",
    sizes: ["SAI-4.5\" (115mm)", "SAI-5.0\" (127mm)", "SAI-6.0\" (152mm)"],
    specs: {
      "Sheet Thickness": "0.4 to 1.2 mm",
      "Machine Speed": "6 m/min",
      "Max Length": "No limit",
      "Motor": "5 to 7.5 HP",
    },
    videos: [
      { label: "Basic Machine", url: "https://youtube.com/shorts/LPEQldD5c6g?si=bJdL-7Kihr_BX0FL" },
      { label: "Medium Machine", url: "https://youtube.com/shorts/1DbpzyxH6sw?si=mx3AyLFMYWlu2gZz" },
      { label: "Advance Machine", url: "https://youtu.be/Q8kiahPsCe0?si=Z21gMqe_c7TDOqj0" },
    ],
    description: "High-speed roll forming machine for manufacturing shutter patti strips. Available in 3 width sizes with Standard and Custom Knurling profile options. Configurable from 6 to 16 stations with Basic, Medium, and Advance variants.",
  },
  { id: "side-channel", name: "Side Channel Machine", tagline: "Precision side channel forming", status: "soon" as const, gradient: "from-purple-500 to-violet-700", icon: "⚙️" },
  { id: "bottom-plate", name: "Bottom Plate Machine", tagline: "Bottom plate roll former", status: "soon" as const, gradient: "from-emerald-500 to-teal-700", icon: "🔩" },
  { id: "spring",       name: "Spring Machine",       tagline: "Shutter spring manufacturing",   status: "soon" as const, gradient: "from-orange-500 to-red-600",   icon: "🌀" },
];

const FALSE_CEILING_PRODUCTS = [
  {
    id: "pop-channel",
    name: "POP Channel Machine",
    tagline: "Cross • Main • Angle — 3 profiles",
    status: "live" as const,
    gradient: "from-sky-500 to-blue-700",
    icon: "📐",
    profiles: ["Cross Channel", "Main Channel", "Angle Channel"],
    comboNote: "2-in-1 Combo Available: Cross + Main in one machine",
  },
  {
    id: "gypsum-channel",
    name: "Gypsum Channel Machine",
    tagline: "Ceiling Section • Perimeter • Interior • Angle",
    status: "live" as const,
    gradient: "from-violet-500 to-purple-700",
    icon: "🏗️",
    profiles: ["Ceiling Section", "Perimeter", "Interior", "Angle"],
    comboNote: "3-in-1 Combo Available: up to 3 profiles in one machine",
  },
  {
    id: "metal-partition",
    name: "Metal Partition Machine",
    tagline: "Stud • Floor — Lightweight steel partition",
    status: "live" as const,
    gradient: "from-rose-500 to-red-700",
    icon: "🧱",
    profiles: ["Stud Channel", "Floor Channel"],
    comboNote: "2-in-1 Combo Available: Stud + Floor in one machine",
  },
];

/* ─── Wizard Steps ───────────────────────────────────────── */
type AutoType = "semi" | "auto" | "combo";
type Grade = "Basic" | "Medium" | "Advance";

function ShutterWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [autoType, setAutoType] = useState<AutoType | null>(null);
  const [grade, setGrade]         = useState<Grade | null>(null);
  const [, navigate] = useLocation();

  const DEFAULT_STATIONS = 8;
  const price = grade && autoType ? calcPrice(grade, DEFAULT_STATIONS, autoType) : 0;

  const handleAddToQuote = () => {
    if (!grade || !autoType) return;
    const item = {
      description: `Shutter Patti Machine — ${grade} | ${autoType === "semi" ? "Semi-Automatic" : autoType === "auto" ? "Fully Automatic" : "Combo (Semi + Auto)"}`,
      hsn: "8455",
      quantity: 1,
      unit: "NOS",
      unitPrice: price,
    };
    localStorage.setItem("sai_pending_quote_item", JSON.stringify(item));
    onClose();
    navigate("/quotation-maker");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        style={{ maxHeight: "92vh" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium opacity-80">🏭 Shutter Patti Machine</p>
              <h2 className="text-base font-bold">Configure Your Machine</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Step bar */}
          <div className="flex items-center gap-1.5 mt-3">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? "bg-white" : "bg-white/30"}`} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] opacity-70 mt-1">
            <span>Type</span><span>Grade</span><span>Price</span>
          </div>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(92vh - 120px)" }}>
          <div className="p-5">

            {/* Step 1: Auto / Semi-Auto */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">Machine Type kya chahiye?</h3>
                {[
                  { value: "semi" as AutoType, label: "Semi-Automatic", sub: "Circular blade cut-off · Manual cutting", icon: "⚙️", color: "border-blue-400 bg-blue-50" },
                  { value: "auto" as AutoType, label: "Fully Automatic", sub: "Hydraulic die cut-off · Flying cut-off system", icon: "🤖", color: "border-indigo-400 bg-indigo-50" },
                  { value: "combo" as AutoType, label: "Combo — Semi + Auto", sub: "Both machines together · Best value deal", icon: "⚡", color: "border-purple-400 bg-purple-50" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setAutoType(opt.value); setStep(2); }}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${autoType === opt.value ? opt.color + " border-opacity-100" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.sub}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </motion.div>
            )}

            {/* Step 2: Grade */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">Machine Grade Select Karein</h3>
                {([
                  {
                    value: "Basic" as Grade, icon: "🔵", color: "border-blue-400 bg-blue-50",
                    perStation: 45000,
                    highlights: ["En8 Rolls", "35mm Shaft", "Lathe Machining", "1 Year Roll Warranty", "Chain Drive"],
                  },
                  {
                    value: "Medium" as Grade, icon: "🟣", color: "border-purple-400 bg-purple-50",
                    perStation: 55000,
                    highlights: ["En31 Rolls", "45mm Shaft", "CNC Machining", "2 Year Roll Warranty", "Worm Gear"],
                  },
                  {
                    value: "Advance" as Grade, icon: "🟠", color: "border-orange-400 bg-orange-50",
                    perStation: 65000,
                    highlights: ["D3 Rolls", "50mm Shaft", "CNC + Advanced", "5 Year Roll Warranty", "FAG German Bearings"],
                  },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setGrade(opt.value); setStep(3); }}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${grade === opt.value ? opt.color + " border-opacity-100" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{opt.icon}</span>
                        <span className="text-sm font-bold text-gray-800">{opt.value} Machine</span>
                      </div>
                      <span className="text-xs font-bold text-gray-500">₹{(opt.perStation / 1000).toFixed(0)}K/station</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {opt.highlights.map(h => (
                        <span key={h} className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-600">{h}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {/* Step 3: Price Summary */}
            {step === 3 && grade && autoType && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white text-center">
                  <p className="text-xs opacity-80 mb-1">Your Machine Price</p>
                  <p className="text-4xl font-black">{fmtINR(price)}</p>
                  <p className="text-xs opacity-70 mt-1">+ GST 18% extra</p>
                </div>

                {/* Breakdown */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 text-sm">
                  <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Price Breakdown</p>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base ({DEFAULT_STATIONS} stations × ₹{(PER_STATION[grade] / 1000).toFixed(0)}K)</span>
                    <span className="font-semibold">{fmtINR(PER_STATION[grade] * DEFAULT_STATIONS)}</span>
                  </div>
                  {autoType !== "semi" && (
                    <div className="flex justify-between text-blue-700">
                      <span>Automatic Upgrade</span>
                      <span className="font-semibold">+ {fmtINR(AUTO_ADDON[grade])}</span>
                    </div>
                  )}
                  {autoType === "combo" && (
                    <div className="flex justify-between text-purple-700">
                      <span>Semi-Auto Unit</span>
                      <span className="font-semibold">+ {fmtINR(PER_STATION[grade] * DEFAULT_STATIONS)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800">
                    <span>Total (excl. GST)</span>
                    <span>{fmtINR(price)}</span>
                  </div>
                </div>

                {/* Config summary */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  {[
                    { l: "Type", v: autoType === "semi" ? "Semi-Auto" : autoType === "auto" ? "Fully Auto" : "Combo" },
                    { l: "Grade", v: grade },
                  ].map(({ l, v }) => (
                    <div key={l} className="bg-gray-50 rounded-xl p-2.5">
                      <p className="font-bold text-gray-800">{v}</p>
                      <p className="text-gray-500 mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>

                {/* Terms */}
                <div className="text-[10px] text-gray-500 space-y-0.5">
                  <p>• 50% advance with confirmed order, 30% progress, 20% on delivery</p>
                  <p>• Delivery: 20-60 days · Installation: 4% extra · GST 18% extra</p>
                  <p>• Trial material by owner · Transportation extra</p>
                </div>

                {/* Actions */}
                <div className="space-y-2.5">
                  <button
                    onClick={handleAddToQuote}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg"
                  >
                    <ShoppingCart className="w-4 h-4" /> Quotation Mein Add Karein
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-2xl text-sm font-medium"
                  >
                    Dobara Configure Karein
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Machine Detail Sheet ───────────────────────────────── */
function MachineDetail({ product, onClose, onConfigure }: { product: typeof SHUTTER_PRODUCTS[0]; onClose: () => void; onConfigure?: () => void }) {
  const [activeVideo, setActiveVideo] = useState(0);

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        <div className={`bg-gradient-to-r ${product.gradient} px-5 py-5 text-white`}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-3xl">{product.icon}</span>
              <h2 className="text-lg font-bold mt-1">{product.name}</h2>
              <p className="text-xs opacity-80">{product.tagline}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 130px)" }}>
          <div className="p-5 space-y-4">

            {/* Videos */}
            {"videos" in product && product.videos && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Videos</p>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {product.videos.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveVideo(i)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all
                        ${activeVideo === i ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
                    >
                      <Play className="w-3 h-3 inline mr-1" />{v.label}
                    </button>
                  ))}
                </div>
                <YouTubeEmbed url={product.videos[activeVideo].url} title={product.videos[activeVideo].label} />
              </div>
            )}

            {/* Description */}
            {"description" in product && product.description && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Sizes */}
            {"sizes" in product && product.sizes && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Available Sizes</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <span key={s} className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Specs */}
            {"specs" in product && product.specs && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Specifications</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div key={k} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500">{k}</p>
                      <p className="text-xs font-semibold text-gray-800 mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Configure CTA */}
            {product.status === "live" && onConfigure && (
              <button
                onClick={onConfigure}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <Settings className="w-4 h-4" /> Price Configure Karein
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Product Card ───────────────────────────────────────── */
function ProductCard({ product, onView, onConfigure }: {
  product: { id: string; name: string; tagline: string; status: "live" | "soon"; gradient: string; icon: string; profiles?: string[]; comboNote?: string };
  onView: () => void;
  onConfigure?: () => void;
}) {
  return (
    <motion.div variants={staggerItem} className="relative group">
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${product.gradient} p-5 text-white shadow-lg`}>
        {/* Status badge */}
        <div className="absolute top-4 right-4">
          {product.status === "live" ? (
            <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" /> LIVE
            </span>
          ) : (
            <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3" /> Coming Soon
            </span>
          )}
        </div>

        <div className="text-3xl mb-3">{product.icon}</div>
        <h3 className="text-base font-bold leading-tight">{product.name}</h3>
        <p className="text-xs opacity-80 mt-1">{product.tagline}</p>

        {/* Profiles */}
        {"profiles" in product && product.profiles && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.profiles.map(p => (
              <span key={p} className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{p}</span>
            ))}
          </div>
        )}

        {/* Combo note */}
        {"comboNote" in product && product.comboNote && (
          <div className="mt-2 text-[10px] bg-white/15 rounded-xl px-2.5 py-1.5 flex items-center gap-1">
            <Zap className="w-3 h-3 shrink-0" /> {product.comboNote}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          {product.status === "live" ? (
            <>
              <button
                onClick={onView}
                className="flex-1 py-2.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-xl transition-all backdrop-blur-sm"
              >
                Details Dekho
              </button>
              <button
                onClick={onConfigure}
                className="flex-1 py-2.5 bg-white text-blue-700 text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                Price Configure
              </button>
            </>
          ) : (
            <div className="w-full py-2.5 bg-white/10 text-white/60 text-xs font-medium rounded-xl text-center">
              Jald Aayega — Notify Karein
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── False Ceiling Pricing Modal ───────────────────────── */
const FC_PRICING = {
  "pop-channel": {
    profiles: ["Cross Channel", "Main Channel", "Angle Channel"],
    rows: [
      { label: "Semi-Auto (Row Model)",     semi: 300000, auto: 500000 },
      { label: "Basic Model",               semi: 350000, auto: 550000 },
      { label: "Medium Model",              semi: 400000, auto: 600000 },
      { label: "Advance Model",             semi: 450000, auto: 650000 },
    ],
    combos: [
      { label: "2-in-1 Semi (Cross+Main)",  price: 600000 },
      { label: "2-in-1 Auto (Cross+Main)",  price: 1000000 },
      { label: "3-in-1 Semi (All 3)",       price: 900000 },
      { label: "3-in-1 Auto (All 3)",       price: 1500000 },
    ],
    video: "https://youtu.be/Jc7vmbXE510",
  },
  "gypsum-channel": {
    profiles: ["Ceiling Section", "Perimeter", "Interior", "Angle"],
    rows: [
      { label: "Semi-Auto (Row Model)",     semi: 300000, auto: 500000 },
      { label: "Basic Model",               semi: 350000, auto: 550000 },
      { label: "Medium Model",              semi: 400000, auto: 600000 },
      { label: "Advance Model",             semi: 450000, auto: 650000 },
    ],
    combos: [
      { label: "2-in-1 Semi",              price: 600000 },
      { label: "2-in-1 Auto",              price: 1000000 },
      { label: "3-in-1 Semi",              price: 850000 },
      { label: "3-in-1 Auto",              price: 1450000 },
    ],
    video: "https://youtu.be/r6Yl_6JUSq8",
  },
  "metal-partition": {
    profiles: ["Stud Channel", "Floor Channel"],
    rows: [
      { label: "Semi-Auto (Row Model)",     semi: 350000, auto: 550000 },
      { label: "Basic Model",               semi: 400000, auto: 600000 },
      { label: "Medium Model",              semi: 450000, auto: 650000 },
      { label: "Advance Model",             semi: 500000, auto: 700000 },
    ],
    combos: [
      { label: "2-in-1 Semi (Stud+Floor)", price: 700000 },
      { label: "2-in-1 Auto (Stud+Floor)", price: 1100000 },
    ],
    video: "https://youtu.be/v3mTc7Li-1s",
  },
} as const;

function FalseCeilingDetail({ product, onClose }: {
  product: typeof FALSE_CEILING_PRODUCTS[0];
  onClose: () => void;
}) {
  const pricing = FC_PRICING[product.id as keyof typeof FC_PRICING];
  const [tab, setTab] = useState<"price" | "video">("price");
  const [, navigate] = useLocation();

  const handleInquiry = () => {
    const msg = encodeURIComponent(
      `Namaste SAI RoloTech!\n\nMujhe ${product.name} ke baare mein jaankari chahiye.\n\nProfiles: ${product.profiles?.join(", ")}\n\nPlease quote bhejein.`
    );
    window.open(`https://wa.me/919899925274?text=${msg}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        style={{ maxHeight: "92vh" }}
      >
        <div className={`bg-gradient-to-r ${product.gradient} px-5 py-4 text-white`}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-2xl">{product.icon}</span>
              <h2 className="text-base font-bold mt-1">{product.name}</h2>
              <p className="text-xs opacity-80">{product.tagline}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Profiles */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {product.profiles?.map(p => (
              <span key={p} className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{p}</span>
            ))}
          </div>
          {/* Tabs */}
          <div className="flex gap-2 mt-3">
            {[{ id: "price", l: "💰 Pricing" }, { id: "video", l: "▶ Video" }].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all
                  ${tab === t.id ? "bg-white text-gray-800" : "bg-white/20 text-white"}`}
              >{t.l}</button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(92vh - 180px)" }}>
          <div className="p-4 space-y-3">

            {tab === "price" && pricing && (
              <>
                {/* Price table */}
                <div className="bg-gray-50 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-3 bg-gray-200 text-[10px] font-bold text-gray-600 px-3 py-2">
                    <span>Model</span>
                    <span className="text-center">Semi-Auto</span>
                    <span className="text-center">Full Auto</span>
                  </div>
                  {pricing.rows.map((row, i) => (
                    <div key={i} className={`grid grid-cols-3 px-3 py-2.5 text-xs ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                      <span className="text-gray-700 font-medium">{row.label}</span>
                      <span className="text-center font-bold text-emerald-700">{fmtINR(row.semi)}</span>
                      <span className="text-center font-bold text-blue-700">{fmtINR(row.auto)}</span>
                    </div>
                  ))}
                </div>

                {/* Combo options */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">⚡ Combo Deals</p>
                  <div className="grid grid-cols-2 gap-2">
                    {pricing.combos.map((c, i) => (
                      <div key={i} className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-200 rounded-xl p-3">
                        <p className="text-[10px] font-bold text-blue-800">{c.label}</p>
                        <p className="text-sm font-black text-blue-700 mt-1">{fmtINR(c.price)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms mini */}
                <div className="text-[10px] text-gray-500 bg-amber-50 rounded-xl p-3 space-y-0.5">
                  <p>• GST 18% extra · Installation 4% extra · Transport extra</p>
                  <p>• Warranty: 1 year on rolls · Payment: 50-30-20</p>
                  <p>• Delivery: 20-60 days from confirmed order</p>
                </div>
              </>
            )}

            {tab === "video" && pricing?.video && (
              <YouTubeEmbed url={pricing.video} title={product.name} />
            )}

            {/* Combo note */}
            {product.comboNote && (
              <div className="flex gap-2 bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                <Zap className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-700 font-medium">{product.comboNote}</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => { onClose(); navigate("/quotation-maker"); }}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" /> Quotation Banana Hai
              </button>
              <button
                onClick={handleInquiry}
                className="w-full py-2.5 border-2 border-green-500 text-green-700 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" /> WhatsApp pe Poochein
              </button>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function MachineCatalogPage() {
  const [activeCategory, setActiveCategory] = useState<"shutter" | "ceiling">("shutter");
  const [selectedProduct, setSelectedProduct] = useState<typeof SHUTTER_PRODUCTS[0] | null>(null);
  const [selectedCeilingProduct, setSelectedCeilingProduct] = useState<typeof FALSE_CEILING_PRODUCTS[0] | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showCeilingDetail, setShowCeilingDetail] = useState(false);

  const categories = [
    { id: "shutter" as const, label: "Shutter Plant", icon: "🏭", count: SHUTTER_PRODUCTS.length, live: 1 },
    { id: "ceiling" as const, label: "False Ceiling", icon: "🏗️", count: FALSE_CEILING_PRODUCTS.length, live: 3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-10">

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-4 pt-6 pb-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-blue-200 text-xs font-medium mb-1">SAI RoloTech CRM</p>
          <h1 className="text-2xl font-black text-white">Machine Catalog</h1>
          <p className="text-blue-200 text-sm mt-1">Roll Forming Machines — Configure & Quote</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4">

        {/* Category Tabs */}
        <div className="flex gap-3 mb-5">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-1 flex flex-col items-center py-3.5 rounded-2xl border-2 transition-all font-medium text-sm
                ${activeCategory === cat.id
                  ? "bg-white border-blue-500 shadow-lg shadow-blue-100"
                  : "bg-white/70 border-transparent hover:border-gray-200"}`}
            >
              <span className="text-xl mb-1">{cat.icon}</span>
              <span className={`text-xs font-bold ${activeCategory === cat.id ? "text-blue-700" : "text-gray-600"}`}>{cat.label}</span>
              <div className="flex items-center gap-1 mt-1">
                {cat.live > 0 && (
                  <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">{cat.live} Live</span>
                )}
                <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{cat.count} Total</span>
              </div>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {activeCategory === "shutter" && SHUTTER_PRODUCTS.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onView={() => { setSelectedProduct(p); setShowDetail(true); setShowWizard(false); }}
                onConfigure={() => { setSelectedProduct(p); setShowWizard(true); setShowDetail(false); }}
              />
            ))}
            {activeCategory === "ceiling" && FALSE_CEILING_PRODUCTS.map(p => (
              <ProductCard
                key={p.id}
                product={p as any}
                onView={() => { setSelectedCeilingProduct(p); setShowCeilingDetail(true); }}
                onConfigure={() => { setSelectedCeilingProduct(p); setShowCeilingDetail(true); }}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Info strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-5 bg-amber-50 border border-amber-200 rounded-2xl p-4"
        >
          <div className="flex gap-3">
            <span className="text-xl shrink-0">💡</span>
            <div>
              <p className="text-xs font-bold text-amber-800">Custom Machines Available</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Koi bhi custom profile chahiye? Size, material, ya special configuration — hum banate hain.
                Contact: +91-9899925274
              </p>
            </div>
          </div>
        </motion.div>

        {/* PDF Price note */}
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-blue-800 mb-1">📋 Terms & Conditions</p>
          <div className="text-[11px] text-blue-700 space-y-0.5">
            <p>• GST 18% extra on all machines</p>
            <p>• Delivery: 20-60 days · Installation: 4% extra</p>
            <p>• Warranty: 1-5 years on rolls (grade-wise)</p>
            <p>• Payment: 50% advance, 30% progress, 20% on delivery</p>
          </div>
        </div>

      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDetail && selectedProduct && (
          <MachineDetail
            product={selectedProduct}
            onClose={() => setShowDetail(false)}
            onConfigure={() => { setShowDetail(false); setShowWizard(true); }}
          />
        )}
        {showWizard && (
          <ShutterWizard onClose={() => setShowWizard(false)} />
        )}
        {showCeilingDetail && selectedCeilingProduct && (
          <FalseCeilingDetail
            product={selectedCeilingProduct}
            onClose={() => setShowCeilingDetail(false)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
