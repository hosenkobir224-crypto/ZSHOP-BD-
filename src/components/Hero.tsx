import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Shield, Award, RefreshCcw } from "lucide-react";
import { PROMOTIONS } from "../data";
import { Promotion } from "../types";

interface HeroProps {
  onCtaClick: (categoryId: string) => void;
}

export default function Hero({ onCtaClick }: HeroProps) {
  const [banners, setBanners] = useState<Promotion[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const loadBanners = () => {
      try {
        const saved = localStorage.getItem("zshop_bd_banners_v1");
        if (saved) {
          setBanners(JSON.parse(saved));
        } else {
          setBanners(PROMOTIONS);
        }
      } catch {
        setBanners(PROMOTIONS);
      }
    };

    loadBanners();

    window.addEventListener("zshop_bd_banners_sync", loadBanners);
    return () => window.removeEventListener("zshop_bd_banners_sync", loadBanners);
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners]);

  useEffect(() => {
    if (currentSlide >= banners.length && banners.length > 0) {
      setCurrentSlide(0);
    }
  }, [banners, currentSlide]);

  const handlePrev = () => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  if (banners.length === 0) return null;

  return (
    <section className="w-full bg-linear-to-b from-gray-50 to-white pt-2 pb-8 px-4 sm:px-6 lg:px-8" id="hero-slider-section">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-slate-900 aspect-[1.8/1] sm:aspect-[2.2/1] md:aspect-[3.2/1] lg:aspect-[3.8/1] xl:aspect-[4/1] min-h-[180px] sm:min-h-[240px] md:min-h-[280px] lg:min-h-[320px]">
          
          {/* Active Banner Slide */}
          <div className="absolute inset-0 w-full h-full">
            {banners.map((promo, idx) => (
              <div
                key={promo.id}
                className={`absolute inset-0 w-full h-full flex flex-col md:flex-row transition-all duration-1000 ease-in-out ${idx === currentSlide ? "opacity-100 translate-x-0 scale-100 pointer-events-auto" : "opacity-0 translate-x-12 scale-98 pointer-events-none"}`}
              >
                {/* Visual Image Background */}
                <div className="absolute inset-0 md:relative md:w-3/5 h-full order-1 md:order-2 overflow-hidden">
                  <img
                    src={promo.image}
                    alt={promo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center transform scale-105 hover:scale-110 duration-10000 transition-transform"
                  />
                  {/* Modern image overlay/fade gradient for mobile portrait readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent md:bg-linear-to-r md:from-slate-950 md:via-slate-950/20 md:to-transparent z-10" />
                </div>

                {/* Promotional Overlay Texts Box */}
                <div className={`relative z-20 md:w-2/5 h-full bg-transparent md:bg-slate-950 flex flex-col justify-end md:justify-center p-4 sm:p-8 md:p-10 lg:p-12 order-2 md:order-1 text-left`}>
                  <div className="mb-2 sm:mb-3 inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 bg-amber-500/10 text-amber-400 font-display text-[9px] sm:text-xs font-bold rounded-full w-fit border border-amber-500/25">
                    {promo.badge}
                  </div>
                  
                  <h1 className="text-sm xs:text-base sm:text-2xl md:text-2.5xl lg:text-3.5xl xl:text-4.5xl font-display font-black text-white leading-tight tracking-tight mb-1.5 sm:mb-3 drop-shadow-sm">
                    {promo.title}
                  </h1>
                  
                  <p className="text-[10px] sm:text-xs md:text-sm text-slate-300 font-sans leading-relaxed mb-3 sm:mb-6 max-w-xs sm:max-w-md font-medium line-clamp-2 sm:line-clamp-none drop-shadow-xs">
                    {promo.subtitle}
                  </p>

                  <button
                    onClick={() => onCtaClick(promo.link)}
                    className="w-fit px-4 py-1.5 sm:px-6 sm:py-3 bg-white text-slate-950 hover:bg-amber-400 hover:text-slate-950 text-[10px] sm:text-xs font-display font-bold rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/10 flex items-center justify-center gap-1.5 sm:gap-2 group cursor-pointer focus:outline-none"
                  >
                    <span>{promo.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white/90 hover:text-white transition-all cursor-pointer z-30 focus:outline-none border border-white/10 shadow-lg"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white/90 hover:text-white transition-all cursor-pointer z-30 focus:outline-none border border-white/10 shadow-lg"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Slide Indicators Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={(() => setCurrentSlide(idx))}
                className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${idx === currentSlide ? "w-6 bg-amber-400" : "w-1.5 bg-white/50"}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Triple Service Highlights Grid (Trust Factors below banner) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6" id="trust-factors-grid">
          <div className="bg-slate-50 border border-gray-200/80 rounded-2xl p-4.5 flex items-center gap-4.5">
            <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
              <Shield className="w-5 h-5 font-bold" />
            </div>
            <div>
              <p className="text-xs font-display font-bold text-slate-900 leading-snug">100% Authentic Quality</p>
              <p className="text-[10px] text-gray-500 font-medium font-sans mt-0.5">Sourced directly from verified brand manufacturers.</p>
            </div>
          </div>
          
          <div className="bg-slate-50 border border-gray-200/80 rounded-2xl p-4.5 flex items-center gap-4.5">
            <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
              <RefreshCcw className="w-5 h-5 font-bold" />
            </div>
            <div>
              <p className="text-xs font-display font-bold text-slate-900 leading-snug">7-Day Easy Return Policy</p>
              <p className="text-[10px] text-gray-500 font-medium font-sans mt-0.5">No-hassle exchange if you run into fitting or item issues.</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-gray-200/80 rounded-2xl p-4.5 flex items-center gap-4.5">
            <div className="w-11 h-11 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
              <Award className="w-5 h-5 font-bold" />
            </div>
            <div>
              <p className="text-xs font-display font-bold text-slate-900 leading-snug">Dedicated Local Warranty</p>
              <p className="text-[10px] text-gray-500 font-medium font-sans mt-0.5">Full warranty services supported by our Dhaka service center.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
