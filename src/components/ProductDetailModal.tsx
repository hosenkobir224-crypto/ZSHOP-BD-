import React, { useState, useEffect, useMemo } from "react";
import { 
  X, 
  Star, 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Check, 
  HelpCircle,
  Camera,
  Heart,
  Share2,
  Clock,
  MapPin,
  Calendar,
  Send,
  MessageSquare,
  Copy,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  Info,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Home,
  SlidersHorizontal,
  Compass,
  Play,
  User,
  Search
} from "lucide-react";
import { Product } from "../types";
import { PRODUCTS } from "../data";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  image?: string;
}

interface Question {
  id: string;
  senderName: string;
  query: string;
  reply?: string;
  date: string;
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCartWithSpecs: (product: Product, quantity: number, color?: string, size?: string) => void;
  onBuyNowWithSpecs?: (product: Product, quantity: number, color?: string, size?: string) => void;
  products?: Product[]; // Pass full products catalog for related recommendations
  onSelectProduct?: (product: Product) => void; // Support swapping active product
}

function getCategorySpecs(category: string) {
  if (category === "watches") {
    return [
      { text: "Genuine Stainless Steel", icon: "✏" },
      { text: "Mineral Glass Dial Face", icon: "🔲" },
      { text: "50M Water Resistance", icon: "💧" },
      { text: "Chronograph Function", icon: "⏱" }
    ];
  } else if (category === "clothing") {
    return [
      { text: "100% Combed Cotton Fabric", icon: "✏" },
      { text: "Premium High-Density Sewing", icon: "🔲" },
      { text: "Lifetime Color Bleed Proof", icon: "💧" },
      { text: "Classic Comfort Silhouette", icon: "⏱" }
    ];
  } else {
    return [
      { text: "Authentic Quality Materials", icon: "✏" },
      { text: "Built for Modern Longevity", icon: "🔲" },
      { text: "IPX5 Splash Resistance", icon: "💧" },
      { text: "100% Genuine Certified Goods", icon: "⏱" }
    ];
  }
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCartWithSpecs,
  onBuyNowWithSpecs,
  products = [],
  onSelectProduct,
}: ProductDetailModalProps) {
  // Option Selectors
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [addedMessage, setAddedMessage] = useState<boolean>(false);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);

  // Gallery Active View
  const [activeImage, setActiveImage] = useState<string>("");
  const [activeThumbId, setActiveThumbId] = useState<string>("thumb-1");
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Floating/Expanded detail tab
  const [activeTab, setActiveTab] = useState<"detail" | "specs" | "qa" | "reviews">("detail");

  // Timer values for flash urgencies
  const [countdown, setCountdown] = useState({ hrs: 2, mins: 45, secs: 19 });

  // Delivery estimation state
  const [selectedDistrict, setSelectedDistrict] = useState<string>("chittagong"); // Bayezid Bostami is in Chittagong!

  // Reviews states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewPhoto, setNewReviewPhoto] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  // Q&A states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [qaSuccessMessage, setQaSuccessMessage] = useState("");

  // Social share link feedback
  const [copiedLink, setCopiedLink] = useState(false);

  // Cart Status Counter state
  const [cartCount, setCartCount] = useState<number>(0);

  // Load and read Cart items count to make red badge feel realistic!
  useEffect(() => {
    if (!isOpen) return;
    const updateCartCount = () => {
      try {
        const raw = localStorage.getItem("zshop_bd_cart_v1");
        if (raw) {
          const items = JSON.parse(raw);
          if (Array.isArray(items)) {
            setCartCount(items.reduce((acc, curr) => acc + curr.quantity, 0));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("zshop_bd_cart_update", updateCartCount);
    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("zshop_bd_cart_update", updateCartCount);
    };
  }, [isOpen]);

  // Dynamic Specifications Generator based on product category
  const specifications = useMemo(() => {
    if (!product) return [];
    
    const common = [
      { label: "ব্র্যান্ড (Brand)", value: product.isTrending ? "ZSHOP BD MALL SELLER" : "ZSHOP Core Exclusive" },
      { label: "প্রোডাক্ট আইডি (Product ID)", value: `#ZSP-${product.id.toUpperCase()}` },
    ];

    switch (product.category) {
      case "clothing":
        return [
          ...common,
          { label: "মেটেরিয়াল (Material)", value: "মেডিকেটেড লাক্সারি কটন ও ডাইং লিনেন ফেস" },
          { label: "ফিটিং টাইপ (Fitting Type)", value: "সেমি-ফিট স্টাইলিশ কমফোর্ট" },
          { label: "কালার গ্যারান্টি (Color)", value: "১০০% লাইফটাইম কালার ব্ল্যাকআউট পলিসি" },
          { label: "উৎপাদনকারী দেশ (Origin)", value: "বাংলাদেশ (ZSHOP ইন-হাউজ)" },
        ];
      case "watches":
        return [
          ...common,
          { label: "মুভমেন্ট (Engine)", value: "হাই-গ্রেড জাপানি ক্রনোগ্রাফ কোয়ার্টজ ক্রু" },
          { label: "ডায়াল গ্লাস (Glass Dial)", value: "স্যাফায়ার অ্যান্টি-স্ক্র্যাচ রেজিস্ট্যান্ট সারফেস" },
          { label: "বেল্ট ডিজাইন (Strap Material)", value: "প্রিমিয়াম বাছুরের চামড়ার বেল্ট (Genuine Leather)" },
        ];
      case "electronics":
        return [
          ...common,
          { label: "ব্লুটুথ ভার্সন (Bluetooth)", value: "Qualcomm Bluetooth v5.3 প্লাস ফাস্ট চিপসেট" },
          { label: "ব্যাটারি পারফরম্যান্স (Battery)", value: "টানা ৩৬ ঘণ্টা পর্যন্ত অ্যাক্টিভ প্লেব্যাক" },
          { label: "সাউন্ড মেকানিজম (Acoustic)", value: "৪০ মিমি ডুয়াল মেগা-বাস ড্রাইভার মেকানিক্যাল টিউনিং" },
        ];
      default:
        return [
          ...common,
          { label: "উৎপাদনকারী বা সোর্স (Vouched)", value: "ZSHOP BD Certified Mall Seller" },
          { label: "প্যাকেজিং স্ট্যান্ডার্ড (Pack Type)", value: "সিলড প্রিমিয়াম গিফট রিল বক্স প্রটেকশনসহ" },
        ];
    }
  }, [product]);

  // Default Reviews for each product
  const getDefaultReviews = (productId: string) => {
    return [
      {
        id: `rev-def-1-${productId}`,
        name: "রাসেল চৌধুরী",
        rating: 5,
        comment: "অসাধারণ কোয়ালিটি! ডেলিভারিও অনেক দ্রুত পেয়েছি। ছবিতে যেমন দেখেছি অরিজিনাল ফ্যান একদম সেইম পেয়েছি। অনেক বাতাস দেয় এবং ডিজিটাল স্ক্রীনের চার্জ দেখায়। ৫-এ ৫ স্টার দিলাম।",
        date: new Date(Date.now() - 3 * 24 * 60 * 65 * 1000).toLocaleDateString("bn-BD"),
        image: ""
      },
      {
        id: `rev-def-2-${productId}`,
        name: "শারমীন আকতার",
        rating: 4,
        comment: "অনেক ভালো এবং প্রিমিয়াম ডিজাইন। ফিনিশিং চমৎকার, গলায় ঝুলিয়ে সহজেই ব্যবহার করা যায়। থ্যাংক ইউ ZSHOP!",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString("bn-BD"),
        image: ""
      }
    ];
  };

  // Preloaded dynamic questions for Q&A block
  const getDefaultQuestions = (productId: string) => {
    return [
      {
        id: `qa-def-1-${productId}`,
        senderName: "মোহাম্মদ রিফাত",
        query: "আমি যদি চট্টগ্রামে থাকি, অর্ডারের পর ডেলিভারি কত দিনের ভেতর পাবো? আর ক্যাশ অন কি পাওয়া যাবে?",
        reply: "ধন্যবাদ ভাইয়া। চট্টগ্রামে আমরা ২৪ ঘণ্টার স্পেশাল কন্ডিশনে ক্যাশ অন ডেলিভারি (COD) দিয়ে থাকি। ১ থেকে ২ দিনের মধ্যে দ্রুত পেয়ে যাবেন।",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString("bn-BD")
      },
      {
        id: `qa-def-2-${productId}`,
        senderName: "নাইমা রহমান",
        query: "কালার কি ফেড হয়ে যাবে? কোনো গ্যারান্টি আছে?",
        reply: "জি না আপু, এটি হাই-কোয়ালিটি প্রিমিয়াম বডি প্লাস্টিক এবং কালার প্রলেপে তৈরি। কালার ফেড হওয়ার কোনো সুযোগ নেই।",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString("bn-BD")
      }
    ];
  };

  // Synchronize dynamic details whenever product pointer changes
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : "");
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : "");
      setQuantity(1);
      setAddedMessage(false);
      setActiveImage(product.image);
      setActiveThumbId("thumb-1");
      setActiveIndex(0);
      
      // Reset scroll position of the gallery container
      setTimeout(() => {
        const scrollContainer = document.getElementById("product-detail-swipe-container");
        if (scrollContainer) {
          scrollContainer.scrollLeft = 0;
        }
      }, 50);
      setActiveTab("detail");
      setIsWishlisted(localStorage.getItem(`zshop_bd_wishlist_${product.id}`) === "true");

      // Load Reviews from localstorage
      const savedReviews = localStorage.getItem(`zshop_bd_reviews_${product.id}`);
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews));
      } else {
        const initialRev = getDefaultReviews(product.id);
        localStorage.setItem(`zshop_bd_reviews_${product.id}`, JSON.stringify(initialRev));
        setReviews(initialRev);
      }

      // Load Q&A questions from localstorage
      const savedQuestions = localStorage.getItem(`zshop_bd_qa_${product.id}`);
      if (savedQuestions) {
        setQuestions(JSON.parse(savedQuestions));
      } else {
        const initialQA = getDefaultQuestions(product.id);
        localStorage.setItem(`zshop_bd_qa_${product.id}`, JSON.stringify(initialQA));
        setQuestions(initialQA);
      }

      // Pre-fill user review details if active customer session exists
      try {
        const savedSession = localStorage.getItem("zshop_bd_active_customer_session_v1");
        if (savedSession) {
          const customer = JSON.parse(savedSession);
          setNewReviewName(customer.name || customer.phone || "");
        } else {
          setNewReviewName("");
        }
      } catch (err) {
        console.error("Session fetch failed", err);
      }

      // Reset form states
      setNewReviewRating(5);
      setNewReviewComment("");
      setNewReviewPhoto(null);
      setShowReviewForm(false);
      setReviewMessage("");
      setNewQuestionText("");
      setQaSuccessMessage("");
    }
  }, [product]);

  // Handle keydown for Escape key closing & Scroll viewport resetting on open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      window.scrollTo({ top: 0, behavior: "instant" });
      
      // Also reset modal container inside
      const modalElement = document.getElementById("product-detail-mobile-page");
      if (modalElement) {
        modalElement.scrollTop = 0;
      }
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Flash Sale Timer Tick Engine
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.secs > 0) {
          return { ...prev, secs: prev.secs - 1 };
        } else if (prev.mins > 0) {
          return { ...prev, mins: prev.mins - 1, secs: 59 };
        } else if (prev.hrs > 0) {
          return { hrs: prev.hrs - 1, mins: 59, secs: 59 };
        } else {
          return { hrs: 2, mins: 44, secs: 59 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute alternative thumb snapshots to simulate a real multi-photo gallery
  const alternativeThumbnails = useMemo(() => {
    if (!product) return [];
    return [
      { id: "thumb-1", label: "মূল ভিউ", image: product.image, styleClass: "object-cover" },
      { id: "thumb-2", label: "ডিটেইল ভিউ", image: product.image, styleClass: "object-cover scale-150 origin-center" },
      { id: "thumb-3", label: "স্টাইলিশ ফ্রন্ট", image: product.image, styleClass: "object-cover brightness-[1.04] contrast-105" },
      { id: "thumb-4", label: "প্যাকিং সিল", image: product.image, styleClass: "object-cover brightness-95 sepia-[0.1]" }
    ];
  }, [product]);

  // Helper to get deterministic sold count matches style
  const getProductSoldCount = (productId: string) => {
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
        hash += productId.charCodeAt(i);
    }
    return (hash % 180) + 320; // Stable, realistic sales numbers matching standard screenshots
  };

  if (!isOpen || !product) return null;

  // Format currency
  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const roundedHeadingRating = reviews.length > 0
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
    : product.rating;

  const totalReviewsCount = reviews.length > 0
    ? Math.max(product.reviewsCount, reviews.length)
    : product.reviewsCount;

  // Delivery configuration reactive values
  const deliveryCostForDistrict = selectedDistrict === "chittagong" ? 60 : 120;
  
  // Custom delivery date estimates (e.g. June 17-19)
  const getDeliveryDateEstimate = () => {
    const start = new Date();
    start.setDate(start.getDate() + 2);
    const end = new Date();
    end.setDate(end.getDate() + 4);

    const formatShortMonthAndDate = (d: Date) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    };

    return `${formatShortMonthAndDate(start)}-${formatShortMonthAndDate(end)}`;
  };

  // Add to cart callback
  const handleAddToCart = () => {
    onAddToCartWithSpecs(product, quantity, selectedColor || undefined, selectedSize || undefined);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 2000);
  };

  // Direct checkout Buy Now callback
  const handleBuyNowTrigger = () => {
    if (onBuyNowWithSpecs) {
      onBuyNowWithSpecs(product, quantity, selectedColor || undefined, selectedSize || undefined);
    } else {
      // Fallback
      onAddToCartWithSpecs(product, quantity, selectedColor || undefined, selectedSize || undefined);
    }
  };

  const handleCopyLink = () => {
    const text = `${window.location.origin}/product/${product.id} - ${product.title}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const toggleWishlist = () => {
    const next = !isWishlisted;
    setIsWishlisted(next);
    localStorage.setItem(`zshop_bd_wishlist_${product.id}`, String(next));
    window.dispatchEvent(new Event("zshop_bd_wishlist_update"));
  };

  const handleReviewPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setReviewMessage("অনুগ্রহ করে আপনার নাম এবং প্রোডাক্ট সম্পর্কে মতামত লিখুন।");
      return;
    }

    const reviewItem: Review = {
      id: `rev-${Date.now()}`,
      name: newReviewName.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      date: new Date().toLocaleDateString("bn-BD"),
      image: newReviewPhoto || undefined
    };

    const nextReviews = [reviewItem, ...reviews];
    localStorage.setItem(`zshop_bd_reviews_${product.id}`, JSON.stringify(nextReviews));
    setReviews(nextReviews);
    window.dispatchEvent(new Event("zshop_bd_reviews_update"));

    setNewReviewComment("");
    setNewReviewPhoto(null);
    setShowReviewForm(false);
    setReviewMessage("আপনার মূল্যবান রিভিউটি সফলভাবে প্রকাশিত হয়েছে। ধন্যবাদ!");
    setTimeout(() => setReviewMessage(""), 4000);
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    let sender = "বেনামী গ্রাহক";
    try {
      const savedSession = localStorage.getItem("zshop_bd_active_customer_session_v1");
      if (savedSession) {
        const customer = JSON.parse(savedSession);
        sender = customer.name || customer.phone || "কাস্টমার";
      }
    } catch {}

    const newQA: Question = {
      id: `qa-${Date.now()}`,
      senderName: sender,
      query: newQuestionText.trim(),
      date: new Date().toLocaleDateString("bn-BD")
    };

    const nextQs = [newQA, ...questions];
    localStorage.setItem(`zshop_bd_qa_${product.id}`, JSON.stringify(nextQs));
    setQuestions(nextQs);
    setNewQuestionText("");
    setQaSuccessMessage("আপনার প্রশ্নটি জমা হয়েছে। ZSHOP-এর সাপোর্ট টিম শীঘ্রই উত্তর দিবে!");
    
    // Auto simulate replies
    setTimeout(() => {
      setQuestions((prev) => {
        const updated = prev.map((q) => {
          if (q.id === newQA.id) {
            return {
              ...q,
              reply: "ধন্যবাদ আপনার ইনকুয়ারির জন্য। এটি আমাদের রেডি ইন-স্টক প্রোডাক্ট। আপনি এখনই অর্ডার প্লেস করতে পারেন, আমাদের কাস্টমার রিলেশন হাব থেকে দ্রুত কনফার্মেশন কল দেওয়া হবে।"
            };
          }
          return q;
        });
        localStorage.setItem(`zshop_bd_qa_${product.id}`, JSON.stringify(updated));
        return updated;
      });
    }, 4000);

    setTimeout(() => setQaSuccessMessage(""), 5000);
  };

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#f8fafc] overflow-y-auto animate-fadeIn flex flex-col items-stretch justify-start pb-28 font-sans"
      id="product-detail-mobile-page"
    >
      {/* 1. Header Navigation Bar (Screenshot Style) */}
      <div className="sticky top-0 z-35 bg-white border-b border-gray-100 px-4 py-3 flex flex-col gap-3 shadow-xs">
        
        {/* Row 1: Logo & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger / Back Button */}
            <button
              onClick={onClose}
              className="p-1 px-1.5 focus:outline-none hover:bg-slate-50 rounded-lg transition-colors shrink-0"
              title="সার্চ থেকে ফিরে যান"
            >
              <ChevronLeft className="w-6 h-6 text-slate-800 stroke-[2.5]" />
            </button>

            {/* Logo Brand Frame */}
            <div className="flex items-center gap-1.5 cursor-pointer selection:bg-transparent" onClick={onClose}>
              <div className="w-8 h-8 bg-slate-950 text-white rounded-lg flex items-center justify-center font-display font-black text-base tracking-tight shadow-sm">
                Z
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-sm tracking-normal text-slate-950 leading-none">
                  ZSHOP<span className="text-amber-500 font-semibold text-xs ml-0.5">BD</span>
                </span>
                <span className="text-[7px] tracking-[0.15em] uppercase text-gray-400 font-mono mt-0.5 font-bold">
                  Retail Revolution
                </span>
              </div>
            </div>
          </div>

          {/* User Profile and Cart indicator */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                onClose();
                // trigger profile route click
                const anchor = document.getElementById("header-profile-trigger");
                if (anchor) anchor.click();
              }}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-700 transition"
            >
              <User className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Cart Icon with red badge */}
            <div className="relative">
              <button 
                onClick={() => {
                  onClose();
                  // trigger open cart on home viewport
                  const flCart = document.getElementById("navbar-floating-cart-anchor");
                  if (flCart) {
                    flCart.click();
                  } else {
                    const hCart = document.getElementById("header-cart-trigger");
                    if (hCart) hCart.click();
                  }
                }} 
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-700"
              >
                <ShoppingCart className="w-5 h-5 stroke-[2]" />
              </button>
              {cartCount > 0 ? (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border border-white leading-none shadow-xs">
                  {cartCount}
                </span>
              ) : (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border border-white leading-none shadow-xs">
                  3
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Search Input area */}
        <div className="flex items-center border border-gray-250 bg-white rounded-xl px-3 py-1 bg-[#fff] justify-between shadow-xs">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-gray-400">🔍</span>
            <input
              type="text"
              readOnly
              value={product.category === "watches" ? "Search matching clothes, watches" : "Search in ZSHOP BD"}
              className="w-full text-xs font-medium text-slate-400 bg-transparent focus:outline-none pr-1 select-none pointer-events-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-slate-400 shrink-0 cursor-pointer" />
            <button className="bg-[#0b1120] hover:bg-slate-800 text-white p-2 px-3 rounded-lg text-xs font-bold transition">
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

      </div>

      {/* Main product block */}
      <div className="max-w-6xl mx-auto w-full px-4 pt-4 pb-12 flex-1">
        
        {/* Breadcrumb section matches picture */}
        <div className="hidden md:flex text-[11px] sm:text-xs text-gray-500 font-sans mb-4 items-center flex-wrap gap-1 bg-white p-2.5 px-4 rounded-xl border border-gray-100 shadow-3xs">
          <span className="hover:text-[#f85606] cursor-pointer" onClick={onClose}>Home</span>
          <span className="text-gray-300 font-bold">&gt;</span>
          <span className="hover:text-[#f85606] cursor-pointer capitalize">
            {product.category === "watches" ? "Wathes" : product.category}
          </span>
          <span className="text-gray-300 font-bold">&gt;</span>
          <span className="hover:text-[#f85606] cursor-pointer">
            {product.category === "watches" ? "Men's Watch" : "New Fashion"}
          </span>
          <span className="text-gray-300 font-bold">&gt;</span>
          <span className="text-slate-800 truncate max-w-[200px] font-medium">{product.title}</span>
        </div>

        {/* Dynamic Screen Layout Details */}
        <div className="bg-white border border-gray-100 rounded-2xl md:p-8 p-4 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
          
          {/* Left Column: Image with coupon sticker & snapshots */}
          <div className="md:col-span-5 flex flex-col gap-4">
            
            {/* Primary Gallery viewport */}
            <div className="relative aspect-square w-full rounded-xl bg-slate-50 border border-gray-100 overflow-hidden select-none shadow-3xs group">
              <img
                src={activeImage}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
              />

              {/* Red Discount Badges Badge exact in top left corner */}
              <span className="absolute top-3 left-3 bg-rose-600 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-sm shadow-md tracking-wider">
                -{product.originalPrice && product.originalPrice > product.price 
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
                  : 35}%
              </span>
            </div>

            {/* Thumbnail Gallery snapshots selector bar matches the mockup styles */}
            <div className="flex gap-2.5 overflow-x-auto py-1 scrollbar-none justify-start">
              {alternativeThumbnails.map((thumb) => (
                <button
                  key={thumb.id}
                  onClick={() => {
                    setActiveThumbId(thumb.id);
                    setActiveImage(thumb.image);
                  }}
                  className={`w-14 h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all p-0.5 ${activeThumbId === thumb.id ? "border-[#fdb900] shadow-sm scale-102" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <img src={thumb.image} alt={thumb.label} referrerPolicy="no-referrer" className={`w-full h-full object-cover ${thumb.styleClass}`} />
                </button>
              ))}
            </div>

            {/* Viewers countdown card panel */}
            <div className="bg-[#fafafa] border border-gray-150 p-4 rounded-xl flex items-center justify-center gap-2 shadow-3xs">
              <span className="text-lg">👁</span>
              <p className="text-xs text-gray-600 font-sans font-medium">
                <strong className="text-slate-900 font-extrabold">1,248 people</strong> are viewing this product
              </p>
            </div>

          </div>

          {/* Right Column: Key Details, Price, Spec Bullet values */}
          <div className="md:col-span-7 flex flex-col justify-start">
            
            {/* 100% Genuine line banner */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1d4ed8] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full shadow-3xs">
                <span className="text-blue-600">✔</span>
                <span>100% Genuine</span>
              </div>

              {/* Heart Wishlist Trigger */}
              <button 
                onClick={toggleWishlist}
                className="p-2 bg-slate-50 border border-gray-100 hover:bg-slate-100 text-gray-400 hover:text-red-500 transition-colors rounded-full focus:outline-none"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
              </button>
            </div>

            {/* Product Title */}
            <h1 className="text-lg md:text-xl font-bold text-[#0f172a] leading-tight font-sans tracking-tight mb-3">
              {product.title}
            </h1>

            {/* Price Row section */}
            <div className="flex items-baseline gap-2.5 mb-5 bg-[#fafafa] p-4 rounded-xl border border-gray-100">
              <span className="text-2xl md:text-3xl font-black text-[#0f172a] font-sans">
                ৳{formatBDT(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-sm md:text-base text-gray-400 line-through font-medium">
                    ৳{formatBDT(product.originalPrice)}
                  </span>
                  <span className="text-[10px] md:text-xs font-extrabold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Brand/Model Specs Directory details table */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600 mb-6 border-b border-gray-100 pb-5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-400">Brand:</span>
                <span className="text-[#1d4ed8] hover:underline font-semibold cursor-pointer">
                  {product.category === "watches" ? "Emporio Armani" : "ZSHOP Premium"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-400">Model:</span>
                <span className="font-semibold text-slate-900">{product.id === "wt-armani" ? "AR2448" : `Z-${product.id.toUpperCase()}`}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-400">Condition:</span>
                <span className="font-semibold text-slate-900">Brand New</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-400">Warranty:</span>
                <span className="font-semibold text-slate-900">{product.category === "watches" ? "2 Years International Warranty" : "1 Year Brand Warranty"}</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <span className="font-bold text-slate-400">Stock:</span>
                <span className="font-extrabold text-emerald-600">● In Stock</span>
              </div>
            </div>

            {/* Core Feature bullet outline specs list with dynamic icons */}
            <div className="space-y-3 mb-8 bg-amber-50/20 border border-amber-100 p-4 rounded-xl text-xs sm:text-sm text-slate-700">
              <h3 className="font-bold text-slate-900 mb-2 font-sans text-xs uppercase tracking-wider text-amber-800">Product Highlights:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {getCategorySpecs(product.category).map((spec, index) => (
                  <div key={index} className="flex items-center gap-2 text-slate-810">
                    <span className="text-slate-800 font-bold bg-[#fafafa] w-6 h-6 flex items-center justify-center rounded border border-gray-150 shrink-0">
                      {spec.icon}
                    </span>
                    <span className="font-medium">{spec.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Call Action Control boxes */}
            <div className="bg-[#fcfdff] p-5 rounded-xl border border-blue-50/50 space-y-5">
              
              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2.5 text-left">
                  <span className="text-[11px] font-black text-slate-550 uppercase tracking-widest block">পছন্দের কালার সিলেক্ট করুন:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => {
                      const isSelected = selectedColor === color;
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`px-3.5 py-2 text-xs font-bold rounded-lg border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#f85606] bg-orange-50/50 text-[#f85606] shadow-3xs"
                              : "border-gray-200 bg-white text-slate-700 hover:border-gray-300"
                          }`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2.5 text-left">
                  <span className="text-[11px] font-black text-slate-550 uppercase tracking-widest block">সাইজ সিলেক্ট করুন:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`w-11 h-11 flex items-center justify-center text-xs font-black rounded-lg border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#f85606] bg-orange-50/50 text-[#f85606] shadow-3xs"
                              : "border-gray-200 bg-white text-slate-700 hover:border-gray-355"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              <div className="flex items-center justify-between border-t border-gray-100/60 pt-4">
                <span className="text-xs font-bold text-slate-550 uppercase tracking-wider">Purchase Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden h-9">
                  <button
                    onClick={() => { if (quantity > 1) setQuantity(quantity - 1); }}
                    className="px-3 text-gray-500 hover:text-slate-900 font-bold h-full focus:outline-none hover:bg-slate-50 transition"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 text-gray-500 hover:text-slate-900 font-bold h-full focus:outline-none hover:bg-slate-50 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Dynamic cart and order CTA buttons exact as in screenshot draft */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 bg-[#0b1120] hover:bg-slate-800 active:scale-98 text-white rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md focus:outline-none"
                >
                  <ShoppingCart className="w-4 h-4 text-white" />
                  <span>ADD TO CART</span>
                </button>

                <button
                  onClick={handleBuyNowTrigger}
                  className="flex-1 h-12 bg-white border-2 border-[#0b1120] hover:bg-slate-50 active:scale-98 text-[#0b1120] rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer transition-all focus:outline-none"
                >
                  <span>⚡ BUY NOW</span>
                </button>
              </div>

              {/* Sub secure cash delivery notification */}
              <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-black tracking-wide uppercase font-sans">
                <span>💵</span>
                <span>CASH ON DELIVERY AVAILABLE</span>
              </div>

            </div>

          </div>

        </div>

        {/* RELATED PRODUCTS (CAROUSEL WITH ARROWS) */}
        <div className="p-5 text-left bg-white mt-6 border border-gray-100 rounded-2xl shadow-xs relative">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <span className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-sans">
              🔍 Related Products
            </span>
            <button 
              onClick={() => {
                onClose();
                // trigger Categories tab selection in parents
                const btns = document.getElementsByTagName("button");
                for (let i = 0; i < btns.length; i++) {
                  if (btns[i].innerText && btns[i].innerText.includes("Watches")) {
                    btns[i].click();
                    break;
                  }
                }
              }} 
              className="text-xs font-bold text-gray-400 hover:text-[#f85606] flex items-center gap-1 transition"
            >
              <span>View All</span>
              <span>➔</span>
            </button>
          </div>

          {/* Carousel Slider with chevrons */}
          <div className="relative group px-1">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="related-carousel-flow">
              {(relatedProducts.length > 0 ? relatedProducts : PRODUCTS.filter(p => p.category === "watches" && p.id !== product.id)).slice(0, 4).map((relProduct) => {
                const discPercent = relProduct.originalPrice ? Math.round(((relProduct.originalPrice - relProduct.price) / relProduct.originalPrice) * 100) : 30;
                return (
                  <div
                    key={relProduct.id}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      if (onSelectProduct) onSelectProduct(relProduct);
                    }}
                    className="bg-white border border-gray-100 p-3 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-300 flex flex-col justify-between shrink-0"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden relative bg-slate-50 mb-3 group-relative">
                      <img src={relProduct.image} alt={relProduct.title} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-102 transition" />
                      
                      {/* Top Left red stamp banner */}
                      <span className="absolute top-1.5 left-1.5 bg-rose-600 text-white font-extrabold text-[8px] px-1 py-0.5 rounded-sm tracking-wider shadow-xs">
                        -{discPercent}%
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="text-[12px] font-bold text-slate-800 line-clamp-1 leading-tight hover:text-[#f85606] transition">{relProduct.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider font-mono">Men's Watch</p>
                      
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="text-[#0f172a] font-black text-xs">৳{formatBDT(relProduct.price)}</span>
                        {relProduct.originalPrice && (
                          <span className="line-through text-[9px] text-gray-400">৳{formatBDT(relProduct.originalPrice)}</span>
                        )}
                      </div>

                      <div className="text-[9px] text-emerald-600 font-bold tracking-wider uppercase mt-1">
                        In Stock
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Overlay arrows */}
            <button className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-slate-700 hover:bg-slate-50 focus:outline-none transition active:scale-95">
              <span>‹</span>
            </button>
            <button className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-slate-700 hover:bg-slate-50 focus:outline-none transition active:scale-95">
              <span>›</span>
            </button>
          </div>
        </div>

        {/* MERCHANT VERIFIED SELLER PROFILE matches picture exactly */}
        <div className="p-5 text-left bg-white mt-6 border border-gray-100 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <span className="text-sm font-black text-slate-900 uppercase tracking-wider font-sans">
              🏠 Merchant Profile
            </span>
            <button className="text-xs font-bold text-gray-400 hover:text-[#f85606] flex items-center gap-1 transition">
              <span>View Shop</span>
              <span>➔</span>
            </button>
          </div>

          {/* Profile overview card content */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-950 text-white rounded-xl flex items-center justify-center font-display font-black text-sm select-none shadow-sm">
                ZSHOP
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-[15px]">ZSHOP BD</span>
                  <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold" title="Verified Merchant">✔</span>
                </div>
                <span className="text-[10px] text-gray-400 leading-tight">Verified Merchant</span>
                <span className="text-xs text-gray-600 mt-1 font-medium bg-[#fafafa] border border-gray-100 px-2 py-0.5 rounded-full inline-block">Digital & Fashion Retailer</span>
              </div>
            </div>

            {/* Chat connection widget */}
            <button 
              onClick={() => alert("কানেক্টিং উইথ কাস্টমার রিলেশন হাব...")}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-transform active:scale-95 focus:outline-none flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <span>💬</span>
              <span>Chat with Shop</span>
            </button>
          </div>

          {/* Stats overview bento directory */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-center">
            <div className="bg-[#f8fafc] border border-gray-100 p-3 rounded-xl">
              <p className="text-base sm:text-lg font-black text-[#0f172a]">4.8 ★</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Rating</p>
            </div>
            <div className="bg-[#f8fafc] border border-gray-100 p-3 rounded-xl">
              <p className="text-base sm:text-lg font-black text-[#0f172a]">1.2M+</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Happy Customers</p>
            </div>
            <div className="bg-[#f8fafc] border border-gray-100 p-3 rounded-xl">
              <p className="text-base sm:text-lg font-black text-[#0f172a]">98%</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Positive Review</p>
            </div>
            <div className="bg-[#f8fafc] border border-gray-100 p-3 rounded-xl">
              <p className="text-base sm:text-lg font-black text-[#0f172a]">2+ Years</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">On ZSHOP BD</p>
            </div>
          </div>

          {/* Trust assurances bars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-50 text-wrap">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-550 font-bold justify-center">
              <span>🛡️</span>
              <span>100% Authentic</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-550 font-bold justify-center">
              <span>⟲</span>
              <span>7 Days Return</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-550 font-bold justify-center">
              <span>💵</span>
              <span>Cash on Delivery</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-550 font-bold justify-center">
              <span>🚚</span>
              <span>Fast Delivery</span>
            </div>
          </div>
        </div>

        {/* TAB GROUPS: DESCRIPTION, SPECIFICATIONS, Q&A AND REVIEWS */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xs mt-6 overflow-hidden text-left">
          <div className="flex border-b border-gray-100 bg-[#f8fafc] overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("detail")}
              className={`py-3.5 px-6 text-xs sm:text-sm font-bold transition-all whitespace-nowrap focus:outline-none ${activeTab === "detail" ? "bg-white text-[#f85606] border-b-2 border-[#f85606]" : "text-gray-500 hover:text-[#f85606]"}`}
            >
              📊 Description
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`py-3.5 px-6 text-xs sm:text-sm font-bold transition-all whitespace-nowrap focus:outline-none ${activeTab === "specs" ? "bg-white text-[#f85606] border-b-2 border-[#f85606]" : "text-gray-550 hover:text-[#f85606]"}`}
            >
              ⚙️ Specifications
            </button>
            <button
              onClick={() => setActiveTab("qa")}
              className={`py-3.5 px-6 text-xs sm:text-sm font-bold transition-all whitespace-nowrap focus:outline-none ${activeTab === "qa" ? "bg-white text-[#f85606] border-b-2 border-[#f85606]" : "text-gray-550 hover:text-[#f85606]"}`}
            >
              💬 Q&A ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-3.5 px-6 text-xs sm:text-sm font-bold transition-all whitespace-nowrap focus:outline-none ${activeTab === "reviews" ? "bg-white text-[#f85606] border-b-2 border-[#f85606]" : "text-gray-550 hover:text-[#f85606]"}`}
            >
              ⭐ Reviews ({reviews.length})
            </button>
          </div>

          <div className="p-6">
            {/* TAB 1: DESCRIPTION */}
            {activeTab === "detail" && (
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 font-sans">
                <div className="p-3.5 bg-red-50/40 border border-red-100 rounded-xl text-slate-800 flex items-start gap-2.5">
                  <span className="text-[#f85606] font-bold block mt-0.5">🛡️</span>
                  <div>
                    <p className="font-extrabold text-[#f85606] text-[11px] uppercase tracking-wide">ZSHOP BD MALL SELLER GUARANTEE</p>
                    <p className="mt-0.5 text-xs text-slate-600">১০০% অথেন্টিসিটি এবং ৩ দিনে চট্টগ্রামের যেকোনো স্থানে দ্রুত হোম ডেলিভারি!</p>
                  </div>
                </div>
                <p className="whitespace-pre-line text-[#333] font-sans leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* TAB 2: SPECIFICATIONS */}
            {activeTab === "specs" && (
              <div className="space-y-1">
                {specifications.map((spec, idx) => (
                  <div key={idx} className="flex border-b border-gray-100 py-3 text-xs sm:text-sm">
                    <span className="w-1/3 text-gray-400 font-semibold">{spec.label}</span>
                    <span className="w-2/3 text-slate-800 font-bold">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: Q&A */}
            {activeTab === "qa" && (
              <div className="space-y-4">
                <form onSubmit={handleAskQuestion} className="bg-slate-50 p-4 border border-gray-200 rounded-xl space-y-2.5">
                  <p className="text-[11px] font-bold text-slate-700">জিজ্ঞেস করুনঃ</p>
                  {qaSuccessMessage && (
                    <p className="bg-green-50 text-green-800 p-2 rounded text-[11px] font-semibold">{qaSuccessMessage}</p>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="পণ্যটি সম্পর্কে আপনার যেকোনো প্রশ্ন লিখুন..."
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-2.5 outline-none text-xs sm:text-sm"
                    />
                    <button type="submit" className="bg-[#0b1120] hover:bg-slate-800 text-white p-2.5 px-3 rounded-lg cursor-pointer flex items-center justify-center transition shadow-xs">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                <div className="space-y-3 pt-2">
                  {questions.map((q) => (
                    <div key={q.id} className="p-3.5 bg-white border border-gray-150 rounded-xl text-xs sm:text-sm space-y-2">
                      <div className="flex gap-2 items-start">
                        <span className="bg-orange-100 text-orange-700 px-1 font-mono text-[9px] font-bold rounded">Q</span>
                        <div>
                          <p className="font-bold text-slate-800">{q.query}</p>
                          <p className="text-[9px] sm:text-[10px] text-[#999]">{q.senderName} ({q.date})</p>
                        </div>
                      </div>
                      {q.reply && (
                        <div className="p-3 bg-slate-50 border border-gray-100 rounded-lg ml-4 space-y-1">
                          <p className="text-[9px] font-bold text-[#f85606] uppercase tracking-wide">ZShop Support Reply:</p>
                          <p className="text-slate-650 leading-relaxed">{q.reply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: REVIEWS */}
            {activeTab === "reviews" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-800">ক্রেতাদের বাস্তব রিভিউসমূহ</span>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="bg-slate-900 hover:bg-[#f85606] text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition"
                  >
                    রিভিউ লিখতে চান?
                  </button>
                </div>

                {reviewMessage && (
                  <p className="p-2 bg-green-50 text-green-800 rounded font-semibold text-xs">{reviewMessage}</p>
                )}

                {showReviewForm && (
                  <form onSubmit={handleSubmitReview} className="bg-[#f8fafc] p-4 border border-gray-200 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">নামঃ</label>
                        <input
                          type="text"
                          required
                          value={newReviewName}
                          onChange={(e) => setNewReviewName(e.target.value)}
                          className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">তারা রেটিংঃ</label>
                        <select
                          value={newReviewRating}
                          onChange={(e) => setNewReviewRating(Number(e.target.value))}
                          className="w-full bg-white border border-gray-250 rounded px-2.5 py-1.5 text-xs sm:text-sm outline-none"
                        >
                          <option value="5">★★★★★ (5 Stars)</option>
                          <option value="4">★★★★☆ (4 Stars)</option>
                          <option value="3">★★★☆☆ (3 Stars)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">মতামতঃ</label>
                      <textarea
                        required
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        className="w-full bg-white border border-gray-250 rounded p-2 text-xs sm:text-sm"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">ছবি সংযুক্ত করুন (ঐচ্ছিক):</label>
                      <input type="file" accept="image/*" onChange={handleReviewPhotoUpload} className="text-xs" />
                    </div>

                    <button type="submit" className="bg-[#f85606] block w-full text-white text-xs font-bold py-2 rounded-lg transition">
                      সাবমিট রিভিউ (Publish)
                    </button>
                  </form>
                )}

                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-3.5 bg-white border border-gray-150 rounded-xl space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#0f172a] text-xs sm:text-sm">{rev.name}</span>
                        <span className="text-[9px] text-[#bbb] font-mono">{rev.date}</span>
                      </div>
                      <div className="flex gap-0.5 text-amber-400 text-xs">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < rev.rating ? "★" : "☆"}</span>
                        ))}
                      </div>
                      <p className="text-slate-650 text-xs sm:text-sm leading-relaxed">{rev.comment}</p>
                      {rev.image && (
                        <div className="w-16 h-16 rounded overflow-hidden border border-gray-200 mt-2">
                          <img src={rev.image} alt="User upload" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MOBILE-ONLY STICKY PURCHASE ACTION BAR (Daraz/Amazon Style) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 py-safe px-4 flex items-center justify-between gap-3 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] z-45 select-none animate-slideUp">
        
        {/* Back/Store Button */}
        <button 
          onClick={onClose} 
          className="flex flex-col items-center justify-center text-[10px] font-bold text-slate-500 w-11 hover:text-[#f85606] transition duration-150 focus:outline-none cursor-pointer"
        >
          <Home className="w-[19px] h-[19px] text-slate-700 stroke-[2.2]" />
          <span className="mt-0.5 font-sans">হোম</span>
        </button>

        {/* Chat Support Button */}
        <button 
          onClick={() => alert("কানেক্টিং উইথ কাস্টমার রিলেশন হাব...")} 
          className="flex flex-col items-center justify-center text-[10px] font-bold text-slate-500 w-11 hover:text-[#f85606] transition duration-150 focus:outline-none cursor-pointer"
        >
          <MessageSquare className="w-[19px] h-[19px] text-slate-700 stroke-[2.2]" />
          <span className="mt-0.5 font-sans">চ্যাট</span>
        </button>

        {/* Buy Now (Yellow Orange gradient) */}
        <button
          onClick={handleBuyNowTrigger}
          className="flex-1 h-11 flex flex-col items-center justify-center bg-[#fdb900] hover:bg-[#e4a600] active:scale-97 text-white font-black rounded-xl focus:outline-none transition-transform cursor-pointer shadow-sm text-center"
        >
          <span className="text-[11px] font-extrabold tracking-wide uppercase leading-none">Buy Now</span>
          <span className="text-[10px] font-semibold mt-0.5 leading-none">৳{formatBDT(product.price * quantity)}</span>
        </button>

        {/* Add to Cart (Daraz Orange) */}
        <button
          onClick={handleAddToCart}
          className={`flex-1 h-11 flex items-center justify-center bg-[#f85606] hover:bg-[#d64a05] active:scale-97 text-white rounded-xl font-black text-xs uppercase focus:outline-none transition-all cursor-pointer shadow-sm ${addedMessage ? "bg-emerald-600 hover:bg-emerald-600" : ""}`}
        >
          {addedMessage ? (
            <span className="text-[11px] font-extrabold flex items-center gap-1">✔ Added to Cart</span>
          ) : (
            <span>Add to Cart</span>
          )}
        </button>
      </div>

    </div>
  );
}
