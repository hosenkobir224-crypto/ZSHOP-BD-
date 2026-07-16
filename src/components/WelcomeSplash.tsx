import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface WelcomeSplashProps {
  onComplete: () => void;
}

export default function WelcomeSplash({ onComplete }: WelcomeSplashProps) {
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    // Show splash for 2200ms to allow smooth staggered animations, then trigger fadeout
    const timer = setTimeout(() => {
      setVisible(false);
      const exitTimer = setTimeout(onComplete, 450); // Wait for exit animation
      return () => clearTimeout(exitTimer);
    }, 2200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="welcome-splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-6 select-none"
        >
          {/* Subtle elegant radial background */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white to-slate-100/30" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Top: Icon (Sleek bouncy intro) */}
            <motion.div
              initial={{ scale: 0.5, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: 0.1 
              }}
              className="mb-5 shadow-xl shadow-slate-900/10 rounded-[28px]"
            >
              <svg
                width={96}
                height={96}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <rect width="100" height="100" rx="28" fill="#0b1329" />
                <path
                  d="M28 28 H72 V36 L39.5 68 H72 V76 H28 V68 L60.5 36 H28 V28 Z"
                  fill="#ffffff"
                />
              </svg>
            </motion.div>

            {/* Middle: Brand name (Smooth slide & fade) */}
            <motion.div 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
              className="flex items-baseline font-display"
            >
              <span className="font-black text-[#0b1329] tracking-tight text-3.5xl sm:text-5xl leading-none">ZSHOP</span>
              <span className="text-[#f1a115] font-extrabold text-2.5xl sm:text-4xl ml-1 leading-none">BD</span>
            </motion.div>

            {/* Bottom: Tagline (Stretched tracking effect) */}
            <motion.span 
              initial={{ opacity: 0, letterSpacing: "0.1em" }}
              animate={{ opacity: 1, letterSpacing: "0.3em" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.75 }}
              className="text-[10px] sm:text-xs uppercase text-slate-400 font-display mt-4 font-black leading-none block"
            >
              RETAIL REVOLUTION
            </motion.span>
          </div>

          {/* Elegant Loading Indication */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-1 bg-gray-100 rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ left: "-100%" }}
              animate={{ left: "100%" }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[#f1a115] to-transparent"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
