import React, { useMemo } from "react";
import { Search, X, SlidersHorizontal, ShoppingBag, Eye, HelpCircle } from "lucide-react";
import { Product } from "../types";
import ProductCard from "./ProductCard";

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

      return matchesQuery && matchesCategory && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === "priceAsc") return a.price - b.price;
      if (sortBy === "priceDesc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0; // default
    });
  }, [searchQuery, products, selectedCategory, priceRange, sortBy]);

  // Extract unique categories from search results to assist fast filtering
  const searchResultCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    
    const matching = products.filter((prod) =>
      prod.title.toLowerCase().includes(query) ||
      prod.category.toLowerCase().includes(query) ||
      prod.description.toLowerCase().includes(query)
    );
    
    const cats = matching.map((p) => p.category);
    return ["all", ...Array.from(new Set(cats))];
  }, [searchQuery, products]);

  if (!searchQuery) return null;

  // Clear search function
  const handleClose = () => {
    setSearchQuery("");
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md overflow-y-auto animate-fadeIn flex flex-col items-center justify-start p-4 md:p-6"
      id="search-results-overlay-page"
    >
      <div 
        className="w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-amber-300/35 flex flex-col my-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon / Navigation of search page */}
        <div className="bg-gradient-to-r from-amber-500 via-rose-600 to-red-650 p-5 md:p-6 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-white/20 rounded-2xl border border-white/25">
              <Search className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-widest font-mono font-black uppercase text-amber-200">
                  SEARCH RESULTS • সার্চ রেজাল্ট
                </span>
              </div>
              <h2 className="text-base md:text-xl font-display font-black text-white leading-tight">
                “{searchQuery}” এর জন্য পাওয়া গেছে {filteredSearchProducts.length} টি প্রোডাক্ট
              </h2>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10 cursor-pointer flex items-center gap-1.5 focus:outline-none"
            title="সার্চ থেকে ফিরে যান"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-display font-bold">বন্ধ করুন (Close)</span>
          </button>
        </div>

        {/* Filters and Controls area */}
        <div className="bg-slate-50 border-b border-gray-150 p-4 md:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Bengali description */}
          <p className="text-[11px] font-sans font-bold text-gray-500 max-w-lg leading-relaxed text-left">
             আপনার খোঁজা রিলেটেড সেরা প্রোডাক্টগুলো নিচে সাজানো হয়েছে। কোনো স্ক্রল করার প্রয়োজন ছাড়াই সরাসরি আপনার পছন্দের আইটেমটি অর্ডার করতে পারবেন।
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Categories Filter */}
            {searchResultCategories.length > 2 && (
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 mr-1 uppercase">ক্যাটাগরি:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer pr-1"
                >
                  {searchResultCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "সবগুলো ক্যাটাগরি" : cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Price Filter range */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 mr-1 uppercase">বাজেট:</span>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value as any)}
                className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer pr-1"
              >
                <option value="all">যেকোনো মূল্য</option>
                <option value="low">৳ ৩,০০০ এর নিচে</option>
                <option value="mid">৳ ৩,০০০ - ৳ ৮,০০০</option>
                <option value="high">৳ ৮,০০০ এর উপরে</option>
              </select>
            </div>

            {/* Sorting criteria */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 mr-1 uppercase">সর্টিং:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer pr-1"
              >
                <option value="default">ডিফল্ট ক্রমানুসারে</option>
                <option value="priceAsc">নাম্বার ১ কম দাম</option>
                <option value="priceDesc">দামী প্রোডাক্ট আগে</option>
                <option value="rating">সেরা রেটিং প্রাপ্ত</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Body Display */}
        <div className="p-6 md:p-8 bg-white min-h-[360px] max-h-[70vh] overflow-y-auto">
          {filteredSearchProducts.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto" id="search-no-results">
              <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4 animate-bounce">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-base font-display font-black text-slate-900">দুঃখিত, কোনো প্রোডাক্ট পাওয়া যায়নি!</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                আপনার ব্রাউজকৃত কীওয়ার্ড “{searchQuery}” এর সাথে ম্যাচিং কোনো প্রোডাক্ট এই মুহূর্তে আমাদের কাছে নেই। অনুগ্রহ করে বানান পরিবর্তন বা অন্য ক্যাটাগরি ট্রাই করুন।
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setPriceRange("all");
                  setSortBy("default");
                  setSearchQuery("");
                }}
                className="mt-6 px-6 py-2.5 bg-slate-950 text-white hover:bg-amber-400 hover:text-slate-950 text-xs font-display font-bold rounded-xl transition-colors cursor-pointer focus:outline-none shadow-md"
              >
                রিসেট করে ফিরে যান
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" id="search-grid-listings">
              {filteredSearchProducts.map((product) => (
                <div key={product.id} className="transform transition-transform hover:-translate-y-1">
                  <ProductCard
                    product={product}
                    onAddToCart={onAddToCart}
                    onOrderNow={onOrderNow}
                    onOpenQuickView={onOpenQuickView}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info ribbon */}
        <div className="bg-slate-50 border-t border-gray-150 p-4 text-center flex flex-col sm:flex-row items-center justify-between gap-3 px-6">
          <span className="text-[10px] font-display font-bold text-gray-400 uppercase tracking-wider">
            ZSHOP BD SECURE SHOPPING WINDOW
          </span>
          <p className="text-[11px] font-sans text-gray-500 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
            কোনো প্রোডাক্ট পছন্দ না হলে ৭ দিনের রিটার্ন পলিসি রয়েছে।
          </p>
        </div>
      </div>
    </div>
  );
}
