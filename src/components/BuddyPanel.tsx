import { AnimatePresence, motion } from "framer-motion";
import { Bot, X } from "lucide-react";
import { AIDisclaimer } from "@/components/shared";

interface BuddyToggleButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function BuddyToggleButton({ onClick, isOpen }: BuddyToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Close Buddy" : "Open Buddy"}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground"
    >
      <Bot className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Buddy</span>
    </button>
  );
}

interface BuddyPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BuddyPanel({ isOpen, onClose }: BuddyPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed right-0 top-0 h-full w-80 glass-card border-l border-border z-30 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[hsl(var(--accent))]" />
              <h2 className="font-semibold text-sm">AI Buddy</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-muted transition-colors"
              aria-label="Close Buddy"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center text-center p-6">
            <div>
              <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                AI Buddy is ready to help you with insights and automation.
              </p>
            </div>
          </div>
          <div className="p-3 border-t border-border">
            <AIDisclaimer compact />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
