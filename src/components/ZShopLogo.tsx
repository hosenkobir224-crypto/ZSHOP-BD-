import React from "react";

interface ZShopLogoProps {
  variant?: "full-vertical" | "full-horizontal" | "icon" | "text-only" | "horizontal-light";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "custom";
  iconSize?: number;
}

export default function ZShopLogo({
  variant = "full-horizontal",
  className = "",
  size = "md",
  iconSize
}: ZShopLogoProps) {
  // Define standard dimensions based on size prop
  let iconWidth = iconSize || 40;
  if (size === "sm") iconWidth = 32;
  if (size === "lg") iconWidth = 48;
  if (size === "xl") iconWidth = 84;

  const renderIcon = () => (
    <svg
      width={iconWidth}
      height={iconWidth}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-[1.04]"
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
        <div className="flex items-baseline font-sans">
          <span className="font-extrabold text-slate-900 tracking-tight leading-none text-2xl">ZSHOP</span>
          <span className="text-[#f85606] font-bold text-lg ml-0.5 leading-none">BD</span>
        </div>
        <span className="text-[8px] tracking-[0.25em] uppercase text-gray-500 font-sans mt-1 font-black">
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
          <div className="flex items-baseline font-sans">
            <span className="font-black text-white tracking-tight text-xl sm:text-2xl leading-none">ZSHOP</span>
            <span className="text-amber-500 font-extrabold text-lg sm:text-xl ml-0.5 leading-none">BD</span>
          </div>
          <span className="text-[8.5px] sm:text-[9.5px] tracking-[0.25em] uppercase text-slate-300 font-sans mt-1.5 font-black leading-none">
            RETAIL REVOLUTION
          </span>
        </div>
      </div>
    );
  }

  if (variant === "full-vertical") {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`} id="zshop-logo-vertical">
        {/* Top: Icon */}
        <div className="mb-4">
          {renderIcon()}
        </div>
        {/* Middle: Brand name */}
        <div className="flex items-baseline font-sans">
          <span className="font-black text-slate-950 tracking-tight text-3xl sm:text-4.5xl leading-none">ZSHOP</span>
          <span className="text-[#f85606] font-extrabold text-2xl sm:text-3xl ml-1 leading-none">BD</span>
        </div>
        {/* Bottom: Tagline */}
        <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-slate-500 font-sans mt-3.5 font-black leading-none">
          RETAIL REVOLUTION
        </span>
      </div>
    );
  }

  // default full-horizontal
  return (
    <div className={`flex items-center gap-3 select-none ${className}`} id="zshop-logo-horizontal">
      {renderIcon()}
      <div className="flex flex-col text-left">
        <div className="flex items-baseline font-sans">
          <span className="font-black text-slate-950 tracking-tight text-xl sm:text-2xl leading-none">ZSHOP</span>
          <span className="text-[#f85606] font-extrabold text-lg sm:text-xl ml-0.5 leading-none">BD</span>
        </div>
        <span className="text-[8.5px] sm:text-[9.5px] tracking-[0.25em] uppercase text-slate-500 font-sans mt-1.5 font-black leading-none">
          RETAIL REVOLUTION
        </span>
      </div>
    </div>
  );
}
