import React, { useState, useEffect } from "react";
import { 
  X, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Check, 
  Edit3, 
  CheckCircle, 
  Layers, 
  Database, 
  Grid,
  AlertCircle,
  Clock,
  MapPin,
  Smartphone,
  RotateCcw,
  Tag,
  Boxes,
  Image,
  Copy,
  ExternalLink,
  Users,
  Activity,
  BarChart2
} from "lucide-react";
import { Product, Order, OrderItem, Promotion } from "../types";
import { PROMOTIONS } from "../data";
import { 
  getPixelConfig, 
  savePixelConfig, 
  getPixelAuditLogs, 
  clearPixelAuditLogs, 
  PixelAuditLog,
  trackPixelEvent
} from "../lib/metaPixel";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (updatedProducts: Product[]) => void;
}

export default function AdminPanel({
  isOpen,
  onClose,
  products,
  onUpdateProducts
}: AdminPanelProps) {
  // Authentication active states
  const [isLogged, setIsLogged] = useState<boolean>(() => {
    try {
      return localStorage.getItem("zshop_bd_admin_session") === "active";
    } catch {
      return false;
    }
  });

  const [phoneInput, setPhoneInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  // Sub-navigation state: "dashboard" | "orders" | "products" | "add-product" | "banners" | "pixel"
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "products" | "add-product" | "banners" | "pixel">("dashboard");

  // Facebook Meta Pixel & Ads tracking states
  const [pixelIdStr, setPixelIdStr] = useState("");
  const [isPixelActive, setIsPixelActive] = useState(false);
  const [pixelLogs, setPixelLogs] = useState<PixelAuditLog[]>([]);
  const [pixelSaveSuccess, setPixelSaveSuccess] = useState("");

  // Banners admin panel states
  const [banners, setBanners] = useState<Promotion[]>([]);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerBadge, setBannerBadge] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [bannerCtaText, setBannerCtaText] = useState("Shop Collection");
  const [bannerBgGradient, setBannerBgGradient] = useState("from-slate-900 via-slate-950 to-slate-900");
  const [bannerLink, setBannerLink] = useState("all");
  const [bannerImageSourceType, setBannerImageSourceType] = useState<"link" | "upload">("link");
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerSuccessMessage, setBannerSuccessMessage] = useState("");
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);

  // Visitor counting stats state
  const [visitorStats, setVisitorStats] = useState<{ total: number; daily: Record<string, number> }>({
    total: 0,
    daily: {}
  });

  const fetchVisitorStats = () => {
    fetch("/api/visits/stats")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) {
          setVisitorStats(data.stats);
        }
      })
      .catch(err => console.error("Error loading visitor stats:", err));
  };

  const handleCopyProductLink = (productId: string) => {
    try {
      const url = `${window.location.origin}${window.location.pathname}?product=${productId}`;
      navigator.clipboard.writeText(url);
      setCopiedProductId(productId);
      setTimeout(() => setCopiedProductId(null), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const loadBanners = () => {
    try {
      const saved = localStorage.getItem("zshop_bd_banners_v1");
      if (saved) {
        setBanners(JSON.parse(saved));
      } else {
        setBanners(PROMOTIONS);
      }
    } catch {
      setBanners(PROMOTIONS);
    }
  };

  const handleBannerImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2.5 * 1024 * 1024) {
        alert("ফাইলের সাইজ অনেক বড়! দয়া করে ২.৫ মেগাবাইটের চেয়ে ছোট ফাইল আপলোড করুন।");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setBannerImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOrUpdateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim() || !bannerImage.trim()) {
      alert("ব্যানারের শিরোনাম এবং ছবি আবশ্যক!");
      return;
    }

    try {
      let updatedBanners: Promotion[];
      if (editingBannerId) {
        // Update existing banner
        updatedBanners = banners.map(b => b.id === editingBannerId ? {
          ...b,
          title: bannerTitle.trim(),
          subtitle: bannerSubtitle.trim(),
          badge: bannerBadge.trim() || "Promotional 🎯",
          image: bannerImage,
          ctaText: bannerCtaText.trim() || "Shop Now",
          bgGradient: bannerBgGradient,
          link: bannerLink
        } : b);
        setBannerSuccessMessage("ব্যানার সফলভাবে আপডেট করা হয়েছে!");
      } else {
        // Add new banner
        const newBanner: Promotion = {
          id: `banner-${Date.now()}`,
          title: bannerTitle.trim(),
          subtitle: bannerSubtitle.trim(),
          badge: bannerBadge.trim() || "New Deal 🔥",
          image: bannerImage,
          ctaText: bannerCtaText.trim() || "Shop Now",
          bgGradient: bannerBgGradient,
          link: bannerLink
        };
        updatedBanners = [...banners, newBanner];
        setBannerSuccessMessage("নতুন ব্যানার সফলভাবে সংযুক্ত করা হয়েছে!");
      }

      setBanners(updatedBanners);
      localStorage.setItem("zshop_bd_banners_v1", JSON.stringify(updatedBanners));
      window.dispatchEvent(new Event("zshop_bd_banners_sync"));

      // Reset Form State
      setBannerTitle("");
      setBannerSubtitle("");
      setBannerBadge("");
      setBannerImage("");
      setBannerCtaText("Shop Collection");
      setBannerBgGradient("from-slate-900 via-slate-950 to-slate-900");
      setBannerLink("all");
      setEditingBannerId(null);

      setTimeout(() => {
        setBannerSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("ব্যানার সংরক্ষণ করতে ত্রুটি হয়েছে!");
    }
  };

  const handleDeleteBanner = (bannerId: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই ব্যানারটি মুছে ফেলতে চান?")) return;
    try {
      const updated = banners.filter(b => b.id !== bannerId);
      setBanners(updated);
      localStorage.setItem("zshop_bd_banners_v1", JSON.stringify(updated));
      window.dispatchEvent(new Event("zshop_bd_banners_sync"));
      setBannerSuccessMessage("ব্যানারটি সফলভাবে মুছে ফেলা হয়েছে!");
      setTimeout(() => setBannerSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditBannerClick = (banner: Promotion) => {
    setEditingBannerId(banner.id);
    setBannerTitle(banner.title);
    setBannerSubtitle(banner.subtitle || "");
    setBannerBadge(banner.badge || "");
    setBannerImage(banner.image || "");
    setBannerCtaText(banner.ctaText || "Shop Now");
    setBannerBgGradient(banner.bgGradient || "from-slate-900 via-slate-950 to-slate-900");
    setBannerLink(banner.link || "all");
    setBannerImageSourceType(banner.image?.startsWith("data:image") ? "upload" : "link");
  };

  const handleRestoreDefaultBanners = () => {
    if (!window.confirm("আপনি কি ব্যানারগুলো প্রথম অবস্থার ডেমো ব্যানারে ফিরিয়ে নিতে চান?")) return;
    try {
      localStorage.removeItem("zshop_bd_banners_v1");
      loadBanners();
      window.dispatchEvent(new Event("zshop_bd_banners_sync"));
      setBannerSuccessMessage("ব্যানারগুলো ডেমো অবস্থায় ফিরিয়ে নেওয়া হয়েছে!");
      setTimeout(() => setBannerSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);

  // Add Product form states
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newOriginalPrice, setNewOriginalPrice] = useState("");
  const [newCategory, setNewCategory] = useState("clothing");
  const [newImage, setNewImage] = useState("");
  const [newSizes, setNewSizes] = useState("");
  const [newColors, setNewColors] = useState("");
  const [addSuccessMessage, setAddSuccessMessage] = useState("");
  const [imageSourceType, setImageSourceType] = useState<"link" | "upload">("link");

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2.5 * 1024 * 1024) {
        alert("ফাইলের সাইজ অনেক বড়! দয়া করে ২.৫ মেগাবাইটের চেয়ে ছোট ফাইল আপলোড করুন।");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setNewImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Inline edit price state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState("");

  // Load and subscribe to order logs from localStorage
  const loadOrders = () => {
    try {
      const savedOrders = localStorage.getItem("zshop_bd_orders_v1");
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load orders from local storage:", err);
    }
  };

  const loadPixelConfigAndLogs = () => {
    const pConf = getPixelConfig();
    setPixelIdStr(pConf.pixelId);
    setIsPixelActive(pConf.isEnabled);
    setPixelLogs(getPixelAuditLogs());
  };

  useEffect(() => {
    if (isOpen) {
      loadOrders();
      loadBanners();
      loadPixelConfigAndLogs();
      fetchVisitorStats();
    }
  }, [isOpen]);

  useEffect(() => {
    // Listen for custom trigger when customer places order in real-time
    const handleStorageUpdate = () => {
      loadOrders();
    };
    const handleLogsUpdate = () => {
      setPixelLogs(getPixelAuditLogs());
    };
    window.addEventListener("storage_orders_update", handleStorageUpdate);
    window.addEventListener("zshop_bd_pixel_logs_updated", handleLogsUpdate);
    return () => {
      window.removeEventListener("storage_orders_update", handleStorageUpdate);
      window.removeEventListener("zshop_bd_pixel_logs_updated", handleLogsUpdate);
    };
  }, []);

  if (!isOpen) return null;

  // Custom BDT Currency Formatting
  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Submit Handler for Admin Verification
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneInput.replace(/\s+/g, "");
    if (cleanPhone === "01888223470" && passwordInput === "zahidtheking52") {
      setIsLogged(true);
      setAuthError("");
      try {
        localStorage.setItem("zshop_bd_admin_session", "active");
      } catch (err) {
        console.error(err);
      }
    } else {
      setAuthError("ভুল নম্বর অথবা পাসওয়ার্ড! আবার চেষ্টা করুন।");
    }
  };

  const handleLogout = () => {
    setIsLogged(false);
    try {
      localStorage.removeItem("zshop_bd_admin_session");
    } catch (err) {
      console.error(err);
    }
  };

  // Order Operations
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    try {
      const updatedOrders = orders.map(ord => ord.id === orderId ? { ...ord, status: newStatus } : ord);
      setOrders(updatedOrders);
      localStorage.setItem("zshop_bd_orders_v1", JSON.stringify(updatedOrders));
      window.dispatchEvent(new Event("storage_orders_update"));
    } catch (err) {
      console.error("Order status update failed:", err);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই অর্ডারটি ডিলিট করতে চান?")) {
      try {
        const filtered = orders.filter(ord => ord.id !== orderId);
        setOrders(filtered);
        localStorage.setItem("zshop_bd_orders_v1", JSON.stringify(filtered));
        window.dispatchEvent(new Event("storage_orders_update"));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleClearAllOrders = () => {
    if (window.confirm("সাবধান! আপনি কি সব অর্ডার এক ক্লিকে পরিষ্কার করতে চান?")) {
      try {
        setOrders([]);
        localStorage.setItem("zshop_bd_orders_v1", JSON.stringify([]));
        window.dispatchEvent(new Event("storage_orders_update"));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Product Operations
  const handleToggleStockStatus = (productId: string) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        return { ...p, inStock: !p.inStock };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  const handleStartEditPrice = (product: Product) => {
    setEditingProductId(product.id);
    setEditPriceVal(product.price.toString());
  };

  const handleSavePriceEdit = (productId: string) => {
    const parsedPrice = parseFloat(editPriceVal);
    if (!isNaN(parsedPrice) && parsedPrice >= 0) {
      const updated = products.map(p => {
        if (p.id === productId) {
          return { ...p, price: parsedPrice };
        }
        return p;
      });
      onUpdateProducts(updated);
      setEditingProductId(null);
    } else {
      alert("Please enter a valid price number");
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm(`আপনি কি এই পণ্যটি তালিকা থেকে ডিলিট করতে চান?`)) {
      const updated = products.filter(p => p.id !== productId);
      onUpdateProducts(updated);
    }
  };

  // Create Product Submit Form Handler
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice.trim()) {
      alert("Title & Price are required");
      return;
    }

    const priceNum = parseFloat(newPrice);
    const originalPriceNum = newOriginalPrice.trim() ? parseFloat(newOriginalPrice) : undefined;
    const sizesArr = newSizes.trim() ? newSizes.split(",").map(s => s.trim()) : undefined;
    const colorsArr = newColors.trim() ? newColors.split(",").map(c => c.trim()) : undefined;

    // Use a clean stock Image preset if the user didn't specify one
    const imageToUse = newImage.trim() || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600";

    const customId = `cl-custom-${Date.now().toString().slice(-4)}`;

    const newProduct: Product = {
      id: customId,
      title: newTitle,
      description: newDescription || "No custom description provided yet.",
      price: priceNum,
      originalPrice: originalPriceNum,
      image: imageToUse,
      category: newCategory,
      rating: 4.8,
      reviewsCount: 1,
      isTrending: true,
      isNewArrival: true,
      inStock: true,
      sizes: sizesArr,
      colors: colorsArr,
      discountTag: originalPriceNum ? `${Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)}% OFF` : "NEW"
    };

    onUpdateProducts([newProduct, ...products]);

    // Reset fields & success response
    setNewTitle("");
    setNewDescription("");
    setNewPrice("");
    setNewOriginalPrice("");
    setNewImage("");
    setNewSizes("");
    setNewColors("");
    setAddSuccessMessage("অভিনন্দন! আপনার নতুন পণ্যটি সফলভাবে স্টোরে যোগ করা হয়েছে।");
    setTimeout(() => {
      setAddSuccessMessage("");
    }, 5000);
  };

  // Preset Image Picker
  const imagePresets = [
    { label: "Premium Jersey", url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=600" },
    { label: "Casual Sneakers", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600" },
    { label: "Air Fryer", url: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=600" },
    { label: "Minimalist Watch", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600" }
  ];

  // Calculated Stats
  const stats = {
    totalRevenue: orders.filter(o => o.status !== "Cancelled").reduce((acc, curr) => acc + curr.total, 0),
    totalOrders: orders.length,
    pendingCount: orders.filter(o => o.status === "Pending").count || orders.filter(o => o.status === "Pending").length,
    totalProducts: products.length,
    stockoutCount: products.filter(p => !p.inStock).length
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-5 overflow-hidden" 
      id="zshop-admin-portal-modal"
      role="dialog"
      aria-modal="true"
    >
      {/* Absolute dark backdrop mask */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300" 
      />

      {/* Main Admin Interface Card */}
      <div className="relative w-full h-full sm:h-[90vh] sm:max-w-5xl bg-slate-900 border border-slate-800 sm:rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden font-sans text-slate-100 max-h-screen text-left">
        
        {/* Header Ribbon bar */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-display font-black">
              A
            </div>
            <div>
              <h2 className="font-display font-black text-xs sm:text-sm tracking-wider text-amber-500 uppercase">
                ZSHOP BD - ADMIN HUB
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                Storefront Manager & Order Registry Panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLogged && (
              <button 
                onClick={handleLogout}
                className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-200 border border-slate-750 text-slate-350 text-[10px] font-mono rounded-lg transition-colors cursor-pointer"
              >
                Logout Session
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1 px-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-all cursor-pointer"
              title="Close System Overlay"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ---------------- LOGIN FRAME (If unauthenticated) ---------------- */}
        {!isLogged ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/40 p-6 sm:p-12 overflow-y-auto">
            <div className="w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-display font-extrabold text-white">
                  এডমিন লগইন প্যানেল
                </h3>
                <p className="text-xs text-slate-400">
                  নিচের অথেনটিকেশন ফর্মটি পূরণ করে এডমিন ড্যাশবোর্ডে প্রবেশ করুন
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-550/20 text-rose-400 text-xs rounded-xl flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <p className="font-semibold">{authError}</p>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-1.5">
                    Phone Identification (ফোন নম্বর)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-650" />
                    <input
                      type="text"
                      required
                      placeholder="e.g., 01888223470"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full pl-9.5 pr-4 py-2.5 bg-slate-955 border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-1.5">
                    Secure Password (পাসওয়ার্ড)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-650" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full pl-9.5 pr-10 py-2.5 bg-slate-955 border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-display font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors shrink-0 shadow-lg cursor-pointer"
                >
                  Verify Admin Credentials
                </button>
              </form>

              <div className="border-t border-slate-800 pt-3 text-center">
                <span className="text-[10px] text-slate-500 bg-slate-950/40 rounded-md py-1 px-2 font-mono">
                  Standard Credentials Secured & Verified
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ---------------- AUTHENTICATED SYSTEM VIEWS ---------------- */
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/20">
            
            {/* Nav Menu Tabs */}
            <div className="bg-slate-950 px-4 py-2 layout-border border-b border-slate-800 flex flex-wrap items-center gap-1">
              {[
                { id: "dashboard", label: "ড্যাশবোর্ড", icon: <TrendingUp className="w-3.5 h-3.5" /> },
                { id: "orders", label: `অর্ডারসমূহ (${orders.length})`, icon: <ShoppingBag className="w-3.5 h-3.5" /> },
                { id: "products", label: "পণ্য ইনভেন্টরি", icon: <Package className="w-3.5 h-3.5" /> },
                { id: "add-product", label: "নতুন পণ্য যোগ করুন", icon: <Plus className="w-3.5 h-3.5" /> },
                { id: "banners", label: "ব্যানার এডিটর 🎨", icon: <Image className="w-3.5 h-3.5" /> },
                { id: "pixel", label: "Meta Pixel / Ads ⚙️", icon: <Layers className="w-3.5 h-3.5" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${activeTab === tab.id ? "bg-amber-400 text-slate-950" : "text-slate-400 hover:text-white hover:bg-slate-850"}`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Scrollable Workspace canvas area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-slate-300">
              
              {/* TAB 1: ANALYTICS DASHBOARD VIEW */}
              {activeTab === "dashboard" && (
                <div className="space-y-6" id="admin-analytics-view">
                  <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                    Store Performance Summary (রিয়েল-টাইম এনালাইটিক্স)
                  </h3>

                  {/* Highlights Bento-grid Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-start relative overflow-hidden">
                      <span className="text-[10px] font-mono tracking-wider font-extrabold text-emerald-400 uppercase">
                        মোট সেলস (সমস্ত অর্ডার)
                      </span>
                      <p className="text-lg sm:text-2xl font-display font-black text-white mt-1.5">
                        ৳{formatBDT(stats.totalRevenue)}
                      </p>
                      <div className="absolute right-3 bottom-3 text-emerald-500/20">
                        <TrendingUp className="w-12 h-12 stroke-[1.5]" />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-start relative overflow-hidden">
                      <span className="text-[10px] font-mono tracking-wider font-extrabold text-blue-400 uppercase">
                        সর্বমোট অর্ডার সংখ্যা
                      </span>
                      <p className="text-lg sm:text-2xl font-display font-black text-white mt-1.5">
                        {stats.totalOrders}
                      </p>
                      <div className="absolute right-3 bottom-3 text-blue-500/20">
                        <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-start relative overflow-hidden">
                      <span className="text-[10px] font-mono tracking-wider font-extrabold text-amber-400 uppercase">
                        পেন্ডিং অর্ডার (Pending)
                      </span>
                      <p className="text-lg sm:text-2xl font-display font-black text-white mt-1.5">
                        {stats.pendingCount}
                      </p>
                      <div className="absolute right-3 bottom-3 text-amber-500/20">
                        <Clock className="w-12 h-12 stroke-[1.5]" />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-start relative overflow-hidden">
                      <span className="text-[10px] font-mono tracking-wider font-extrabold text-indigo-400 uppercase">
                        ইনভেন্টরি প্রোডাক্টস
                      </span>
                      <p className="text-lg sm:text-2xl font-display font-black text-white mt-1.5">
                        {stats.totalProducts} <span className="text-xs text-rose-500 ml-1">({stats.stockoutCount} Stockout)</span>
                      </p>
                      <div className="absolute right-3 bottom-3 text-indigo-500/20">
                        <Boxes className="w-12 h-12 stroke-[1.5]" />
                      </div>
                    </div>

                    {/* Today's Visitors Counter Category Card */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-start relative overflow-hidden">
                      <span className="text-[10px] font-mono tracking-wider font-extrabold text-orange-400 uppercase">
                        আজকের ভিজিটর (Today)
                      </span>
                      <p className="text-lg sm:text-2xl font-display font-black text-white mt-1.5">
                        {(() => {
                          const d = new Date();
                          const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
                          const bdTime = new Date(utc + (3600000 * 6));
                          const bdDateStr = bdTime.toISOString().split("T")[0];
                          return visitorStats.daily?.[bdDateStr] || 0;
                        })()}
                      </p>
                      <div className="absolute right-3 bottom-3 text-orange-500/20">
                        <Activity className="w-12 h-12 stroke-[1.5]" />
                      </div>
                    </div>

                    {/* Total Visitors Counter Category Card */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-start relative overflow-hidden">
                      <span className="text-[10px] font-mono tracking-wider font-extrabold text-fuchsia-400 uppercase">
                        সর্বমোট ভিজিটর (Total)
                      </span>
                      <p className="text-lg sm:text-2xl font-display font-black text-white mt-1.5">
                        {visitorStats.total || 0}
                      </p>
                      <div className="absolute right-3 bottom-3 text-fuchsia-500/20">
                        <Users className="w-12 h-12 stroke-[1.5]" />
                      </div>
                    </div>
                  </div>

                  {/* Daily Visitor Timeline Breakdown */}
                  <div className="space-y-3 bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-fuchsia-400" />
                        <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider">
                          Daily Visitor Report (দৈনিক ভিজিটর রিপোর্ট)
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">লাইভ ট্রাফিক কাউন্ট</span>
                    </div>

                    {Object.keys(visitorStats.daily || {}).length === 0 ? (
                      <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 text-xs">
                        এখন পর্যন্ত কোনো ট্রাফিক ডেটা পাওয়া যায়নি।
                      </div>
                    ) : (
                      <div className="max-h-[170px] overflow-y-auto divide-y divide-slate-800/60 pr-1 select-none">
                        {Object.entries(visitorStats.daily || {})
                          .sort((a, b) => b[0].localeCompare(a[0]))
                          .slice(0, 15) // Show last 15 days
                          .map(([date, count]) => {
                            const formattedDate = new Date(date).toLocaleDateString("bn-BD", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            });
                            return (
                              <div key={date} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-800/25 px-2 rounded-lg transition-colors">
                                <div className="space-y-0.5">
                                  <span className="font-mono text-slate-300 font-bold bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{date}</span>
                                  <p className="text-[10px] text-slate-500 font-medium">{formattedDate}</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="bg-fuchsia-500/10 text-fuchsia-400 font-mono font-black px-2 py-0.5 rounded text-[11px] border border-fuchsia-500/20">
                                    {count} জন ভিজিটর
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Informational Guidance Alert box */}
                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-semibold text-white">How this database works:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-400">
                      ZSHOP BD values extreme server integrity and robust sandboxed testing. The mock order system acts dynamically with standard React hooks! By placing an order inside the consumer frontend cart drawer, that order is instantly captured, typed, and pushed into the admin-dashboard! Changing orders status reflects in real-time.
                    </p>
                  </div>

                  {/* Recent Orders Overview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider">
                        Recent Logs (সাম্প্রতিক অর্ডারসমূহ)
                      </h4>
                      <button 
                        onClick={() => setActiveTab("orders")}
                        className="text-[10px] font-mono text-amber-400 hover:underline"
                      >
                        সবগুলো দেখুন →
                      </button>
                    </div>

                    {orders.length === 0 ? (
                      <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 text-xs">
                        এখন পর্যন্ত কোনো কাস্টমার অর্ডার নেই। ফ্রন্টএন্ডে গিয়ে প্রোডাক্ট অর্ডার করুন!
                      </div>
                    ) : (
                      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900 divide-y divide-slate-800 text-xs">
                        {orders.slice(0, 3).map(ord => (
                          <div key={ord.id} className="p-3 flex items-center justify-between flex-wrap gap-2 hover:bg-slate-850 transition-colors">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-white">{ord.id}</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {new Date(ord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-slate-350">
                                <strong>Customer:</strong> {ord.customerName} ({ord.phone})
                              </p>
                            </div>

                            <div className="text-right flex items-center gap-3">
                              <div>
                                <p className="font-bold text-white">৳{formatBDT(ord.total)}</p>
                                <p className="text-[9px] text-slate-400">{ord.district === "dhaka" ? "Inside Dhaka" : "Outside"}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono uppercase font-bold 
                                ${ord.status === "Pending" ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" : ""}
                                ${ord.status === "Confirmed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : ""}
                                ${ord.status === "Shipped" ? "bg-indigo-400/10 text-indigo-400 border border-indigo-400/20" : ""}
                                ${ord.status === "Delivered" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-400/20" : ""}
                                ${ord.status === "Cancelled" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : ""}
                              `}>
                                {ord.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: MANAGE CUSTOMER ORDERS */}
              {activeTab === "orders" && (
                <div className="space-y-4" id="admin-orders-manager">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-display font-medium text-white uppercase tracking-wider">
                        Customer Orders Desk (অর্ডার তালিকা ও ট্র্যাকিং)
                      </h3>
                      <p className="text-[10px] text-slate-450 font-mono mt-0.5">
                        Track customer details, edit lifecycle statuses, or manage data logs.
                      </p>
                    </div>

                    {orders.length > 0 && (
                      <button
                        onClick={handleClearAllOrders}
                        className="px-2.5 py-1 text-[10px] bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear All Orders</span>
                      </button>
                    )}
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl">
                      <ShoppingBag className="w-10 h-10 text-slate-650 mx-auto mb-3" />
                      <p className="text-xs text-slate-400">এখন পর্যন্ত কোনো অর্ডার প্লেস করা হয়নি।</p>
                      <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                        আপনি কাস্টমার ইন্টারফেস ব্যবহার করে একটি অর্ডার প্লেস করুন, অর্ডারটি সাথে সাথে এই তালিকায় চলে আসবে!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div 
                          key={order.id} 
                          className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4 text-xs font-sans hover:border-slate-700 transition-all duration-200"
                        >
                          {/* Left Segment: Customer Details */}
                          <div className="space-y-3 flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-amber-400 font-mono font-extrabold tracking-wide uppercase px-2 py-0.5 bg-amber-400/5 border border-amber-400/10 rounded">
                                {order.id}
                              </span>
                              <span className="text-[10px] text-slate-450 font-mono">
                                {new Date(order.timestamp).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}
                              </span>
                            </div>

                            <div className="space-y-1 text-xs">
                              <p className="text-slate-100 flex items-center gap-1.5">
                                <span className="text-amber-500 font-bold font-mono">CUSTOMER:</span>
                                <strong>{order.customerName}</strong>
                              </p>
                              <p className="text-slate-350 flex items-center gap-1.5">
                                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                                <a href={`tel:${order.phone}`} className="hover:underline text-amber-400 font-mono">{order.phone}</a>
                              </p>
                              <p className="text-slate-350 flex items-start gap-1.5 leading-relaxed">
                                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                <span>{order.address} ({order.district === "dhaka" ? "Inside Dhaka" : "Outside Dhaka"})</span>
                              </p>
                              {order.instructions && order.instructions !== "None" && (
                                <p className="text-orange-300 font-medium italic mt-1 bg-orange-950/20 p-2 border border-orange-950/15 rounded-lg flex items-center gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span>Instructions: {order.instructions}</span>
                                </p>
                              )}
                            </div>

                            {/* Inner Cart Items detail snippet */}
                            <div className="border-t border-slate-800 pt-3 mt-1 space-y-2">
                              <p className="text-[10px] font-mono tracking-widest text-slate-400 font-extrabold uppercase">
                                Ordered Items ({order.cartItems.reduce((acc, c) => acc + c.quantity, 0)} Pcs)
                              </p>
                              <div className="divide-y divide-slate-800/40">
                                {order.cartItems.map((item: any, i) => (
                                  <div key={item.id || i} className="flex gap-2 py-1.5 items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <img 
                                        src={item.image} 
                                        alt={item.title} 
                                        referrerPolicy="no-referrer"
                                        className="w-7 h-7 rounded object-cover bg-slate-950" 
                                      />
                                      <p className="text-slate-300 line-clamp-1 leading-snug">
                                        {item.title} 
                                        {(item.color || item.size) && (
                                          <span className="text-[9px] text-slate-450 font-mono block">
                                            {item.color && `Color: ${item.color}`} {item.size && `| Size: ${item.size}`}
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                    <div className="text-right shrink-0 whitespace-nowrap font-mono font-semibold">
                                      <span className="text-slate-500 text-[10px] mr-1">Qty {item.quantity} × BDT {item.price}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Right Segment: Order Pricing Bill & Actions status selector */}
                          <div className="md:w-56 shrink-0 border-t md:border-t-0 md:border-l border-slate-850 pt-4 md:pt-0 md:pl-4 flex flex-col justify-between text-left md:text-right space-y-3">
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between md:justify-end gap-2 text-slate-400 text-[11px] font-mono">
                                <span>Items Subtotal:</span>
                                <span>৳{formatBDT(order.itemsSubtotal)}</span>
                              </div>
                              <div className="flex justify-between md:justify-end gap-2 text-slate-400 text-[11px] font-mono">
                                <span>Delivery Cost:</span>
                                <span>৳{formatBDT(order.deliveryFee)}</span>
                              </div>
                              <div className="flex justify-between md:justify-end gap-2 text-white font-display font-black text-sm border-t border-slate-850 pt-1 mt-1">
                                <span className="md:hidden">Total COD Bill:</span>
                                <span>৳{formatBDT(order.total)}</span>
                              </div>
                            </div>

                            {/* Status Change Picker */}
                            <div className="space-y-2">
                              <label className="block text-[10px] font-mono text-slate-400 uppercase">
                                Action Status Lifecycle
                              </label>
                              <div className="flex gap-1.5 items-center">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                                  className={`flex-1 bg-slate-950 border border-slate-800 p-2 rounded-xl text-xs font-semibold focus:outline-none 
                                    ${order.status === "Pending" ? "text-amber-400" : ""}
                                    ${order.status === "Confirmed" ? "text-emerald-400" : ""}
                                    ${order.status === "Shipped" ? "text-indigo-400" : ""}
                                    ${order.status === "Delivered" ? "text-cyan-400" : ""}
                                    ${order.status === "Cancelled" ? "text-rose-400" : ""}
                                  `}
                                >
                                  <option value="Pending" className="text-amber-400 bg-slate-950">Pending</option>
                                  <option value="Confirmed" className="text-emerald-400 bg-slate-950">Confirmed</option>
                                  <option value="Shipped" className="text-indigo-400 bg-slate-950">Shipped</option>
                                  <option value="Delivered" className="text-cyan-400 bg-slate-950">Delivered</option>
                                  <option value="Cancelled" className="text-rose-400 bg-slate-950">Cancelled</option>
                                </select>

                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="p-2 border border-slate-800 hover:border-rose-500/30 bg-slate-950 hover:bg-rose-950/20 text-slate-450 hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
                                  title="Delete Order Log"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PRODUCT INVENTORY MANAGER */}
              {activeTab === "products" && (
                <div className="space-y-4" id="admin-product-inventory">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-display font-medium text-white uppercase tracking-wider">
                        Product Catalog Inventory (মজুদ এবং মূল্য নিয়ন্ত্রণ)
                      </h3>
                      <p className="text-[10px] text-slate-450 font-mono mt-0.5">
                        Toggle dynamic stock availability, tweak retail prices, or delete custom items block.
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab("add-product")}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold font-display rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Product</span>
                    </button>
                  </div>

                  {/* Desktop view tables / Mobile grid listings card lists */}
                  <div className="space-y-3.5">
                    {products.map((prod) => (
                      <div 
                        key={prod.id} 
                        className="p-3.5 rounded-xl border border-slate-850 bg-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs hover:border-slate-800 transition-colors"
                      >
                        {/* Summary details */}
                        <div className="flex gap-3.5 items-center min-w-0 flex-1 text-left">
                          <img 
                            src={prod.image} 
                            alt={prod.title} 
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 object-cover rounded-xl bg-slate-950 border border-slate-800" 
                          />
                          <div className="min-w-0">
                            <p className="font-display font-bold text-white leading-snug line-clamp-1">{prod.title}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 rounded px-1.5 py-0.5 uppercase tracking-wide">
                                {prod.category}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-950 rounded px-1.5 py-0.5">
                                ID: {prod.id}
                              </span>
                              <button
                                onClick={() => handleCopyProductLink(prod.id)}
                                className={`text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                                  copiedProductId === prod.id
                                    ? "bg-emerald-950 text-emerald-400 border border-emerald-900"
                                    : "bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800"
                                }`}
                                title="কপি প্রোডাক্ট লিংক (Copy Direct Link)"
                              >
                                {copiedProductId === prod.id ? (
                                  <>
                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                                    <span className="font-semibold text-[9px]">লিঙ্ক কপি হয়েছে!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-2.5 h-2.5 text-amber-450" />
                                    <span className="font-semibold text-[9px]">লিঙ্ক কপি করুন</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Middle Area: Price editing system */}
                        <div className="flex items-center gap-2 flex-wrap text-left justify-start">
                          {editingProductId === prod.id ? (
                            <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg">
                              <span className="text-[10px] text-amber-500 font-bold px-1">৳</span>
                              <input
                                type="number"
                                value={editPriceVal}
                                onChange={(e) => setEditPriceVal(e.target.value)}
                                className="w-20 bg-transparent text-xs text-white focus:outline-none focus:ring-0 font-semibold text-center"
                                autoFocus
                              />
                              <button 
                                onClick={() => handleSavePriceEdit(prod.id)}
                                className="p-1 px-1.5 bg-emerald-500 text-slate-950 rounded hover:bg-emerald-600 cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-1 bg-slate-950 px-2 py-1.5 border border-slate-850 rounded-lg">
                              <span className="text-[10px] text-slate-450">Price:</span>
                              <span className="font-bold text-amber-400 font-mono">৳{formatBDT(prod.price)}</span>
                              {prod.originalPrice && (
                                <span className="text-[9px] line-through text-slate-500 font-mono ml-1">৳{formatBDT(prod.originalPrice)}</span>
                              )}
                              <button 
                                onClick={() => handleStartEditPrice(prod)}
                                className="ml-2 hover:text-white text-slate-450 p-0.5 hover:bg-slate-800 rounded cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Right Area: Availability Controls */}
                        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-between w-full md:w-auto">
                          {/* Toggle switches */}
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] tracking-wide font-mono font-bold uppercase ${prod.inStock ? "text-emerald-400" : "text-rose-400"}`}>
                              {prod.inStock ? "মজুদ আছে (In Stock)" : "স্টক আউট (Out of Stock)"}
                            </span>
                            <button
                              onClick={() => handleToggleStockStatus(prod.id)}
                              className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors outline-none focus:outline-none ${prod.inStock ? "bg-emerald-500" : "bg-slate-800 border border-slate-700"}`}
                            >
                              <div className={`w-5 h-5 rounded-full bg-white transition-all transform duration-200 ${prod.inStock ? "translate-x-5" : "translate-x-0 bg-slate-400"}`} />
                            </button>
                          </div>

                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-2 border border-slate-850 hover:border-rose-550/30 bg-slate-950 hover:bg-rose-950/20 text-slate-450 hover:text-rose-400 rounded-xl transition-colors cursor-pointer ml-auto"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ADD NEW PRODUCT FORM */}
              {activeTab === "add-product" && (
                <div className="space-y-4 max-w-2xl mx-auto text-left" id="admin-add-product-form">
                  <div>
                    <h3 className="text-sm font-display font-medium text-white uppercase tracking-wider border-b border-slate-800 pb-3">
                      Add New Product to Storefront (দোকানে নতুন পণ্য যোগ করুন)
                    </h3>
                    <p className="text-[10px] text-slate-450 font-mono mt-0.5">
                      Fill out this system registration form to showcase custom garments or tech on ZSHOP BD.
                    </p>
                  </div>

                  {addSuccessMessage && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2.5">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                      <p className="font-semibold">{addSuccessMessage}</p>
                    </div>
                  )}

                  <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs font-sans">
                    
                    {/* Grid Title + Category selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 font-mono tracking-wider mb-1.5 uppercase">
                          Product Title (পণ্যের নাম) <span className="text-amber-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Men's Designer Linen Shari, Smart TV etc."
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-mono tracking-wider mb-1.5 uppercase">
                          Store Category (ক্যাটাগরি) <span className="text-amber-500">*</span>
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white focus:outline-none font-semibold text-xs py-2.5 h-[37px]"
                        >
                          <option value="clothing">Clothing & Fashion (পোষাক-আশাক)</option>
                          <option value="watches">Luxury Watches (প্রিমিয়াম ঘড়ি)</option>
                          <option value="electronics">Smart Electronics (স্মার্ট গ্যাজেট)</option>
                          <option value="kitchen">Home & Kitchen (রান্নাঘর সামগ্রী)</option>
                          <option value="sports">Sports & Outdoors (খেলাধুলা-ভ্রমণ)</option>
                        </select>
                      </div>
                    </div>

                    {/* Pricing inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 font-mono tracking-wider mb-1.5 uppercase">
                          Selling Price BDT (৳ মূল্য) <span className="text-amber-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="e.g., 2450"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-mono tracking-wider mb-1.5 uppercase">
                          Original Price BDT (৳ আসল বা কাটা মূল্য - ইচ্ছাধীন)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 3200"
                          value={newOriginalPrice}
                          onChange={(e) => setNewOriginalPrice(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Image URL / Local gallery upload selector */}
                    <div className="space-y-2">
                      <label className="block text-slate-400 font-mono tracking-wider uppercase mb-1.5">
                        Product Photo option (পণ্যের ছবি সংযুক্তকরণ) <span className="text-amber-500">*</span>
                      </label>
                      
                      {/* Segmented control tabs */}
                      <div className="flex gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl w-full sm:w-80">
                        <button
                          type="button"
                          onClick={() => {
                            setImageSourceType("link");
                          }}
                          className={`flex-1 text-center py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            imageSourceType === "link"
                              ? "bg-amber-400 text-slate-950 font-black"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          ছবি লিঙ্ক দিন
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImageSourceType("upload");
                          }}
                          className={`flex-1 text-center py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            imageSourceType === "upload"
                              ? "bg-amber-400 text-slate-950 font-black"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          গ্যালারি থেকে আপলোড
                        </button>
                      </div>

                      {imageSourceType === "link" ? (
                        <div className="space-y-2">
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/your-image-url..."
                            value={newImage.startsWith("data:image") ? "" : newImage}
                            onChange={(e) => setNewImage(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white focus:outline-none font-mono text-[10px]"
                          />
                          
                          {/* Presets Grid */}
                          <p className="text-[10px] text-slate-500">
                            অথবা নিচের যেকোনো একটি ডেমো ইমেজ সোর্স সিলেক্ট করুন:
                          </p>
                          <div className="flex flex-wrap gap-2 pt-0.5">
                            {imagePresets.map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setNewImage(preset.url)}
                                className={`text-[10px] font-medium bg-slate-900 border px-2 py-1 rounded-md text-slate-350 transition-all cursor-pointer ${
                                  newImage === preset.url ? "border-amber-400 text-amber-400" : "border-slate-800 hover:border-amber-400/55"
                                }`}
                              >
                                🎨 {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="relative border border-dashed border-slate-800 hover:border-amber-400/50 bg-slate-950/45 rounded-xl p-4 transition-all flex flex-col items-center justify-center text-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              id="gallery-file-uploader"
                            />
                            
                            <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center pointer-events-none">
                              <Plus className="w-5 h-5" />
                            </div>

                            <p className="text-xs font-semibold text-slate-300 pointer-events-none">
                              এখানে ক্লিক করে গ্যালারি থেকে ছবি সিলেক্ট করুন
                            </p>
                            <p className="text-[10px] text-slate-500 pointer-events-none uppercase font-mono">
                              PNG, JPG, WEBP (Max: 2.5MB)
                            </p>
                          </div>

                          {/* Preview container */}
                          {newImage && newImage.startsWith("data:image") && (
                            <div className="flex items-center gap-3 p-2 bg-slate-900 border border-slate-800 rounded-xl">
                              <img 
                                src={newImage} 
                                alt="Uploader product preview" 
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 object-cover rounded-lg bg-slate-950 border border-slate-800 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-bold text-slate-200">ছবি সফলভাবে লোড হয়েছে</p>
                                <p className="text-[9px] font-mono text-emerald-450 uppercase tracking-widest mt-0.5">READY TO PUBLISH</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setNewImage("")}
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer mr-1 shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Description field */}
                    <div>
                      <label className="block text-slate-400 font-mono tracking-wider mb-1.5 uppercase">
                        Description / Fabric details (পণ্যের সংক্ষিপ্ত বিবরণী)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="প্রিমিয়াম কোয়ালিটির উপাদান দ্বারা তৈরি, আরামদায়ক এবং টেকসই ব্যবহার উপযোগী..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white focus:outline-none"
                      />
                    </div>

                    {/* Sizes and colors layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 font-mono tracking-wider mb-1.5 uppercase">
                          Available Sizes (কমা দিয়ে লিখুন - ইচ্ছাধীন)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., M, L, XL or 38, 40, 42"
                          value={newSizes}
                          onChange={(e) => setNewSizes(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-mono tracking-wider mb-1.5 uppercase">
                          Available Colors (কমা দিয়ে লিখুন - ইচ্ছাধীন)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Classic White, Ocean Blue, Black"
                          value={newColors}
                          onChange={(e) => setNewColors(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-display font-black uppercase tracking-wider text-xs rounded-xl cursor-pointer transition-colors shadow-lg"
                    >
                      Publish Custom Product (পণ্য সংযুক্ত করুন)
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 5: BANNER MANAGER/EDITOR VIEW */}
              {activeTab === "banners" && (
                <div className="space-y-6" id="admin-banner-view">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                        Manage Promotion Banners (ওয়েবসাইট ব্যানার কন্ট্রোল)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">
                        আপনার ওয়েবসাইটের প্রধান স্লাইডারের ব্যানারগুলো পরিবর্তন, যোগ এবং ডিলিট করুন।
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRestoreDefaultBanners}
                      className="text-[11px] font-mono shrink-0 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-850 rounded-xl transition-all font-semibold cursor-pointer"
                    >
                      🔄 ডেমো ব্যানার ফিরিয়ে আনুন
                    </button>
                  </div>

                  {bannerSuccessMessage && (
                    <div className="p-3 bg-emerald-950/40 text-emerald-400 text-xs rounded-xl flex items-center gap-2.5 border border-emerald-900">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                      <p className="font-semibold">{bannerSuccessMessage}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left block: Form to Add/Edit */}
                    <div className="lg:col-span-5 bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-850/60 text-slate-350 space-y-4 font-sans">
                      <h4 className="text-xs font-display font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                        <span>{editingBannerId ? "ব্যানার সম্পাদন করুণ (EDIT)" : "নতুন ব্যানার যুক্ত করুন"}</span>
                      </h4>

                      <form onSubmit={handleAddOrUpdateBanner} className="space-y-4">
                        <div>
                          <label className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-1">
                            Banner Category Badge (ছোট লাল/হলুদ ব্যাজ) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="যেমনঃ Special Eid Sale 🕌, Hot Deal 🔥"
                            value={bannerBadge}
                            onChange={(e) => setBannerBadge(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-white focus:outline-none placeholder-slate-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-1">
                            Banner Main Title (ব্যানারের মূল শিরোনাম) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="যেমনঃ ঈদ-উল-আযহা ধামাকা অফার"
                            value={bannerTitle}
                            onChange={(e) => setBannerTitle(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-white focus:outline-none placeholder-slate-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-1">
                            Banner Subtitle / Details (ছোট বিবরণ)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="যেমনঃ পাঞ্জাবি ও প্রিমিয়াম ওয়াচে ৫০% পর্যন্ত বিশাল ছাড়!"
                            value={bannerSubtitle}
                            onChange={(e) => setBannerSubtitle(e.target.value)}
                            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-white focus:outline-none placeholder-slate-700"
                          />
                        </div>

                        {/* Banner Image selector link vs upload */}
                        <div className="space-y-2">
                          <label className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                            Banner Photo Option (ব্যানারের ছবি) *
                          </label>

                          <div className="flex gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl w-full">
                            <button
                              type="button"
                              onClick={() => setBannerImageSourceType("link")}
                              className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                bannerImageSourceType === "link"
                                  ? "bg-amber-400 text-slate-950 font-black"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              ছবি লিঙ্ক
                            </button>
                            <button
                              type="button"
                              onClick={() => setBannerImageSourceType("upload")}
                              className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                bannerImageSourceType === "upload"
                                  ? "bg-amber-400 text-slate-950 font-black"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              গ্যালারি থেকে আপলোড
                            </button>
                          </div>

                          {bannerImageSourceType === "link" ? (
                            <input
                              type="url"
                              placeholder="https://images.unsplash.com/your-banner-url..."
                              value={bannerImage.startsWith("data:image") ? "" : bannerImage}
                              onChange={(e) => setBannerImage(e.target.value)}
                              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-white focus:outline-none font-mono placeholder-slate-700"
                            />
                          ) : (
                            <div className="space-y-2">
                              <div className="relative border border-dashed border-slate-800 hover:border-amber-400/50 bg-slate-950/45 rounded-xl p-3 transition-all flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleBannerImageFileUpload}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <div className="p-1 px-2 rounded bg-amber-400/10 text-amber-400 text-[10px] font-bold pointer-events-none">
                                  এখানে ক্লিক করে ছবি নির্বাচন করুন
                                </div>
                                <span className="text-[9px] text-slate-500 pointer-events-none">Max size: 2.5MB</span>
                              </div>

                              {bannerImage && (
                                <div className="p-1.5 bg-slate-950 rounded-lg flex items-center gap-2 border border-slate-800">
                                  <img
                                    src={bannerImage}
                                    alt="Preview"
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-10 object-cover rounded shadow"
                                  />
                                  <span className="text-[10px] text-emerald-450 font-mono truncate">ছবি লোড হয়েছে!</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Slide Layout Gradients and buttons details */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-1">
                              CTA Button Title
                            </label>
                            <input
                              type="text"
                              value={bannerCtaText}
                              onChange={(e) => setBannerCtaText(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-1">
                              Target Category Link
                            </label>
                            <select
                              value={bannerLink}
                              onChange={(e) => setBannerLink(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                            >
                              <option value="all">সব প্রোডাক্ট (All Catalog)</option>
                              <option value="clothing">পাঞ্জাবি ও ফ্যাশন (Clothing)</option>
                              <option value="watches">লাক্সারি ঘড়ি (Watches)</option>
                              <option value="electronics">ইলেকট্রনিক্স (Electronics)</option>
                              <option value="kitchen">কিচেন ও হোম (Kitchen)</option>
                              <option value="sports">স্পোর্টস আইটেম (Sports)</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold uppercase tracking-wider text-[11px] rounded-xl cursor-pointer transition-colors text-center"
                          >
                            {editingBannerId ? "ব্যানার আপডেট করুণ" : "ব্যানার প্রকাশ করুণ"}
                          </button>
                          {editingBannerId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBannerId(null);
                                setBannerTitle("");
                                setBannerSubtitle("");
                                setBannerBadge("");
                                setBannerImage("");
                                setBannerCtaText("Shop Collection");
                                setBannerLink("all");
                              }}
                              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-[11px] rounded-xl cursor-pointer"
                            >
                              বাতিল
                            </button>
                          )}
                        </div>
                      </form>
                    </div>

                    {/* Right block: Live Banners Directory list */}
                    <div className="lg:col-span-7 bg-slate-900/20 border border-slate-800/60 rounded-2xl p-4 sm:p-5 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-display font-black text-slate-300 uppercase tracking-widest">
                          Active Banners List (স্লাইডার ব্যানার তালিকা - মোটঃ {banners.length})
                        </h4>
                      </div>

                      {banners.length === 0 ? (
                        <div className="p-10 border border-dashed border-slate-800 rounded-xl text-center text-slate-500">
                          কোনো সক্রিয় ব্যানার পাওয়া যায়নি! অনুগ্রহ করে নতুন ব্যানার সংযুক্ত করুন বা ডেমো ব্যানার পুনরুদ্ধার করুন।
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {banners.map((item, idx) => (
                            <div
                              key={item.id}
                              className="bg-slate-950/80 border border-slate-850 rounded-xl p-3.5 flex items-start gap-4 hover:border-slate-700 transition-all text-xs"
                            >
                              <img
                                src={item.image}
                                alt={item.title}
                                referrerPolicy="no-referrer"
                                className="w-16 h-12 object-cover rounded-lg bg-slate-900 border border-slate-800 shrink-0"
                              />

                              <div className="min-w-0 flex-1 space-y-1">
                                <span className="inline-block px-1.5 py-0.5 bg-slate-900 text-amber-500 text-[8px] font-mono font-bold rounded uppercase">
                                  {item.badge}
                                </span>
                                <h5 className="font-display font-extrabold text-white truncate text-xs">
                                  {idx + 1}. {item.title}
                                </h5>
                                <p className="text-[10px] text-slate-400 line-clamp-1 leading-snug">
                                  {item.subtitle}
                                </p>
                                <p className="text-[8px] text-slate-500 font-mono tracking-widest uppercase">
                                  CTA Target: <span className="text-amber-500 font-extrabold">{item.link}</span> | Button: {item.ctaText}
                                </p>
                              </div>

                              <div className="flex flex-col gap-1.5 shrink-0 ml-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditBannerClick(item)}
                                  className="py-1 px-2.5 bg-slate-900 hover:bg-amber-400 hover:text-slate-950 border border-slate-800 rounded text-[10px] transition-all font-semibold cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBanner(item.id)}
                                  className="py-1 px-2.5 bg-rose-950/20 hover:bg-rose-900/60 hover:text-white border border-rose-950 text-rose-500 rounded text-[10px] transition-all cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: META PIXEL & ADS CONFIGURATION */}
              {activeTab === "pixel" && (
                <div className="space-y-6" id="admin-pixel-view">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                        Facebook Meta Pixel Setup (ফেইসবুক বিজ্ঞাপন ট্র্যাকিং কোড সংযোগ)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">
                        আপনার ওয়েবসাইটে কাস্টমার প্রোডাক্ট দেখার সময়, কার্টে এড করার সময় এবং সফলভাবে অর্ডার করার সময় Facebook Pixel-এ রিয়েল-টাইমে ডাটা বা সিগন্যাল ট্র্যাকিং করতে সাহায্য করবে। এটা দিয়ে আপনার ফেইসবুকে ad দিতে পারবেন।
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
                    {/* Left Panel: Primary Configuration form card */}
                    <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 text-left">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-left">
                        <Layers className="w-4 h-4 text-amber-500" />
                        <h4 className="text-xs font-display font-black text-white uppercase tracking-wider">
                          Pixel Details (পিক্সেল সেটআপ ফর্ম)
                        </h4>
                      </div>

                      {pixelSaveSuccess && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-fade-in font-medium">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>{pixelSaveSuccess}</span>
                        </div>
                      )}

                      <form onSubmit={(e) => {
                        e.preventDefault();
                        savePixelConfig(pixelIdStr, isPixelActive);
                        setPixelSaveSuccess("অভিনন্দন! ফেইসবুক মেটা পিক্সেল সফলভাবে সংরক্ষিত হয়েছে।");
                        setTimeout(() => setPixelSaveSuccess(""), 4000);
                      }} className="space-y-4 text-left">
                        {/* Status Toggle Box */}
                        <div className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl space-y-2.5 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono uppercase text-slate-404 font-bold">
                              পিক্সেল ট্র্যাকিং স্ট্যাটাস
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono tracking-widest uppercase font-bold ${isPixelActive ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-slate-800 text-slate-500 border border-slate-750"}`}>
                              {isPixelActive ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-snug">
                            এটি সক্রিয় থাকলে আপনার ওয়েবসাইটের সমস্ত কাস্টমার কার্যক্রম ফেইসবুক পিক্সেলে পাঠানো হবে বিজ্ঞাপন উন্নত করতে।
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsPixelActive(!isPixelActive)}
                            className={`w-full py-2 rounded-xl text-xs font-bold font-sans transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border ${isPixelActive ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 shadow-sm" : "bg-slate-850 hover:bg-slate-800 text-slate-350 border-slate-750"}`}
                          >
                            <span>{isPixelActive ? "পিক্সেল ট্র্যাকিং বন্ধ করুন" : "পিক্সেল ট্র্যাকিং চালু করুন"}</span>
                          </button>
                        </div>

                        {/* Pixel Name Input */}
                        <div className="space-y-1.5 text-left">
                          <label className="block text-[11px] font-mono tracking-wider text-slate-400 uppercase">
                            Facebook Pixel ID (মেটা পিক্সেল আইডি)
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="যেমনঃ 471295038164010"
                            value={pixelIdStr}
                            onChange={(e) => setPixelIdStr(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 focus:border-amber-400 rounded-xl text-xs text-white uppercase tracking-widest font-mono focus:outline-none focus:ring-1 focus:ring-amber-400"
                          />
                          <span className="text-[9px] text-slate-505 block leading-relaxed">
                            ⚠️ আপনার ফেইসবুক এডস ম্যানেজার থেকে পিক্সেল আইডিটি কপি করে এখানে পেস্ট করুন।
                          </span>
                        </div>

                        {/* Save Button */}
                        <button
                          type="submit"
                          className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-display font-black uppercase tracking-wider text-xs rounded-xl cursor-pointer transition-colors shadow-lg"
                        >
                          Save Configuration (পিক্সেল রুলস সংরক্ষণ করুন)
                        </button>
                      </form>

                      {/* Educational tracking events info */}
                      <div className="p-3.5 bg-slate-950/30 border border-slate-850/45 rounded-xl text-left space-y-1.5">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                          Auto Tracking standard events (অটোমেটিক ইভেন্টসমূহ)
                        </span>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] text-slate-400 text-left">
                          <div className="flex items-center gap-1">
                            <span className="text-amber-500 font-bold">●</span> PageView
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-amber-500 font-bold">●</span> ViewContent
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-amber-500 font-bold">●</span> AddToCart
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-amber-500 font-bold">●</span> InitiateCheckout
                          </div>
                          <div className="col-span-2 flex items-center gap-1">
                            <span className="text-amber-500 font-bold">●</span> Purchase (৳ সহ ট্র্যাক হবে)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Panel: Simulated audit trace feed */}
                    <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 text-left">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-left">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <h4 className="text-xs font-display font-black text-slate-300 uppercase tracking-widest">
                            Real-time Ad Tracking Feed (পিক্সেল লাইভ একটিভিটি লগ)
                          </h4>
                        </div>
                        {pixelLogs.length > 0 && (
                          <button
                            onClick={clearPixelAuditLogs}
                            className="text-[9px] px-1.5 py-0.5 bg-rose-950/45 text-rose-455 border border-rose-950 hover:bg-rose-950 hover:text-white rounded font-mono cursor-pointer uppercase font-extrabold"
                          >
                            Clear Logs
                          </button>
                        )}
                      </div>

                      {/* Simulation helpers */}
                      <div className="p-3 bg-slate-950/50 rounded-xl space-y-2 border border-slate-850/65 text-left">
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                          💡 <strong>টেস্ট প্যানেলঃ</strong> কাস্টমারের অ্যাকশন টেস্ট করতে নিচের ডেমো ইভেন্টগুলোতে চাপ দিয়ে পিক্সেল ফায়ার সফলভাবে হচ্ছে কিনা টেস্ট করুন।
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { name: "Demo View Product", action: () => trackPixelEvent("ViewContent", { content_name: "iPhone Special Custom Match", value: 145000, currency: "BDT" }) },
                            { name: "Demo Add Cart", action: () => trackPixelEvent("AddToCart", { content_name: "RFL Air Fryer Premium", value: 4500, currency: "BDT" }) },
                            { name: "Demo Purchase (৳১২০০)", action: () => trackPixelEvent("Purchase", { value: 1200, currency: "BDT", content_name: "Premium Special Pan" }) }
                          ].map((testEv, idx) => (
                            <button
                              key={idx}
                              onClick={testEv.action}
                              type="button"
                              className="px-2.5 py-1 text-[9px] bg-slate-800 font-bold hover:bg-amber-400 hover:text-slate-950 border border-slate-750 text-slate-300 rounded transition-all cursor-pointer"
                            >
                              🚀 {testEv.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Logs output console box */}
                      <div className="bg-slate-950 rounded-xl border border-slate-850 p-3 h-72 overflow-y-auto font-mono text-[10px] space-y-2.5 text-left">
                        {pixelLogs.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-1 py-12">
                            <span>┌────────────────────────────────────────┐</span>
                            <span>│ No tracking events triggered yet.      │</span>
                            <span>│ Trigger demo events, or test-buy items│</span>
                            <span>│ on the storefront to monitor logs.    │</span>
                            <span>└────────────────────────────────────────┘</span>
                          </div>
                        ) : (
                          pixelLogs.map((log) => (
                            <div key={log.id} className="pb-2 border-b border-slate-900/40 last:border-0 hover:bg-slate-900/10 p-1 rounded text-left">
                              <div className="flex items-center justify-between text-[11px] text-left">
                                <span className={`font-bold font-mono tracking-wide ${
                                  log.eventName === "Purchase" ? "text-emerald-400" :
                                  log.eventName === "AddToCart" ? "text-amber-400" :
                                  log.eventName === "InitiateCheckout" ? "text-indigo-400" :
                                  log.eventName === "ViewContent" ? "text-cyan-400" : "text-amber-300"
                                }`}>
                                  ⚡ facebook.fbq('track', '{log.eventName}')
                                </span>
                                <span className="text-slate-500 font-mono text-[9px]">
                                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                              </div>
                              {log.payload && (
                                <pre className="text-[10px] text-slate-400 mt-1 pl-4 overflow-x-auto select-all leading-tight text-left">
                                  {JSON.stringify(log.payload, null, 2)}
                                </pre>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Footer info lock indicator */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 text-slate-500 text-[10px] font-mono flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure connection established strictly inside AI Studio sandboxed container.</span>
          </div>
          <div>
            <span>Developed for ZSHOP BD Retail Ltd.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
