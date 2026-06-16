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
  Play
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
      className="absolute inset-0 z-50 bg-[#f1f5f9] overflow-y-auto animate-fadeIn flex flex-col items-stretch justify-start pb-24"
      id="product-detail-mobile-page"
    >
      {/* 1. Header Navigation Bar (Daraz Style) */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-150 px-3 py-2 flex items-center justify-between gap-1.5 shadow-xs">
        {/* Back Button */}
        <button
          onClick={onClose}
          className="p-1 px-1.5 focus:outline-none hover:bg-slate-100 rounded-full transition-colors shrink-0"
          title="সার্চ থেকে ফিরে যান"
        >
          <ChevronLeft className="w-6 h-6 text-slate-800 stroke-[2.5]" />
        </button>

        {/* Center Search Input Box */}
        <div className="flex-1 flex items-center border-[1.8px] border-[#f85606] bg-[#f9f9f9] rounded-xl px-2.5 py-1.5 shadow-xs">
          <input
            type="text"
            readOnly
            value="Search in Daraz"
            className="w-full text-xs font-semibold text-slate-450 bg-transparent focus:outline-none pr-1 select-none pointer-events-none"
          />
          <Camera className="w-4 h-4 text-slate-400 shrink-0 cursor-pointer" />
        </div>

        {/* Right Icons: Share, Cart with red badging, Menu Dots with badging */}
        <div className="flex items-center gap-2 text-slate-700 shrink-0">
          <button onClick={handleCopyLink} className="p-1.5 focus:outline-none hover:bg-slate-150 rounded-full relative" title="লিংক কপি করুন">
            <Share2 className="w-5 h-5 stroke-[2.2]" />
            {copiedLink && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                Copied!
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <div className="relative">
            <button 
              onClick={() => {
                onClose();
                // trigger open cart on home viewport
                document.getElementById("navbar-floating-cart-anchor")?.click();
              }} 
              className="p-1.5 focus:outline-none hover:bg-slate-150 rounded-full"
            >
              <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
            </button>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border border-white leading-none shadow-xs">
                {cartCount}
              </span>
            )}
          </div>

          <div className="relative">
            <button className="p-1.5 focus:outline-none hover:bg-slate-150 rounded-full">
              <MoreHorizontal className="w-5 h-5 stroke-[2.2]" />
            </button>
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border border-white leading-none shadow-xs">
              16
            </span>
          </div>
        </div>
      </div>

      {/* 2. Photo Gallery Cover */}
      <div className="relative aspect-square w-full bg-white overflow-hidden select-none">
        <div 
          id="product-detail-swipe-container"
          className="w-full h-full overflow-x-auto flex snap-x snap-mandatory scroll-smooth scrollbar-none"
          onScroll={(e) => {
            const el = e.currentTarget;
            if (el.clientWidth > 0) {
              const scrollPos = el.scrollLeft;
              const idx = Math.round(scrollPos / el.clientWidth);
              setActiveIndex(idx);
              const targetThumb = alternativeThumbnails[idx];
              if (targetThumb && targetThumb.id !== activeThumbId) {
                setActiveThumbId(targetThumb.id);
              }
            }
          }}
        >
          {alternativeThumbnails.map((thumb) => (
            <div key={thumb.id} className="w-full h-full shrink-0 snap-center snap-always relative">
              <img
                src={thumb.image}
                alt={`${product.title} - ${thumb.label}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}
        </div>

        {/* Video / Photos Selector Badge */}
        <div className="absolute top-3.5 right-3.5 flex items-center bg-slate-900/40 backdrop-blur-md rounded-full overflow-hidden p-[2px] border border-white/10 text-[10px] font-extrabold shadow-sm">
          <span className="px-2.5 py-1 text-white/70 hover:text-white flex items-center gap-0.5 cursor-pointer">
            <Play className="w-2.5 h-2.5 fill-current" /> Video
          </span>
          <span className="px-3.5 py-1 bg-white text-[#212121] rounded-full shadow-xs">
            Photos
          </span>
        </div>

        {/* Count Indicator */}
        <div className="absolute bottom-3.5 right-3.5 bg-black/40 text-white text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <span>📹</span> {activeIndex + 1}/{alternativeThumbnails.length}
        </div>

        {/* Campaign Left Voucher Stamp */}
        {product.discountTag && (
          <span className="absolute top-3.5 left-3.5 bg-[#f85606] text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-xs shadow-xs uppercase tracking-wider">
            {product.discountTag}
          </span>
        )}
      </div>

      {/* 3. Small thumbnails rows indicator */}
      <div className="bg-white px-3 py-2 flex gap-1.5 overflow-x-auto border-b border-gray-100 scrollbar-none">
        {alternativeThumbnails.map((thumb, idx) => (
          <button
            key={thumb.id}
            onClick={() => {
              setActiveThumbId(thumb.id);
              const container = document.getElementById("product-detail-swipe-container");
              if (container) {
                container.scrollTo({
                  left: idx * container.clientWidth,
                  behavior: "smooth"
                });
              }
            }}
            className={`w-11 h-11 shrink-0 rounded-lg overflow-hidden border transition-all ${activeThumbId === thumb.id ? "border-[#f85606]" : "border-gray-200"}`}
          >
            <img src={thumb.image} alt={thumb.label} referrerPolicy="no-referrer" className={`w-full h-full object-cover ${thumb.styleClass}`} />
          </button>
        ))}
      </div>

      {/* 4. Pricing, Campaign Label and Voucher Saves Bar */}
      <div className="bg-white px-3.5 py-3 border-b border-gray-100 space-y-1.5 text-left">
        {/* Campaign ticket indicator */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#f85606] leading-none">
          <span className="bg-[#feeeeb] text-[#f85606] px-1 py-0.5 rounded-xs border border-[#ffe0d9] text-[9px] font-black uppercase tracking-wider leading-none">
            Voucher Max
          </span>
          <span className="text-[12px] font-bold leading-none">Voucher Saves ৳ 26 🎫</span>
        </div>

        {/* Price output matches picture */}
        <div className="flex items-baseline gap-2 pt-0.5 leading-none">
          <span className="text-[26px] font-black text-[#f85606] leading-none font-display">
            ৳{formatBDT(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-xs text-slate-400 line-through leading-none font-medium">
                ৳{formatBDT(product.originalPrice)}
              </span>
              <span className="text-[10px] text-red-500 font-extrabold bg-red-50 border border-red-100 px-1 py-0.2 rounded-xs leading-none">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* 5. Product Title Head with Action Icons */}
      <div className="bg-white px-3.5 pb-3 border-b border-gray-100 text-left relative space-y-2">
        <h1 className="text-xs font-semibold text-slate-900 leading-relaxed pr-8 line-clamp-2 md:line-clamp-none font-sans">
          {product.title}
        </h1>

        <button 
          onClick={toggleWishlist}
          className="absolute right-3 top-[-4px] p-1.5 text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
        </button>

        {/* Ratings and sold volume count */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#222] font-semibold pt-0.5">
          <span className="text-amber-500 text-[12px]">★</span>
          <span className="font-extrabold text-slate-800">{roundedHeadingRating.toFixed(1)}</span>
          <span className="text-gray-400 font-medium">({totalReviewsCount})</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500 font-medium">{getProductSoldCount(product.id)} sold</span>
        </div>
      </div>

      {/* 6. High Fidelity Returns and Standard Localized Delivery blocks */}
      <div className="bg-white mt-2 border-t border-b border-gray-150 p-3.5 space-y-4 text-left">
        
        {/* Row 1: Return guarantee */}
        <div className="flex items-start justify-between cursor-pointer group">
          <div className="flex items-start gap-2 text-xs text-slate-800">
            <span className="text-green-600 font-bold block mt-0.5 text-xs">🛡️</span>
            <div>
              <p className="font-bold">14 days easy return</p>
              <p className="text-[10px] text-gray-400 mt-0.5">১০০% অথেন্টিসিটি এবং ৭ দিনের সহজ রিপ্লেসমেন্ট পলিসি</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 self-center" />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Row 2: Standard Delivery details */}
        <div className="flex items-start justify-between cursor-pointer group">
          <div className="flex items-start gap-2 text-xs text-slate-800">
            <span className="text-indigo-600 block mt-0.5 text-xs">🚚</span>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="font-bold">Guaranteed by {getDeliveryDateEstimate()}</p>
                <span className="bg-orange-50 border border-orange-200 text-[#f85606] text-[8px] font-black px-1 rounded-sm uppercase tracking-wide">
                  With Voucher ৳ 120
                </span>
              </div>
              <p className="text-[11px] text-slate-700">Standard Delivery</p>
              
              {/* Specialized localized Address selection inside Chittagong */}
              <div className="flex items-center gap-1 text-[10px] text-[#f85606] font-bold bg-[#fffdf0] border border-[#ffebaa] rounded px-1.5 py-0.5 mt-1.5 self-start">
                <MapPin className="w-3 h-3 text-[#f85606]" />
                <span>To Bayezid Bostami (চট্টগ্রাম) • ৳{deliveryCostForDistrict} কুরিয়ার চার্জ</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 self-center" />
        </div>
      </div>

      {/* 7. Vouchers Row Section */}
      <div className="bg-white mt-1.5 border-t border-b border-gray-150 p-3 flex items-center justify-between text-left cursor-pointer">
        <div className="flex items-center gap-3.5">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest text-[9px]">Vouchers</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="border border-dashed border-red-300 text-[#f85606] bg-red-50 text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm">
              ৳40 Off
            </span>
            <span className="bg-[#e6f9f6] text-[#00b4a0] text-[9px] font-black px-1.5 py-0.5 rounded-xs border border-[#bcefed] uppercase">
              Free Shipping T&C
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>

      {/* 8. Specifications Selectors (Colors & Sizes) */}
      <div className="bg-white mt-1.5 border-t border-b border-gray-150 p-3.5 space-y-4 text-left">
        <h3 className="text-xs font-bold text-slate-900 border-l-[3px] border-[#f85606] pl-2 uppercase tracking-wide">
          বাছাই করুন (Specifications)
        </h3>

        {/* Color specification rows */}
        {product.colors && product.colors.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">কালার/ভ্যারিয়েন্ট:</span>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedColor(col)}
                  className={`px-3 py-1 bg-slate-50 border rounded-lg text-xs font-semibold cursor-pointer transition-all ${selectedColor === col ? "border-[#f85606] text-[#f85606] bg-[#feeeeb] font-extrabold" : "border-gray-200 text-slate-700 hover:border-gray-450"}`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sizes specification rows */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">সাইজ কোড:</span>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`min-w-8 h-8 px-2 flex items-center justify-center border rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${selectedSize === sz ? "border-[#f85606] text-[#f85606] bg-[#feeeeb]" : "border-gray-200 text-slate-700 hover:border-gray-450"}`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity selector row */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-[11px] font-bold text-slate-650">অর্ডারের পরিমাণ (Quantity):</span>
          <div className="flex items-center border border-gray-250 rounded-xl bg-slate-50 overflow-hidden h-9">
            <button
              onClick={() => { if (quantity > 1) setQuantity(quantity - 1); }}
              className="px-3.5 text-gray-500 hover:text-slate-900 font-bold h-full focus:outline-none"
            >
              -
            </button>
            <span className="w-7 text-center text-xs font-bold text-slate-900">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3.5 text-gray-500 hover:text-slate-900 font-bold h-full focus:outline-none"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* 9. Collapsible Switch Tabs: Description, Specs, Q&A and Reviews */}
      <div className="bg-white mt-1.5 border-t border-b border-gray-150 text-left">
        <div className="flex border-b border-gray-150 bg-slate-50 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("detail")}
            className={`py-2.5 px-4 text-xs font-bold transition-all whitespace-nowrap focus:outline-none ${activeTab === "detail" ? "bg-white text-[#f85606] border-b-2 border-[#f85606]" : "text-gray-550 hover:text-slate-800"}`}
          >
            📊 Description
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`py-2.5 px-4 text-xs font-bold transition-all whitespace-nowrap focus:outline-none ${activeTab === "specs" ? "bg-white text-[#f85606] border-b-2 border-[#f85606]" : "text-gray-550 hover:text-slate-800"}`}
          >
            ⚙️ Specifications
          </button>
          <button
            onClick={() => setActiveTab("qa")}
            className={`py-2.5 px-4 text-xs font-bold transition-all whitespace-nowrap focus:outline-none ${activeTab === "qa" ? "bg-white text-[#f85606] border-b-2 border-[#f85606]" : "text-gray-550 hover:text-slate-800"}`}
          >
            💬 Q&A ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`py-2.5 px-4 text-xs font-bold transition-all whitespace-nowrap focus:outline-none ${activeTab === "reviews" ? "bg-white text-[#f85606] border-b-2 border-[#f85606]" : "text-gray-550 hover:text-slate-800"}`}
          >
            ⭐ Reviews ({reviews.length})
          </button>
        </div>

        <div className="p-4">
          {/* TAB 1: DESCRIPTION */}
          {activeTab === "detail" && (
            <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 font-sans">
              <div className="p-3 bg-red-50/40 border border-red-100 rounded-xl text-slate-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#f85606] shrink-0 mt-0.5" />
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
                <div key={idx} className="flex border-b border-gray-100 py-2.5 text-xs">
                  <span className="w-1/3 text-gray-400 font-semibold">{spec.label}</span>
                  <span className="w-2/3 text-slate-800 font-bold">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Q&A */}
          {activeTab === "qa" && (
            <div className="space-y-4">
              <form onSubmit={handleAskQuestion} className="bg-slate-50 p-3 border border-gray-200 rounded-xl space-y-2">
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
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none text-xs"
                  />
                  <button type="submit" className="bg-[#f85606] text-white p-2 rounded-lg cursor-pointer">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>

              <div className="space-y-3 pt-2">
                {questions.map((q) => (
                  <div key={q.id} className="p-3 bg-white border border-gray-150 rounded-xl text-xs space-y-2">
                    <div className="flex gap-2 items-start">
                      <span className="bg-orange-100 text-orange-700 px-1 font-mono text-[9px] font-bold rounded">Q</span>
                      <div>
                        <p className="font-bold text-slate-800">{q.query}</p>
                        <p className="text-[9px] text-[#999]">{q.senderName} ({q.date})</p>
                      </div>
                    </div>
                    {q.reply && (
                      <div className="p-2.5 bg-slate-50 border border-gray-100 rounded-lg ml-4 space-y-0.5">
                        <p className="text-[9px] font-bold text-[#f85606] uppercase tracking-wide">ZShop Support Reply:</p>
                        <p className="text-slate-600">{q.reply}</p>
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
                <span className="text-xs font-bold text-slate-800">ক্রেতাদের বাস্তব রিভিউসমূহ</span>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-slate-900 hover:bg-[#f85606] text-white font-bold text-[10px] px-2.5 py-1 rounded-lg"
                >
                  리뷰 লিখতে চান?
                </button>
              </div>

              {reviewMessage && (
                <p className="p-2 bg-green-50 text-green-800 rounded font-semibold text-xs">{reviewMessage}</p>
              )}

              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="bg-slate-50 p-3 border border-gray-200 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">নামঃ</label>
                      <input
                        type="text"
                        required
                        value={newReviewName}
                        onChange={(e) => setNewReviewName(e.target.value)}
                        className="w-full bg-white border border-gray-250 rounded px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">তারা রেটিংঃ</label>
                      <select
                        value={newReviewRating}
                        onChange={(e) => setNewReviewRating(Number(e.target.value))}
                        className="w-full bg-white border border-gray-250 rounded px-2 py-1 text-xs outline-none"
                      >
                        <option value="5">★★★★★ (5 Stars)</option>
                        <option value="4">★★★★☆ (4 Stars)</option>
                        <option value="3">★★★☆☆ (3 Stars)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">মতামতঃ</label>
                    <textarea
                      required
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      className="w-full bg-white border border-[#ccc] rounded p-2 text-xs"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">ছবি সংযুক্ত করুন (ঐচ্ছিক):</label>
                    <input type="file" accept="image/*" onChange={handleReviewPhotoUpload} className="text-xs" />
                  </div>

                  <button type="submit" className="bg-[#f85606] block w-full text-white text-xs font-bold py-1.5 rounded-lg">
                    সাবমিট রিভিউ (Publish)
                  </button>
                </form>
              )}

              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-white border border-gray-150 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800 text-xs">{rev.name}</span>
                      <span className="text-[9px] text-[#bbb] font-mono">{rev.date}</span>
                    </div>
                    <div className="flex gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < rev.rating ? "★" : "☆"}</span>
                      ))}
                    </div>
                    <p className="text-slate-650 text-xs leading-relaxed">{rev.comment}</p>
                    {rev.image && (
                      <div className="w-16 h-16 rounded overflow-hidden border border-gray-200 mt-1">
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

      {/* 10. Related Carousel Block */}
      {relatedProducts.length > 0 && (
        <div className="p-4 space-y-3.5 text-left bg-white mt-1.5 border-t border-b border-gray-150">
          <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#f85606]" /> Related Products
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {relatedProducts.map((relProduct) => (
              <div
                key={relProduct.id}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  if (onSelectProduct) onSelectProduct(relProduct);
                }}
                className="bg-white border border-gray-200 rounded-xl p-2 cursor-pointer hover:shadow-sm"
              >
                <div className="aspect-square rounded-lg overflow-hidden relative bg-slate-100 mb-1.5">
                  <img src={relProduct.image} alt={relProduct.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
                <h4 className="text-[11px] font-bold text-slate-800 truncate leading-tight">{relProduct.title}</h4>
                <p className="text-[#f85606] font-extrabold text-[11px] mt-0.5">৳{formatBDT(relProduct.price)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. Custom Bottom Action Bar Sticky to wrapper device (Daraz Orange Theme) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-gray-250 py-2.5 px-3 flex items-center justify-between gap-2 shadow-2xl z-40 select-none">
        
        {/* Store Access Button */}
        <button 
          onClick={onClose} 
          className="flex flex-col items-center justify-center text-[10px] font-bold text-gray-500 w-11 focus:outline-none"
        >
          <Home className="w-[19px] h-[19px] text-gray-600 stroke-[2.2]" />
          <span className="mt-0.5">Store</span>
        </button>

        {/* Chat Access Button */}
        <button 
          onClick={() => alert("কানেক্টিং উইথ কাস্টমার রিলেশন সাপোর্ট...")} 
          className="flex flex-col items-center justify-center text-[10px] font-bold text-gray-500 w-11 focus:outline-none"
        >
          <MessageSquare className="w-[19px] h-[19px] text-gray-600 stroke-[2.2]" />
          <span className="mt-0.5">Chat</span>
        </button>

        {/* Buy Now Yellow Button */}
        <button
          onClick={handleBuyNowTrigger}
          className="flex-1 h-11 flex flex-col items-center justify-center bg-[#fdb900] hover:bg-[#e4a600] active:scale-95 text-white rounded-lg focus:outline-none transition-transform"
        >
          <span className="text-[11px] font-extrabold tracking-wide uppercase leading-none">Buy Now</span>
          <span className="text-[10px] font-semibold mt-0.5 leading-none">৳{formatBDT(product.price * quantity)}</span>
        </button>

        {/* Add to Cart Orange Button */}
        <button
          onClick={handleAddToCart}
          className={`flex-1 h-11 flex items-center justify-center bg-[#f85606] hover:bg-[#d64a05] active:scale-95 text-white rounded-lg font-black text-xs uppercase focus:outline-none transition-transform ${addedMessage ? "bg-green-600 hover:bg-green-600" : ""}`}
        >
          {addedMessage ? (
            <span className="text-[11px]">✔ Added to Cart</span>
          ) : (
            <span>Add to Cart</span>
          )}
        </button>
      </div>

    </div>
  );
}
