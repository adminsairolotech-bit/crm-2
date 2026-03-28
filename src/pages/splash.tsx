import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashPage() {
  const [, setLocation] = useLocation();
  const [phase, setPhase] = useState<"logo" | "profile" | "text" | "out">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("profile"), 700);
    const t2 = setTimeout(() => setPhase("text"), 2000);
    const t3 = setTimeout(() => setPhase("out"), 3200);
    const t4 = setTimeout(() => setLocation("/login"), 3700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [setLocation]);

  return (
    <AnimatePresence>
      {phase !== "out" ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 40%, #f5f0ff 100%)" }}
        >
          {/* Background rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-blue-200/50"
                initial={{ width: 80, height: 80, opacity: 0 }}
                animate={{ width: 80 + i * 160, height: 80 + i * 160, opacity: [0, 0.4, 0] }}
                transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity, ease: "easeOut" }}
              />
            ))}
          </div>

          <div className="relative flex flex-col items-center gap-8">
            {/* Logo badge */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-400/30"
              style={{ background: "linear-gradient(135deg, #2563eb, #4f46e5)" }}
            >
              <span className="text-white text-xl font-extrabold tracking-tight">SR</span>
            </motion.div>

            {/* C-Profile SVG Animation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: phase === "logo" ? 0 : 1, y: phase === "logo" ? 10 : 0 }}
              transition={{ duration: 0.4 }}
              className="relative flex items-center justify-center"
            >
              <svg width="220" height="160" viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Shadow/glow */}
                <ellipse cx="110" cy="145" rx="60" ry="6" fill="url(#shadowGrad)" opacity="0.3" />

                {/* C-Profile shape — the formed metal */}
                <motion.path
                  d="M 155,28 L 65,28 L 65,132 L 155,132"
                  stroke="url(#profileGrad)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: phase === "logo" ? 0 : 1,
                    opacity: phase === "logo" ? 0 : 1
                  }}
                  transition={{ duration: 1.1, ease: "easeInOut", delay: 0.1 }}
                />

                {/* Inner highlight line on profile */}
                <motion.path
                  d="M 155,28 L 65,28 L 65,132 L 155,132"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeOpacity="0.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: phase === "logo" ? 0 : 1,
                    opacity: phase === "logo" ? 0 : 0.5
                  }}
                  transition={{ duration: 1.1, ease: "easeInOut", delay: 0.2 }}
                />

                {/* Dimension lines */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase === "text" ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <line x1="60" y1="20" x2="60" y2="140" stroke="#93c5fd" strokeWidth="0.8" strokeDasharray="4 3" />
                  <line x1="160" y1="20" x2="160" y2="140" stroke="#93c5fd" strokeWidth="0.8" strokeDasharray="4 3" />
                  <line x1="50" y1="24" x2="170" y2="24" stroke="#93c5fd" strokeWidth="0.8" />
                  <polygon points="55,21 62,24 55,27" fill="#93c5fd" />
                  <polygon points="165,21 158,24 165,27" fill="#93c5fd" />
                  <text x="110" y="18" textAnchor="middle" fontSize="9" fill="#3b82f6" fontFamily="monospace">W</text>

                  <line x1="58" y1="26" x2="58" y2="134" stroke="#93c5fd" strokeWidth="0.8" />
                  <polygon points="55,31 58,24 61,31" fill="#93c5fd" />
                  <polygon points="55,129 58,136 61,129" fill="#93c5fd" />
                  <text x="48" y="82" textAnchor="middle" fontSize="9" fill="#3b82f6" fontFamily="monospace">H</text>
                </motion.g>

                {/* Moving spark along path */}
                <motion.circle
                  r="5"
                  fill="white"
                  filter="url(#sparkGlow)"
                  initial={{ opacity: 0 }}
                  animate={phase !== "logo" ? {
                    opacity: [0, 1, 1, 0],
                    offsetDistance: ["0%", "100%"],
                  } : { opacity: 0 }}
                  style={{ offsetPath: "path('M 155,28 L 65,28 L 65,132 L 155,132')" } as React.CSSProperties}
                  transition={{ duration: 1.1, ease: "easeInOut", delay: 0.1 }}
                />

                <defs>
                  <linearGradient id="profileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                  <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </radialGradient>
                  <filter id="sparkGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
              </svg>

              {/* Particles */}
              {phase !== "logo" && [
                { x: 158, y: 28, delay: 0.3 }, { x: 65, y: 50, delay: 0.6 },
                { x: 65, y: 110, delay: 0.9 }, { x: 140, y: 132, delay: 1.05 },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-blue-400"
                  style={{ left: p.x - 5, top: p.y - 80 }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0], y: [-4, -14] }}
                  transition={{ duration: 0.5, delay: p.delay }}
                />
              ))}
            </motion.div>

            {/* Text content */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: phase === "text" || phase === "out" ? 1 : 0, y: phase === "text" || phase === "out" ? 0 : 8 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">SAI RoloTech</h1>
              <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mt-0.5">Design Engine</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-blue-500"
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.25 }}
                    />
                  ))}
                </div>
                <span className="text-gray-400 text-xs">Loading...</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
