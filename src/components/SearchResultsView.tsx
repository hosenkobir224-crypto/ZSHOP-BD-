import React, { useMemo } from "react";
import { Search, X, ShoppingBag, HelpCircle, ChevronLeft, Camera, SlidersHorizontal, MapPin, Sparkles } from "lucide-react";
import { Product } from "../types";

interface SearchResultsViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onOrderNow: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
}

export default function SearchResultsView({
  searchQuery,
  setSearchQuery,
  products,
  onAddToCart,
  onOrderNow,
  onOpenQuickView,
}: SearchResultsViewProps) {
  // Sort and filter states internal to focus on the search results page experience
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [priceRange, setPriceRange] = React.useState<"all" | "low" | "mid" | "high">("all");
  const [sortBy, setSortBy] = React.useState<"default" | "priceAsc" | "priceDesc" | "rating">("default");
  
  // High fidelity mobile UI filters
  const [mallActive, setMallActive] = React.useState<boolean>(false);
  const [freeDeliveryActive, setFreeDeliveryActive] = React.useState<boolean>(false);
  const [showFilterDrawer, setShowFilterDrawer] = React.useState<boolean>(false);

  // Filter products by active search query + additional filters inside search page
  const filteredSearchProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return products.filter((prod) => {
      // Keyword matches title, description, or category
      const matchesQuery =
        prod.title.toLowerCase().includes(query) ||
        prod.category.toLowerCase().includes(query) ||
        prod.description.toLowerCase().includes(query);

      const matchesCategory = selectedCategory === "all" || prod.category === selectedCategory;

      let matchesPrice = true;
      if (priceRange === "low") matchesPrice = prod.price < 3000;
      else if (priceRange === "mid") matchesPrice = prod.price >= 3000 && prod.price <= 8000;
      else if (priceRange === "high") matchesPrice = prod.price > 8000;

      // Mall Filter -> matches trending products
      const matchesMall = !mallActive || prod.isTrending;

      // Free Delivery Filter -> simulated under 4000 price limit or trending
      const matchesFreeDelivery = !freeDeliveryActive || prod.price < 4000;

      return matchesQuery && matchesCategory && matchesPrice && matchesMall && matchesFreeDelivery;
    }).sort((a, b) => {
      if (sortBy === "priceAsc") return a.price - b.price;
      if (sortBy === "priceDesc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating; // Map Top Sales to rating
      return 0; // default
    });
  }, [searchQuery, products, selectedCategory, priceRange, sortBy, mallActive, freeDeliveryActive]);

  // Handle Escape key closure & Scroll viewport resetting on active search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchQuery("");
      }
    };
    if (searchQuery) {
      window.addEventListener("keydown", handleKeyDown);
      
      // Reset scroll of the page viewport instantly so the search drawer does not align offset due to #root transform boundaries on mobile screens
      window.scrollTo({ top: 0, behavior: "instant" });
      
      // Also reset search overlay container scroll
      const overlayElement = document.getElementById("search-results-overlay-page");
      if (overlayElement) {
        overlayElement.scrollTop = 0;
      }
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchQuery, setSearchQuery]);

  if (!searchQuery) return null;

  // Clear search function
  const handleClose = () => {
    setSearchQuery("");
  };

  // Helper to get deterministic location based on ID
  const getProductLocation = (productId: string) => {
    const locations = ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal"];
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      hash += productId.charCodeAt(i);
    }
    return locations[hash % locations.length];
  };

  // Helper to get deterministic sold count
  const getProductSoldCount = (productId: string) => {
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      hash += productId.charCodeAt(i);
    }
    return (hash % 180) + 12; // stable sold numbers
  };

  // Helper to get deterministic coins saving flag
  const getCoinsDiscount = (productId: string) => {
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      hash += productId.charCodeAt(i);
    }
    return (hash % 3 === 0) ? 5 : (hash % 4 === 0) ? 8 : 0;
  };

  return (
    <div 
      className="absolute inset-0 z-50 bg-[#f1f5f9] overflow-y-auto animate-fadeIn flex flex-col items-stretch justify-start"
      id="search-results-overlay-page"
    >
      {/* 1. Header Search Bar Area */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-150 px-3 py-2 flex items-center gap-2">
        {/* Back Arrow button */}
        <button
          onClick={handleClose}
          className="p-1 px-1.5 focus:outline-none hover:bg-slate-100 rounded-full transition-colors"
          title="সার্চ থেকে ফিরে যান"
        >
          <ChevronLeft className="w-6 h-6 text-slate-800 stroke-[2.5]" />
        </button>

        {/* Input box showing keywords with orange Daraz outline */}
        <div className="flex-1 flex items-center border-[1.8px] border-[#f85606] bg-white rounded-xl px-2.5 py-1.5 shadow-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none pr-2"
            placeholder="প্রোডাক্ট খুঁজুন..."
          />
          <Camera className="w-4 h-4 text-slate-400 shrink-0 cursor-pointer hover:text-[#f85606]" />
        </div>
      </div>

      {/* 2. Primary Tabs: Best Match, Top Sales, Price */}
      <div className="bg-white border-b border-gray-100 py-2.5 px-1 flex items-center justify-around text-xs font-bold text-gray-500">
        <button
          onClick={() => {
            setSortBy("default");
          }}
          className={`flex-1 text-center transition-all cursor-pointer focus:outline-none ${sortBy === "default" ? "text-[#f85606] font-extrabold" : "hover:text-slate-800"}`}
        >
          Best Match
        </button>
        <button
          onClick={() => {
            setSortBy("rating");
          }}
          className={`flex-1 text-[#222] border-l border-r border-gray-200 text-center transition-all cursor-pointer focus:outline-none ${sortBy === "rating" ? "text-[#f85606] font-extrabold" : "hover:text-[#f85606]"}`}
        >
          Top Sales
        </button>
        <button
          onClick={() => {
            setSortBy(sortBy === "priceAsc" ? "priceDesc" : "priceAsc");
          }}
          className={`flex-1 text-center transition-all cursor-pointer focus:outline-none flex items-center justify-center gap-0.5 ${(sortBy === "priceAsc" || sortBy === "priceDesc") ? "text-[#f85606] font-extrabold" : "hover:text-slate-800"}`}
        >
          Price {sortBy === "priceAsc" ? "▲" : sortBy === "priceDesc" ? "▼" : "↕"}
        </button>
      </div>

      {/* 3. Horizontal scrolling Filter Badges / Pills */}
      <div className="bg-[#f8f9fa] border-b border-gray-150 px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {/* Toggle Categories drawer dropdown */}
        <button
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          className={`shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
            selectedCategory !== "all" || priceRange !== "all"
              ? "bg-[#fff2ed] border-[#f85606] text-[#f85606]"
              : "bg-white border-gray-200 text-slate-700"
          }`}
        >
          <SlidersHorizontal className="w-2.5 h-2.5" />
          Filter {selectedCategory !== "all" ? "• " + selectedCategory : "⏷"}
        </button>

        {/* Mall filter */}
        <button
          onClick={() => setMallActive(!mallActive)}
          className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
            mallActive ? "bg-[#fff2ed] border-[#f85606] text-[#f85606]" : "bg-white border-gray-200 text-slate-700"
          }`}
        >
          Mall
        </button>

        {/* Free Delivery filter */}
        <button
          onClick={() => setFreeDeliveryActive(!freeDeliveryActive)}
          className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
            freeDeliveryActive ? "bg-[#fff2ed] border-[#f85606] text-[#f85606]" : "bg-white border-gray-200 text-slate-700"
          }`}
        >
          Free Delivery
        </button>

        {/* Best Price Guaranteed filter */}
        <button
          onClick={() => {
            setSortBy("priceAsc");
          }}
          className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
            sortBy === "priceAsc" ? "bg-[#fff2ed] border-[#f85606] text-[#f85606]" : "bg-white border-gray-200 text-slate-700"
          }`}
        >
          Best Price Guaranteed
        </button>
      </div>

      {/* Inline collapsible quick filters selector container */}
      {showFilterDrawer && (
        <div className="bg-white border-b border-gray-150 p-3.5 space-y-3.5 animate-fadeIn">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 block mb-1.5 uppercase tracking-wider">ক্যাটাগরি ফিল্টার:</span>
            <div className="flex flex-wrap gap-1.5">
              {["all", "clothing", "watches", "electronics", "kitchen", "sports"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                    selectedCategory === cat ? "bg-[#f85606] text-white border-transparent" : "bg-slate-50 border-gray-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {cat === "all" ? "সবগুলো" : cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-extrabold text-slate-400 block mb-1.5 uppercase tracking-wider">সর্বোচ্চ বাজেট:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "যেকোনো দাম" },
                { id: "low", label: "৳ ৩,০০০ এর নিচে" },
                { id: "mid", label: "৳ ৩,০০০ - ৳ ৮,০০০" },
                { id: "high", label: "৳ ৮,০০০ এর ওপরে" }
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => setPriceRange(range.id as any)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                    priceRange === range.id ? "bg-[#f85606] text-white border-transparent" : "bg-slate-50 border-gray-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Two-Column High Fidelity Product Cards Listings */}
      <div className="flex-1 overflow-y-auto bg-[#f1f5f9] pb-24">
        {filteredSearchProducts.length === 0 ? (
          <div className="py-20 text-center max-w-xs mx-auto animate-fadeIn">
            <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-3">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 font-display">অনুসন্ধান মেলেনি!</h3>
            <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed px-4">
              আপনার খোঁজা কীওয়ার্ড “{searchQuery}” এর সাথে কোনো প্রোডাক্টের মিল পাওয়া যায়নি। অন্য কিছু দিয়ে সার্চ করুন।
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setPriceRange("all");
                setSortBy("default");
                setMallActive(false);
                setFreeDeliveryActive(false);
                setSearchQuery("");
              }}
              className="mt-5 px-5 py-2 bg-slate-950 text-white text-[10px] font-bold rounded-lg hover:bg-[#f85606] transition-colors focus:outline-none"
            >
              সব রিসেট করুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 p-2" id="search-grid-listings">
            {filteredSearchProducts.map((product) => {
              const locationLabel = getProductLocation(product.id);
              const soldCount = getProductSoldCount(product.id);
              const coinsSaving = getCoinsDiscount(product.id);
              
              return (
                <div 
                  key={product.id}
                  onClick={() => onOpenQuickView(product)}
                  className="bg-white rounded-xl overflow-hidden border border-gray-150 flex flex-col hover:shadow-md transition-shadow cursor-pointer duration-200 group"
                >
                  {/* Image Viewport */}
                  <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                    <img
                      src={product.image}
                      alt={product.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Left corner campaign tag */}
                    {product.discountTag && (
                      <span className="absolute top-2 left-2 bg-[#f85606] text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-sm shadow-xs uppercase tracking-wider">
                        {product.discountTag}
                      </span>
                    )}
                  </div>

                  {/* Standard Delivery & Promo Badges Bar directly nested inside Card */}
                  <div className="flex flex-wrap items-center gap-1.5 px-2 pt-1.5 shrink-0">
                    {/* Free Delivery Tag */}
                    <span className="bg-[#00b4a0] text-white text-[8px] font-black px-1 rounded-xs uppercase tracking-wide">
                      FREE DELIVERY
                    </span>
                    {/* Coins Badge */}
                    <span className="bg-[#ff9900] text-black text-[8px] font-black px-1 rounded-xs uppercase tracking-wide flex items-center gap-0.5">
                      🪙 COINS
                    </span>
                  </div>

                  {/* Card Title */}
                  <h3 className="text-[11px] font-semibold text-slate-800 leading-tight line-clamp-2 px-2 pt-1.5 min-h-[30px]">
                    {product.title}
                  </h3>

                  {/* Price & Sold section */}
                  <div className="px-2 pt-1.5 flex flex-wrap items-center justify-between gap-1 leading-none">
                    <span className="text-xs font-black text-[#f85606] font-display">
                      ৳ {product.price.toLocaleString("en-US")}
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium">
                      {soldCount} sold
                    </span>
                  </div>

                  {/* Extra Saving Coins Tag */}
                  {coinsSaving > 0 && (
                    <div className="px-2 pt-1 font-sans">
                      <span className="text-[9px] text-amber-600 font-extrabold bg-amber-50 border border-amber-100 rounded-sm px-1 py-0.5">
                        Coins save ৳ {coinsSaving}
                      </span>
                    </div>
                  )}

                  {/* Rating & Location Footer bar */}
                  <div className="flex items-center justify-between text-[9px] text-gray-400 px-2 pb-2.5 pt-1.5 mt-auto">
                    <div className="flex items-center gap-0.5 font-bold text-amber-500">
                      ★ <span className="text-slate-700 text-[9px]">{product.rating.toFixed(1)}</span>
                    </div>
                    <span className="truncate max-w-[65px]">{locationLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Helper Footer strip */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-slate-900 text-white/95 border-t border-slate-800 p-2 text-center text-[10px] font-bold tracking-wider uppercase shadow-lg select-none z-10 flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-[#f85606] animate-pulse" />
        ZSHOP BD MALL PREMIUM SELLER
      </div>
    </div>
  );
}
