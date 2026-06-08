import React, { useState, useEffect, useMemo } from "react";
import { Zap, Clock, ChevronLeft, ChevronRight, ShoppingCart, Check, Eye } from "lucide-react";
import { Product, Order } from "../types";

interface FlashSaleProps {
  products: Product[];
  orders: Order[];
  onAddToCart: (product: Product) => void;
  onOrderNow: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
}

export default function FlashSale({
  products,
  orders,
  onAddToCart,
  onOrderNow,
  onOpenQuickView,
}: FlashSaleProps) {
  // 1. Calculate the most sold products dynamically
  const sortedFlashSaleProducts = useMemo(() => {
    const salesMap = new Map<string, number>();
    orders.forEach((order) => {
      if (order.cartItems) {
        order.cartItems.forEach((item) => {
          const prodId = item.productId || item.id;
          if (prodId) {
            salesMap.set(prodId, (salesMap.get(prodId) || 0) + item.quantity);
          }
        });
      }
    });

    return [...products]
      .map((prod) => {
        const liveSales = salesMap.get(prod.id) || 0;
        // score is reviewsCount (base popularity) + live orders sales heavily weighted
        const score = (prod.reviewsCount || 0) + liveSales * 20;
        return { prod, score, liveSales };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Take top 5
  }, [products, orders]);

  // 2. Active Slide State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Auto transition
  useEffect(() => {
    if (isHovered || sortedFlashSaleProducts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sortedFlashSaleProducts.length);
    }, 5000); // 5 seconds
    return () => clearInterval(timer);
  }, [isHovered, sortedFlashSaleProducts]);

  // Ensure current slide is within bounds if products list changes
  useEffect(() => {
    if (currentSlide >= sortedFlashSaleProducts.length && sortedFlashSaleProducts.length > 0) {
      setCurrentSlide(0);
    }
  }, [sortedFlashSaleProducts, currentSlide]);

  // 3. Persistent countdown timer (resets to tomorrow or runs down over 8 hours loop)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 30, seconds: 0 });

  useEffect(() => {
    const getTargetTime = () => {
      try {
        const saved = localStorage.getItem("zshop_bd_flash_sale_target_v1");
        if (saved) {
          const parsed = parseInt(saved, 10);
          if (parsed > Date.now()) return parsed;
        }
      } catch (err) {
        console.error(err);
      }
      // Create new target: 6 hours from now
      const newTarget = Date.now() + 6 * 60 * 60 * 1000;
      try {
        localStorage.setItem("zshop_bd_flash_sale_target_v1", String(newTarget));
      } catch {}
      return newTarget;
    };

    const targetTime = getTargetTime();

    const updateTimer = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        // Reset timer to another 6 hours
        const nextTarget = Date.now() + 6 * 60 * 60 * 1000;
        try {
          localStorage.setItem("zshop_bd_flash_sale_target_v1", String(nextTarget));
        } catch {}
        setTimeLeft({ hours: 6, minutes: 0, seconds: 0 });
        return;
      }

      const totalSeconds = Math.floor(difference / 1000);
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      setTimeLeft({ hours: hrs, minutes: mins, seconds: secs });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  if (sortedFlashSaleProducts.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) =>
      prev === 0 ? sortedFlashSaleProducts.length - 1 : prev - 1
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % sortedFlashSaleProducts.length);
  };

  // Helper convert to Bengali digit
  const toBnDigit = (num: number) => {
    const bn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return String(num)
      .split("")
      .map((char) => (isNaN(parseInt(char, 10)) ? char : bn[parseInt(char, 10)]))
      .join("");
  };

  const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  // Active slide details
  const activeWrapper = sortedFlashSaleProducts[currentSlide];
  if (!activeWrapper) return null;

  const activeProduct = activeWrapper.prod;
  const originalPrice = activeProduct.originalPrice || Math.round(activeProduct.price * 1.35);
  const discountPercent = Math.round(
    ((originalPrice - activeProduct.price) / originalPrice) * 100
  );

  // Calculate sold progress percentage (using a dynamic formula mapping reviews etc.)
  const totalStock = 50;
  const soldQty = Math.min(
    45,
    Math.max(12, (activeProduct.reviewsCount % 15) + (activeWrapper.liveSales * 3) + 15)
  );
  const soldPercent = Math.min(96, Math.max(40, Math.round((soldQty / totalStock) * 100)));

  const handleAddToCartClick = (e: React.MouseEvent, prod: Product) => {
    e.stopPropagation();
    onAddToCart(prod);
    setJustAddedId(prod.id);
    setTimeout(() => setJustAddedId(null), 1500);
  };

  return (
    <section
      className="w-full bg-white py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-100"
      id="flash-sale-main-section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Header Ribbon / Flash Sale Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-linear-to-r from-red-650 via-rose-600 to-amber-500 rounded-2xl p-4 md:p-6 text-white shadow-lg mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4.5 text-center sm:text-left">
            <div className="flex items-center gap-2 bg-white/20 border border-white/30 rounded-xl px-4 py-2 animate-pulse shrink-0">
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span className="text-sm font-display font-black tracking-wider uppercase text-white animate-bounce">
                FLASH SALE  •  ফ্ল্যাশ সেল
              </span>
            </div>
            
            <p className="text-[11px] sm:text-xs font-sans font-bold text-rose-50 tracking-wide text-center sm:text-left">
              আজকের সবচেয়ে বেশি বিক্রি হওয়া ডিলগুলো স্টক শেষ হওয়ার আগেই কিনে নিন!
            </p>
          </div>

          {/* Realtime Urgency Countdown */}
          <div className="flex items-center gap-2 bg-slate-950/40 backdrop-blur-md rounded-xl p-2 px-4 shadow-inner border border-white/10 shrink-0">
            <Clock className="w-4 h-4 text-amber-300" />
            <span className="text-[10px] md:text-xs font-display font-semibold tracking-wide text-rose-100 mr-2">
              অফার রিমেইনিং:
            </span>
            <div className="flex items-center gap-1 font-mono text-center">
              <span className="bg-slate-900 border border-slate-800 text-amber-400 px-2 py-1 rounded text-xs font-black min-w-8">
                {padZero(timeLeft.hours)}
              </span>
              <span className="text-amber-400 font-bold">:</span>
              <span className="bg-slate-900 border border-slate-800 text-amber-400 px-2 py-1 rounded text-xs font-black min-w-8">
                {padZero(timeLeft.minutes)}
              </span>
              <span className="text-amber-400 font-bold">:</span>
              <span className="bg-slate-900 border border-slate-800 text-amber-400 px-2 py-1 rounded text-xs font-black min-w-8 animate-pulse">
                {padZero(timeLeft.seconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Carousel Body Box */}
        <div className="relative border border-amber-300/40 bg-linear-to-br from-amber-500/5 via-rose-500/5 to-white rounded-3xl overflow-hidden p-4 sm:p-6 lg:p-8 min-h-[290px]">
          
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 lg:gap-10">
            
            {/* Left Box: Product Image Wrapper */}
            <div
              className="relative w-full md:w-2/5 aspect-square max-h-[320px] rounded-2xl overflow-hidden border border-gray-150 shadow-md bg-white group cursor-pointer"
              onClick={() => onOpenQuickView(activeProduct)}
            >
              <img
                src={activeProduct.image}
                alt={activeProduct.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 bg-red-600 text-white font-mono text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Zap className="w-3 h-3 fill-white" />
                <span>-{discountPercent}% OFF</span>
              </div>
              <div className="absolute top-3 right-3 bg-slate-950/80 text-amber-300 font-display text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                🔥 TOP SELLING #{currentSlide + 1}
              </div>
            </div>

            {/* Right Box: Product Actions and Text Detail */}
            <div className="w-full md:w-3/5 text-left flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-rose-100 text-rose-700 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wide">
                    {activeProduct.category}
                  </span>
                  <span className="text-gray-400 text-[11px] font-black font-sans">
                     ({activeProduct.reviewsCount + 10} বিক্রি হয়েছে)
                  </span>
                </div>

                <h3
                  className="text-lg sm:text-xl lg:text-2.5xl font-display font-black text-slate-950 tracking-tight cursor-pointer hover:text-rose-600 transition-colors"
                  onClick={() => onOpenQuickView(activeProduct)}
                >
                  {activeProduct.title}
                </h3>

                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {activeProduct.description}
                </p>
              </div>

              {/* Price and Stock Progress Row */}
              <div className="space-y-3 p-4 bg-slate-50 border border-gray-150 rounded-2xl">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3.5xl font-sans font-black text-rose-600">
                    ৳{activeProduct.price}
                  </span>
                  <span className="text-xs sm:text-sm font-sans font-bold text-gray-400 line-through">
                    ৳{originalPrice}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    সেভ ৳{originalPrice - activeProduct.price}
                  </span>
                </div>

                {/* Sell Percentage progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-amber-600 flex items-center gap-1">
                      <span>🔥 স্টক খুবই সীমিত!</span>
                    </span>
                    <span className="text-slate-700">
                      বিক্রি হয়েছে: {toBnDigit(soldPercent)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden shadow-inner relative">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-rose-600 h-full rounded-full transition-all duration-1000 ease-in-out shadow"
                      style={{ width: `${soldPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Order buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1.5">
                <button
                  onClick={() => onOrderNow(activeProduct)}
                  className="w-full sm:flex-1 py-3 px-6 bg-red-600 hover:bg-red-700 text-white text-xs font-display font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-red-600/10 focus:outline-none"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>সরাসরি অর্ডার করুন (BUY NOW)</span>
                </button>
                
                <button
                  onClick={(e) => handleAddToCartClick(e, activeProduct)}
                  className={`w-full sm:flex-1 py-3 px-6 text-xs font-display font-black rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer focus:outline-none ${
                    justAddedId === activeProduct.id
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-white border-slate-950 text-slate-950 hover:bg-slate-50"
                  }`}
                >
                  {justAddedId === activeProduct.id ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3px]" />
                      <span>কার্টে যোগ হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>কার্টে অ্যাড করুন</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onOpenQuickView(activeProduct)}
                  className="p-3 text-gray-500 hover:text-slate-950 rounded-xl bg-slate-50 border border-gray-200 hover:border-gray-300 flex items-center justify-center cursor-pointer transition-colors"
                  title="বিস্তারিত দেখুন"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white hover:bg-amber-400 border border-gray-150 hover:border-amber-400 text-slate-700 hover:text-slate-950 transition-all cursor-pointer z-10 shadow-md focus:outline-none hidden sm:flex"
            aria-label="Previous Flash Product"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white hover:bg-amber-400 border border-gray-150 hover:border-amber-400 text-slate-700 hover:text-slate-950 transition-all cursor-pointer z-10 shadow-md focus:outline-none hidden sm:flex"
            aria-label="Next Flash Product"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Indicator Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {sortedFlashSaleProducts.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                  idx === currentSlide ? "w-5 bg-rose-600" : "w-1.5 bg-gray-300 hover:bg-gray-450"
                }`}
                aria-label={`Go to item ${idx + 1}`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
