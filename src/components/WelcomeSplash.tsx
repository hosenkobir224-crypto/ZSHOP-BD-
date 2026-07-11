import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ZShopLogo from "./ZShopLogo";

interface WelcomeSplashProps {
  onComplete: () => void;
}

export default function WelcomeSplash({ onComplete }: WelcomeSplashProps) {
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    // Show splash for 1500ms, then trigger fadeout
    const timer = setTimeout(() => {
      setVisible(false);
      const exitTimer = setTimeout(onComplete, 400); // Wait for exit animation
      return () => clearTimeout(exitTimer);
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="welcome-splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-6"
        >
          {/* Subtle elegant radial background */}
          <div className="absolute inset-0 bg-radial-gradient from-slate-50 to-white opacity-60" />
          
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.45, ease: "easeOut" }}
            className="relative z-10"
          >
            <ZShopLogo variant="full-vertical" size="custom" iconSize={80} />
          </motion.div>

          {/* Elegant Loading Indication */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ left: "-100%" }}
              animate={{ left: "100%" }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[#f85606] to-transparent"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
