import React from "react";

interface ZShopLogoProps {
  variant?: "full-vertical" | "full-horizontal" | "icon" | "text-only" | "horizontal-light";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "custom";
  iconSize?: number;
  catchEye?: boolean;
}

export default function ZShopLogo({
  variant = "full-horizontal",
  className = "",
  size = "md",
  iconSize,
  catchEye = false
}: ZShopLogoProps) {
  // Define standard dimensions based on size prop
  let iconWidth = iconSize || 40;
  if (size === "sm") iconWidth = 32;
  if (size === "lg") iconWidth = 48;
  if (size === "xl") iconWidth = 84;

  const renderIcon = () => (
    <div className="relative shrink-0">
      {catchEye && (
        <>
          <div className="absolute inset-0 bg-[#f1a115]/25 rounded-[28px] animate-logo-pulse-1" style={{ animationDelay: "2.3s" }} />
          <div className="absolute inset-0 bg-[#0b1329]/15 rounded-[28px] animate-logo-pulse-2" style={{ animationDelay: "2.5s" }} />
        </>
      )}
      <svg
        width={iconWidth}
        height={iconWidth}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 shrink-0 transition-transform duration-300 group-hover:scale-[1.04]"
        aria-hidden="true"
      >
        {/* Soft rounded box with deep navy/slate-950 background */}
        <rect width="100" height="100" rx="28" fill="#0b1329" />
        {/* Crisp white bold modern Z */}
        <path
          d="M28 28 H72 V36 L39.5 68 H72 V76 H28 V68 L60.5 36 H28 V28 Z"
          fill="#ffffff"
        />
      </svg>
    </div>
  );

  if (variant === "icon") {
    return (
      <div className={`inline-flex items-center justify-center ${className}`} id="zshop-icon-logo">
        {renderIcon()}
      </div>
    );
  }

  if (variant === "text-only") {
    return (
      <div className={`flex flex-col text-left ${className}`} id="zshop-text-logo">
        <div className="flex items-baseline font-display">
          <span className="font-black text-[#0b1329] tracking-tight leading-none text-2xl">ZSHOP</span>
          <span className="text-[#f1a115] font-bold text-lg ml-0.5 leading-none">BD</span>
        </div>
        <span className="text-[8px] tracking-[0.25em] uppercase text-slate-400 font-display mt-1 font-black">
          RETAIL REVOLUTION
        </span>
      </div>
    );
  }

  if (variant === "horizontal-light") {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`} id="zshop-logo-horizontal-light">
        {renderIcon()}
        <div className="flex flex-col text-left">
          <div className="flex items-baseline font-display">
            <span className="font-black text-white tracking-tight text-xl sm:text-2xl leading-none">ZSHOP</span>
            <span className="text-[#f1a115] font-extrabold text-lg sm:text-xl ml-0.5 leading-none">BD</span>
          </div>
          <span className="text-[8.5px] sm:text-[9.5px] tracking-[0.25em] uppercase text-slate-300 font-display mt-1.5 font-black leading-none">
            RETAIL REVOLUTION
          </span>
        </div>
      </div>
    );
  }

  if (variant === "full-vertical") {
    // Determine responsive sizing based on size prop
    let iconMb = "mb-4";
    let titleSize = "text-3xl sm:text-4.5xl";
    let suffixSize = "text-2xl sm:text-3xl";
    let titleGap = "ml-1";
    let tagSize = "text-[10px] sm:text-xs";
    let tagMt = "mt-3.5";
    let tagTracking = "tracking-[0.3em]";

    if (size === "sm") {
      iconMb = "mb-1";
      titleSize = "text-lg";
      suffixSize = "text-sm";
      titleGap = "ml-0.5";
      tagSize = "text-[6.5px]";
      tagMt = "mt-0.5";
      tagTracking = "tracking-[0.2em]";
    } else if (size === "md") {
      iconMb = "mb-1 sm:mb-1.5";
      titleSize = "text-xl sm:text-2xl";
      suffixSize = "text-base sm:text-lg";
      titleGap = "ml-0.5";
      tagSize = "text-[7.5px] sm:text-[8.5px]";
      tagMt = "mt-1";
      tagTracking = "tracking-[0.25em]";
    } else if (size === "lg") {
      iconMb = "mb-2";
      titleSize = "text-2xl sm:text-3xl";
      suffixSize = "text-lg sm:text-xl";
      titleGap = "ml-1";
      tagSize = "text-[9px] sm:text-[10px]";
      tagMt = "mt-2";
      tagTracking = "tracking-[0.28em]";
    }

    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`} id="zshop-logo-vertical">
        {/* Top: Icon */}
        <div className={iconMb}>
          {renderIcon()}
        </div>
        {/* Middle: Brand name */}
        <div className="flex items-baseline font-display">
          <span className={`font-black text-[#0b1329] tracking-tight leading-none ${titleSize}`}>ZSHOP</span>
          <span className={`text-[#f1a115] font-extrabold leading-none ${titleGap} ${suffixSize}`}>BD</span>
        </div>
        {/* Bottom: Tagline */}
        <span className={`uppercase text-slate-500 font-display font-black leading-none block ${tagTracking} ${tagSize} ${tagMt}`}>
          RETAIL REVOLUTION
        </span>
      </div>
    );
  }

  // default full-horizontal
  return (
    <div className={`flex items-center gap-3 select-none ${catchEye ? 'logo-catch-eye' : ''} ${className}`} id="zshop-logo-horizontal">
      {catchEye && (
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes logoCatchEye {
            0% { transform: scale(0.92); opacity: 0; filter: drop-shadow(0 0 0 rgba(241, 161, 21, 0)); }
            45% { transform: scale(1.08); opacity: 1; filter: drop-shadow(0 0 14px rgba(241, 161, 21, 0.55)); }
            70% { transform: scale(0.98); filter: drop-shadow(0 0 6px rgba(241, 161, 21, 0.25)); }
            100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 0 rgba(241, 161, 21, 0)); }
          }
          @keyframes logoPulse1 {
            0% { transform: scale(1); opacity: 0.85; }
            100% { transform: scale(1.85); opacity: 0; }
          }
          @keyframes logoPulse2 {
            0% { transform: scale(1); opacity: 0.7; }
            100% { transform: scale(2.2); opacity: 0; }
          }
          .logo-catch-eye {
            opacity: 0;
            animation: logoCatchEye 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            animation-delay: 2.3s;
          }
          .animate-logo-pulse-1 {
            animation: logoPulse1 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-logo-pulse-2 {
            animation: logoPulse2 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        ` }} />
      )}
      {renderIcon()}
      <div className="flex flex-col text-left">
        <div className="flex items-baseline font-display">
          <span className="font-black text-[#0b1329] tracking-tight text-xl sm:text-2xl leading-none">ZSHOP</span>
          <span className="text-[#f1a115] font-extrabold text-lg sm:text-xl ml-0.5 leading-none">BD</span>
        </div>
        <span className="text-[8.5px] sm:text-[9.5px] tracking-[0.25em] uppercase text-slate-500 font-display mt-1.5 font-black leading-none">
          RETAIL REVOLUTION
        </span>
      </div>
    </div>
  );
}
