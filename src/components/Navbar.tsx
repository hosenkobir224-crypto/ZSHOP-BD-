import React, { useState, useEffect } from "react";
import { 
  Search, 
  ShoppingCart, 
  Menu, 
  X, 
  ChevronDown, 
  MapPin, 
  PhoneCall, 
  Flame, 
  ShieldCheck, 
  Sparkles,
  LayoutGrid,
  Shirt,
  Watch,
  Smartphone,
  ChefHat,
  Trophy,
  User,
  Camera,
  Loader2
} from "lucide-react";
import { Category, CartItem, Product } from "../types";
import { CATEGORIES } from "../data";

interface NavbarProps {
  cart: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenProfile: () => void;
  products: Product[];
}

export default function Navbar({
  cart,
  setIsCartOpen,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onOpenProfile,
  products,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

  // States for Visual Search from Gallery
  const [isSearchingImg, setIsSearchingImg] = useState(false);
  const [imgSearchErr, setImgSearchErr] = useState<string | null>(null);
  const [detectedLabel, setDetectedLabel] = useState<string | null>(null);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSearchingImg(true);
    setImgSearchErr(null);
    setDetectedLabel(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const response = await fetch("/api/search-by-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, catalogProducts: products })
        });
        const data = await response.json();
        if (data.success && data.keywords && data.keywords.length > 0) {
          // Select and set search query to match first tag
          const query = data.keywords[0];
          setSearchQuery(query);
          
          const detectName = data.detectedObject || "Product";
          setDetectedLabel(detectName);
        } else {
          setImgSearchErr("ছবিটি সনাক্ত করা যায়নি। অন্য ছবি চেষ্টা করুন।");
        }
      } catch (err) {
        console.error("Image search error:", err);
        setImgSearchErr("ছবি সার্চ সমস্যা! নেটওয়ার্ক পুনরায় পরীক্ষা করুন।");
      } finally {
        setIsSearchingImg(false);
        // Reset file input value to allow selecting the same file again
        e.target.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  // Active customer session state
  const [activeCustomer, setActiveCustomer] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("zshop_bd_active_customer_session_v1");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem("zshop_bd_active_customer_session_v1");
        setActiveCustomer(saved ? JSON.parse(saved) : null);
      } catch {
        setActiveCustomer(null);
      }
    };
    window.addEventListener("active_customer_navbar_sync", handleSync);
    return () => window.removeEventListener("active_customer_navbar_sync", handleSync);
  }, []);

  // Sync search words inside customer query database
  useEffect(() => {
    if (!activeCustomer || !searchQuery.trim()) return;
    const cleanWord = searchQuery.trim();
    if (cleanWord.length < 2) return;

    const timer = setTimeout(() => {
      try {
        const key = `zshop_bd_user_searches_${activeCustomer.phone}`;
        const savedRaw = localStorage.getItem(key);
        const searches: string[] = savedRaw ? JSON.parse(savedRaw) : [];
        if (!searches.includes(cleanWord)) {
          const updated = [cleanWord, ...searches.filter(t => t !== cleanWord)].slice(0, 10);
          localStorage.setItem(key, JSON.stringify(updated));
          window.dispatchEvent(new Event("customer_searches_update"));
        }
      } catch (err) {
        console.error(err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchQuery, activeCustomer]);

  const totalCartItems = cart.reduce((sums, item) => sums + item.quantity, 0);

  // Helper to map category icon names to Lucide elements
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Shirt": return <Shirt className="w-4 h-4" />;
      case "Watch": return <Watch className="w-4 h-4" />;
      case "Smartphone": return <Smartphone className="w-4 h-4" />;
      case "ChefHat": return <ChefHat className="w-4 h-4" />;
      case "Trophy": return <Trophy className="w-4 h-4" />;
      default: return <LayoutGrid className="w-4 h-4" />;
    }
  };

  const getActiveCategoryName = () => {
    const active = CATEGORIES.find(c => c.id === selectedCategory);
    return active ? active.name : "All Categories";
  };

  return (
    <header className="w-full relative z-40 bg-white" id="main-header">
      {/* Top Banner (Utility Bar / Trust Indicators) */}
      <div id="top-utility-bar" className="w-full bg-slate-950 text-slate-300 py-2 border-b border-slate-900 px-4 sm:px-6 lg:px-8 text-xs font-sans tracking-wide">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
            <span className="flex items-center gap-1.5 focus:outline-none">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              100% Genuine Brands Guaranteed
            </span>
            <span className="flex items-center gap-1.5 focus:outline-none">
              <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
              Superfast Cash on Delivery in Bangladesh
            </span>
          </div>
          <div className="flex items-center justify-center gap-x-6">
            <a href="tel:01888223470" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              Hotline: 01888223470
            </a>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-500" />
              Dhaka, BD
            </span>
          </div>
        </div>
      </div>

      {/* Sticky Primary Header */}
      <div className="w-full sticky top-0 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-3.5 px-4 sm:px-6 lg:px-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo Branding */}
          <div className="flex items-center gap-2">
            <button 
              id="mobile-hamburger-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="p-1.5 md:hidden text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <a href="/" className="flex items-center gap-2 select-none group" id="navbar-logo">
              <div className="w-10 h-10 bg-slate-950 text-white rounded-xl flex items-center justify-center font-display font-black text-xl tracking-tight shadow-md shadow-slate-900/10 group-hover:scale-105 transition-transform duration-200">
                Z
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-2xl tracking-normal text-slate-950 leading-none">
                  ZSHOP<span className="text-amber-500 font-semibold text-lg ml-0.5">BD</span>
                </span>
                <span className="text-[9px] tracking-[0.18em] uppercase text-gray-500 font-mono mt-0.5 font-medium">
                  Retail Revolution
                </span>
              </div>
            </a>
          </div>

          {/* Search Area */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4 flex-col relative" id="search-input-wrapper">
            <div className="w-full flex border-2 border-slate-950 hover:border-amber-500 focus-within:border-amber-500 rounded-xl overflow-hidden transition-all duration-200 shadow-sm">
              
              {/* Category Dropdown (Integrated) */}
              <div className="relative border-r border-gray-200 bg-gray-50 shrink-0">
                <button
                  id="navbar-category-dropdown"
                  onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                  className="flex items-center gap-1.5 px-4 h-full text-xs font-semibold text-gray-700 hover:text-slate-950 transition-colors focus:outline-none bg-gray-50/50"
                >
                  <span className="truncate max-w-[130px]">{getActiveCategoryName()}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 object-contain transition-transform duration-300 ${isCatDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCatDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-60 bg-white border border-gray-150 rounded-xl shadow-xl py-1 z-50">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setIsCatDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${selectedCategory === cat.id ? 'bg-amber-50/50 text-amber-600 font-semibold' : 'text-gray-700'}`}
                      >
                        {getCategoryIcon(cat.icon)}
                        <span className="truncate">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Text Search Input */}
              <div className="flex-1 relative flex items-center">
                <input
                  id="navbar-search-textbox"
                  type="text"
                  placeholder="Search over 10,000+ authentic clothing, watches & appliances..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-16 h-10.5 text-xs text-gray-800 placeholder-gray-400 font-sans focus:outline-none bg-white font-medium"
                />
                
                <div className="absolute right-3 flex items-center gap-2 z-10">
                  {searchQuery && (
                    <button 
                      onClick={() => {
                        setSearchQuery("");
                        setDetectedLabel(null);
                        setImgSearchErr(null);
                      }} 
                      className="p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none hover:bg-gray-100"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Visual Image Search Button */}
                  <label 
                    className="p-1 rounded-full text-slate-500 hover:text-[#f85606] hover:bg-slate-50 cursor-pointer focus-within:outline-none transition-all duration-200" 
                    title="গ্যালারি থেকে ছবি দিয়ে খুঁজুন"
                  >
                    {isSearchingImg ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    ) : (
                      <Camera className="w-4 h-4 text-slate-600 hover:text-amber-500" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageFileChange} 
                      className="hidden" 
                      disabled={isSearchingImg}
                    />
                  </label>
                </div>
              </div>

              {/* Search Submit Icon */}
              <div className="bg-slate-950 px-5 text-white flex items-center justify-center shrink-0">
                <Search className="w-4 h-4 font-bold" />
              </div>
            </div>

            {/* Visual Search Notifications */}
            {detectedLabel && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-semibold px-3 py-1.5 flex items-center justify-between rounded-lg border border-emerald-250 z-50 animate-fade-in shadow-md">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-550">📷</span> ছবিতে সনাক্তকৃত পণ্য: <strong className="font-bold text-slate-950 underline decoration-emerald-500">{detectedLabel}</strong>
                </span>
                <button 
                  onClick={() => setDetectedLabel(null)} 
                  className="hover:text-amber-700 transition-colors ml-1.5 font-bold font-sans text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {imgSearchErr && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-red-50 text-red-800 text-[11px] font-semibold px-3 py-1.5 flex items-center justify-between rounded-lg border border-red-200 z-50 animate-fade-in shadow-md">
                <span className="flex items-center gap-1.5">
                  <span className="text-red-500">⚠️</span> {imgSearchErr}
                </span>
                <button 
                  onClick={() => setImgSearchErr(null)} 
                  className="hover:text-red-955 transition-colors ml-1.5 font-bold font-sans text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* User & Cart CTA Actions */}
          <div className="flex items-center gap-4" id="navbar-actions">
            
            {/* Quick trust signal for desktop */}
            <div className="hidden lg:flex items-center gap-2 text-right">
              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider font-semibold">Customer Support</p>
              <p className="text-xs font-display font-extrabold text-slate-950">Dhaka Office</p>
            </div>

             {/* Customer Profile Trigger */}
            <button
              id="header-profile-trigger"
              onClick={onOpenProfile}
              className="relative p-2.5 text-slate-950 hover:bg-slate-100 rounded-xl transition-all duration-200 select-none cursor-pointer focus:outline-none flex items-center gap-1.5 group border border-gray-100"
              aria-label="View Profile"
            >
              {activeCustomer ? (
                <>
                  {activeCustomer.avatar ? (
                    <img 
                      src={activeCustomer.avatar} 
                      alt={activeCustomer.name} 
                      referrerPolicy="no-referrer" 
                      className="w-5 h-5 rounded-full object-cover shrink-0" 
                    />
                  ) : (
                    <User className="w-5 h-5 text-amber-500 shrink-0" />
                  )}
                  <span className="hidden sm:inline text-xs font-display font-bold text-slate-900 truncate max-w-[65px]">
                    {activeCustomer.name.split(" ")[0]}
                  </span>
                </>
              ) : (
                <>
                  <User className="w-5 h-5 text-gray-650 group-hover:scale-105 transition-transform duration-200 shrink-0" />
                  <span className="hidden sm:inline text-xs font-display font-bold text-slate-900">লগইন</span>
                </>
              )}
            </button>

            {/* Cart Button Slider */}
            <button
              id="header-cart-trigger"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-slate-950 hover:bg-slate-100 rounded-xl transition-all duration-200 select-none cursor-pointer focus:outline-none flex items-center gap-1.5 group border border-gray-100"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-105 transition-transform duration-200" />
              <span className="hidden sm:inline text-xs font-display font-bold text-slate-900">Cart</span>
              
              {totalCartItems > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-mono text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {totalCartItems}
                </span>
              ) : (
                <span className="absolute -top-1.5 -right-1.5 bg-gray-300 text-slate-700 font-mono text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  0
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile-Only Search Box (Expands layout below navbar) */}
      <div className="md:hidden w-full px-4 pb-3.5 pt-1.5 bg-white border-b border-gray-100 flex flex-col gap-1.5" id="mobile-search-bar">
        <div className="w-full flex border-2 border-slate-950 rounded-xl overflow-hidden shadow-sm relative items-center">
          <input
            id="mobile-search-textbox"
            type="text"
            placeholder="Search matching clothes, watches, air fryers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 pl-4 pr-16 py-2.5 text-xs text-gray-800 focus:outline-none font-sans bg-white font-medium"
          />
          
          <div className="absolute right-12 flex items-center gap-1.5 z-10">
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setDetectedLabel(null);
                  setImgSearchErr(null);
                }} 
                className="px-2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Visual Image Search Button (Mobile) */}
            <label className="p-1 rounded-full text-slate-505 hover:text-[#f85606] cursor-pointer transition-all duration-200">
              {isSearchingImg ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              ) : (
                <Camera className="w-4 h-4 text-slate-600 hover:text-[#f85606]" />
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageFileChange} 
                className="hidden" 
                disabled={isSearchingImg}
              />
            </label>
          </div>

          <div className="bg-slate-950 text-white px-4 h-10 flex items-center justify-center shrink-0">
            <Search className="w-4 h-4" />
          </div>
        </div>

        {/* Visual Search Mobile Notification & Badges */}
        {detectedLabel && (
          <div className="w-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2.5 py-1.5 flex items-center justify-between rounded-lg border border-emerald-250 animate-fade-in shadow-sm">
            <span className="flex items-center gap-1">
              📷 ছবিতে সনাক্ত: <strong className="font-bold text-slate-950 underline decoration-emerald-500">{detectedLabel}</strong>
            </span>
            <button 
              onClick={() => setDetectedLabel(null)} 
              className="hover:text-amber-700 transition-colors ml-1 font-bold text-[11px] cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {imgSearchErr && (
          <div className="w-full bg-red-50 text-red-800 text-[10px] font-semibold px-2.5 py-1.5 flex items-center justify-between rounded-lg border border-red-200 animate-fade-in shadow-sm">
            <span>⚠️ {imgSearchErr}</span>
            <button 
              onClick={() => setImgSearchErr(null)} 
              className="hover:text-red-950 transition-colors ml-1 font-bold text-[11px] cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Sub-Header Horizontal Category Tabs Bar (Desktop Highlight) */}
      <nav className="hidden md:block w-full bg-slate-50 border-b border-gray-200/60 py-2.5 px-4 sm:px-6 lg:px-8" id="category-navigation-tabs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-display font-semibold transition-all duration-200 cursor-pointer focus:outline-none flex items-center gap-2 ${selectedCategory === cat.id ? 'bg-slate-950 text-white shadow-sm' : 'text-gray-600 hover:text-slate-950 hover:bg-gray-100'}`}
              >
                {getCategoryIcon(cat.icon)}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Quick deals tag */}
          <div className="flex items-center gap-1.5 text-xs text-rose-600 font-sans font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Hot Clearance: Buy 1 Get 1 on selected Premium T-shirts!</span>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer (Sidebar Navigation Overlay) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 bg-opacity-50 z-50 transition-opacity" id="mobile-menu-overlay">
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl p-6 z-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-950 text-white rounded-lg flex items-center justify-center font-display font-black text-lg">
                    Z
                  </div>
                  <span className="font-display font-extrabold text-xl text-slate-950">ZSHOP BD</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories Links (Mobile Panel) */}
              <div className="py-6 flex flex-col gap-1.5">
                <p className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-semibold mb-2 px-1">Categories Available</p>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${selectedCategory === cat.id ? 'bg-slate-950 text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={selectedCategory === cat.id ? 'text-amber-400' : 'text-gray-500'}>
                        {getCategoryIcon(cat.icon)}
                      </div>
                      <span>{cat.name}</span>
                    </div>
                    {selectedCategory === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Mobile Support Contact */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <PhoneCall className="w-4 h-4 text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-mono font-bold uppercase leading-none">Support Hotline</span>
                  <a href="tel:01888223470" className="text-xs font-display font-black text-slate-950 mt-1 hover:underline">
                    01888223470
                  </a>
                </div>
              </div>
              <p className="text-[10px] text-center text-gray-400 mt-4 font-mono font-medium">© 2026 ZSHOP BD Retail Ltd.</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
