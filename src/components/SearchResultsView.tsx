import React, { useMemo } from "react";
import { Search, X, ShoppingBag, HelpCircle, ChevronLeft, Camera, SlidersHorizontal, MapPin, Sparkles, Star, Zap, ShoppingCart, ShieldCheck } from "lucide-react";
import { Product } from "../types";

interface SearchResultsViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onOrderNow: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
}

const englishToBanglaDigits: { [key: string]: string } = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

const toBanglaNumber = (numStr: string) => {
  return numStr.split('').map(char => englishToBanglaDigits[char] || char).join('');
};

const formatBDT = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

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
        prod.description.toLowerCase().includes(query) ||
        (prod.merchantShopName && prod.merchantShopName.toLowerCase().includes(query));

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
      className="absolute inset-0 z-40 bg-[#f1f5f9] overflow-y-auto animate-fadeIn flex flex-col items-stretch justify-start"
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
              const discountPercentNum = product.originalPrice && product.originalPrice > product.price
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;

              return (
                <div 
                  key={product.id}
                  onClick={() => onOpenQuickView(product)}
                  className="group bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
                  id={`search-card-${product.id}`}
                >
                  {/* Product Image Area */}
                  <div className="relative aspect-square overflow-hidden bg-[#f4f4f6] shrink-0">
                    <img
                      src={product.image}
                      alt={product.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />

                    {/* Outer Shadow Vignette */}
                    <div className="absolute inset-0 bg-black/3 pointer-events-none" />

                    {/* ZSHOP BD MALL SELLER badge */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-15">
                      <span className="px-1.5 py-0.5 text-[8px] font-sans font-black text-white bg-slate-950 rounded-xs uppercase tracking-wider flex items-center gap-0.5 shadow-sm">
                        <ShieldCheck className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        <span>ZSHOP BD MALL SELLER</span>
                      </span>
                    </div>
                  </div>

                  {/* Product Metadata Area */}
                  <div className="p-3 flex flex-col flex-1 justify-between gap-2.5 text-left bg-white">
                    <div>
                      {/* Title */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenQuickView(product);
                        }}
                        className="block text-xs sm:text-[13px] font-normal text-[#212121] hover:text-[#f85606] transition-colors text-left font-sans line-clamp-2 leading-tight cursor-pointer focus:outline-none h-9 mt-0.5 overflow-hidden"
                      >
                        {product.title}
                      </button>

                      {/* Rating with design */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex items-center text-[#faca51]">
                          <Star className="w-2.5 h-2.5 fill-[#faca51] stroke-[#faca51]" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold text-[#757575] leading-none">{product.rating.toFixed(1)}</span>
                        <span className="text-[10px] sm:text-[11px] text-[#9e9e9e]">({product.reviewsCount})</span>
                      </div>
                    </div>

                    <div>
                      {/* Price & Discount */}
                      <div className="space-y-0.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[15px] sm:text-[17px] font-bold text-[#f85606]">
                            ৳{toBanglaNumber(formatBDT(product.price))}
                          </span>
                        </div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="flex items-center gap-1.5 flex-wrap min-h-[16px]">
                            <span className="text-[11px] sm:text-xs text-[#9e9e9e] line-through">
                              ৳{toBanglaNumber(formatBDT(product.originalPrice))}
                            </span>
                            {discountPercentNum > 0 && (
                              <span className="text-[10px] sm:text-[11px] font-semibold text-[#f85606]">
                                {discountPercentNum}% OFF
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Location & Stock Status Row */}
                      <div className="text-[10px] text-[#9e9e9e] font-sans mt-2.5 border-t border-gray-100 pt-1.5 flex items-center justify-between">
                        <span>🏠 Bangladesh</span>
                        {product.inStock && <span className="text-[9px] text-[#25a55f] font-semibold">In Stock</span>}
                      </div>

                      {/* CTA Buttons Row */}
                      <div className="mt-2.5 space-y-1.5">
                        {product.inStock ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOrderNow(product);
                              }}
                              className="w-full py-2 bg-[#f85606] hover:bg-[#d64a05] text-white rounded text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer focus:outline-none shadow-xs uppercase tracking-wider"
                            >
                              <span>⚡ ORDER NOW</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(product);
                              }}
                              className="w-full py-1.5 bg-[#eff0f5] hover:bg-[#e2e3e8] text-[#212121] rounded text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer focus:outline-none"
                            >
                              <span>🛒 Add to Cart</span>
                            </button>
                          </>
                        ) : (
                          <button
                            disabled
                            className="w-full py-2 bg-[#f4f4f4] text-[#9e9e9e] rounded text-xs font-semibold cursor-not-allowed"
                          >
                            <span>Stock Out</span>
                          </button>
                        )}
                      </div>
                    </div>
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
