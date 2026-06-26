import React, { useState, useMemo } from "react";
import { ChevronRight, ArrowLeft, MessageSquare, Star, SlidersHorizontal, Check } from "lucide-react";
import { Product, BrandingSettings } from "../types";
import ProductCard from "./ProductCard";

interface ShopViewProps {
  shopName: string;
  products: Product[];
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onOrderNow?: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
  branding?: BrandingSettings;
}

export default function ShopView({
  shopName,
  products,
  onClose,
  onAddToCart,
  onOrderNow,
  onOpenQuickView,
  branding,
}: ShopViewProps) {
  const [sortBy, setSortBy] = useState<string>("popular");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter products for this specific merchant shop
  const shopProducts = useMemo(() => {
    return products.filter((p) => {
      const pShop = p.merchantShopName || "ZSHOP BD";
      return pShop.toLowerCase() === shopName.toLowerCase();
    });
  }, [products, shopName]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...shopProducts];
    if (sortBy === "priceAsc") {
      return list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceDesc") {
      return list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      return list.sort((a, b) => b.rating - a.rating);
    }
    // "popular" / default: put trending first
    return list.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
  }, [shopProducts, sortBy]);

  // Pagination logic: 8 products per page
  const itemsPerPage = 8;
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  return (
    <div className="w-full bg-slate-50 min-h-screen py-6 px-4 sm:px-6 lg:px-8" id="shop-view-container">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Breadcrumb Header */}
        <div className="flex flex-col gap-4 text-left">
          {/* Back Button and logo strip */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition cursor-pointer text-slate-800"
              title="Back to home"
              id="shop-back-button"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 select-none">
              {branding?.logoType === "image" && branding?.logoImage ? (
                <img src={branding.logoImage} alt={branding.logoText || "Logo"} className="h-8 object-contain" />
              ) : (
                <>
                  <div className="w-8 h-8 bg-slate-950 text-white rounded-lg flex items-center justify-center font-display font-black text-base tracking-tight shadow-xs">
                    {(branding?.logoText || "ZSHOP")[0]?.toUpperCase() || "Z"}
                  </div>
                  <span className="font-display font-extrabold text-lg text-slate-950 leading-none">
                    {branding?.logoText || "ZSHOP"}<span className="text-amber-500 font-semibold text-sm ml-0.5">{branding?.logoSuffix || "BD"}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-gray-500 font-sans font-medium" id="shop-breadcrumbs">
            <span className="hover:text-slate-800 cursor-pointer" onClick={onClose}>Home</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="hover:text-slate-800 cursor-pointer" onClick={onClose}>Shops</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-slate-800 font-bold">{shopName}</span>
          </div>
        </div>

        {/* MERCHANT VERIFIED SELLER PROFILE - Matches picture exactly */}
        <div className="p-6 text-left bg-white border border-gray-150 rounded-2xl shadow-sm" id="shop-profile-card">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              {/* Logo block */}
              <div className="w-16 h-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-display font-black text-sm uppercase tracking-widest select-none shadow-md px-1.5 text-center shrink-0">
                {shopName.substring(0, 5).toUpperCase()}
              </div>
              
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-slate-950 text-xl sm:text-2xl tracking-tight leading-none">{shopName}</h1>
                  <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold" title="Verified Merchant">✔</span>
                </div>
                <span className="text-xs text-gray-400 mt-1 font-semibold leading-none">Verified Merchant</span>
                <span className="text-xs text-slate-600 mt-2 font-semibold bg-gray-50 border border-gray-100 px-3 py-1 rounded-full inline-block w-fit">
                  {shopName === "ZSHOP BD" ? "Digital & Fashion Retailer" : "Verified Store Partner"}
                </span>
              </div>
            </div>

            {/* Chat connection widget */}
            <button 
              onClick={() => alert(`${shopName} এর কাস্টমার রিলেশন হাব এর সাথে কানেক্ট করা হচ্ছে...`)}
              className="px-5 py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition active:scale-95 focus:outline-none flex items-center gap-2 shadow-md shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span>Chat with Shop</span>
            </button>
          </div>

          {/* Stats overview bento directory */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-gray-100 text-center">
            <div className="bg-slate-50 border border-gray-100 p-4 rounded-xl shadow-3xs">
              <p className="text-xl sm:text-2xl font-black text-[#0f172a]">4.8 ★</p>
              <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">RATING</p>
            </div>
            <div className="bg-slate-50 border border-gray-100 p-4 rounded-xl shadow-3xs">
              <p className="text-xl sm:text-2xl font-black text-[#0f172a]">1.2M+</p>
              <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">HAPPY CUSTOMERS</p>
            </div>
            <div className="bg-slate-50 border border-gray-100 p-4 rounded-xl shadow-3xs">
              <p className="text-xl sm:text-2xl font-black text-[#0f172a]">98%</p>
              <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">POSITIVE REVIEW</p>
            </div>
            <div className="bg-slate-50 border border-gray-100 p-4 rounded-xl shadow-3xs">
              <p className="text-xl sm:text-2xl font-black text-[#0f172a]">2+ Years</p>
              <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">ON {shopName.toUpperCase()}</p>
            </div>
          </div>

          {/* Trust assurances bars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 text-center">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-bold justify-center bg-slate-50/50 py-2.5 px-3 rounded-lg border border-gray-50">
              <span className="text-base">🛡️</span>
              <span>100% Authentic</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-bold justify-center bg-slate-50/50 py-2.5 px-3 rounded-lg border border-gray-50">
              <span className="text-base">💵</span>
              <span>Cash on Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-bold justify-center bg-slate-50/50 py-2.5 px-3 rounded-lg border border-gray-50">
              <span className="text-base">🔄</span>
              <span>7 Days Return</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-bold justify-center bg-slate-50/50 py-2.5 px-3 rounded-lg border border-gray-50">
              <span className="text-base">🚚</span>
              <span>Fast Delivery</span>
            </div>
          </div>
        </div>

        {/* Shop Catalog Area */}
        <div className="space-y-6 pt-4" id="shop-catalog-area">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
            <div className="text-left">
              <h2 className="text-lg sm:text-xl font-display font-black text-slate-950">
                All Products ({shopProducts.length})
              </h2>
              <p className="text-xs text-gray-400 mt-1 font-medium font-sans">
                Showing {shopProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                {Math.min(currentPage * itemsPerPage, shopProducts.length)} of {shopProducts.length} items
              </p>
            </div>

            {/* Filter and Sort options */}
            <div className="flex items-center gap-3 self-end sm:self-center">
              {/* Sort Selector */}
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 hover:border-gray-300 transition shadow-3xs">
                <span className="text-xs text-gray-500 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs text-slate-800 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="popular">Popular</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="rating">Top Customer Ratings</option>
                </select>
              </div>

              {/* Filter Button */}
              <button className="bg-white hover:bg-gray-50 text-slate-800 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-2 shadow-3xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Product Grid */}
          {paginatedProducts.length === 0 ? (
            <div className="bg-white py-20 text-center rounded-2xl border border-gray-100 shadow-3xs">
              <p className="text-sm font-bold text-slate-600">No products uploaded by this store yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {paginatedProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onAddToCart={onAddToCart}
                  onOrderNow={onOrderNow}
                  onOpenQuickView={onOpenQuickView}
                />
              ))}
            </div>
          )}

          {/* Beautiful Pagination matching the picture */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 pb-12" id="shop-pagination">
              {/* Active, Inactive page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer ${
                    currentPage === p
                      ? "bg-slate-950 text-white shadow-md"
                      : "bg-white text-slate-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {p}
                </button>
              ))}

              {/* Show ellipsis and final page indicator if there are many pages */}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="text-gray-400 font-bold text-xs px-1 select-none">...</span>
                  <button
                    onClick={() => {
                      setCurrentPage(totalPages);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-9 h-9 bg-white text-slate-700 hover:bg-gray-100 border border-gray-200 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              {/* Next page icon button */}
              {currentPage < totalPages && (
                <button
                  onClick={() => {
                    setCurrentPage((prev) => prev + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-9 h-9 bg-white text-slate-700 hover:bg-gray-100 border border-gray-200 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer"
                  title="Next page"
                >
                  <span>➔</span>
                </button>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
