import React from "react";
import { Star, Eye, ShoppingCart, Zap, ShieldCheck } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  key?: string;
  product: Product;
  onAddToCart: (product: Product) => void;
  onOrderNow?: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onOrderNow,
  onOpenQuickView,
}: ProductCardProps) {
  const {
    title,
    price,
    originalPrice,
    discountTag,
    image,
    rating,
    reviewsCount,
    inStock,
  } = product;

  // Format currency with standard Bangladeshi styling comma-separated BDT
  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Safe discount percentage extractor
  const getDiscountPercent = () => {
    if (discountTag) return discountTag;
    if (originalPrice && originalPrice > price) {
      const pct = Math.round(((originalPrice - price) / originalPrice) * 100);
      return `-${pct}%`;
    }
    return null;
  };

  const discountPercent = getDiscountPercent();

  return (
    <div 
      className="group bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
      id={`product-card-${product.id}`}
      onClick={() => onOpenQuickView(product)}
    >
      {/* Product Image Area */}
      <div className="relative aspect-square overflow-hidden bg-[#f4f4f6] shrink-0">
        <img
          src={image}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-out"
        />

        {/* Outer Shadow Vignette */}
        <div className="absolute inset-0 bg-black/3 pointer-events-none" />

        {/* Daraz mall or active campaign tagging */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-15">
          {product.isTrending && (
            <span className="px-1.5 py-0.5 text-[8px] font-sans font-black text-white bg-slate-950 rounded-xs uppercase tracking-wider flex items-center gap-0.5 shadow-sm">
              <ShieldCheck className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
              <span>Mall</span>
            </span>
          )}
          {!inStock && (
            <span className="px-1.5 py-0.5 text-[8px] font-bold text-white bg-[#757575] rounded-xs shadow-xs tracking-wide">
              Stock Out
            </span>
          )}
        </div>

        {/* Hover Quick View Button over the image */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenQuickView(product);
            }}
            className="p-2.5 bg-white text-[#212121] hover:bg-[#f85606] hover:text-white rounded-full transition-all duration-200 shadow-md focus:outline-none cursor-pointer"
            title="Quick View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Daraz-Style Product Metadata Area */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-2.5 text-left bg-white">
        <div>
          {/* Title - Daraz uses black/gray simple font with a 2-line clamp */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenQuickView(product);
            }}
            className="block text-xs sm:text-[13px] font-normal text-[#212121] hover:text-[#f85606] transition-colors text-left font-sans line-clamp-2 leading-tight cursor-pointer focus:outline-none h-9 mt-0.5 overflow-hidden"
          >
            {title}
          </button>

          {/* Rating Block with exact star counts */}
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex items-center text-[#faca51]">
              <Star className="w-2.5 h-2.5 fill-[#faca51] stroke-[#faca51]" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-[#757575] leading-none">{rating}</span>
            <span className="text-[10px] sm:text-[11px] text-[#9e9e9e]">({reviewsCount})</span>
          </div>
        </div>

        <div>
          {/* Price & Discount Indicator */}
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[15px] sm:text-[17px] font-bold text-[#f85606]">
                ৳{formatBDT(price)}
              </span>
            </div>
            {(originalPrice || discountPercent) && (
              <div className="flex items-center gap-1.5 flex-wrap min-h-[16px]">
                {originalPrice && originalPrice > price && (
                  <span className="text-[11px] sm:text-xs text-[#9e9e9e] line-through">
                    ৳{formatBDT(originalPrice)}
                  </span>
                )}
                {discountPercent && (
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#f85606]">
                    {discountPercent}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Location / Free Shipping Footer Badge */}
          <div className="text-[10px] text-[#9e9e9e] font-sans mt-1 border-t border-gray-100 pt-1.5 flex items-center justify-between">
            <span>🏠 Bangladesh</span>
            {inStock && <span className="text-[9px] text-[#25a55f] font-semibold">In Stock</span>}
          </div>

          {/* CTAs styled with exact Daraz promotional colors */}
          <div className="mt-2.5 space-y-1.5">
            {inStock ? (
              <>
                {/* Instant Order Now Button (Daraz Primary Highlight) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOrderNow) {
                      onOrderNow(product);
                    } else {
                      onAddToCart(product);
                    }
                  }}
                  className="w-full py-2 bg-[#f85606] hover:bg-[#d64a05] text-white rounded text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer focus:outline-none shadow-xs uppercase tracking-wider"
                >
                  <Zap className="w-3 h-3 fill-current" />
                  <span>Order Now</span>
                </button>

                {/* Subtle Add to Cart (Daraz Secondary Highlight) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  className="w-full py-1.5 bg-[#eff0f5] hover:bg-[#e2e3e8] text-[#212121] rounded text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer focus:outline-none"
                >
                  <ShoppingCart className="w-3 h-3 text-[#212121]" />
                  <span>Add to Cart</span>
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
}
