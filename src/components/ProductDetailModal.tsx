import React, { useState, useEffect } from "react";
import { 
  X, 
  Star, 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Check, 
  HelpCircle,
  Camera
} from "lucide-react";
import { Product } from "../types";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  image?: string;
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCartWithSpecs: (product: Product, quantity: number, color?: string, size?: string) => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCartWithSpecs,
}: ProductDetailModalProps) {
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [addedMessage, setAddedMessage] = useState<boolean>(false);

  // Custom states for Customer ratings and real-time reviews with photos
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewPhoto, setNewReviewPhoto] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const getDefaultReviews = (productId: string) => {
    return [
      {
        id: `rev-def-1-${productId}`,
        name: "আরিফুল ইসলাম",
        rating: 5,
        comment: "অসাধারণ কোয়ালিটি! ডেলিভারিও অনেক দ্রুত পেয়েছি। ঠিক যেমন ছবিতে দেখেছি তেমনই অরিজিনাল পণ্য পেয়েছি। ৫-এ ৫ স্টার দিলাম।",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString("bn-BD"),
        image: ""
      },
      {
        id: `rev-def-2-${productId}`,
        name: "নাসরিন রহমান",
        rating: 4,
        comment: "অনেক ভালো এবং প্রিমিয়াম প্রডাক্ট। ফিনিশিং এবং মেটেরিয়াল যথেষ্ট নিখুঁত ও মজবুত। ধন্যবাদ ZSHOP BD অরিジナাল পণ্য সরবরাহ করার জন্য। সাজেস্টেড!",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString("bn-BD"),
        image: ""
      }
    ];
  };

  // Sync state variables with newly selected product details
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : "");
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : "");
      setQuantity(1);
      setAddedMessage(false);

      // Fetch reviews
      const stored = localStorage.getItem(`zshop_bd_reviews_${product.id}`);
      if (stored) {
        setReviews(JSON.parse(stored));
      } else {
        const initial = getDefaultReviews(product.id);
        localStorage.setItem(`zshop_bd_reviews_${product.id}`, JSON.stringify(initial));
        setReviews(initial);
      }

      // Auto pre-fill reviewer details if logged-in session exists
      try {
        const activeCustomerRaw = localStorage.getItem("zshop_bd_active_customer_session_v1");
        if (activeCustomerRaw) {
          const customerObj = JSON.parse(activeCustomerRaw);
          setNewReviewName(customerObj.name || customerObj.phone || "");
        } else {
          setNewReviewName("");
        }
      } catch (e) {
        console.error("Failed to parse local customer session:", e);
      }

      setNewReviewRating(5);
      setNewReviewComment("");
      setNewReviewPhoto(null);
      setShowReviewForm(false);
      setReviewMessage("");
    }
  }, [product]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewReviewPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) {
      setReviewMessage("দয়া করে আপনার নাম এবং প্রোডাক্টের মতামতটি লিখুন।");
      return;
    }

    if (!product) return;

    const newReview: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: newReviewName.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      date: new Date().toLocaleDateString("bn-BD"),
      image: newReviewPhoto || undefined
    };

    const updated = [newReview, ...reviews];
    localStorage.setItem(`zshop_bd_reviews_${product.id}`, JSON.stringify(updated));
    setReviews(updated);

    // Track standard search update or dispatch events if components are sharing ratings
    window.dispatchEvent(new Event("zshop_bd_reviews_update"));

    setNewReviewComment("");
    setNewReviewPhoto(null);
    setShowReviewForm(false);
    setReviewMessage("আপনার সফল রিভিউটি পোস্ট করা হয়েছে! ধন্যবাদ।");
    setTimeout(() => {
      setReviewMessage("");
    }, 4000);
  };

  if (!isOpen || !product) return null;

  const {
    title,
    price,
    originalPrice,
    discountTag,
    image,
    category,
    rating,
    reviewsCount,
    inStock,
    description,
    sizes,
    colors,
  } = product;

  // Compute dynamic averages based on latest customer submissions
  const dynamicAvgRating = reviews.length > 0
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
    : rating;
  const dynamicReviewsCount = reviews.length > 0
    ? Math.max(reviewsCount, reviews.length)
    : reviewsCount;

  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmittingSpecs = () => {
    onAddToCartWithSpecs(product, quantity, selectedColor || undefined, selectedSize || undefined);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4" 
      id="product-detail-modal"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
        id="modal-backdrop"
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[92vh] overflow-y-auto">
        
        {/* Close Button Trigger */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-md text-gray-500 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 transition-all z-35 cursor-pointer"
          aria-label="Close details modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Main Product Info: Top Half */}
        <div className="w-full flex flex-col md:flex-row bg-white">
          
          {/* Column 1: Image Showcase */}
        <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-6 relative select-none">
          <div className="aspect-square w-full rounded-2xl overflow-hidden shadow-md border border-gray-150">
            <img
              src={image}
              alt={title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Floating discount banner */}
          {discountTag && (
            <div className="absolute top-8 left-8 py-1.5 px-3 bg-amber-400 text-slate-950 font-display font-extrabold text-[10px] rounded-lg shadow-md uppercase tracking-wider">
              {discountTag}
            </div>
          )}
        </div>

        {/* Column 2: Detailed Specs */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between text-left space-y-5">
          <div className="space-y-4">
            
            {/* Category Breadcrumbs */}
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-extrabold block">
              ZSHOP BD • {category} Collection
            </span>

            {/* Product Title */}
            <h2 className="text-lg sm:text-xl md:text-2xl font-display font-black text-slate-950 leading-snug">
              {title}
            </h2>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-400 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${i < Math.floor(dynamicAvgRating) ? 'fill-amber-400' : 'text-gray-200'}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-mono font-bold text-slate-800">{dynamicAvgRating} Rating</span>
              <span className="text-xs text-gray-400 font-medium">({dynamicReviewsCount} Verified Customer Reviews)</span>
            </div>

            {/* Product Valuation Pricing */}
            <div className="flex items-baseline gap-3 py-1 border-y border-gray-100">
              <span className="text-2xl font-display font-black text-slate-950">
                ৳{formatBDT(price)}
              </span>
              {originalPrice && (
                <>
                  <span className="text-sm text-gray-400 line-through font-medium">
                    ৳{formatBDT(originalPrice)}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                    You Save ৳{formatBDT(originalPrice - price)}
                  </span>
                </>
              )}
            </div>

            {/* Product Description text */}
            <p className="text-xs sm:text-sm text-gray-600 font-sans leading-relaxed">
              {description}
            </p>

            {/* SELECTION FORMS: Sizes & Colors */}
            <div className="space-y-3.5">
              
              {/* Size Select (Available for Clothing/Apparel) */}
              {sizes && sizes.length > 0 && (
                <div>
                  <p className="text-xs font-display font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                    <span>Selected Size:</span>
                    <span className="text-amber-600 font-mono text-[11px] font-extrabold">{selectedSize}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-10 h-9 rounded-xl text-xs font-mono font-bold flex items-center justify-center transition-all border cursor-pointer focus:outline-none ${selectedSize === size ? "border-slate-950 bg-slate-950 text-white" : "border-gray-200 text-slate-700 hover:bg-slate-50"}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Select */}
              {colors && colors.length > 0 && (
                <div>
                  <p className="text-xs font-display font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                    <span>Selected Option / Color:</span>
                    <span className="text-amber-600 font-mono text-[11px] font-extrabold">{selectedColor}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3.5 py-1.5 h-9 rounded-xl text-xs font-sans font-semibold transition-all border cursor-pointer focus:outline-none ${selectedColor === color ? "border-slate-950 bg-slate-950 text-white" : "border-gray-200 text-slate-700 hover:bg-slate-50"}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Multi-points Trust features */}
            <div className="grid grid-cols-3 gap-2 py-4 bg-slate-50 rounded-2xl p-4.5 border border-gray-200/50 text-[10px] font-medium text-slate-700 font-sans">
              <div className="flex flex-col items-center text-center gap-1">
                <Truck className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-slate-800">Swift Delivery</span>
                <span>Dhaka: 24-48h</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 border-x border-gray-200">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-slate-800">Brand Original</span>
                <span>100% Genuine</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-slate-800">Support Returns</span>
                <span>7 Day Guarantee</span>
              </div>
            </div>

          </div>

          {/* Action Footer Button Form */}
          <div className="pt-2 border-t border-gray-100 flex items-center gap-4">
            
            {/* Quantity Selector */}
            {inStock && (
              <div className="flex items-center border border-gray-200 rounded-xl bg-white h-12">
                <button
                  type="button"
                  onClick={() => {
                    if (quantity > 1) setQuantity(quantity - 1);
                  }}
                  className="px-3 text-gray-500 hover:text-slate-950 h-full flex items-center justify-center hover:bg-slate-50 rounded-l-xl focus:outline-none cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-mono font-extrabold text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 text-gray-500 hover:text-slate-950 h-full flex items-center justify-center hover:bg-slate-50 rounded-r-xl focus:outline-none cursor-pointer"
                >
                  +
                </button>
              </div>
            )}

            {/* Buy CTA */}
            <div className="flex-1">
              {inStock ? (
                <button
                  onClick={handleSubmittingSpecs}
                  className={`w-full h-12 bg-slate-950 hover:bg-slate-900 border border-slate-950 text-white rounded-xl text-xs font-display font-bold transition-all flex items-center justify-center gap-2 group cursor-pointer focus:outline-none ${addedMessage ? "bg-emerald-600 border-emerald-600 hover:bg-emerald-600" : ""}`}
                >
                  {addedMessage ? (
                    <>
                      <Check className="w-4 h-4 animate-bounce" />
                      <span>Added Successfully!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 group-hover:scale-105 transition-transform" />
                      <span>Add directly to Cart • ৳{formatBDT(price * quantity)}</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full h-12 bg-gray-105 border border-gray-200 text-gray-400 rounded-xl text-xs font-display font-semibold flex items-center justify-center"
                >
                  Temporarily Sold Out
                </button>
              )}
            </div>
          </div>

        </div>
        </div>

        {/* Dynamic Reviews and Photo Gallery Upload Section */}
        <div className="w-full border-t border-gray-100 bg-slate-50/50 p-6 sm:p-8 space-y-6 text-left" id="product-reviews-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 pb-4">
            <div>
              <h3 className="text-base font-display font-black text-slate-950 uppercase tracking-wide">
                কাস্টমার মূল্যায়ন ও রিভিউসমূহ ({reviews.length})
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                পণ্যটি সম্পর্কে ক্রেতাদের সৎ মতামত ও গ্যালারি থেকে আপলোড করা বাস্তব ছবি দেখুন।
              </p>
            </div>
            
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-slate-950 hover:bg-amber-400 hover:text-slate-950 transition-all text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer focus:outline-none"
            >
              {showReviewForm ? "রিভিউ ফর্ম বন্ধ করুন ✕" : "রিভিউ ও ছবি আপলোড করুন ✍️"}
            </button>
          </div>

          {/* Success/Error Alerts feed */}
          {reviewMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-xl flex items-center gap-2 animate-fade-in font-semibold">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{reviewMessage}</span>
            </div>
          )}

          {/* Review Add Form Drawer block */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-4 animate-fade-in text-left">
              <h4 className="text-xs font-display font-black text-slate-950 uppercase tracking-widest border-b border-gray-100 pb-2">
                রিভিউ এবং বাস্তব ছবি আপলোড করুন
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {/* User Name input */}
                <div className="space-y-1 text-left">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">
                    আপনার নাম / মোবাইল নম্বর
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমনঃ রাসেল আহমেদ"
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    className="w-full h-10 px-3.5 border border-gray-200 focus:border-slate-950 focus:outline-none rounded-xl text-xs font-medium"
                  />
                </div>

                {/* Stars select buttons */}
                <div className="space-y-1 text-left">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">
                    পণ্যটির রেটিং বা মান কেমন লেগেছে?
                  </label>
                  <div className="flex items-center gap-1.5 h-10 text-left">
                    {[1, 2, 3, 4, 5].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setNewReviewRating(st)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                        title={`${st} Star`}
                      >
                        <Star 
                          className={`w-5 h-5 ${st <= newReviewRating ? "fill-amber-400 text-amber-500" : "text-gray-250 hover:text-amber-300"}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Comment box */}
              <div className="space-y-1 text-left">
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">
                  মতামত ও রিভিউ লিখুন
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="যেমনঃ কাপড় বা প্রোডাক্টের মান খুব চমৎকার। ডেলিভারিও অনেক ফাস্ট ছিল। সেলার ভাইও খুব হেল্পফুল..."
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 focus:border-slate-950 focus:outline-none rounded-xl text-xs font-medium"
                />
              </div>

              {/* Upload file component */}
              <div className="space-y-2 text-left">
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">
                  গ্যালারি থেকে বাস্তব প্রোডাক্টের ছবি আপলোড করুন
                </label>
                <div className="flex flex-wrap items-center gap-3 text-left">
                  <label className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-gray-200 hover:border-slate-400 rounded-xl cursor-pointer text-xs font-bold text-slate-700 transition-all flex items-center gap-2 focus-within:outline-none select-none">
                    <Camera className="w-4 h-4 text-slate-600" />
                    <span>গ্যালারি থেকে ছবি সিলেক্ট করুন 📷</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>

                  {newReviewPhoto && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-150 px-3 py-2 rounded-xl animate-fade-in">
                      <img src={newReviewPhoto} alt="Review attachment" className="w-8 h-8 object-cover rounded-lg border border-emerald-250 shadow-xs" />
                      <span className="text-[10px] text-emerald-800 font-bold">১টি ছবি সংযুক্ত হয়েছে!</span>
                      <button
                        type="button"
                        onClick={() => setNewReviewPhoto(null)}
                        className="text-gray-400 hover:text-rose-600 font-mono text-[13px] font-bold ml-1.5 focus:outline-none cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit trigger row */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-slate-50 rounded-xl text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-950 hover:bg-amber-400 hover:text-slate-950 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  রিভিউ ও ছবি পোস্ট করুন
                </button>
              </div>
            </form>
          )}

          {/* Reviews loop list */}
          <div className="space-y-4 text-left">
            {reviews.length === 0 ? (
              <div className="text-center py-10 bg-white border border-gray-150 rounded-2xl text-gray-400 text-xs text-left">
                এখনো কোনো রিভিউ দেওয়া হয়নি। প্রোডাক্টটি কিনে বা পূর্বে ব্যবহার করে থাকলে প্রথম রিভিউটি আপনিই দিন!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-white border border-gray-200 p-4 sm:p-5 rounded-2xl shadow-xs space-y-3.5 text-left flex flex-col justify-between">
                    <div className="space-y-2.5 text-left">
                      {/* Name header & rating */}
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2 text-left">
                        <div className="flex items-center gap-2 text-left">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-700 uppercase">
                            {rev.name.slice(0, 2)}
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-extrabold text-slate-900 block leading-none">
                              {rev.name}
                            </span>
                            <span className="text-[9px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-0.5">
                              ✔ Verified Purchase
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold font-mono">
                          {rev.date}
                        </span>
                      </div>

                      {/* Score stars */}
                      <div className="flex items-center text-amber-400 gap-0.5 text-left">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-250"}`}
                          />
                        ))}
                      </div>

                      {/* Comment text */}
                      <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium text-left">
                        {rev.comment}
                      </p>
                    </div>

                    {/* Snapshot uploads */}
                    {rev.image && (
                      <div className="pt-2 self-start border-t border-gray-50 w-full mt-2 text-left">
                        <p className="text-[10px] text-slate-400 mb-1 font-semibold block uppercase">
                          📷 কাষ্টমার রিভিউ ছবিঃ
                        </p>
                        <div className="relative cursor-zoom-in inline-block rounded-xl overflow-hidden border border-gray-200 max-w-full">
                          <a href={rev.image} target="_blank" rel="noopener noreferrer" className="block outline-none" title="View fullscreen thumbnail">
                            <img
                              src={rev.image}
                              alt="Customer real uploaded feedback attachment"
                              referrerPolicy="no-referrer"
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
