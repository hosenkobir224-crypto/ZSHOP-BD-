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
  ChevronRight
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
  products?: Product[]; // Pass full products catalog for related recommendations
  onSelectProduct?: (product: Product) => void; // Support swapping active product
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCartWithSpecs,
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

  // Tab State
  const [activeTab, setActiveTab] = useState<"detail" | "specs" | "qa" | "reviews">("detail");

  // Timer values
  const [countdown, setCountdown] = useState({ hrs: 2, mins: 45, secs: 19 });

  // Delivery estimation state
  const [selectedDistrict, setSelectedDistrict] = useState<string>("dhaka");

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

  // Dynamic Specifications Generator based on product category
  const specifications = useMemo(() => {
    if (!product) return [];
    
    const common = [
      { label: "ব্র্যান্ড (Brand)", value: product.isTrending ? "ZSHOP BD MALL SELLER" : "ZSHOP Core Exclusive" },
      { label: "প্রোডাক্ট আইডি (Product ID)", value: `#ZSP-${product.id.toUpperCase()}` },
      { label: "ক্যাটাগরি (Category)", value: product.category === "clothing" ? "পোশাক ও ফ্যাশন (Apparel)" : product.category === "watches" ? "লাক্সারি টাইমপিস (Premium watches)" : product.category === "electronics" ? "স্মার্ট অ্যাক্সেসরিজ (Electronics)" : product.category === "kitchen" ? "হোম ও কিচেন (Home utilities)" : "স্পোর্টিং আইটেম (Sports & fitness)" },
    ];

    switch (product.category) {
      case "clothing":
        return [
          ...common,
          { label: "মেটেরিয়াল (Material)", value: "মেডিকেটেড লাক্সারি কটন ও ডাইং লিনেন ফেস" },
          { label: "ফিটিং টাইপ (Fitting Type)", value: "সেমি-ফিট স্টাইলিশ কমফোর্ট" },
          { label: "কালার গ্যারান্টি (Color Guarantee)", value: "১০০% লাইফটাইম কালার ব্ল্যাকআউট পলিসি" },
          { label: "উৎপাদনকারী দেশ (Origin)", value: "বাংলাদেশ (ZSHOP ইন-হাউজ ডিজাইনার্স)" },
          { label: "পরিষ্কারের নিয়ম (Wash instructions)", value: "হালকা ওয়াশ অথবা ড্রাই ওয়াশ রিকমেন্ডেড" },
        ];
      case "watches":
        return [
          ...common,
          { label: "মুভমেন্ট (Engine)", value: "হাই-গ্রেড জাপানি ক্রনোগ্রাফ কোয়ার্টজ ক্রু" },
          { label: "ডায়াল গ্লাস (Glass Dial)", value: "স্যাফায়ার অ্যান্টি-স্ক্র্যাচ রেজিস্ট্যান্ট সারফেস" },
          { label: "বেল্ট ডিজাইন (Strap Material)", value: "প্রিমিয়াম বাছুরের চামড়ার বেল্ট (Genuine Polish Leather)" },
          { label: "ওয়াটার রেজিস্ট্যান্স (Water Resistance)", value: "3 ATM মাইনর ওয়াটার স্প্ল্যাশ প্রুফ" },
          { label: "ওয়ারেন্টি (Warranty Service)", value: "১ বছরের ZSHOP ব্র্যান্ড টেক ওয়ারেন্টি" },
        ];
      case "electronics":
        return [
          ...common,
          { label: "ব্লুটুথ ভার্সন (Bluetooth)", value: "কোয়ালকম Bluetooth v5.3 প্লাস ফাস্ট চিপসেট" },
          { label: "ব্যাটারি পারফরম্যান্স (Battery)", value: "টানা ৩৬ ঘণ্টা পর্যন্ত অ্যাক্টিভ প্লেব্যাক ও ফাস্ট চার্জ" },
          { label: "সাউন্ড মেকানিজম (Acoustic)", value: "৪০ মিমি ডুয়াল মেগা-বাস ড্রাইভার মেকানিক্যাল টিউনিং" },
          { label: "কন্ট্রোল ট্র্যাকার (Waterproof)", value: "IPX6 রেইন ও সোয়েট প্রুফ ডিজাইন" },
          { label: "ওয়ারেন্টি (Warranty Support)", value: "৬ মাসের ডাইরেক্ট ZSHOP রিপ্লেসমেন্ট গ্যারান্টি" },
        ];
      case "kitchen":
        return [
          ...common,
          { label: "সুরক্ষা কোটিং (Safety Body)", value: "ফুড-গ্রেড ৩১৬ স্টেইনলেস স্টিল ও বিপিএ-মুক্ত ফাইবার" },
          { label: "মোটর ওয়াট (Power Limit)", value: "১২০০ ওয়াট থার্মোস্ট্যাটিক পাওয়ার সেভিং ইঞ্জিন" },
          { label: "ধারনক্ষমতা (Usable Space)", value: "৩.০ লিটার লার্জ ফ্যামিলি বাস্কেট ফ্রেম" },
          { label: "নিরাপত্তা ফিচার (Safety Systems)", value: "স্বয়ংক্রিয় অভারহিট অফ কন্ট্রোলার ও স্মার্ট লক" },
          { label: "ওয়ারেন্টি (Engine Warranty)", value: "১ বছরের অফিসিয়াল মোটর গ্যারান্টি" },
        ];
      default:
        return [
          ...common,
          { label: "উৎপাদনকারী বা সোর্স (Vouched)", value: "ZSHOP সার্টিফাইড ক্লাউড মার্চেন্ট" },
          { label: "প্যাকেজিং স্ট্যান্ডার্ড (Pack Type)", value: "সিলড প্রিমিয়াম গিফট রিল বক্স প্রটেকশনসহ" },
        ];
    }
  }, [product]);

  // Default Reviews for each product
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

  // Preloaded dynamic questions for Q&A block
  const getDefaultQuestions = (productId: string) => {
    return [
      {
        id: `qa-def-1-${productId}`,
        senderName: "তানভীর আহমেদ",
        query: "আমি যদি ঢাকার বাইরে থাকি, অর্ডারের পর ডেলিভারি কত দিনের ভেতর পাবো? আর ক্যাশ অন কি পাওয়া যাবে?",
        reply: "ধন্যবাদ ভাইয়া। ঢাকার বাইরে আমরা সুন্দরবন বা রেডেক্স কুরিয়ারের মাধ্যমে ক্যাশ অন ডেলিভারি (COD) দিয়ে থাকি। ৩ থেকে ৫ দিনের মধ্যে পেয়ে যাবেন।",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString("bn-BD")
      },
      {
        id: `qa-def-2-${productId}`,
        senderName: "সাবিনা ইয়াসমিন",
        query: "সাইজে কোনো সমস্যা হলে কি চেঞ্জ বা এক্সচেঞ্জ করার সুযোগ আছে?",
        reply: "জি অবশ্যই আপু! আমাদের ৭ দিনের ইজি এক্সচেঞ্জ পলিসি আছে। ডেলিভারি পাওয়ার পর অক্ষত অবস্থায় ছবি তুলে আমাদের জানালে সাইজ পরিবর্তন করে দেওয়া হবে।",
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
      
      // Reset scroll position of the gallery container
      setTimeout(() => {
        const scrollContainer = document.getElementById("product-gallery-scroll-container");
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
          // Restart loop
          return { hrs: 3, mins: 44, secs: 59 };
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
      { id: "thumb-3", label: "স্টাইলিশ কোণ", image: product.image, styleClass: "object-cover brightness-[1.04] contrast-105" },
      { id: "thumb-4", label: "প্যাকিং সিল", image: product.image, styleClass: "object-cover brightness-95 sepia-[0.1]" }
    ];
  }, [product]);

  if (!isOpen || !product) return null;

  // Format currency with standard Bangladeshi styling comma-separated BDT
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
  const deliveryCost = selectedDistrict === "dhaka" ? 60 : 120;
  const deliveryDays = selectedDistrict === "dhaka" ? "১-২ দিন (ফাস্ট ডেলিভারি)" : "৩-৫ দিন (নিরাপদ কুরিয়ার)";

  // Compute estimated delivery date strings dynamically
  const getDeliveryDateEstimate = () => {
    const current = new Date();
    const daysToAdd = selectedDistrict === "dhaka" ? 2 : 4;
    current.setDate(current.getDate() + daysToAdd);
    
    // Bangla Days Translate
    const banglaDays = ["রোববার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
    const banglaMonths = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
    
    const dayName = banglaDays[current.getDay()];
    const dateNum = current.getDate();
    const monthName = banglaMonths[current.getMonth()];
    
    return `${dayName}, ${dateNum} ${monthName}`;
  };

  // Add specs to cart Trigger
  const handleAddToCart = () => {
    onAddToCartWithSpecs(product, quantity, selectedColor || undefined, selectedSize || undefined);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 2000);
  };

  // Copy shared link
  const handleCopyLink = () => {
    const text = `${window.location.origin}/product/${product.id} - ${product.title}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Add/Remove wishlist
  const toggleWishlist = () => {
    const next = !isWishlisted;
    setIsWishlisted(next);
    localStorage.setItem(`zshop_bd_wishlist_${product.id}`, String(next));
    // dispatch event
    window.dispatchEvent(new Event("zshop_bd_wishlist_update"));
  };

  // File Review attachment reader
  const handleReviewPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewReviewPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Review Form
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) {
      setReviewMessage("অনুগ্রহ করে আপনার নাম এবং প্রোডাক্ট সম্পর্কে মতামত লিখুন।");
      return;
    }

    const reviewItem: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: newReviewName.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      date: new Date().toLocaleDateString("bn-BD"),
      image: newReviewPhoto || undefined
    };

    const nextReviews = [reviewItem, ...reviews];
    localStorage.setItem(`zshop_bd_reviews_${product.id}`, JSON.stringify(nextReviews));
    setReviews(nextReviews);
    
    // Dispatch global ratings counter
    window.dispatchEvent(new Event("zshop_bd_reviews_update"));

    setNewReviewComment("");
    setNewReviewPhoto(null);
    setShowReviewForm(false);
    setReviewMessage("আপনার মূল্যবান রিভিউটি সফলভাবে প্রকাশিত হয়েছে। ধন্যবাদ!");
    setTimeout(() => setReviewMessage(""), 4000);
  };

  // Submit Q&A
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
    
    // Auto simulate support answers after 3 seconds for active e-commerce experience!
    setTimeout(() => {
      setQuestions((prev) => {
        const updated = prev.map((q) => {
          if (q.id === newQA.id) {
            return {
              ...q,
              reply: "ধন্যবাদ আপনার ইনকুয়ারির জন্য। আপনার জিজ্ঞাসিত প্রোডাক্টটি আমাদের রেডি ইন-স্টক প্রোডাক্ট। আপনি এখনই অর্ডার প্লেস করতে পারেন, আমাদের কাস্টমার রিলেশন হাব থেকে দ্রুত কনফার্মেশন কল দেওয়া হবে।"
            };
          }
          return q;
        });
        localStorage.setItem(`zshop_bd_qa_${product.id}`, JSON.stringify(updated));
        return updated;
      });
      // Sound alert / update notification
    }, 4500);

    setTimeout(() => setQaSuccessMessage(""), 5000);
  };

  // Filter products by same category for related carousel
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      id="upscaled-product-portal-dialog"
      role="dialog"
      aria-modal="true"
    >
      {/* Absolute background drop */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Main Container */}
      <div 
        className="relative bg-white w-full max-w-5xl rounded-2xl md:rounded-3xl shadow-2xl z-10 flex flex-col md:max-h-[92vh] overflow-y-auto animate-fadeIn border border-slate-350"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header navigation bar inside Modal */}
        <div className="sticky top-0 bg-white border-b border-gray-150 p-4 flex items-center justify-between z-30 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#f85606] rounded-full animate-ping" />
            <span className="text-[10px] md:text-xs font-mono font-black uppercase text-[#f85606] tracking-wider">
              ZSHOP Live Product View
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Wishlist triggers */}
            <button
              onClick={toggleWishlist}
              className={`p-2 rounded-full border border-gray-150 transition-all cursor-pointer ${isWishlisted ? "bg-rose-50 text-rose-650 border-rose-150" : "bg-white text-gray-400 hover:text-rose-600"}`}
              title="পছন্দের তালিকায় যুক্ত করুন"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
            </button>

            {/* Close trigger */}
            <button
              onClick={onClose}
              className="p-2 bg-slate-50 border border-gray-200 text-gray-550 hover:text-slate-900 rounded-full cursor-pointer hover:bg-slate-100 transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body Layout */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
          
          {/* Main Showcase block: Image + Pricing Specs Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left side: Premium Image Gallery Hub (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Primary Image Viewport - NOW HORIZONTALLY SCROLLABLE/SWIPEABLE */}
              <div className="relative aspect-square rounded-2xl bg-slate-50 border border-gray-200 overflow-hidden shadow-sm group">
                <div 
                  id="product-gallery-scroll-container"
                  className="w-full h-full overflow-x-auto flex snap-x snap-mandatory scroll-smooth scrollbar-none select-none"
                  onScroll={(e) => {
                    const el = e.currentTarget;
                    if (el.clientWidth > 0) {
                      const scrollPos = el.scrollLeft;
                      const idx = Math.round(scrollPos / el.clientWidth);
                      const targetThumb = alternativeThumbnails[idx];
                      if (targetThumb && targetThumb.id !== activeThumbId) {
                        setActiveThumbId(targetThumb.id);
                      }
                    }
                  }}
                >
                  {alternativeThumbnails.map((thumb) => (
                    <div 
                      key={thumb.id}
                      className="w-full h-full shrink-0 snap-center snap-always relative aspect-square overflow-hidden"
                    >
                      <img
                        src={thumb.image}
                        alt={`${product.title} - ${thumb.label}`}
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover object-center transition-transform duration-300 hover:scale-135 cursor-zoom-in ${thumb.styleClass}`}
                      />
                    </div>
                  ))}
                </div>

                {/* Left/Right Navigation Slide Arrows */}
                <button
                  onClick={() => {
                    const container = document.getElementById("product-gallery-scroll-container");
                    if (container) {
                      container.scrollBy({ left: -container.clientWidth, behavior: "smooth" });
                    }
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-slate-800 p-1.5 rounded-full shadow-md z-10 cursor-pointer border border-gray-150 hover:scale-105 transition-all select-none focus:outline-none flex items-center justify-center opacity-0 group-hover:opacity-100 duration-200"
                  title="পূর্ববর্তী ছবি"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  onClick={() => {
                    const container = document.getElementById("product-gallery-scroll-container");
                    if (container) {
                      container.scrollBy({ left: container.clientWidth, behavior: "smooth" });
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-slate-800 p-1.5 rounded-full shadow-md z-10 cursor-pointer border border-gray-150 hover:scale-105 transition-all select-none focus:outline-none flex items-center justify-center opacity-0 group-hover:opacity-100 duration-200"
                  title="পরবর্তী ছবি"
                >
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* Micro campaign tag inside image */}
                {product.discountTag && (
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-rose-600 to-amber-500 text-white font-extrabold text-[10px] px-3 py-1 rounded-lg uppercase tracking-wider shadow-md z-10">
                    {product.discountTag}
                  </span>
                )}

                {/* Trending Ribbon */}
                {product.isTrending && (
                  <div className="absolute top-4 right-4 bg-slate-950/85 text-amber-400 font-extrabold text-[9px] px-2 py-1 rounded-md border border-amber-400/20 flex items-center gap-1 uppercase tracking-wide z-10">
                    <Award className="w-3.5 h-3.5 text-amber-400 fill-current" />
                    <span>ZSHOP BD MALL SELLER</span>
                  </div>
                )}
              </div>

              {/* Thumbnail snapshots block */}
              <div className="grid grid-cols-4 gap-2">
                {alternativeThumbnails.map((thumb, index) => (
                  <button
                    key={thumb.id}
                    onClick={() => {
                      setActiveThumbId(thumb.id);
                      const container = document.getElementById("product-gallery-scroll-container");
                      if (container) {
                        container.scrollTo({
                          left: index * container.clientWidth,
                          behavior: "smooth"
                        });
                      }
                    }}
                    onMouseEnter={() => {
                      setActiveThumbId(thumb.id);
                      const container = document.getElementById("product-gallery-scroll-container");
                      if (container) {
                        container.scrollTo({
                          left: index * container.clientWidth,
                          behavior: "smooth"
                        });
                      }
                    }}
                    className={`relative aspect-square rounded-xl bg-slate-50 border overflow-hidden transition-all duration-200 cursor-pointer ${activeThumbId === thumb.id ? "border-[#f85606] shadow-xs scale-[1.02] ring-1 ring-[#f85606]/30" : "border-gray-200 hover:border-gray-400"}`}
                  >
                    <img
                      src={thumb.image}
                      alt={thumb.label}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover ${thumb.styleClass}`}
                    />
                    
                    {/* Shadow active label */}
                    <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[8px] font-bold text-center py-0.5 pointer-events-none uppercase">
                      {thumb.id === "thumb-1" ? "১০০% সত্য" : thumb.label}
                    </div>
                  </button>
                ))}
              </div>

              {/* Social sharing widget */}
              <div className="bg-slate-50/75 border border-gray-150 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <span className="font-bold text-slate-500 font-sans tracking-wide">Share:</span>
                
                <div className="flex items-center gap-2">
                  {/* Copy Link Button */}
                  <button
                    onClick={handleCopyLink}
                    className="py-1 px-2.5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 text-slate-700 font-bold text-[10px] flex items-center gap-1 cursor-pointer select-none active:bg-slate-50"
                  >
                    <Copy className="w-3 h-3 text-gray-500" />
                    <span>{copiedLink ? "কপি হয়েছে!" : "লিংক কপি করুন"}</span>
                  </button>

                  {/* Share on WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=Check out this awesome product: ${product.title} at ${window.location.host}/product/${product.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 px-2 bg-[#25d366]/10 text-[#128c7e] rounded-lg font-bold text-[10px] flex items-center gap-1 border border-[#25d366]/20"
                  >
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

            </div>

            {/* Right side: Specifications Form & Delivery Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-5 text-left flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Category & Verified Seller Hub Info */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#f85606] font-extrabold bg-[#f85606]/10 px-2 py-0.5 rounded-md">
                    {product.category}
                  </span>
                  
                  {product.merchantShopName ? (
                    <span className="text-[10px] font-bold text-slate-500 border-l border-gray-300 pl-2">
                      সেলার: <span className="text-slate-900 font-black">{product.merchantShopName}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 border-l border-gray-300 pl-2">
                      সেলার: <span className="text-slate-900 font-black">ZSHOP BD MALL SELLER (অফিসিয়াল)</span>
                    </span>
                  )}
                </div>

                {/* Product Title Banner */}
                <h2 className="text-lg sm:text-xl lg:text-2xl font-display font-black text-slate-950 leading-tight">
                  {product.title}
                </h2>

                {/* Ratings & Total Orders metrics */}
                <div className="flex flex-wrap items-center gap-3.5 pb-3 border-b border-gray-150">
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-lg text-amber-500">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                    </div>
                    <span className="text-xs font-mono font-black text-slate-900">{roundedHeadingRating}</span>
                  </div>

                  <span className="text-xs text-[#f85606] font-bold cursor-pointer" onClick={() => setActiveTab("reviews")}>
                    {totalReviewsCount} কাস্টমার রিভিউস
                  </span>

                  <span className="text-xs text-slate-400 font-medium">|</span>

                  <span className="text-xs text-emerald-650 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg">
                    {Math.max(12, product.reviewsCount + 15)} টি অর্ডার সফলভাবে ডেলিভারড হয়েছে
                  </span>
                </div>

                {/* Flash Deal Urgency Timer Widget */}
                {product.inStock && (
                  <div className="bg-gradient-to-r from-red-650 via-rose-600 to-amber-500 p-3 sm:p-4 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm relative overflow-hidden">
                    <div className="space-y-0.5 z-10">
                      <p className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5 text-amber-200">
                        <Zap className="w-3.5 h-3.5 fill-current animate-bounce text-amber-300" />
                        লিমিটেড ফ্লাশ ডিল অফার!
                      </p>
                      <p className="text-xs text-white/90">দারুণ মূল্যছাড়ে এখনই অর্ডার সম্পন্ন করুন।</p>
                    </div>

                    {/* Timer digits */}
                    <div className="flex items-center gap-1.5 z-10 self-start sm:self-center font-mono">
                      <span className="text-[10px] text-rose-100 font-bold font-sans">অফার শেষ হতে বাকি:</span>
                      <div className="bg-slate-950/40 border border-white/20 text-white font-black text-xs px-2.5 py-1.5 rounded-lg">
                        {String(countdown.hrs).padStart(2, "0")}ঘণ্টা
                      </div>
                      <div className="bg-slate-950/40 border border-white/20 text-white font-black text-xs px-2.5 py-1.5 rounded-lg">
                        {String(countdown.mins).padStart(2, "0")}মিঃ
                      </div>
                      <div className="bg-[#f85606] text-white font-black text-xs px-2.5 py-1.5 rounded-lg animate-pulse">
                        {String(countdown.secs).padStart(2, "0")}সেঃ
                      </div>
                    </div>
                  </div>
                )}

                {/* Pricing module */}
                <div className="bg-slate-50/60 p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider leading-none">বিশেষ ক্যাম্পেইন মূল্য</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-display font-black text-[#f85606]">
                        ৳{formatBDT(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs sm:text-sm text-gray-400 line-through font-semibold">
                          ৳{formatBDT(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="text-right">
                      <span className="bg-emerald-500 text-white font-black text-[9px] px-2 py-1 rounded-lg uppercase tracking-wider block shadow-sm">
                        সঞ্চয় ৳{formatBDT(product.originalPrice - product.price)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Selectors for specifications */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Colors */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-650 uppercase tracking-wide">পণ্যর কালার/ভ্যারিয়েন্ট *</label>
                      <div className="flex flex-wrap gap-1.5">
                        {product.colors.map((col) => (
                          <button
                            key={col}
                            onClick={() => setSelectedColor(col)}
                            className={`px-3 py-1.5 border rounded-xl text-xs font-semibold cursor-pointer transition-all ${selectedColor === col ? "border-[#f85606] bg-[#f85656]/5 text-[#f85606] font-black" : "border-gray-200 text-slate-700 bg-white hover:border-gray-350"}`}
                          >
                            {col}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-650 uppercase tracking-wide">সাইজ সিলেক্ট করুন *</label>
                      <div className="flex flex-wrap gap-1.5">
                        {product.sizes.map((sz) => (
                          <button
                            key={sz}
                            onClick={() => setSelectedSize(sz)}
                            className={`min-w-8 h-8 flex items-center justify-center border rounded-xl text-xs font-mono font-bold cursor-pointer transition-all ${selectedSize === sz ? "border-[#f85606] bg-[#f85656]/5 text-[#f85606]" : "border-gray-200 text-slate-705 bg-white hover:border-gray-350"}`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Shipping Estimator widget */}
                <div className="p-3 bg-slate-50 border border-gray-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#f85606]" />
                      ডেলিভারি ডিস্ট্রিক্ট নির্বাচন করুনঃ
                    </span>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="bg-white border border-gray-200 text-xs font-bold rounded-lg px-2 py-1 outline-none cursor-pointer focus:border-[#f85606]"
                    >
                      <option value="dhaka">ঢাকা (Dhaka Division)</option>
                      <option value="chittagong">চট্টগ্রাম (Chittagong)</option>
                      <option value="sylhet">সিলেট (Sylhet)</option>
                      <option value="rajshahi">রাজশাহী (Rajshahi)</option>
                      <option value="khulna">খুলনা (Khulna)</option>
                      <option value="barishal">বরিশাল (Barishal)</option>
                      <option value="rangpur">রংপুর (Rangpur)</option>
                      <option value="mymensingh">ময়মনসিংহ (Mymensingh)</option>
                    </select>
                  </div>

                  {/* Live Cost Output */}
                  <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-gray-200/70 text-[11px] font-medium text-slate-650">
                    <p className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-gray-400" />
                      কুরিয়ার চার্জ: <span className="font-bold text-slate-900">৳{deliveryCost}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-right justify-end">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      ডেলিভারি সময়: <span className="font-bold text-[#f85606]">{deliveryDays}</span>
                    </p>
                  </div>

                  <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1 bg-white/50 p-1.5 rounded-lg border border-gray-150">
                    <Info className="w-3 h-3 text-amber-500 shrink-0" />
                    ডিপোচার অনুমান: পণ্যটি অর্ডার করার পর সম্ভবত <span className="font-bold text-[#f85606]">{getDeliveryDateEstimate()}</span> এর মধ্যে আপনার ঠিকানায় পৌঁছাবে।
                  </p>
                </div>

              </div>

              {/* Drawer actions button */}
              <div className="pt-3 border-t border-gray-150 flex items-center gap-3">
                {/* Quantity triggers for buying */}
                {product.inStock && (
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
                    <span className="w-8 text-center text-xs font-mono font-extrabold text-slate-900">
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

                {/* Main Action buttons */}
                <div className="flex-1">
                  {product.inStock ? (
                    <button
                      onClick={handleAddToCart}
                      className={`w-full h-12 bg-slate-950 hover:bg-[#d64a05] text-white rounded-xl text-xs font-display font-bold hover:bg-[#f85606] hover:border-[#f85606] transition-all flex items-center justify-center gap-2 group cursor-pointer focus:outline-none border border-slate-950 ${addedMessage ? "bg-emerald-600 border-emerald-600 hover:bg-emerald-600" : ""}`}
                    >
                      {addedMessage ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 animate-bounce shrink-0" />
                          <span>সফলভাবে যুক্ত হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform text-white" />
                          <span>কার্টে যুক্ত করুন (Add to Cart) • ৳{formatBDT(product.price * quantity)}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full h-12 bg-gray-100 border border-gray-200 text-gray-400 rounded-xl text-xs font-display font-semibold flex items-center justify-center"
                    >
                      সাময়িকভাবে স্টকে নেই
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Large tabswitcher layout: Description / specifications / Reviews */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
            {/* Tabs head */}
            <div className="flex border-b border-gray-150 bg-slate-50 p-2 overflow-x-auto gap-1">
              <button
                onClick={() => setActiveTab("detail")}
                className={`py-2 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === "detail" ? "bg-white text-[#f85606] shadow-xs" : "text-gray-550 hover:text-slate-800"}`}
              >
                📊 বর্ণনা (Description)
              </button>
              <button
                onClick={() => setActiveTab("specs")}
                className={`py-2 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === "specs" ? "bg-white text-[#f85606] shadow-xs" : "text-gray-550 hover:text-slate-800"}`}
              >
                ⚙️ টেকনিক্যাল স্পেসিফিকেশন
              </button>
              <button
                onClick={() => setActiveTab("qa")}
                className={`py-2 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === "qa" ? "bg-white text-[#f85606] shadow-xs" : "text-gray-550 hover:text-slate-800"}`}
              >
                💬 কাস্টমার প্রশ্নোত্তর ({questions.length})
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-2 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === "reviews" ? "bg-white text-[#f85606] shadow-xs" : "text-gray-550 hover:text-slate-800"}`}
              >
                ⭐ রিভিউ ও রেটিং ({reviews.length})
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="p-4 sm:p-6 text-left">
              
              {/* DESCRIPTION */}
              {activeTab === "detail" && (
                <div className="space-y-4 font-sans text-xs sm:text-sm leading-relaxed text-slate-700">
                  <div className="p-3 bg-rose-50/40 border border-rose-100 rounded-xl text-[12px] text-slate-800 flex items-start gap-2 max-w-2xl">
                    <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-rose-950">ZSHOP BD MALL SELLER গ্যারান্টিঃ</p>
                      <p className="mt-0.5 text-slate-600">আমরা সরাসরি ব্র্যান্ড অথেন্টিসিটির গ্যারান্টি দিয়ে পণ্য সরবরাহ করে থাকি। ছবিতে প্রদর্শিত মূল্যের বাইরে কোনো অতিরিক্ত চার্জ নেই।</p>
                    </div>
                  </div>

                  <p className="whitespace-pre-line text-slate-650 leading-relaxed font-sans">{product.description}</p>
                </div>
              )}

              {/* SPECIFICATIONS TAB */}
              {activeTab === "specs" && (
                <div className="max-w-2xl">
                  <table className="w-full text-xs font-medium border-collapse">
                    <thead>
                      <tr className="border-b border-gray-205 text-slate-400 font-mono tracking-wider text-[10px] uppercase">
                        <th className="py-2.5 text-left font-bold block">স্পেকস টাইটেল</th>
                        <th className="py-2.5 text-left font-bold">বিস্তারিত মানসমূহ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {specifications.map((spec, idx) => (
                        <tr key={idx} className="border-b border-gray-100 font-sans">
                          <td className="py-3 pr-4 font-bold text-slate-500 w-1/3 leading-snug">{spec.label}</td>
                          <td className="py-3 text-slate-900 font-semibold leading-relaxed">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Q&A BOARD TAB */}
              {activeTab === "qa" && (
                <div className="space-y-6 max-w-3xl">
                  {/* ask question input box */}
                  <form onSubmit={handleAskQuestion} className="bg-slate-50 p-4 border border-gray-200 rounded-2xl space-y-3">
                    <h5 className="text-xs font-bold text-slate-800">পণ্যটি সম্পর্কে কোনো প্রশ্ন আছে? এখানে জিজ্ঞেস করুনঃ</h5>
                    
                    {qaSuccessMessage && (
                      <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-150 text-[11px] rounded-lg font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{qaSuccessMessage}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        placeholder="যেমনঃ পণ্যটির কালার কি ফেড হয়ে যাবে? বা ঢাকার বাইরে কি হোম ডেলিভারি পাওয়া যাবে?"
                        className="flex-1 bg-white border border-gray-200 hover:border-gray-350 focus:border-[#f85606] rounded-xl px-3.5 py-2.5 outline-none text-xs font-medium"
                      />
                      <button
                        type="submit"
                        className="p-3 bg-[#f85606] hover:bg-[#d64a05] text-white rounded-xl cursor-pointer transition-colors flex items-center justify-center shrink-0 shadow-xs"
                        title="প্রশ্ন সেন্ড করুন"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>

                  {/* list of questions */}
                  <div className="space-y-4">
                    {questions.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">ইনকুয়ারির জন্য এখনও কোনো প্রশ্ন নেই। প্রথম আপনার প্রশ্নটি করুন!</p>
                    ) : (
                      questions.map((q) => (
                        <div key={q.id} className="p-4 bg-white border border-gray-150 rounded-2xl text-xs space-y-3">
                          
                          {/* Query line */}
                          <div className="flex items-start gap-2.5">
                            <span className="bg-amber-100 text-amber-700 font-extrabold w-5 h-5 flex items-center justify-center rounded-lg text-[9px] uppercase shrink-0 font-mono mt-0.5">Q</span>
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-850 leading-relaxed font-sans">{q.query}</p>
                              <p className="text-[10px] text-gray-400">প্রশ্নকারী: <span className="font-semibold text-slate-600">{q.senderName}</span> ({q.date})</p>
                            </div>
                          </div>

                          {/* support Reply block */}
                          {q.reply ? (
                            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1 ml-6.5">
                              <div className="flex items-center gap-1.5">
                                <span className="bg-slate-900 text-white font-extrabold w-5 h-5 flex items-center justify-center rounded-lg text-[9px] uppercase shrink-0 font-mono">A</span>
                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-mono">ZSHOP Admin Hub Support</span>
                              </div>
                              <p className="text-slate-650 leading-relaxed font-sans pl-1 pt-0.5">{q.reply}</p>
                            </div>
                          ) : (
                            <div className="p-2 bg-slate-50 text-slate-450 rounded-xl text-[10px] font-semibold italic flex items-center gap-1 ml-6.5">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-ping" />
                              <span>আমাদের সাপোর্ট টিম প্রশ্নটি প্রসেস করছে, ৪ মিনিটের মধ্যে রিপ্লাই দেওয়া হবে...</span>
                            </div>
                          )}

                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}

              {/* REVIEWS LIST & GUEST REVIEW POST */}
              {activeTab === "reviews" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/50 pb-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">কাস্টমার মতামতসমূহ</h4>
                      <p className="text-xs text-slate-400">প্রোডাক্ট ব্যবহারের সত্য অভিজ্ঞতা সম্পর্কে ক্রেতাদের অনুভূতি ও গ্যালারি দেখু্ন।</p>
                    </div>

                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="px-4 py-2.5 bg-slate-950 hover:bg-[#f85606] hover:text-white transition-all text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer focus:outline-none"
                    >
                      {showReviewForm ? "রিভিউ ফর্ম বন্ধ করুন ✕" : "রিভিউ ও পণ্যর ছবি পোস্ট করুন ✍️"}
                    </button>
                  </div>

                  {/* Alert messages */}
                  {reviewMessage && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-250 text-xs rounded-xl flex items-center gap-2 animate-fade-in font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{reviewMessage}</span>
                    </div>
                  )}

                  {/* Submission drawers */}
                  {showReviewForm && (
                    <form onSubmit={handleSubmitReview} className="p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-4 animate-fade-in text-left">
                      <h4 className="text-xs font-display font-black text-slate-950 uppercase tracking-widest border-b border-gray-100 pb-2">
                        নতুন কাস্টমার রিভিউ যোগ করুন
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">আপনার নাম / মোবাইল নম্বর</label>
                          <input
                            type="text"
                            required
                            placeholder="যেমনঃ রাসেল আহমেদ"
                            value={newReviewName}
                            onChange={(e) => setNewReviewName(e.target.value)}
                            className="w-full h-10 px-3.5 border border-gray-200 focus:border-slate-950 focus:outline-none rounded-xl text-xs font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">রেটিং প্রদান করুন</label>
                          <div className="flex items-center gap-1 h-10">
                            {[1, 2, 3, 4, 5].map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => setNewReviewRating(st)}
                                className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                                title={`${st} Star`}
                              >
                                <Star 
                                  className={`w-5 h-5 ${st <= newReviewRating ? "fill-amber-400 text-[#faca51] stroke-[#faca51]" : "text-gray-200"}`} 
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="block text-[11px] font-bold text-slate-705 uppercase mb-0.5">মতামত ও বিস্তারিত</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="পণ্যটি ডেলিভারি পাওয়ার পর কাপড়, ডিজাইন এবং ফিনিশিং নিয়ে আপনার ভালো লাগার কথাগুলো লিখুন..."
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-gray-200 focus:border-slate-950 focus:outline-none rounded-xl text-xs font-medium"
                        />
                      </div>

                      <div className="space-y-2 text-left">
                        <label className="block text-[11px] font-bold text-slate-705 uppercase mb-0.5">বাস্তব পণ্যর ছবি সংযুক্ত করুন (ঐচ্ছিক)</label>
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-gray-200 hover:border-slate-400 rounded-xl cursor-pointer text-xs font-bold text-slate-700 transition-all flex items-center gap-2 select-none">
                            <Camera className="w-4 h-4 text-slate-600" />
                            <span>গ্যালারি থেকে ফটো বাছাই 📸</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleReviewPhotoUpload}
                              className="hidden"
                            />
                          </label>

                          {newReviewPhoto && (
                            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-150 px-3 py-2 rounded-xl">
                              <img src={newReviewPhoto} alt="Review attachment" className="w-8 h-8 object-cover rounded-lg border" />
                              <span className="text-[10px] text-emerald-800 font-bold">১টি ফটো সংযুক্ত হয়েছে!</span>
                              <button
                                type="button"
                                onClick={() => setNewReviewPhoto(null)}
                                className="text-gray-400 hover:text-rose-600 font-mono text-xs font-bold ml-1"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2.5">
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-slate-50 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          বাতিল
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-slate-950 hover:bg-[#f85606] hover:text-white text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
                        >
                          রিভিউ সাবমিট করুন
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Reviews looping */}
                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <p className="text-xs text-slate-450 py-8 text-center bg-slate-50 border border-gray-150 rounded-xl text-left">কোনো কাস্টমার রিভিউ পাওয়া যায়নি। আপনি প্রথম কাস্টমার রিভিউটি দিন!</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reviews.map((rev) => (
                          <div key={rev.id} className="bg-white border border-gray-150 p-4 rounded-xl flex flex-col justify-between shadow-xs">
                            <div className="space-y-2">
                              {/* Header user */}
                              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 text-left">
                                <div className="flex items-center gap-2 text-left">
                                  <div className="w-6.5 h-6.5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-700 uppercase">
                                    {rev.name.slice(0, 2)}
                                  </div>
                                  <div>
                                    <span className="text-xs font-extrabold text-[#212121] block leading-none">{rev.name}</span>
                                    <span className="text-[8px] text-green-600 font-bold leading-none inline-block mt-0.5">✔ ভেরিফাইড ক্রেতা (Purchase Verified)</span>
                                  </div>
                                </div>
                                <span className="text-[9px] text-gray-400 font-mono">{rev.date}</span>
                              </div>

                              {/* Rating score */}
                              <div className="flex items-center text-amber-400 gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-amber-400 text-[#faca51]" : "text-gray-200"}`}
                                  />
                                ))}
                              </div>

                              {/* comment */}
                              <p className="text-xs text-[#212121] leading-relaxed font-sans">{rev.comment}</p>
                            </div>

                            {/* Attched photo snapshot */}
                            {rev.image && (
                              <div className="pt-2 mt-2 border-t border-gray-50 self-start">
                                <a href={rev.image} target="_blank" rel="noopener noreferrer" className="block text-slate-400 text-[9px] uppercase font-bold tracking-wide hover:text-slate-650 transition-colors mb-1">
                                  📷 ক্রেতার আপলোডকৃত বাস্তব ছবিঃ
                                </a>
                                <div className="border border-gray-200 rounded-lg overflow-hidden w-20 h-20 bg-slate-50">
                                  <img src={rev.image} alt="User attachment snapshot" className="w-full h-full object-cover" />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>

          {/* Interacted Related list column carousel block */}
          {relatedProducts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-250 pb-2 text-left">
                <div>
                  <h3 className="text-sm font-display font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#f85606]" />
                    এই ক্যাটাগরির অন্যান্য জনপ্রিয় প্রোডাক্ট সমূহ (Related Products)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">ZSHOP BD কালেকশন থেকে অন্যান্য ম্যাচিং প্রোডাক্টগুলো এক ক্লিকেই রিভিউ করুন।</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((relProduct) => {
                  const savedRelReviews = localStorage.getItem(`zshop_bd_reviews_${relProduct.id}`);
                  const parsedRelRev = savedRelReviews ? JSON.parse(savedRelReviews) : [];
                  const relAggScore = parsedRelRev.length > 0 
                    ? Number((parsedRelRev.reduce((acc: number, r: any) => acc + r.rating, 0) / parsedRelRev.length).toFixed(1))
                    : relProduct.rating;

                  return (
                    <div 
                      key={relProduct.id}
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        if (onSelectProduct) {
                          onSelectProduct(relProduct);
                        } else {
                          // Force state overrides inside modal
                          setActiveImage(relProduct.image);
                          setSelectedColor(relProduct.colors && relProduct.colors.length > 0 ? relProduct.colors[0] : "");
                          setSelectedSize(relProduct.sizes && relProduct.sizes.length > 0 ? relProduct.sizes[0] : "");
                          setQuantity(1);
                          setAddedMessage(false);
                          setActiveTab("detail");
                        }
                      }}
                      className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 p-2.5 text-left cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        {/* image */}
                        <div className="aspect-square w-full rounded-lg overflow-hidden bg-slate-50 border border-gray-100 flex items-center justify-center relative">
                          <img
                            src={relProduct.image}
                            alt={relProduct.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          />
                          {relProduct.discountTag && (
                            <span className="absolute top-1.5 left-1.5 bg-[#f85606] text-white font-black text-[7px] px-1.5 py-0.2 rounded-md uppercase">
                              {relProduct.discountTag}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-semibold text-[#212121] group-hover:text-[#f85606] transition-colors leading-tight line-clamp-1">
                          {relProduct.title}
                        </h4>

                        {/* ratings */}
                        <div className="flex items-center gap-1 text-[10px]">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-[#faca51] stroke-[#faca51]" />
                          <span className="font-bold text-slate-800">{relAggScore}</span>
                          <span className="text-gray-400">({Math.max(relProduct.reviewsCount, parsedRelRev.length)})</span>
                        </div>
                      </div>

                      {/* Buy value */}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-2">
                        <span className="text-xs font-extrabold text-[#f85606]">৳{formatBDT(relProduct.price)}</span>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider font-mono">
                          রিভিউ করুন
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
