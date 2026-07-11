import React, { useState, useEffect } from "react";
import { 
  X, 
  Lock, 
  User, 
  Smartphone, 
  Upload, 
  ShoppingBag, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Calendar, 
  Truck, 
  History, 
  Clock, 
  MapPin, 
  LogOut,
  Sparkles,
  ChevronRight,
  Store,
  Plus,
  Trash2,
  FileText,
  Layers,
  Coins,
  Copy,
  Download,
  Link,
  Check,
  ExternalLink,
  Camera,
  LayoutDashboard,
  CreditCard,
  ArrowUpRight,
  ChevronDown,
  Edit2,
  Heart,
  Star,
  Tag,
  TrendingUp
} from "lucide-react";
import { Order, Product } from "../types";
import { PRODUCTS } from "../data";
import { compressImage } from "../lib/utils";

export interface CustomerSession {
  phone: string;
  name: string;
  avatar: string;
}

export interface MerchantSession {
  phone: string;
  name: string;
  shopName: string;
  avatar: string;
  address: string;
  facebookUrl?: string;
}

export interface AffiliateSession {
  phone: string;
  name: string;
  avatar: string;
  earnings: number;
  clicks: number;
  salesCount: number;
  password?: string;
}

interface CustomerProfileProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onSearchSelect?: (term: string) => void;
  onAddToCart?: (product: Product) => void;
}

export default function CustomerProfile({
  isOpen,
  onClose,
  orders: clientOrders,
  onSearchSelect,
  onAddToCart
}: CustomerProfileProps) {
  // Account type selector: "customer" | "merchant" | "affiliate"
  const [userType, setUserType] = useState<"customer" | "merchant" | "affiliate">("customer");

  // Mode selection: "login" | "register" | "profile"
  const [mode, setMode] = useState<"login" | "register" | "profile">("login");
  
  // ==================== Customer Auth State ====================
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regAvatar, setRegAvatar] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [activeCustomer, setActiveCustomer] = useState<CustomerSession | null>(null);
  const [userSearches, setUserSearches] = useState<string[]>([]);

  // ==================== Merchant Auth State ====================
  const [merchName, setMerchName] = useState("");
  const [merchShopName, setMerchShopName] = useState("");
  const [merchPhone, setMerchPhone] = useState("");
  const [merchPassword, setMerchPassword] = useState("");
  const [merchAddress, setMerchAddress] = useState("");
  const [merchAvatar, setMerchAvatar] = useState("");
  const [merchError, setMerchError] = useState("");
  const [merchSuccess, setMerchSuccess] = useState(false);

  const [activeMerchant, setActiveMerchant] = useState<MerchantSession | null>(null);
  const [merchantTab, setMerchantTab] = useState<"summary" | "add" | "products" | "orders">("summary");
  const [merchantFbUrl, setMerchantFbUrl] = useState("");
  const [isSavingFbUrl, setIsSavingFbUrl] = useState(false);
  const [fbUrlSuccessMsg, setFbUrlSuccessMsg] = useState("");

  useEffect(() => {
    if (activeMerchant) {
      setMerchantFbUrl(activeMerchant.facebookUrl || "");
    }
  }, [activeMerchant]);

  // ==================== Affiliate Auth State ====================
  const [affName, setAffName] = useState("");
  const [affPhone, setAffPhone] = useState("");
  const [affPassword, setAffPassword] = useState("");
  const [affAvatar, setAffAvatar] = useState("");
  const [affError, setAffError] = useState("");
  const [affSuccess, setAffSuccess] = useState(false);
  const [activeAffiliate, setActiveAffiliate] = useState<AffiliateSession | null>(null);
  const [affiliateTab, setAffiliateTab] = useState<"dashboard" | "products">("dashboard");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);
  
  // ==================== Merchant Dashboard Data ====================
  const [merchantProducts, setMerchantProducts] = useState<Product[]>([]);
  const [serverOrders, setServerOrders] = useState<Order[]>([]);
  const [selectedMerchantOrderId, setSelectedMerchantOrderId] = useState<string | null>(null);
  const [salesOverviewMetric, setSalesOverviewMetric] = useState<"revenue" | "orders">("revenue");
  const [salesTimeframe, setSalesTimeframe] = useState<"monthly" | "weekly">("monthly");
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  
  // Add Product Form State
  const [prodTitle, setProdTitle] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodOriginalPrice, setProdOriginalPrice] = useState("");
  const [prodCategory, setProdCategory] = useState("clothing");
  const [prodImage, setProdImage] = useState("");
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodVideos, setProdVideos] = useState<string[]>([]);
  const [prodImageSource, setProdImageSource] = useState<"link" | "upload">("link");
  const [prodSizes, setProdSizes] = useState("M, L, XL");
  const [prodColors, setProdColors] = useState("Black, Blue");
  const [prodDescription, setProdDescription] = useState("");
  const [prodInStock, setProdInStock] = useState(true);
  const [prodCommission, setProdCommission] = useState<string>("10"); // new: Affiliate Commission %
  const [prodIsAffiliateReady, setProdIsAffiliateReady] = useState(true);
  const [prodAffiliateCommission, setProdAffiliateCommission] = useState("100");
  const [isNewProdSuccess, setIsNewProdSuccess] = useState(false);

  // ==================== Customer Custom Dashboard States ====================
  const [customerTab, setCustomerTab] = useState<"dashboard" | "orders" | "addresses" | "wishlist" | "details" | "payments">("dashboard");
  const [custEmail, setCustEmail] = useState(() => localStorage.getItem("zshop_bd_customer_email_v1") || "rofh@gmail.com");
  const [custAddress, setCustAddress] = useState(() => localStorage.getItem("zshop_bd_customer_address_v1") || "903 Inspiect 4th Spread,\nCitite 2\nDhaka, Banglada");
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [wishlistVersion, setWishlistVersion] = useState(0);

  // ==================== Guest Order Tracking & Help Center States ====================
  const [showGuestTrack, setShowGuestTrack] = useState(false);
  const [guestOrderId, setGuestOrderId] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestTrackResult, setGuestTrackResult] = useState<any | null>(null);
  const [guestTrackError, setGuestTrackError] = useState("");
  const [guestTrackSubmitted, setGuestTrackSubmitted] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  // Saved Payments States
  const [savedPayments, setSavedPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newPaymentType, setNewPaymentType] = useState<"bkash" | "nagad" | "rocket" | "card">("bkash");
  const [newPaymentName, setNewPaymentName] = useState("");
  const [newPaymentAccountNo, setNewPaymentAccountNo] = useState("");
  const [newPaymentCardNo, setNewPaymentCardNo] = useState("");
  const [newPaymentHolder, setNewPaymentHolder] = useState("");
  const [newPaymentExpires, setNewPaymentExpires] = useState("");
  const [newPaymentIsPrimary, setNewPaymentIsPrimary] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // ==================== Merchant Custom Dashboard States ====================
  const [forumOrderId, setForumOrderId] = useState("");
  const [forumCustomerName, setForumCustomerName] = useState("");
  const [forumEmailDate, setForumEmailDate] = useState("");
  const [forumStatus, setForumStatus] = useState("Pending");
  const [forumSearch, setForumSearch] = useState("");
  const [merchantSearchQuery, setMerchantSearchQuery] = useState("");

  // ==================== Affiliate Custom Dashboard States ====================
  const [affSelectedProdId, setAffSelectedProdId] = useState<string>("");
  const [affGeneratedLinkInput, setAffGeneratedLinkInput] = useState<string>("");
  const [isAffLinkCopied, setIsAffLinkCopied] = useState(false);
  const [marketingToolActiveTab, setMarketingToolActiveTab] = useState<"quick" | "banners" | "text_links" | "text_link">("quick");
  const [graphFilter, setGraphFilter] = useState("all-time");
  const [affSearchQuery, setAffSearchQuery] = useState("");

  // Load session & configuration on mount or whenever open
  const loadActiveSession = async () => {
    try {
      // 1. Check Customer Session
      const activeCustomerRaw = localStorage.getItem("zshop_bd_active_customer_session_v1");
      // 2. Check Merchant Session
      const activeMerchantRaw = localStorage.getItem("zshop_bd_active_merchant_session_v1");
      // 3. Check Affiliate Session
      const activeAffiliateRaw = localStorage.getItem("zshop_bd_active_affiliate_session_v1");

      if (activeAffiliateRaw) {
        const sessionObj = JSON.parse(activeAffiliateRaw);
        setActiveAffiliate(sessionObj);
        setUserType("affiliate");
        setMode("profile");
        // Pull latest affiliate count/stats from server if they had registered
        try {
          const res = await fetch("/api/affiliates/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: sessionObj.phone, password: sessionObj.password })
          });
          const d = await res.json();
          if (d.success) {
            const freshObj = { ...d.affiliate, password: sessionObj.password };
            setActiveAffiliate(freshObj);
            localStorage.setItem("zshop_bd_active_affiliate_session_v1", JSON.stringify(freshObj));
          }
        } catch (e) {
          console.error("Affiliate status sync error:", e);
        }
        // Fetch all products and orders
        try {
          const res = await fetch("/api/products");
          const d = await res.json();
          if (d.success) {
            setAllProducts(d.products || []);
          }
        } catch {}
        try {
          const res = await fetch("/api/orders");
          const d = await res.json();
          if (d.success) {
            setServerOrders(d.orders || []);
          }
        } catch {}
      } else if (activeMerchantRaw) {
        const sessionObj = JSON.parse(activeMerchantRaw);
        setActiveMerchant(sessionObj);
        setUserType("merchant");
        setMode("profile");
        await fetchMerchantData(sessionObj.phone);
      } else if (activeCustomerRaw) {
        const sessionObj = JSON.parse(activeCustomerRaw);
        setActiveCustomer(sessionObj);
        setUserType("customer");
        setMode("profile");

        // Pre-populate editing states
        setEditName(sessionObj.name || "");
        setEditPhone(sessionObj.phone || "");
        const storedEmail = localStorage.getItem("zshop_bd_customer_email_v1") || "rofh@gmail.com";
        setEditEmail(storedEmail);
        setCustEmail(storedEmail);
        const storedAddress = localStorage.getItem("zshop_bd_customer_address_v1") || "903 Inspiect 4th Spread,\nCitite 2\nDhaka, Banglada";
        setEditAddress(storedAddress);
        setCustAddress(storedAddress);

        // Load searches
        const searchesRaw = localStorage.getItem(`zshop_bd_user_searches_${sessionObj.phone}`);
        setUserSearches(searchesRaw ? JSON.parse(searchesRaw) : []);

        // Fetch saved payments
        fetchSavedPayments(sessionObj.phone);

        // Fetch all products for dynamic wishlist
        try {
          const res = await fetch("/api/products");
          const d = await res.json();
          if (d.success) {
            setAllProducts(d.products || []);
          }
        } catch (e) {
          console.error("Error loading products for customer:", e);
        }
      } else {
        setActiveCustomer(null);
        setActiveMerchant(null);
        setActiveAffiliate(null);
        setMode("login");
      }
    } catch (err) {
      console.error("Session load error:", err);
      setMode("login");
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadActiveSession();
      document.body.style.overflow = "hidden";
      window.scrollTo({ top: 0, behavior: "instant" });
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Synchronize customer searches
  useEffect(() => {
    if (isOpen && activeCustomer) {
      const handleSearchesSync = () => {
        try {
          const searchesRaw = localStorage.getItem(`zshop_bd_user_searches_${activeCustomer.phone}`);
          setUserSearches(searchesRaw ? JSON.parse(searchesRaw) : []);
        } catch (e) {
          console.error(e);
        }
      };
      
      window.addEventListener("customer_searches_update", handleSearchesSync);
      return () => window.removeEventListener("customer_searches_update", handleSearchesSync);
    }
  }, [isOpen, activeCustomer]);

  // Synchronize customer wishlist
  useEffect(() => {
    if (isOpen) {
      const handleWishlistSync = () => {
        setWishlistVersion(v => v + 1);
      };
      window.addEventListener("zshop_bd_wishlist_update", handleWishlistSync);
      return () => window.removeEventListener("zshop_bd_wishlist_update", handleWishlistSync);
    }
  }, [isOpen]);

  // Synchronize accounts update (e.g. verification status)
  useEffect(() => {
    const handleAccountsSync = () => {
      if (activeMerchant) {
        try {
          const saved = localStorage.getItem("zshop_bd_merchants_v1");
          if (saved) {
            const merchants = JSON.parse(saved);
            const matched = merchants.find((m: any) => m.phone === activeMerchant.phone);
            if (matched) {
              const updatedSession = {
                ...activeMerchant,
                ...matched
              };
              setActiveMerchant(updatedSession);
              localStorage.setItem("zshop_bd_active_merchant_session_v1", JSON.stringify(updatedSession));
            }
          }
        } catch (e) {
          console.error("Failed to sync active merchant details:", e);
        }
      }
    };

    window.addEventListener("zshop_bd_accounts_updated", handleAccountsSync);
    return () => window.removeEventListener("zshop_bd_accounts_updated", handleAccountsSync);
  }, [activeMerchant]);

  const fetchSavedPayments = async (phone: string) => {
    setLoadingPayments(true);
    try {
      const res = await fetch(`/api/customers/payments?phone=${encodeURIComponent(phone)}`);
      const d = await res.json();
      if (d.success) {
        setSavedPayments(d.payments || []);
      }
    } catch (e) {
      console.error("Error loading saved payments:", e);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer) return;
    
    setPaymentError("");
    const phone = activeCustomer.phone;
    
    if (newPaymentType === "card") {
      if (!newPaymentName || !newPaymentCardNo || !newPaymentHolder || !newPaymentExpires) {
        setPaymentError("সবগুলো প্রয়োজনীয় তথ্য পূরণ করুন।");
        return;
      }
    } else {
      if (!newPaymentName || !newPaymentAccountNo || !newPaymentHolder) {
        setPaymentError("সবগুলো প্রয়োজনীয় তথ্য পূরণ করুন।");
        return;
      }
    }
    
    try {
      const res = await fetch("/api/customers/payments/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          type: newPaymentType,
          name: newPaymentName,
          accountNo: newPaymentType !== "card" ? newPaymentAccountNo : undefined,
          cardNo: newPaymentType === "card" ? newPaymentCardNo : undefined,
          holder: newPaymentHolder,
          expires: newPaymentType === "card" ? newPaymentExpires : undefined,
          isPrimary: newPaymentIsPrimary
        })
      });
      const d = await res.json();
      if (d.success) {
        setSavedPayments(d.payments || []);
        setShowAddPaymentModal(false);
        setNewPaymentName("");
        setNewPaymentAccountNo("");
        setNewPaymentCardNo("");
        setNewPaymentHolder("");
        setNewPaymentExpires("");
        setNewPaymentIsPrimary(false);
      } else {
        setPaymentError(d.message || "পেমেন্ট মেথড যোগ করতে সমস্যা হয়েছে।");
      }
    } catch (err: any) {
      setPaymentError(err.message || "পেমেন্ট মেথড যোগ করতে সমস্যা হয়েছে।");
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!activeCustomer) return;
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই পেমেন্ট মেথডটি মুছে ফেলতে চান?")) return;
    
    try {
      const res = await fetch("/api/customers/payments/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: activeCustomer.phone,
          id
        })
      });
      const d = await res.json();
      if (d.success) {
        setSavedPayments(d.payments || []);
      }
    } catch (e) {
      console.error("Error deleting payment method:", e);
    }
  };

  // Fetch Merchant Products and Global Orders
  const fetchMerchantData = async (phone: string) => {
    try {
      // Fetch Products
      const rProd = await fetch("/api/products");
      const dProd = await rProd.json();
      if (dProd.success) {
        const filtered = dProd.products.filter((p: Product) => p.merchantPhone === phone);
        setMerchantProducts(filtered);
      }

      // Fetch Global Orders to calculate Shop Sales
      const rOrd = await fetch("/api/orders");
      const dOrd = await rOrd.json();
      if (dOrd.success) {
        setServerOrders(dOrd.orders);
      }
    } catch (err) {
      console.error("Error fetching merchant data:", err);
    }
  };

  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Profile Avatar Upload Handler
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        let base64 = reader.result as string;
        // Compress avatar image (avatar is smaller, e.g. max 300x300 for optimal performance)
        base64 = await compressImage(base64, 300, 300, 0.6);

        if (userType === "customer") {
          setRegAvatar(base64);
          if (activeCustomer) {
            const updated = { ...activeCustomer, avatar: base64 };
            setActiveCustomer(updated);
            localStorage.setItem("zshop_bd_active_customer_session_v1", JSON.stringify(updated));
            window.dispatchEvent(new Event("active_customer_navbar_sync"));
            fetch("/api/customers/update-avatar", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phone: activeCustomer.phone, avatar: base64 })
            }).catch(err => console.error("Error updating customer avatar:", err));
          }
        } else if (userType === "merchant") {
          setMerchAvatar(base64);
          if (activeMerchant) {
            const updated = { ...activeMerchant, avatar: base64 };
            setActiveMerchant(updated);
            localStorage.setItem("zshop_bd_active_merchant_session_v1", JSON.stringify(updated));
            fetch("/api/merchants/update-avatar", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phone: activeMerchant.phone, avatar: base64 })
            }).catch(err => console.error("Error updating merchant avatar:", err));
          }
        } else {
          setAffAvatar(base64);
          if (activeAffiliate) {
            const updated = { ...activeAffiliate, avatar: base64 };
            setActiveAffiliate(updated);
            localStorage.setItem("zshop_bd_active_affiliate_session_v1", JSON.stringify(updated));
            fetch("/api/affiliates/update-avatar", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phone: activeAffiliate.phone, avatar: base64 })
            }).catch(err => console.error("Error updating affiliate avatar:", err));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Product Photo Upload Handler (Merchant panel)
  const handleProductPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        let base64 = reader.result as string;
        // Compress product image
        base64 = await compressImage(base64, 800, 800, 0.7);
        setProdImage(base64);
        setProdImages([base64]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Product Multi Photo & Video Upload Handler (Merchant panel)
  const handleProductMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          let resultStr = reader.result as string;
          if (file.type.startsWith("image/")) {
            // Compress product image
            resultStr = await compressImage(resultStr, 800, 800, 0.7);
            setProdImages((prev) => [...prev, resultStr]);
          } else if (file.type.startsWith("video/")) {
            setProdVideos((prev) => [...prev, resultStr]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleUpdateMerchantFbUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMerchant) return;
    setIsSavingFbUrl(true);
    setFbUrlSuccessMsg("");
    try {
      const res = await fetch("/api/merchants/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: activeMerchant.phone,
          facebookUrl: merchantFbUrl
        })
      });
      const d = await res.json();
      if (d.success) {
        const updated = { ...activeMerchant, facebookUrl: merchantFbUrl };
        setActiveMerchant(updated);
        localStorage.setItem("zshop_bd_active_merchant_session_v1", JSON.stringify(updated));
        setFbUrlSuccessMsg("ফেসবুক পেজের লিংক সফলভাবে সংরক্ষণ করা হয়েছে! 🎉");
        // Reload products so they have the latest link
        await fetchMerchantData(activeMerchant.phone);
        // Dispatch window event so that other parts of the UI reload products too!
        window.dispatchEvent(new Event("storage_orders_update"));
        const channel = new BroadcastChannel("zshop_bd_realtime");
        channel.postMessage("accounts_updated");
        channel.close();
        setTimeout(() => setFbUrlSuccessMsg(""), 4000);
      } else {
        alert(d.message || "সংরক্ষণ করতে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      console.error("Error saving facebook link:", err);
      alert("সার্ভার ত্রুটি, অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsSavingFbUrl(false);
    }
  };

  // ==================== ACTION HANDLERS ====================

  // Customer submit register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    const cleanPhone = regPhone.trim().replace(/\s+/g, "");
    if (!cleanPhone.match(/^[0-9]{11}$/)) {
      setRegError("দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন!");
      return;
    }

    if (regPassword.length < 4) {
      setRegError("নিরাপত্তার স্বার্থে পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে!");
      return;
    }

    try {
      const res = await fetch("/api/customers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          phone: cleanPhone,
          password: regPassword,
          avatar: regAvatar
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setRegError(data.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে।");
        return;
      }

      setRegSuccess(true);
      try {
        window.dispatchEvent(new Event("zshop_bd_accounts_updated"));
        const channel = new BroadcastChannel("zshop_bd_realtime");
        channel.postMessage("accounts_updated");
        channel.close();
      } catch (err) {
        console.error("Failed to notify accounts update:", err);
      }
      setTimeout(() => {
        setRegSuccess(false);
        setMode("login");
        setLoginPhone(cleanPhone);
        setLoginPassword(regPassword);
      }, 2000);

      setRegName("");
      setRegPhone("");
      setRegPassword("");
      setRegAvatar("");
    } catch {
      setRegError("অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে! আবার চেষ্টা করুন।");
    }
  };

  // Customer Guest Track Order
  const handleGuestTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGuestTrackSubmitted(true);
    setGuestTrackError("");
    setGuestTrackResult(null);

    const cleanId = guestOrderId.trim().toUpperCase().replace("#", "");
    const cleanPhone = guestPhone.trim().replace(/\s+/g, "");

    if (!cleanId || !cleanPhone) {
      setGuestTrackError("দয়া করে অর্ডার আইডি এবং মোবাইল নম্বর দিন।");
      return;
    }

    // Search clientOrders
    const foundOrder = (clientOrders || []).find((ord: any) => {
      const matchId = ord.id.toUpperCase().replace("#", "") === cleanId ||
                      ord.id.toUpperCase().replace("#", "").replace("ZSB-", "") === cleanId;
      const matchPhone = ord.phone.replace(/\s+/g, "").endsWith(cleanPhone) ||
                         cleanPhone.endsWith(ord.phone.replace(/\s+/g, ""));
      return matchId && matchPhone;
    });

    if (foundOrder) {
      setGuestTrackResult(foundOrder);
    } else {
      setGuestTrackError("দুঃখিত, এই অর্ডার আইডি এবং মোবাইল নম্বর দিয়ে কোনো অর্ডার পাওয়া যায়নি। সঠিক তথ্য দিয়ে পুনরায় চেষ্টা করুন।");
    }
  };

  // Customer submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const cleanPhone = loginPhone.trim().replace(/\s+/g, "");
    
    try {
      const res = await fetch("/api/customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.message || "লগইন ব্যর্থ হয়েছে!");
        return;
      }

      const sessionObj: CustomerSession = data.user;
      localStorage.setItem("zshop_bd_active_customer_session_v1", JSON.stringify(sessionObj));
      setActiveCustomer(sessionObj);
      
      // Initialize editing states
      setEditName(sessionObj.name || "");
      setEditPhone(sessionObj.phone || "");
      const storedEmail = localStorage.getItem("zshop_bd_customer_email_v1") || "rofh@gmail.com";
      setEditEmail(storedEmail);
      setCustEmail(storedEmail);
      const storedAddress = localStorage.getItem("zshop_bd_customer_address_v1") || "903 Inspiect 4th Spread,\nCitite 2\nDhaka, Banglada";
      setEditAddress(storedAddress);
      setCustAddress(storedAddress);

      setMode("profile");

      // Sync customer orders to local if any
      if (data.orders) {
        localStorage.setItem("zshop_bd_orders_v1", JSON.stringify(data.orders));
        window.dispatchEvent(new Event("storage_orders_update"));
      }

      window.dispatchEvent(new Event("active_customer_navbar_sync"));
    } catch {
      setLoginError("লগইন করতে ব্যর্থ হয়েছি। অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
  };

  // Merchant submit register
  const handleMerchantRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMerchError("");

    const cleanPhone = merchPhone.trim().replace(/\s+/g, "");
    if (!cleanPhone.match(/^[0-9]{11}$/)) {
      setMerchError("দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন!");
      return;
    }

    if (merchPassword.length < 4) {
      setMerchError("পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে!");
      return;
    }

    try {
      const res = await fetch("/api/merchants/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: merchName.trim(),
          shopName: merchShopName.trim(),
          phone: cleanPhone,
          password: merchPassword,
          address: merchAddress.trim(),
          avatar: merchAvatar
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMerchError(data.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে।");
        return;
      }

      setMerchSuccess(true);
      try {
        window.dispatchEvent(new Event("zshop_bd_accounts_updated"));
        const channel = new BroadcastChannel("zshop_bd_realtime");
        channel.postMessage("accounts_updated");
        channel.close();
      } catch (err) {
        console.error("Failed to notify accounts update:", err);
      }
      setTimeout(() => {
        setMerchSuccess(false);
        setMode("login");
        setLoginPhone(cleanPhone);
        setLoginPassword(merchPassword);
      }, 2000);

      setMerchName("");
      setMerchShopName("");
      setMerchPhone("");
      setMerchPassword("");
      setMerchAddress("");
      setMerchAvatar("");
    } catch {
      setMerchError("অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে! আবার চেষ্টা করুন।");
    }
  };

  // Merchant submit login
  const handleMerchantLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMerchError("");

    const cleanPhone = loginPhone.trim().replace(/\s+/g, "");
    
    try {
      const res = await fetch("/api/merchants/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMerchError(data.message || "ভুল মার্চেন্ট আইডি বা পাসওয়ার্ড!");
        return;
      }

      const sessionObj: MerchantSession = data.merchant;
      localStorage.setItem("zshop_bd_active_merchant_session_v1", JSON.stringify(sessionObj));
      setActiveMerchant(sessionObj);
      setMode("profile");

      if (data.products) {
        setMerchantProducts(data.products);
      }

      await fetchMerchantData(sessionObj.phone);
    } catch {
      setMerchError("লগইন করতে ব্যর্থ হয়েছি। দয়া করে পুনরায় চেষ্টা করুন।");
    }
  };

  // Affiliate submit register
  const handleAffiliateRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAffError("");

    const cleanPhone = affPhone.trim().replace(/\s+/g, "");
    if (!cleanPhone.match(/^[0-9]{11}$/)) {
      setAffError("দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন!");
      return;
    }

    if (affPassword.length < 4) {
      setAffError("পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে!");
      return;
    }

    try {
      const res = await fetch("/api/affiliates/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: affName.trim(),
          phone: cleanPhone,
          password: affPassword,
          avatar: affAvatar
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAffError(data.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে।");
        return;
      }

      setAffSuccess(true);
      try {
        window.dispatchEvent(new Event("zshop_bd_accounts_updated"));
        const channel = new BroadcastChannel("zshop_bd_realtime");
        channel.postMessage("accounts_updated");
        channel.close();
      } catch (err) {
        console.error("Failed to notify accounts update:", err);
      }
      setTimeout(() => {
        setAffSuccess(false);
        setMode("login");
        setLoginPhone(cleanPhone);
        setLoginPassword(affPassword);
      }, 2000);

      setAffName("");
      setAffPhone("");
      setAffPassword("");
      setAffAvatar("");
    } catch {
      setAffError("অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে! আবার চেষ্টা করুন।");
    }
  };

  // Affiliate submit login
  const handleAffiliateLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAffError("");

    const cleanPhone = loginPhone.trim().replace(/\s+/g, "");
    if (!cleanPhone) {
      setAffError("মোবাইল নম্বর প্রদান করুন!");
      return;
    }

    try {
      const res = await fetch("/api/affiliates/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAffError(data.message || "ভুল এফিলিয়েট নম্বর অথবা পাসওয়ার্ড!");
        return;
      }

      const sessionObj = { ...data.affiliate, password: loginPassword };
      localStorage.setItem("zshop_bd_active_affiliate_session_v1", JSON.stringify(sessionObj));
      setActiveAffiliate(sessionObj);
      setMode("profile");

      // Fetch all products
      const pRes = await fetch("/api/products");
      const pData = await pRes.json();
      if (pData.success) {
        setAllProducts(pData.products || []);
      }
    } catch {
      setAffError("আভ্যান্তরীন সার্ভার ত্রুটি! দয়া করে আবার চেষ্টা করুন।");
    }
  };

  // Download product image utility for Affiliates
  const handleDownloadProductImage = async (imgUrl: string, title: string) => {
    try {
      if (imgUrl.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = imgUrl;
        a.download = `${title.replace(/\s+/g, "_")}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/\s+/g, "_")}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      // Fallback open in new window with reference
      const a = document.createElement("a");
      a.href = imgUrl;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.click();
    }
  };

  // Merchant add product submit
  const handleMerchantAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMerchant) return;

    try {
      const discountPct = prodOriginalPrice && parseFloat(prodOriginalPrice) > parseFloat(prodPrice)
        ? `${Math.round(((parseFloat(prodOriginalPrice) - parseFloat(prodPrice)) / parseFloat(prodOriginalPrice)) * 100)}% OFF`
        : "";

      const finalImages = prodImages.length > 0 ? prodImages : (prodImage ? [prodImage] : []);
      const primaryImage = finalImages[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600";
      const primaryVideo = prodVideos[0] || undefined;

      const productPayload = {
        title: prodTitle.trim(),
        price: parseFloat(prodPrice),
        originalPrice: prodOriginalPrice ? parseFloat(prodOriginalPrice) : undefined,
        discountTag: discountPct || undefined,
        image: primaryImage,
        images: finalImages,
        video: primaryVideo,
        videos: prodVideos,
        category: prodCategory,
        description: prodDescription.trim() || `${prodTitle}. Verified Seller Direct authenticated product on ZSHOP BD.`,
        sizes: prodSizes ? prodSizes.split(",").map(s => s.trim()) : [],
        colors: prodColors ? prodColors.split(",").map(c => c.trim()) : [],
        merchantPhone: activeMerchant.phone,
        merchantShopName: activeMerchant.shopName,
        isTrending: false,
        isNewArrival: true,
        inStock: prodInStock,
        isAffiliateReady: prodIsAffiliateReady,
        affiliateCommission: parseFloat(prodAffiliateCommission) || 0,
        affCommission: Math.round(((parseFloat(prodAffiliateCommission) || 0) / parseFloat(prodPrice)) * 100) || 10
      };

      const res = await fetch("/api/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: productPayload })
      });
      const data = await res.json();
      if (data.success) {
        setIsNewProdSuccess(true);
        setTimeout(() => {
          setIsNewProdSuccess(false);
          setMerchantTab("products");
        }, 1500);

        // Reset form
        setProdTitle("");
        setProdPrice("");
        setProdOriginalPrice("");
        setProdImage("");
        setProdImages([]);
        setProdVideos([]);
        setProdDescription("");
        setProdIsAffiliateReady(true);
        setProdAffiliateCommission("100");

        // Trigger global application state load
        await fetchMerchantData(activeMerchant.phone);
        window.dispatchEvent(new Event("products_db_sync_update"));
      }
    } catch (err) {
      alert("প্রোডাক্ট যোগ করতে ত্রুটি হয়েছে!");
    }
  };

  // Delete product (As a seller)
  const handleMerchantDeleteProduct = async (prodId: string) => {
    if (!activeMerchant) return;
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই প্রোডাক্টটি চিরতরে মুছে ফেলতে চান?")) return;

    try {
      // Prevent client restore/sync of deleted product
      try {
        const deletedRaw = localStorage.getItem("zshop_bd_deleted_products_v1");
        const deletedIds = deletedRaw ? JSON.parse(deletedRaw) : [];
        if (!deletedIds.includes(prodId)) {
          deletedIds.push(prodId);
          localStorage.setItem("zshop_bd_deleted_products_v1", JSON.stringify(deletedIds));
        }
        const localRaw = localStorage.getItem("zshop_bd_products_v1");
        if (localRaw) {
          const localProducts = JSON.parse(localRaw);
          const filtered = localProducts.filter((p: any) => p.id !== prodId);
          localStorage.setItem("zshop_bd_products_v1", JSON.stringify(filtered));
        }
      } catch (e) {
        console.error("Local storage delete error:", e);
      }

      const res = await fetch("/api/products/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prodId })
      });
      const data = await res.json();
      if (data.success) {
        await fetchMerchantData(activeMerchant.phone);
        window.dispatchEvent(new Event("products_db_sync_update"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Stock status
  const handleToggleProductStock = async (prod: Product) => {
    if (!activeMerchant) return;
    try {
      const updated = { ...prod, inStock: !prod.inStock };
      const res = await fetch("/api/products/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: updated })
      });
      const data = await res.json();
      if (data.success) {
        await fetchMerchantData(activeMerchant.phone);
        window.dispatchEvent(new Event("products_db_sync_update"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled") => {
    if (!activeMerchant) return;
    const updatedOrders = serverOrders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });

    try {
      const res = await fetch("/api/admin/orders/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: updatedOrders })
      });
      const data = await res.json();
      if (data.success) {
        setServerOrders(updatedOrders);
        window.dispatchEvent(new Event("order_status_update"));
      } else {
        alert("অর্ডার স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  // Universal Logout
  const handleLogout = () => {
    try {
      if (userType === "customer") {
        localStorage.removeItem("zshop_bd_active_customer_session_v1");
        setActiveCustomer(null);
      } else if (userType === "merchant") {
        localStorage.removeItem("zshop_bd_active_merchant_session_v1");
        setActiveMerchant(null);
      } else {
        localStorage.removeItem("zshop_bd_active_affiliate_session_v1");
        setActiveAffiliate(null);
      }
      setMode("login");
      setLoginPhone("");
      setLoginPassword("");
      window.dispatchEvent(new Event("active_customer_navbar_sync"));
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearSearches = () => {
    if (activeCustomer) {
      try {
        localStorage.removeItem(`zshop_bd_user_searches_${activeCustomer.phone}`);
        setUserSearches([]);
        window.dispatchEvent(new Event("customer_searches_update"));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const activeOrders = userType === "customer" 
    ? clientOrders.filter(ord => ord.phone.replace(/\s+/g, "") === (activeCustomer?.phone || ""))
    : [];

  const currentWishlist = (allProducts.length > 0 ? allProducts : PRODUCTS).filter(
    p => localStorage.getItem(`zshop_bd_wishlist_${p.id}`) === "true"
  );

  const sortedCustomerOrders = [...activeOrders].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const latestCustomerOrder = sortedCustomerOrders[0] || null;

  // Filter orders related to this active merchant's products
  const connectedMerchantOrders = userType === "merchant" && activeMerchant
    ? serverOrders.filter(ord => 
        ord.cartItems.some(item => merchantProducts.some(p => p.id === item.productId))
      )
    : [];

  // Filter orders related to this active affiliate's referral
  const connectedAffiliateOrders = userType === "affiliate" && activeAffiliate
    ? serverOrders.filter(ord => ord.affiliatePhone === activeAffiliate.phone)
    : [];

  // Calculate earnings
  const completedEarnings = connectedMerchantOrders
    .filter(ord => ord.status === "Delivered")
    .reduce((totals, ord) => {
      // sum merchant products in this order
      const merchantSum = ord.cartItems
        .filter(item => merchantProducts.some(p => p.id === item.productId))
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return totals + merchantSum;
    }, 0);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-hidden" 
      id="customer-auth-portal"
      role="dialog"
      aria-modal="true"
    >
      {/* Dark frosted overlay */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300" 
      />

      {/* Primary Card Frame */}
      <div className={`relative w-full bg-white border border-gray-150 shadow-2xl flex flex-col justify-between overflow-hidden text-left transition-all duration-300 ${
        mode !== "profile"
          ? "max-w-[430px] rounded-3xl mx-auto my-auto h-auto max-h-[94vh]"
          : "h-full sm:h-[90vh] sm:max-w-5xl sm:rounded-2xl max-h-screen"
      }`}>
        
        {/* Header navigation tabs (Only in Auth login/reg view) */}
        {mode !== "profile" ? (
          <div className="bg-[#0b1329] text-white flex flex-col select-none border-b border-slate-800/20 shrink-0">
            <div className="px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#f85606] text-white flex items-center justify-center font-display font-black text-[#ffffff] text-lg shadow-sm border border-[#ff6e24]/10">
                  Z
                </div>
                <div>
                  <h3 className="font-sans font-black text-sm tracking-wide text-white uppercase">
                    CUSTOMER PORTAL (গ্রাহক)
                  </h3>
                </div>
              </div>
              <button 
                type="button"
                onClick={onClose}
                className="p-1 px-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer font-bold transition-all hover:bg-white/5 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector tab switch - ZSHOP BD UI aesthetics */}
            <div className="flex bg-[#131d31] px-1 border-t border-slate-900/60 font-sans">
              <button 
                type="button"
                onClick={() => { setUserType("customer"); setMode("login"); }}
                className={`flex-1 py-2.5 sm:py-3.5 text-[10px] sm:text-[11px] font-extrabold text-center transition-all cursor-pointer ${
                  userType === "customer" 
                    ? "border-b-2 border-[#facc15] text-[#facc15]" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🛍️ গ্রাহক (Buyer)
              </button>
              <button 
                type="button"
                onClick={() => { setUserType("merchant"); setMode("login"); }}
                className={`flex-1 py-2.5 sm:py-3.5 text-[10px] sm:text-[11px] font-extrabold text-center transition-all cursor-pointer ${
                  userType === "merchant" 
                    ? "border-b-2 border-rose-500 text-rose-500" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🏪 মার্চেন্ট (Seller)
              </button>
              <button 
                type="button"
                onClick={() => { setUserType("affiliate"); setMode("login"); }}
                className={`flex-1 py-2.5 sm:py-3.5 text-[10px] sm:text-[11px] font-extrabold text-center transition-all cursor-pointer ${
                  userType === "affiliate" 
                    ? "border-b-2 border-indigo-400 text-indigo-400" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🤝 এফিলিয়েট (Affiliate)
              </button>
            </div>
          </div>
        ) : (
          /* Profile Mode Header */
          <div className="px-5 py-4 border-b border-gray-100 bg-[#0a1122] text-white flex items-center justify-between">
            <div className="flex items-center gap-2 font-sans">
              <div className={`w-7 h-7 rounded-lg ${
                userType === "customer" 
                  ? "bg-amber-400 text-slate-950" 
                  : userType === "merchant"
                    ? "bg-rose-600 text-white"
                    : "bg-indigo-600 text-white"
              } flex items-center justify-center font-display font-black text-sm`}>
                {userType === "customer" ? "C" : userType === "merchant" ? "S" : "A"}
              </div>
              <div>
                <h3 className="font-sans font-extrabold text-xs tracking-wider uppercase text-slate-200">
                  {userType === "customer" 
                    ? "Customer Dashboard (গ্রাহক পোর্টাল)" 
                    : userType === "merchant"
                      ? `${activeMerchant?.shopName} Seller Dashboard`
                      : `${activeAffiliate?.name} Affiliate Dashboard`}
                </h3>
                <p className="text-[9px] text-slate-400 font-mono">
                  {userType === "customer" 
                    ? "Orders, History & Device Sync" 
                    : userType === "merchant"
                      ? "Products Listing & Orders Sales"
                      : "Commissions, Downloads & Dynamic Product Links"}
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-1 px-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer font-bold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content Portal Body */}
        <div className={`flex-1 overflow-y-auto ${mode !== "profile" ? "p-4 sm:p-6 bg-white" : "p-5 sm:p-6 bg-slate-50/50"} transition-all duration-300`}>

          {/* ================================================================ */}
          {/* ====================== CUSTOMER FLOW =========================== */}
          {/* ================================================================ */}
          {userType === "customer" && (
            <>
              {/* Guest Order Tracking & Help Center */}
              {showGuestTrack && mode !== "profile" && (
                <div className="space-y-6 text-slate-800 font-sans" id="customer-guest-track-step">
                  <div className="text-center space-y-1">
                    <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-1">
                      HELP & TRACKING
                    </span>
                    <h4 className="text-base sm:text-lg font-extrabold text-[#f85606] tracking-tight">
                      অর্ডার ট্র্যাকার ও সাহায্য কেন্দ্র
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                      যেকোনো অর্ডারের বর্তমান অবস্থা এবং আমাদের কাস্টমার সার্ভিসের সাথে যোগাযোগ করুন এখান থেকেই।
                    </p>
                  </div>

                  {/* 1. Track Order Form Card */}
                  <div className="bg-slate-50 rounded-2xl border border-gray-150 p-4 shadow-xs">
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#f85606]" /> আপনার অর্ডার ট্র্যাক করুন (Track Order)
                    </h5>

                    <form onSubmit={handleGuestTrackSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-mono tracking-wider text-gray-500 uppercase mb-1 font-bold">
                            ORDER ID (অর্ডার আইডি) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="যেমন: ZSB-123456"
                            value={guestOrderId}
                            onChange={(e) => setGuestOrderId(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-[#ffad00] focus:ring-1 focus:ring-[#ffad00] rounded-xl text-xs text-slate-800 focus:outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono tracking-wider text-gray-500 uppercase mb-1 font-bold">
                            MOBILE NUMBER (মোবাইল নম্বর) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="যেমন: 01712345678"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-[#ffad00] focus:ring-1 focus:ring-[#ffad00] rounded-xl text-xs text-slate-800 focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5"
                      >
                        <Search className="w-4 h-4" /> ট্র্যাক করুন (SEARCH ORDER)
                      </button>
                    </form>

                    {/* Result and Error feedback */}
                    {guestTrackSubmitted && guestTrackError && (
                      <div className="mt-4 p-3.5 bg-red-50 text-red-700 text-xs rounded-xl flex items-start gap-2.5 border border-red-100/60 leading-relaxed text-left">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-bold">তথ্য মেলেনি!</p>
                          <p className="mt-0.5 text-red-600 font-medium">{guestTrackError}</p>
                        </div>
                      </div>
                    )}

                    {guestTrackSubmitted && guestTrackResult && (
                      <div className="mt-4 p-4 bg-white border border-emerald-150 rounded-xl space-y-4 animate-fade-in text-left">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-400">ORDER NO</span>
                            <h6 className="text-xs font-black text-[#f85606] font-mono tracking-wider">{guestTrackResult.id}</h6>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-mono font-bold text-slate-400">STATUS</span>
                            <div>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                guestTrackResult.status === "Delivered" ? "bg-emerald-100 text-emerald-800" :
                                guestTrackResult.status === "Cancelled" ? "bg-red-100 text-red-800" :
                                guestTrackResult.status === "Shipped" ? "bg-blue-100 text-blue-800" :
                                guestTrackResult.status === "Confirmed" ? "bg-amber-100 text-amber-800" :
                                "bg-slate-100 text-slate-700"
                              }`}>
                                {guestTrackResult.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Visual Status Steps */}
                        <div className="py-2">
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">ডেলিভারি ট্র্যাকিং (Delivery Status)</p>
                          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                            
                            {/* Step 1: Placed */}
                            <div className="relative">
                              <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 border border-white flex items-center justify-center shadow-xs">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </span>
                              <p className="text-xs font-bold text-slate-800">অর্ডার সফলভাবে সম্পন্ন হয়েছে (Order Placed)</p>
                              <p className="text-[10px] text-slate-400 font-medium">তারিখ: {new Date(guestTrackResult.timestamp).toLocaleString("bn-BD") || "আজ"}</p>
                            </div>

                            {/* Step 2: Confirmed */}
                            <div className="relative">
                              <span className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border border-white flex items-center justify-center shadow-xs ${
                                ["Confirmed", "Shipped", "Delivered"].includes(guestTrackResult.status)
                                  ? "bg-emerald-500"
                                  : "bg-slate-200"
                              }`}>
                                {["Confirmed", "Shipped", "Delivered"].includes(guestTrackResult.status) && <Check className="w-2.5 h-2.5 text-white" />}
                              </span>
                              <p className={`text-xs font-bold ${
                                ["Confirmed", "Shipped", "Delivered"].includes(guestTrackResult.status) ? "text-slate-800" : "text-slate-400"
                              }`}>
                                অর্ডার নিশ্চিত করা হয়েছে (Order Confirmed)
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">আমাদের টিম অর্ডারটি প্যাকেজিং করছে এবং কুরিয়ারে হস্তান্তরের জন্য প্রস্তুত করছে।</p>
                            </div>

                            {/* Step 3: Shipped */}
                            <div className="relative">
                              <span className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border border-white flex items-center justify-center shadow-xs ${
                                ["Shipped", "Delivered"].includes(guestTrackResult.status)
                                  ? "bg-emerald-500"
                                  : "bg-slate-200"
                              }`}>
                                {["Shipped", "Delivered"].includes(guestTrackResult.status) && <Check className="w-2.5 h-2.5 text-white" />}
                              </span>
                              <p className={`text-xs font-bold ${
                                ["Shipped", "Delivered"].includes(guestTrackResult.status) ? "text-slate-800" : "text-slate-400"
                              }`}>
                                কুরিয়ার সার্ভিসে পাঠানো হয়েছে (Shipped via Courier)
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {["Shipped", "Delivered"].includes(guestTrackResult.status) 
                                  ? `আপনার পার্সেলটি ${guestTrackResult.district === "dhaka" ? "RedX" : "Pathao / Steadfast"} কুরিয়ারের মাধ্যমে পাঠানো হয়েছে। ট্র্যাকিং কোড: TRK-${guestTrackResult.id.replace("ZSB-", "")}`
                                  : "কুরিয়ার সার্ভিসে হ্যান্ডওভার করার পর এখানে ট্র্যাকিং নম্বর দেখা যাবে।"}
                              </p>
                            </div>

                            {/* Step 4: Delivered */}
                            <div className="relative">
                              <span className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border border-white flex items-center justify-center shadow-xs ${
                                guestTrackResult.status === "Delivered"
                                  ? "bg-emerald-500"
                                  : "bg-slate-200"
                              }`}>
                                {guestTrackResult.status === "Delivered" && <Check className="w-2.5 h-2.5 text-white" />}
                              </span>
                              <p className={`text-xs font-bold ${
                                guestTrackResult.status === "Delivered" ? "text-emerald-600" : "text-slate-400"
                              }`}>
                                প্রোডাক্ট সফলভাবে ডেলিভারি হয়েছে (Delivered)
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">গ্রাহকের কাছে পার্সেলটি সফলভাবে হস্তান্তর করা হয়েছে। ZSHOP BD থেকে কেনাকাটার জন্য ধন্যবাদ!</p>
                            </div>

                          </div>
                        </div>

                        {/* Order Details Brief */}
                        <div className="bg-slate-50 rounded-xl p-3 border border-gray-100 space-y-2 text-xs font-sans">
                          <p className="font-bold text-slate-800 border-b border-slate-200/60 pb-1.5 mb-1.5">অর্ডার সারসংক্ষেপ:</p>
                          <div className="flex justify-between">
                            <span className="text-slate-500">গ্রাহকের নাম:</span>
                            <span className="font-bold text-slate-800">{guestTrackResult.customerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">ডেলিভারি ঠিকানা:</span>
                            <span className="font-bold text-slate-800 text-right max-w-[200px] leading-tight truncate">{guestTrackResult.address}, {guestTrackResult.district === "dhaka" ? "ঢাকা সিটি" : "ঢাকার বাইরে"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">পেমেন্ট পদ্ধতি:</span>
                            <span className="font-bold text-slate-800 uppercase">{guestTrackResult.paymentMethod}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-dashed border-gray-200 font-bold">
                            <span className="text-[#f85606]">সর্বমোট মূল্য (Total Payable):</span>
                            <span className="text-[#f85606] font-mono">৳{guestTrackResult.total}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Customer Expandable FAQ Center */}
                  <div className="bg-white rounded-2xl border border-gray-150 p-4 text-left">
                    <h5 className="text-xs font-black text-slate-850 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#f85606]" /> সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ Help)
                    </h5>

                    <div className="space-y-2">
                      {[
                        {
                          q: "ZSHOP BD থেকে কীভাবে অর্ডার করব?",
                          a: "আপনার পছন্দের প্রোডাক্টটির পেজ থেকে 'Buy Now' ক্লিক করুন অথবা কার্টে যুক্ত করে 'Checkout' সম্পন্ন করুন। আপনার নাম, ঠিকানা ও ১১ সংখ্যার সঠিক মোবাইল নম্বর দিয়ে অর্ডার প্লেস করুন।"
                        },
                        {
                          q: "পণ্য ডেলিভারি পেতে কতদিন সময় লাগবে?",
                          a: "ঢাকা সিটির ভিতরে ১-২ কার্যদিবস এবং ঢাকার বাইরে ৩-৫ কার্যদিবসের মধ্যে অত্যন্ত দ্রুততার সাথে ডেলিভারি নিশ্চিত করা হয়।"
                        },
                        {
                          q: "ডেলিভারি চার্জ কত?",
                          a: "ঢাকা সিটির ভিতরে ৬০ টাকা এবং ঢাকার বাইরে ১২০ টাকা ডেলিভারি চার্জ প্রযোজ্য।"
                        },
                        {
                          q: "প্রোডাক্টে কোনো সমস্যা থাকলে কি রিটার্ন করা যাবে?",
                          a: "অবশ্যই! ডেলিভারি ম্যানের সামনে প্রোডাক্ট চেক করে কোনো ত্রুটি বা সাইজে অমিল থাকলে সরাসরি রিটার্ন করতে পারবেন অথবা আমাদের হটলাইনে ফোন করে এক্সচেঞ্জ সুবিধা নিতে পারেন।"
                        }
                      ].map((faq, idx) => (
                        <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden transition-all duration-200">
                          <button
                            type="button"
                            onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/85 text-left flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer focus:outline-none"
                          >
                            <span>{faq.q}</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${openFaqIdx === idx ? "rotate-180" : ""}`} />
                          </button>
                          {openFaqIdx === idx && (
                            <div className="px-4 py-3 bg-white text-[11px] text-slate-600 leading-relaxed border-t border-slate-50 text-left">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Customer Service Contacts */}
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                    <div>
                      <h6 className="text-xs font-black text-emerald-800">২৪/৭ কাস্টমার কেয়ার ও সাপোর্ট</h6>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                        আপনার যেকোনো অর্ডার সংক্রান্ত প্রশ্ন বা অভিযোগের জন্য সরাসরি কথা বলুন আমাদের সাপোর্ট এজেন্টের সাথে।
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <a
                        href="tel:01888223470"
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 focus:outline-none"
                      >
                        📞 কল করুন
                      </a>
                      <a
                        href="https://wa.me/8801888223470"
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 focus:outline-none"
                      >
                        💬 হোয়াটসঅ্যাপ
                      </a>
                    </div>
                  </div>

                  {/* 4. Go Back to Login Button */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowGuestTrack(false);
                        setGuestTrackResult(null);
                        setGuestTrackSubmitted(false);
                        setGuestOrderId("");
                        setGuestPhone("");
                      }}
                      className="px-6 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-850 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 focus:outline-none"
                    >
                      ← গ্রাহক লগইন-এ ফিরে যান
                    </button>
                  </div>
                </div>
              )}

              {/* Customer Registration */}
              {!showGuestTrack && mode === "register" && (
                <div className="space-y-4 sm:space-y-5 text-slate-800 font-sans" id="customer-register-step">
                  <div className="text-center space-y-1">
                    <h4 className="text-base sm:text-lg font-extrabold text-[#f85606] tracking-tight">
                      নতুন গ্রাহক অ্যাকাউন্ট রেজিস্টার করুন
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                      নিচের ফর্মটি পূরণ করে আজই ZSHOP BD গ্রাহক পরিবারের অংশ হোন (যেকোনো মোবাইল থেকে অ্যাক্সেসযোগ্য!)
                    </p>
                  </div>

                  {regError && (
                    <div className="p-3 bg-red-55/10 text-red-650 text-xs rounded-xl flex items-center gap-2.5 border border-red-100">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <p className="font-semibold">{regError}</p>
                    </div>
                  )}

                  {regSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2.5 border border-emerald-100">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                      <p className="font-semibold">অ্যাকাউন্ট তৈরি সফল হয়েছে! লগইন ধাপে নিয়ে যাওয়া হচ্ছে...</p>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-3 sm:space-y-4">
                    <div className="border border-dashed border-gray-200 bg-slate-50/40 p-3 rounded-2xl flex flex-col items-center justify-center space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        PROFILE PHOTO (প্রোফাইল ছবি)
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="relative w-11 h-11 sm:w-14 sm:h-14 bg-gray-100 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                          {regAvatar ? (
                            <img src={regAvatar} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <button
                            type="button"
                            className="py-1.5 px-3 sm:py-2 sm:px-3.5 bg-[#111827] hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>আপলোড করুন</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1 font-mono">
                        YOUR NAME ( can be also written as "আপনার নাম" )
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: মোঃ জাহিদ হাসান"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full px-3 py-2 sm:py-3 bg-white border border-gray-200 focus:border-[#ffad00] focus:ring-1 focus:ring-[#ffad00] rounded-2xl text-xs text-slate-800 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1 font-mono">
                        PHONE NUMBER ( Can be also written as "মোবাইল নম্বর" )
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="যেমন: 01712345678"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full px-3 py-2 sm:py-3 bg-white border border-gray-200 focus:border-[#ffad00] focus:ring-1 focus:ring-[#ffad00] rounded-2xl text-xs text-slate-800 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1 font-mono">
                        PASSWORD ( can be also written as "পাসওয়ার্ড" )
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full px-3 py-2 sm:py-3 bg-white border border-gray-200 focus:border-[#ffad00] focus:ring-1 focus:ring-[#ffad00] rounded-2xl text-xs text-slate-800 focus:outline-none transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 sm:py-3.5 bg-[#facc15] hover:bg-amber-400 text-slate-950 font-sans font-black text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-md text-center active:scale-[0.98]"
                    >
                      CREATE CUSTOMER ACCOUNT
                    </button>
                  </form>

                  <div className="border-t border-gray-100 pt-3 sm:pt-4 text-center mt-1.5 sm:mt-3 space-y-2">
                    <p className="text-xs text-slate-600 font-sans font-medium">
                      ইতিমধ্যে অ্যাকাউন্ট আছে? {" "}
                      <button 
                        type="button"
                        onClick={() => setMode("login")}
                        className="text-[#f85606] font-bold hover:underline cursor-pointer ml-1"
                      >
                        লগইন করুন
                      </button>
                    </p>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 mt-2 flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-[11px] font-bold text-slate-800">অ্যাকাউন্ট ছাড়াই অর্ডার ট্র্যাক করতে চান?</p>
                        <p className="text-[9px] text-slate-500">অর্ডার আইডি ও মোবাইল নম্বর দিয়ে ইনস্ট্যান্ট ট্র্যাক করুন।</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowGuestTrack(true)}
                        className="px-3 py-1.5 bg-[#0b1329] hover:bg-slate-900 text-white font-extrabold text-[10px] uppercase rounded-lg transition-colors cursor-pointer"
                      >
                        ট্র্যাক করুন
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Login */}
              {!showGuestTrack && mode === "login" && (
                <div className="space-y-4 sm:space-y-6 text-slate-800 font-sans" id="customer-login-step">
                  <div className="text-center space-y-1">
                    <h4 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                      গ্রাহক লগইন
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                      মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে আপনার স্থায়ী প্রোফাইলে প্রবেশ করুন
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-red-55/10 text-red-650 text-xs rounded-xl flex items-center gap-2.5 border border-red-100">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <p className="font-semibold">{loginError}</p>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 tracking-wider text-left uppercase mb-1 font-mono">
                        PHONE IDENTIFICATION (মোবাইল নম্বর)
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-2.5 sm:top-3.5 w-4 sm:w-4.5 h-4 sm:h-4.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="como: 01712345678"
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 sm:py-3 bg-white border border-gray-150 focus:border-[#ffad00] focus:ring-1 focus:ring-[#ffad00] rounded-2xl text-xs text-slate-800 focus:outline-none font-mono transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 tracking-wider text-left uppercase mb-1 font-mono">
                        VERIFY PASSWORD (পাসওয়ার্ড)
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 sm:top-3.5 w-4 sm:w-4.5 h-4 sm:h-4.5 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full pl-9 pr-9 py-2 sm:py-3 bg-white border border-gray-150 focus:border-[#ffad00] focus:ring-1 focus:ring-[#ffad00] rounded-2xl text-xs text-slate-800 focus:outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 sm:top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer transition-all active:scale-95"
                        >
                          {showPassword ? <EyeOff className="w-4 sm:w-4.5 h-4 sm:h-4.5" /> : <Eye className="w-4 sm:w-4.5 h-4 sm:h-4.5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 sm:py-3.5 bg-[#facc15] hover:bg-amber-400 text-slate-950 font-sans font-black text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-md text-center active:scale-[0.98]"
                    >
                      VERIFY AND LOGIN ACCOUNT
                    </button>
                  </form>

                  <div className="border-t border-gray-100 pt-3 sm:pt-4 text-center mt-1.5 sm:mt-3 space-y-2">
                    <p className="text-xs text-slate-700 font-sans font-medium">
                      নতুন গ্রাহক? {" "}
                      <button 
                        type="button"
                        onClick={() => setMode("register")}
                        className="text-[#f85606] font-bold hover:underline cursor-pointer ml-1"
                      >
                        অ্যাকাউন্ট তৈরি করুন (রেজিস্ট্রেশন)
                      </button>
                    </p>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 mt-2 flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-[11px] font-bold text-slate-800">অ্যাকাউন্ট ছাড়াই অর্ডার ট্র্যাক করতে চান?</p>
                        <p className="text-[9px] text-slate-500">অর্ডার আইডি ও মোবাইল নম্বর দিয়ে ইনস্ট্যান্ট ট্র্যাক করুন।</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowGuestTrack(true)}
                        className="px-3 py-1.5 bg-[#0b1329] hover:bg-slate-900 text-white font-extrabold text-[10px] uppercase rounded-lg transition-colors cursor-pointer"
                      >
                        ট্র্যাক করুন
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Profile Dashboard */}
              {mode === "profile" && activeCustomer && (
                <div className="space-y-4" id="customer-active-profile">
                  
                  {/* PATH BREADCRUMBS: Home / My Account / Dashboard */}
                  <div className="text-xs text-gray-500 font-sans flex items-center gap-1.5 bg-[#FAFAFA] border-b border-gray-100 py-3.5 px-6 -mx-5 -mt-5 mb-5 select-none shrink-0 font-medium">
                    <span className="cursor-pointer hover:text-slate-800 transition-colors" onClick={onClose}>Home</span>
                    <span className="text-gray-300">/</span>
                    <span className="cursor-pointer hover:text-slate-800 transition-colors" onClick={() => setCustomerTab("dashboard")}>My Account</span>
                    <span className="text-gray-300">/</span>
                    <span className="text-slate-900 font-bold uppercase tracking-wider text-[10px]">
                      {customerTab === "dashboard" && "Dashboard"}
                      {customerTab === "orders" && "My Orders"}
                      {customerTab === "addresses" && "Addresses"}
                      {customerTab === "wishlist" && "Wishlist"}
                      {customerTab === "details" && "Account Details"}
                      {customerTab === "payments" && "Saved Payments"}
                    </span>
                  </div>

                  {/* TWO-COLUMN LAYOUT: Sidebar (w-64) + Content (flex-1) */}
                  <div className="flex flex-col lg:flex-row gap-6 bg-[#FAFAFA] -mx-5 -mb-5 p-5 min-h-[620px] rounded-b-2xl">
                    
                    {/* LEFT SIDEBAR NAVIGATION */}
                    <div className="w-full lg:w-64 shrink-0">
                      <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-xs space-y-1.5">
                        
                        <button 
                          onClick={() => setCustomerTab("dashboard")} 
                          className={`w-full text-left py-3 px-4 rounded-xl flex items-center gap-3.5 transition-all text-xs font-semibold uppercase tracking-wider select-none cursor-pointer ${
                            customerTab === "dashboard" 
                              ? "bg-slate-950 text-white shadow-md" 
                              : "text-slate-650 hover:bg-slate-50 hover:text-slate-950"
                          }`}
                        >
                          <LayoutDashboard className="w-4 h-4 shrink-0" />
                          <span>Dashboard</span>
                        </button>

                        <button 
                          onClick={() => setCustomerTab("orders")} 
                          className={`w-full text-left py-3 px-4 rounded-xl flex items-center gap-3.5 transition-all text-xs font-semibold uppercase tracking-wider select-none cursor-pointer ${
                            customerTab === "orders" 
                              ? "bg-slate-950 text-white shadow-md" 
                              : "text-slate-650 hover:bg-slate-50 hover:text-slate-950"
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4 shrink-0" />
                          <span>My Orders</span>
                        </button>

                        <button 
                          onClick={() => setCustomerTab("addresses")} 
                          className={`w-full text-left py-3 px-4 rounded-xl flex items-center gap-3.5 transition-all text-xs font-semibold uppercase tracking-wider select-none cursor-pointer ${
                            customerTab === "addresses" 
                              ? "bg-slate-950 text-white shadow-md" 
                              : "text-slate-650 hover:bg-slate-50 hover:text-slate-950"
                          }`}
                        >
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span>Addresses</span>
                        </button>

                        <button 
                          onClick={() => setCustomerTab("wishlist")} 
                          className={`w-full text-left py-3 px-4 rounded-xl flex items-center gap-3.5 transition-all text-xs font-semibold uppercase tracking-wider select-none cursor-pointer ${
                            customerTab === "wishlist" 
                              ? "bg-slate-950 text-white shadow-md" 
                              : "text-slate-650 hover:bg-slate-50 hover:text-slate-950"
                          }`}
                        >
                          <Heart className="w-4 h-4 shrink-0" />
                          <span>Wishlist</span>
                        </button>

                        <button 
                          onClick={() => setCustomerTab("details")} 
                          className={`w-full text-left py-3 px-4 rounded-xl flex items-center gap-3.5 transition-all text-xs font-semibold uppercase tracking-wider select-none cursor-pointer ${
                            customerTab === "details" 
                              ? "bg-slate-950 text-white shadow-md" 
                              : "text-slate-650 hover:bg-slate-50 hover:text-slate-950"
                          }`}
                        >
                          <User className="w-4 h-4 shrink-0" />
                          <span>Account Details</span>
                        </button>

                        <button 
                          onClick={() => setCustomerTab("payments")} 
                          className={`w-full text-left py-3 px-4 rounded-xl flex items-center gap-3.5 transition-all text-xs font-semibold uppercase tracking-wider select-none cursor-pointer ${
                            customerTab === "payments" 
                              ? "bg-slate-950 text-white shadow-md" 
                              : "text-slate-650 hover:bg-slate-50 hover:text-slate-950"
                          }`}
                        >
                          <CreditCard className="w-4 h-4 shrink-0" />
                          <span>Saved Payments</span>
                        </button>

                        <div className="border-t border-gray-100 my-2 pt-2" />

                        <button 
                          onClick={handleLogout} 
                          className="w-full text-left py-3 px-4 rounded-xl flex items-center gap-3.5 text-xs font-semibold uppercase tracking-wider text-rose-600 hover:bg-rose-50 transition-colors select-none cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <span>Logout</span>
                        </button>

                      </div>
                    </div>

                    {/* RIGHT MAIN PANEL DISPLAY AREA */}
                    <div className="flex-1 space-y-6">

                      {/* TAB 1: DASHBOARD VIEW */}
                      {customerTab === "dashboard" && (
                        <div className="space-y-6">
                          
                          {/* Welcome Header Banner */}
                          <div className="space-y-1 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-44 h-44 bg-amber-400/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
                            <div className="absolute bottom-0 left-1/3 w-36 h-36 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />
                            <div className="relative z-10 space-y-1.5">
                              <span className="inline-block px-2.5 py-0.5 bg-amber-400/25 text-amber-300 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                Customer Portal (গ্রাহক প্যানেল)
                              </span>
                              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                                স্বাগতম, <span className="text-amber-400 font-extrabold font-sans">{activeCustomer.name || "সম্মানিত গ্রাহক"}</span>!
                              </h3>
                              <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-xl">
                                আপনার ড্যাশবোর্ড ওভারভিউতে স্বাগতম। এখান থেকে আপনার সাম্প্রতিক অর্ডার ট্র্যাকিং, প্রিয় তালিকা, সংরক্ষিত পেমেন্ট মেথড ও শিপিং ঠিকানা অত্যন্ত সহজে পরিচালনা করতে পারবেন।
                              </p>
                            </div>
                          </div>

                          {/* Stats Summary Panel Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            
                            {/* Card 1: Total Orders */}
                            <div className="bg-[#DCE1EC] border border-[#CBD1E1] rounded-2xl p-5 flex justify-between items-center relative overflow-hidden shadow-2xs hover:shadow-xs transition-shadow">
                              <div className="space-y-0.5">
                                <span className="block text-slate-700 text-[10px] font-bold uppercase tracking-wider">মোট অর্ডার (Total Orders)</span>
                                <p className="text-3xl font-black text-slate-950 tracking-tight font-sans">
                                  {activeOrders.length.toString().padStart(2, '0')}
                                </p>
                              </div>
                              <div className="p-2.5 bg-white/45 rounded-lg shrink-0 text-slate-700">
                                <FileText className="w-5 h-5" />
                              </div>
                            </div>

                            {/* Card 2: Recent Order */}
                            <div className="bg-[#EFE9DB] border border-[#E3DABF] rounded-2xl p-5 flex justify-between items-center relative overflow-hidden shadow-2xs hover:shadow-xs transition-shadow">
                              <div className="space-y-0.5">
                                <span className="block text-slate-705 text-[10px] font-bold uppercase tracking-wider">সর্বশেষ অর্ডার (Recent Order)</span>
                                {latestCustomerOrder ? (
                                  <>
                                    <p className="text-lg font-black text-slate-950 tracking-wide font-mono">#{latestCustomerOrder.id}</p>
                                    <span className="inline-block text-[10px] font-mono font-bold text-slate-650">{latestCustomerOrder.status}</span>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-sm font-bold text-slate-500 font-sans">কোনো অর্ডার নেই</p>
                                    <span className="inline-block text-[10px] font-mono font-bold text-slate-400">No orders yet</span>
                                  </>
                                )}
                              </div>
                              <div className="p-2.5 bg-white/45 rounded-lg shrink-0 text-slate-700">
                                <ArrowUpRight className="w-5 h-5" />
                              </div>
                            </div>

                            {/* Card 3: Wishlist items count */}
                            <div className="bg-[#E3DCF1] border border-[#D5CBEF] rounded-2xl p-5 flex justify-between items-center relative overflow-hidden shadow-2xs hover:shadow-xs transition-shadow">
                              <div className="space-y-0.5">
                                <span className="block text-slate-700 text-[10px] font-bold uppercase tracking-wider">প্রিয় পণ্যসমূহ (Wishlist)</span>
                                <p className="text-3xl font-black text-slate-950 tracking-tight font-sans">{currentWishlist.length}</p>
                              </div>
                              <div className="p-2.5 bg-white/45 rounded-lg shrink-0 text-[#9A81E4]">
                                <Heart className="w-5 h-5 fill-current" />
                              </div>
                            </div>

                          </div>

                          {/* Recent Orders Box Table */}
                          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-sans">সাম্প্রতিক অর্ডারসমূহ (Recent Orders)</h4>
                              
                              <div className="text-[10px] font-bold border border-gray-200.5 px-2.5 py-1.5 rounded-lg text-slate-700 bg-gray-50 flex items-center gap-1 cursor-pointer">
                                <span>অর্ডার হিস্টোরি</span>
                                <ChevronDown className="w-3 h-3 text-gray-550" />
                              </div>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead>
                                  <tr className="border-b border-gray-150 text-slate-500 font-bold tracking-wider text-[10px] uppercase">
                                    <th className="pb-3.5">Order ID</th>
                                    <th className="pb-3.5">Date</th>
                                    <th className="pb-3.5">Status</th>
                                    <th className="pb-3.5">Total</th>
                                    <th className="pb-3.5 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 align-middle">
                                  {sortedCustomerOrders.length === 0 ? (
                                    <tr>
                                      <td colSpan={5} className="py-8 text-center text-slate-450">
                                        <div className="space-y-1">
                                          <p className="font-bold text-slate-700">আপনি এখনো কোনো নতুন অর্ডার করেননি</p>
                                          <p className="text-[10px]">আমাদের পণ্য তালিকা থেকে পছন্দের আইটেমটি কিনে নিন!</p>
                                        </div>
                                      </td>
                                    </tr>
                                  ) : (
                                    sortedCustomerOrders.slice(0, 4).map((ord) => (
                                      <tr key={ord.id} className="hover:bg-[#FAFAFA] transition-colors">
                                        <td className="py-3.5 font-mono font-bold text-slate-800">#{ord.id}</td>
                                        <td className="py-3.5 text-gray-500 font-mono text-[11px]">
                                          {new Date(ord.timestamp).toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </td>
                                        <td className="py-3.5">
                                          {ord.status === "Pending" ? (
                                            <span className="inline-flex items-center gap-1.5 text-amber-600 font-bold text-[11px]">
                                              <Clock className="w-4 h-4 shrink-0 text-amber-500" />
                                              <span>Pending</span>
                                            </span>
                                          ) : ord.status === "Shipped" ? (
                                            <span className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-[11px]">
                                              <Truck className="w-4 h-4 shrink-0 text-blue-500" />
                                              <span>Shipped</span>
                                            </span>
                                          ) : ord.status === "Cancelled" ? (
                                            <span className="inline-flex items-center gap-1.5 text-rose-600 font-bold text-[11px]">
                                              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                                              <span>Cancelled</span>
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                                              <CheckCircle className="w-4 h-4 shrink-0 text-[#10b981]" />
                                              <span>{ord.status}</span>
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-3.5 font-bold text-slate-900 font-mono">৳{formatBDT(ord.total)}</td>
                                        <td className="py-3.5 text-right">
                                          <div className="flex items-center justify-end gap-1.5">
                                            <button 
                                              onClick={() => setCustomerTab("orders")}
                                              className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 border border-gray-200 rounded-lg text-slate-600 shrink-0 cursor-pointer" 
                                              title="Track / View Order Details"
                                            >
                                              <Eye className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Account Information Section */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider font-sans flex items-center gap-1.5 border-b border-gray-100 pb-2">
                              <User className="w-4 h-4 text-slate-800" />
                              <span>অ্যাকাউন্ট ও যোগাযোগের বিবরণ (Account Information)</span>
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              
                              {/* Stack: Contact details + Shipping address card */}
                              <div className="space-y-4">
                                
                                {/* Contact Details Card */}
                                <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs relative">
                                  <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                                    <h5 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                                      <User className="w-3.5 h-3.5 text-slate-705" />
                                      <span>যোগাযোগের বিবরণ (Contact Details)</span>
                                    </h5>
                                    <button 
                                      onClick={() => {
                                        setIsEditingContact(!isEditingContact);
                                        setEditName(activeCustomer.name || "");
                                        setEditPhone(activeCustomer.phone || "");
                                      }}
                                      className="bg-slate-950 hover:bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all uppercase tracking-wider shrink-0"
                                    >
                                      {isEditingContact ? "Cancel" : "Edit"}
                                    </button>
                                  </div>

                                  {isEditingContact ? (
                                    <div className="space-y-3 pt-1 text-xs">
                                      <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Customer Name (গ্রাহকের নাম)</label>
                                        <input 
                                          type="text" 
                                          value={editName}
                                          onChange={(e)=>setEditName(e.target.value)}
                                          className="w-full px-3 py-2 bg-[#FAFAFA] border border-gray-200 rounded-xl text-slate-800 text-xs focus:outline-none"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Mobile Identification (মোবাইল নম্বর)</label>
                                        <input 
                                          type="text" 
                                          value={editPhone}
                                          onChange={(e)=>setEditPhone(e.target.value)}
                                          className="w-full px-3 py-2 bg-[#FAFAFA] border border-gray-200 rounded-xl text-slate-800 text-xs focus:outline-none"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Email Address (ইমেইল ঠিকানা)</label>
                                        <input 
                                          type="email" 
                                          value={editEmail}
                                          onChange={(e)=>setEditEmail(e.target.value)}
                                          className="w-full px-3 py-2 bg-[#FAFAFA] border border-gray-200 rounded-xl text-slate-800 text-xs focus:outline-none"
                                        />
                                      </div>
                                      <button 
                                        onClick={() => {
                                          const updated = { ...activeCustomer, name: editName, phone: editPhone };
                                          setActiveCustomer(updated);
                                          localStorage.setItem("zshop_bd_active_customer_session_v1", JSON.stringify(updated));
                                          localStorage.setItem("zshop_bd_customer_email_v1", editEmail);
                                          setCustEmail(editEmail);
                                          setIsEditingContact(false);
                                          window.dispatchEvent(new Event("active_customer_navbar_sync"));

                                          // Sync changes to server
                                          fetch("/api/customers/update-profile", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                              phone: activeCustomer.phone,
                                              name: editName,
                                              email: editEmail
                                            })
                                          }).catch(err => console.error("Error updating customer profile on server:", err));
                                        }}
                                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
                                      >
                                        Save Changes
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="space-y-1.5 text-slate-650 text-xs leading-normal">
                                      <p className="font-extrabold text-slate-900">{activeCustomer.name || "গ্রাহক"}</p>
                                      <p className="font-mono text-slate-800 font-semibold">{activeCustomer.phone || "0188-345-7739"}</p>
                                      <p className="text-gray-500">Email: <span className="text-slate-800 font-medium">{custEmail || "Not specified"}</span></p>
                                    </div>
                                  )}
                                </div>

                                {/* Shipping Address Card */}
                                <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs relative">
                                  <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                                    <h5 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                                      <MapPin className="w-3.5 h-3.5 text-slate-705" />
                                      <span>ডেলিভারী ঠিকানা (Shipping Address)</span>
                                    </h5>
                                    <button 
                                      onClick={() => {
                                        setIsEditingAddress(!isEditingAddress);
                                        setEditAddress(custAddress);
                                      }}
                                      className="bg-slate-950 hover:bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all uppercase tracking-wider shrink-0"
                                    >
                                      {isEditingAddress ? "Cancel" : "Edit"}
                                    </button>
                                  </div>

                                  {isEditingAddress ? (
                                    <div className="space-y-3 pt-1 text-xs">
                                      <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Shipping Destination (ডেলিভারী ঠিকানা)</label>
                                        <textarea 
                                          value={editAddress}
                                          onChange={(e)=>setEditAddress(e.target.value)}
                                          rows={3}
                                          className="w-full px-3.5 py-2 bg-[#FAFAFA] border border-gray-200 rounded-xl text-slate-800 text-xs focus:outline-none"
                                        />
                                      </div>
                                      <button 
                                        onClick={() => {
                                          localStorage.setItem("zshop_bd_customer_address_v1", editAddress);
                                          setCustAddress(editAddress);
                                          setIsEditingAddress(false);

                                          // Sync changes to server
                                          if (activeCustomer) {
                                            fetch("/api/customers/update-profile", {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({
                                                phone: activeCustomer.phone,
                                                address: editAddress
                                              })
                                            }).catch(err => console.error("Error updating customer address on server:", err));
                                          }
                                        }}
                                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
                                      >
                                        Save Address
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="space-y-1.5 text-xs text-slate-650 leading-relaxed font-sans whitespace-pre-line">
                                      <p className="font-extrabold text-slate-950">Shipping Destination</p>
                                      <p className="bg-slate-50 p-2.5 rounded-xl border border-gray-100 text-[11px] font-medium text-slate-700">{custAddress || "ঠিকানা দেওয়া হয়নি। অনুগ্রহ করে আপনার ডেলিভারী ঠিকানা যোগ করুন।"}</p>
                                    </div>
                                  )}
                                </div>

                              </div>

                              {/* Right Card Panel: Default/Primary Payment Method details instead of empty Secure Shell block */}
                              <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs relative flex flex-col justify-between min-h-[220px]">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3 w-full">
                                  <h5 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                                    <CreditCard className="w-3.5 h-3.5 text-slate-750" />
                                    <span>ডিফল্ট পেমেন্ট (Default Method)</span>
                                  </h5>
                                  <button 
                                    onClick={() => setCustomerTab("payments")}
                                    className="bg-slate-950 hover:bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all uppercase tracking-wider shrink-0"
                                  >
                                    ম্যানেজ করুন
                                  </button>
                                </div>
                                
                                <div className="flex-1 flex flex-col justify-center py-2">
                                  {savedPayments && savedPayments.length > 0 ? (
                                    (() => {
                                      const primary = savedPayments.find(p => p.isPrimary) || savedPayments[0];
                                      return (
                                        <div className="space-y-3.5 font-sans">
                                          <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold text-white uppercase font-mono tracking-wider shadow-xs ${
                                              primary.type === "bkash" ? "bg-pink-500" : primary.type === "nagad" ? "bg-orange-500" : primary.type === "rocket" ? "bg-purple-500" : "bg-slate-800"
                                            }`}>
                                              {primary.type}
                                            </span>
                                            <span className="text-xs font-black text-slate-900">{primary.name}</span>
                                          </div>
                                          
                                          <div className="space-y-1">
                                            <p className="text-[10px] text-gray-400 font-sans font-medium uppercase tracking-wider">অ্যাকাউন্ট / কার্ড নম্বর (Account No)</p>
                                            <p className="text-sm font-mono font-black text-slate-950 bg-slate-50 py-1.5 px-3 rounded-lg border border-gray-100 tracking-wider">
                                              {primary.type === "card" ? primary.cardNo : primary.accountNo}
                                            </p>
                                          </div>
                                          
                                          <div className="text-[11px] text-slate-650 flex items-center justify-between">
                                            <span>হোল্ডার: <strong className="text-slate-900 font-sans font-bold">{primary.holder}</strong></span>
                                            {primary.isPrimary && (
                                              <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-150 uppercase">Primary</span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })()
                                  ) : (
                                    <div className="text-center py-8 space-y-3 bg-[#FAFAFA] border border-dashed border-gray-200 rounded-xl my-auto">
                                      <CreditCard className="w-8 h-8 text-slate-300 mx-auto" />
                                      <div className="space-y-1">
                                        <p className="text-[11px] text-slate-700 font-bold">কোনো পেমেন্ট মেথড যুক্ত নেই</p>
                                        <p className="text-[9px] text-slate-400">অর্ডার করার সুবিধার্থে নতুন মেথড যোগ করুন</p>
                                      </div>
                                      <button 
                                        onClick={() => setCustomerTab("payments")}
                                        className="text-[10px] font-bold text-indigo-650 hover:text-indigo-850 hover:underline inline-block mt-1"
                                      >
                                        + একটি নতুন পেমেন্ট মেথড যোগ করুন
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* Wishlist Quick View Card */}
                          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-4">
                            <h4 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider font-sans">Wishlist Quick View</h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              
                              {currentWishlist.length === 0 ? (
                                <div className="col-span-full py-8 text-center text-slate-400 space-y-2 bg-[#FAFAFA] border border-dashed border-gray-200 rounded-2xl">
                                  <Heart className="w-8 h-8 text-slate-300 mx-auto" />
                                  <div className="space-y-0.5">
                                    <p className="font-bold text-slate-700 text-xs">আপনার প্রিয় তালিকাটি খালি রয়েছে</p>
                                    <p className="text-[10px]">আমাদের পণ্যগুলোতে হার্ট আইকন ক্লিক করে এখানে যোগ করুন!</p>
                                  </div>
                                </div>
                              ) : (
                                currentWishlist.slice(0, 3).map((prod) => (
                                  <div key={prod.id} className="border border-gray-150 rounded-2xl p-3.5 flex flex-col justify-between space-y-3 bg-white hover:shadow-xs transition-shadow">
                                    <div className="w-full h-32 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center relative">
                                      <img 
                                        referrerPolicy="no-referrer"
                                        src={prod.image} 
                                        alt={prod.name} 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="space-y-0.5">
                                      <p className="text-xs font-extrabold text-slate-950 truncate font-sans">{prod.name}</p>
                                      <p className="text-[11px] font-bold text-emerald-605 font-mono">৳{formatBDT(prod.price)}</p>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        if (prod && onAddToCart) {
                                          onAddToCart(prod);
                                        }
                                      }}
                                      className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors uppercase tracking-wider"
                                    >
                                      Add to Cart
                                    </button>
                                  </div>
                                ))
                              )}

                            </div>
                          </div>

                          {/* Quick Links Card */}
                          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-3.5">
                            <h4 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider font-sans">Quick Links</h4>
                            
                            <div className="flex flex-col gap-2.5">
                              <button 
                                onClick={() => setCustomerTab("orders")}
                                className="w-full py-3 text-center bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                              >
                                Track your order
                              </button>
                              <button 
                                onClick={onClose}
                                className="w-full py-3 text-center bg-white border border-slate-950 text-slate-950 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
                              >
                                View current sales
                              </button>
                              <button 
                                onClick={() => alert("আমাদের হেল্পলাইন নম্বরে যোগাযোগ করুন: +8801888223470")}
                                className="w-full py-3 text-center bg-white border border-slate-950 text-slate-950 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
                              >
                                Contact support
                              </button>
                            </div>
                          </div>

                        </div>
                      )}

                      {/* TAB 2: MY ORDERS LIST AND HISTORY TRACKER */}
                      {customerTab === "orders" && (
                        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-5">
                          <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-black text-slate-950 uppercase tracking-widest flex items-center gap-1.5">
                                <ShoppingBag className="w-4 h-4 text-slate-800" />
                                <span>অর্ডার তথ্য ও ট্র্যাকিং ইতিহাস</span>
                              </h4>
                              <p className="text-[10px] text-gray-400 font-medium">নিচের তালিকা থেকে আপনার অর্ডারের অগ্রগতি যাচাই করতে পারেন।</p>
                            </div>
                            <span className="px-3 py-1 bg-slate-100 rounded-full font-bold text-xs text-slate-705">
                              {activeOrders.length} Orders
                            </span>
                          </div>

                          {activeOrders.length === 0 ? (
                            <div className="text-center py-12 text-slate-450 space-y-3">
                              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                              <p className="text-slate-800 font-bold text-sm">আপনি এখনো কোনো নতুন অর্ডার করেননি।</p>
                              <p className="text-slate-450 text-xs">আমাদের পণ্য তালিকা থেকে পছন্দের আইটেমটি খুঁজে নিয়ে দ্রুত অর্ডার করুন!</p>
                              <button 
                                onClick={onClose} 
                                className="px-5 py-2 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer"
                              >
                                শপিং করুন
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {activeOrders.map((ord) => (
                                <div key={ord.id} className="border border-gray-200 rounded-2xl p-4 bg-white hover:border-slate-300 transition-all space-y-4 shadow-2xs">
                                  <div className="flex flex-col sm:flex-row justify-between gap-2 border-b border-gray-100 pb-3">
                                    <div>
                                      <p className="font-mono text-xs font-bold text-slate-900">
                                        Order ID: <span className="text-amber-600">#{ord.id}</span>
                                      </p>
                                      <p className="text-[10px] text-gray-400 font-mono">
                                        Date: {new Date(ord.timestamp).toLocaleDateString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider font-mono
                                        ${ord.status === "Pending" ? "bg-amber-100 text-amber-800" : ""}
                                        ${ord.status === "Confirmed" ? "bg-emerald-100 text-emerald-800" : ""}
                                        ${ord.status === "Shipped" ? "bg-blue-100 text-blue-800" : ""}
                                        ${ord.status === "Delivered" ? "bg-emerald-100 text-emerald-800" : ""}
                                        ${ord.status === "Cancelled" ? "bg-rose-100 text-rose-800" : ""}
                                      `}>
                                        {ord.status}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    {ord.cartItems.map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-800 tracking-tight line-clamp-1">{item.title}</span>
                                        <span className="shrink-0 font-mono text-gray-500">Qty {item.quantity} × ৳{formatBDT(item.price)}</span>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="flex justify-between items-center border-t border-gray-100 pt-3 text-xs font-extrabold text-slate-900 font-mono">
                                    <span className="text-gray-500 font-sans font-medium">Payable Amount:</span>
                                    <span>৳{formatBDT(ord.total)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB 3: CONTACT DETAILS & ADDRESS EDIT VIEW */}
                      {customerTab === "addresses" && (
                        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-6">
                          <div className="border-b border-gray-100 pb-3">
                            <h4 className="text-sm font-black text-slate-950 uppercase tracking-widest flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-slate-800" />
                              <span>নথিভুক্ত ঠিকানা ও যোগাযোগ</span>
                            </h4>
                          </div>

                          <div className="space-y-5">
                            <div className="bg-[#FAFAFA] border border-gray-200 p-4 rounded-xl space-y-4">
                              <h5 className="text-xs font-bold text-slate-900 border-b border-gray-150 pb-2">যোগাযোগের বিবরণ (Contact Details)</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">গ্রাহকের নাম</label>
                                  <input 
                                    type="text" 
                                    value={editName}
                                    onChange={(e)=>setEditName(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:border-slate-800 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">মোবাইল নম্বর</label>
                                  <input 
                                    type="text" 
                                    value={editPhone}
                                    disabled
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 focus:outline-none cursor-not-allowed"
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">ইমেইল ঠিকানা</label>
                                  <input 
                                    type="email" 
                                    value={editEmail}
                                    onChange={(e)=>setEditEmail(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:border-slate-800 focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="bg-[#FAFAFA] border border-gray-200 p-4 rounded-xl space-y-3">
                              <h5 className="text-xs font-bold text-slate-900 border-b border-gray-150 pb-2">ডেলিভারী গন্তব্য ঠিকানা (Shipping Address)</h5>
                              <div>
                                <textarea 
                                  value={editAddress}
                                  onChange={(e)=>setEditAddress(e.target.value)}
                                  rows={3}
                                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-slate-800 focus:outline-none text-xs"
                                />
                              </div>
                            </div>

                            <button 
                              onClick={() => {
                                const updated = { ...activeCustomer, name: editName };
                                setActiveCustomer(updated);
                                localStorage.setItem("zshop_bd_active_customer_session_v1", JSON.stringify(updated));
                                localStorage.setItem("zshop_bd_customer_email_v1", editEmail);
                                localStorage.setItem("zshop_bd_customer_address_v1", editAddress);
                                setCustEmail(editEmail);
                                setCustAddress(editAddress);
                                alert("ঠিকানা ও প্রোফাইল পরিবর্তন সফলভাবে নথিভুক্ত হয়েছে!");
                                window.dispatchEvent(new Event("active_customer_navbar_sync"));
                              }}
                              className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                            >
                              ঠিকানা সংরক্ষণ করুন (Save Location Info)
                            </button>
                          </div>
                        </div>
                      )}

                      {/* TAB 4: WISHLIST EXPANDED STYLED VIEW */}
                      {customerTab === "wishlist" && (
                        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-5">
                          <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                            <h4 className="text-sm font-black text-slate-950 uppercase tracking-widest flex items-center gap-1.5">
                              <Heart className="w-4 h-4 text-slate-850" />
                              <span>আমার প্রিয় পণ্যসমূহ (Wishlist Products)</span>
                            </h4>
                          </div>

                          {currentWishlist.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 space-y-3 bg-[#FAFAFA] border border-dashed border-gray-200 rounded-2xl">
                              <Heart className="w-10 h-10 text-slate-300 mx-auto animate-pulse" />
                              <div className="space-y-1">
                                <p className="font-bold text-slate-700 text-sm">আপনার প্রিয় পণ্য তালিকাটি খালি রয়েছে</p>
                                <p className="text-xs">আমাদের পণ্য তালিকা থেকে যেকোনো পণ্যের হার্ট আইকনে ক্লিক করে প্রিয় তালিকায় যোগ করুন!</p>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                              {currentWishlist.map((prod) => (
                                <div key={prod.id} className="border border-gray-200.5 rounded-2xl p-3 bg-white flex flex-col justify-between space-y-3.5 hover:shadow-xs transition-shadow">
                                  <div className="relative w-full h-36 bg-[#FAFAFA] rounded-xl overflow-hidden">
                                    <img 
                                      referrerPolicy="no-referrer"
                                      src={prod.image} 
                                      alt={prod.name} 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <h5 className="text-xs font-black text-slate-950 font-sans tracking-tight">{prod.name}</h5>
                                    <p className="text-[10px] text-gray-400 font-medium line-clamp-1">{prod.category || "Premium Quality Product"}</p>
                                    <p className="text-xs font-black text-amber-605 font-mono">৳{formatBDT(prod.price)}</p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (prod && onAddToCart) {
                                        onAddToCart(prod);
                                      }
                                    }}
                                    className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors uppercase tracking-wider"
                                  >
                                    Add to Cart
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB 5: DETAILED PROFILE INFORMATION SECTION */}
                      {customerTab === "details" && (
                        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-6">
                          <div className="border-b border-gray-100 pb-3">
                            <h4 className="text-sm font-black text-slate-950 uppercase tracking-widest flex items-center gap-1.5">
                              <User className="w-4 h-4 text-slate-800" />
                              <span>প্রোফাইল বিবরণ ও পাসওয়ার্ড পরিবর্তন</span>
                            </h4>
                          </div>

                          <div className="space-y-5 text-xs">
                            <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-200 rounded-xl bg-[#FAFAFA] space-y-3">
                              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Profile Photo (প্রোফাইল ছবি পরিবর্তন)</p>
                              <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16 bg-gray-105 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center">
                                  {activeCustomer.avatar ? (
                                    <img src={activeCustomer.avatar} alt="logo" className="w-full h-full object-cover" />
                                  ) : (
                                    <User className="w-8 h-8 text-slate-400" />
                                  )}
                                </div>
                                <div className="relative">
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleAvatarUpload} 
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                  />
                                  <button className="py-2 px-3 bg-slate-950 hover:bg-slate-900 text-white rounded-lg font-semibold transition-all cursor-pointer uppercase tracking-wider text-[10px]">
                                    নতুন ছবি আপলোড
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Your Name (আপনার নাম)</label>
                                <input 
                                  type="text" 
                                  value={editName}
                                  onChange={(e)=>setEditName(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Phone Identification (মোবাইল নম্বর)</label>
                                <input 
                                  type="text" 
                                  value={editPhone}
                                  disabled
                                  className="w-full px-3 py-2.5 bg-gray-55 border border-gray-200 rounded-xl text-gray-400 focus:outline-none cursor-not-allowed"
                                />
                              </div>
                            </div>

                            <button 
                              onClick={() => {
                                const updated = { ...activeCustomer, name: editName };
                                setActiveCustomer(updated);
                                localStorage.setItem("zshop_bd_active_customer_session_v1", JSON.stringify(updated));
                                alert("প্রোফাইল তথ্য সফলভাবে পরিবর্তন করা হয়েছে!");
                                window.dispatchEvent(new Event("active_customer_navbar_sync"));
                              }}
                              className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                            >
                              পরিবর্তন সংরক্ষণ করুন (Save Profile Information)
                            </button>
                          </div>
                        </div>
                      )}

                      {/* TAB 6: SECURITY SAVED CARDS PAYMENTS */}
                      {customerTab === "payments" && (
                        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-6">
                          <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                            <h4 className="text-sm font-black text-slate-950 uppercase tracking-widest flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4 text-slate-800" />
                              <span>নথিভুক্ত পেমেন্ট মেথড (Payment Options)</span>
                            </h4>
                            <button
                              onClick={() => {
                                setNewPaymentType("bkash");
                                setNewPaymentName("bKash Personal");
                                setNewPaymentHolder(activeCustomer?.name || "");
                                setPaymentError("");
                                setShowAddPaymentModal(true);
                              }}
                              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors uppercase tracking-wider flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>নতুন মেথড</span>
                            </button>
                          </div>

                          {loadingPayments ? (
                            <div className="py-12 text-center text-slate-400">
                              <p className="animate-pulse text-xs font-semibold">পেমেন্ট মেথড লোড হচ্ছে...</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-mono">
                              {savedPayments.length === 0 ? (
                                <div className="col-span-full py-12 text-center text-slate-400 space-y-2 bg-[#FAFAFA] border border-dashed border-gray-200 rounded-2xl">
                                  <CreditCard className="w-8 h-8 text-slate-300 mx-auto" />
                                  <div className="space-y-0.5">
                                    <p className="font-bold text-slate-700 text-xs">আপনার কোনো পেমেন্ট মেথড সংরক্ষিত নেই</p>
                                    <p className="text-[10px]">নিচের বোতামটি দিয়ে একটি নতুন পেমেন্ট মেথড যোগ করুন!</p>
                                  </div>
                                </div>
                              ) : (
                                savedPayments.map((pm) => {
                                  if (pm.type === "card") {
                                    return (
                                      <div key={pm.id} className="bg-gradient-to-br from-slate-800 to-slate-950 text-white rounded-2xl p-5 space-y-6 shadow-md relative overflow-hidden select-none">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] uppercase tracking-widest font-extrabold bg-white/10 px-2 py-1 rounded">
                                            {pm.name}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <span className="font-black text-sm italic">Card</span>
                                            <button 
                                              onClick={() => handleDeletePayment(pm.id)}
                                              className="p-1 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
                                              title="Delete"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-[10px] opacity-75">Card Number</p>
                                          <div className="flex items-center gap-1 text-sm tracking-widest font-bold">
                                            {pm.cardNo && pm.cardNo.includes(" ") ? pm.cardNo.split(" ").map((group: string, idx: number) => (
                                              <span key={idx}>{group}</span>
                                            )) : (
                                              <span>{pm.cardNo || "•••• •••• •••• ••••"}</span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex justify-between items-end text-xs">
                                          <div>
                                            <p className="text-[9px] opacity-75 uppercase">Cardholder</p>
                                            <p className="font-sans font-bold text-[11px] uppercase truncate max-w-[120px]">{pm.holder}</p>
                                          </div>
                                          <div className="flex gap-4 items-center">
                                            <div>
                                              <p className="text-[9px] opacity-75 uppercase">Expires</p>
                                              <p className="font-bold text-[11px]">{pm.expires || "MM/YY"}</p>
                                            </div>
                                            {pm.isPrimary && (
                                              <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded">Primary</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div key={pm.id} className={`bg-gradient-to-br ${pm.type === "bkash" ? "from-pink-500 to-rose-600" : pm.type === "nagad" ? "from-orange-500 to-amber-600" : "from-purple-500 to-indigo-600"} text-white rounded-2xl p-5 space-y-6 shadow-md relative overflow-hidden select-none`}>
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] uppercase tracking-widest font-extrabold bg-white/20 px-2 py-1 rounded">
                                            {pm.name}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <span className="font-sans font-black text-sm italic capitalize">{pm.type}</span>
                                            <button 
                                              onClick={() => handleDeletePayment(pm.id)}
                                              className="p-1 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
                                              title="Delete"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-[10px] opacity-75">Saved Wallet Account</p>
                                          <p className="text-base tracking-widest font-bold">{pm.accountNo}</p>
                                        </div>
                                        <div className="flex justify-between items-end text-xs">
                                          <div>
                                            <p className="text-[9px] opacity-75 uppercase">Account Holder</p>
                                            <p className="font-sans font-bold text-[11px] truncate max-w-[140px]">{pm.holder}</p>
                                          </div>
                                          {pm.isPrimary && (
                                            <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded">Primary</span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  }
                                })
                              )}

                              {/* Add New Payment Method Card Option inside grid */}
                              <button
                                onClick={() => {
                                  setNewPaymentType("bkash");
                                  setNewPaymentName("bKash Personal");
                                  setNewPaymentHolder(activeCustomer?.name || "");
                                  setPaymentError("");
                                  setShowAddPaymentModal(true);
                                }}
                                className="border-2 border-dashed border-slate-300 hover:border-slate-800 text-slate-500 hover:text-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center space-y-2 cursor-pointer transition-colors bg-slate-50/50 min-h-[160px]"
                              >
                                <Plus className="w-6 h-6" />
                                <span className="text-[11px] uppercase tracking-widest font-extrabold font-sans">নতুন পেমেন্ট মেথড</span>
                                <span className="text-[9px] opacity-75 font-sans">Add Payment Method</span>
                              </button>
                            </div>
                          )}

                          {/* Add Payment Method Modal */}
                          {showAddPaymentModal && (
                            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-150 space-y-4 font-sans animate-in fade-in zoom-in-95 duration-150">
                                <div className="flex items-center justify-between border-b border-gray-150 pb-2">
                                  <h4 className="text-sm font-black text-slate-950 uppercase tracking-widest flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-emerald-500" />
                                    <span>নতুন পেমেন্ট মেথড (Add Payment Method)</span>
                                  </h4>
                                  <button
                                    onClick={() => setShowAddPaymentModal(false)}
                                    className="text-slate-450 hover:text-slate-800 font-bold text-lg p-1"
                                  >
                                    ✕
                                  </button>
                                </div>

                                {paymentError && (
                                  <div className="p-2.5 bg-red-50 text-red-700 text-[11px] rounded-xl font-medium border border-red-150">
                                    {paymentError}
                                  </div>
                                )}

                                <form onSubmit={handleAddPayment} className="space-y-3.5">
                                  <div>
                                    <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">পেমেন্ট টাইপ (Payment Type)</label>
                                    <div className="grid grid-cols-4 gap-2">
                                      {(["bkash", "nagad", "rocket", "card"] as const).map((t) => (
                                        <button
                                          key={t}
                                          type="button"
                                          onClick={() => {
                                            setNewPaymentType(t);
                                            setNewPaymentName(t === "bkash" ? "bKash Personal" : t === "nagad" ? "Nagad Personal" : t === "rocket" ? "Rocket Personal" : "Visa Classic");
                                            if (t === "card") {
                                              setNewPaymentHolder((activeCustomer?.name || "").toUpperCase());
                                            } else {
                                              setNewPaymentHolder(activeCustomer?.name || "");
                                            }
                                          }}
                                          className={`py-2 text-[11px] font-bold rounded-xl border text-center capitalize cursor-pointer transition-colors ${newPaymentType === t ? "bg-slate-950 text-white border-slate-950" : "bg-slate-50 text-slate-650 border-gray-200 hover:bg-gray-100"}`}
                                        >
                                          {t}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">নাম বা লেবেল (Label Name)</label>
                                    <input
                                      type="text"
                                      placeholder={newPaymentType === "card" ? "e.g. MasterCard Gold" : "e.g. bKash Personal"}
                                      value={newPaymentName}
                                      onChange={(e) => setNewPaymentName(e.target.value)}
                                      className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-slate-800"
                                      required
                                    />
                                  </div>

                                  {newPaymentType === "card" ? (
                                    <>
                                      <div>
                                        <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">কার্ড নম্বর (Card Number)</label>
                                        <input
                                          type="text"
                                          placeholder="•••• •••• •••• 4327"
                                          value={newPaymentCardNo}
                                          onChange={(e) => {
                                            let val = e.target.value.replace(/\s+/g, "").replace(/[^0-9•]/gi, "");
                                            let matches = val.match(/.{1,4}/g);
                                            setNewPaymentCardNo(matches ? matches.join(" ") : val);
                                          }}
                                          maxLength={19}
                                          className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-slate-800"
                                          required
                                        />
                                      </div>

                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">মেয়াদ শেষ (Expiry Date)</label>
                                          <input
                                            type="text"
                                            placeholder="MM/YY"
                                            value={newPaymentExpires}
                                            onChange={(e) => {
                                              let val = e.target.value.replace(/[^0-9]/g, "");
                                              if (val.length > 2) {
                                                val = val.substring(0, 2) + "/" + val.substring(2, 4);
                                              }
                                              setNewPaymentExpires(val);
                                            }}
                                            maxLength={5}
                                            className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-slate-800"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">কার্ডহোল্ডার (Cardholder Name)</label>
                                          <input
                                            type="text"
                                            placeholder="John Doe"
                                            value={newPaymentHolder}
                                            onChange={(e) => setNewPaymentHolder(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-medium uppercase focus:outline-none focus:border-slate-800"
                                            required
                                          />
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div>
                                        <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">মোবাইল বা অ্যাকাউন্ট নম্বর (Account Number)</label>
                                        <input
                                          type="text"
                                          placeholder="017XXXXXXXX"
                                          value={newPaymentAccountNo}
                                          onChange={(e) => setNewPaymentAccountNo(e.target.value)}
                                          className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-slate-800"
                                          required
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">অ্যাকাউন্ট হোল্ডার (Account Holder Name)</label>
                                        <input
                                          type="text"
                                          placeholder="রহমান হাসান"
                                          value={newPaymentHolder}
                                          onChange={(e) => setNewPaymentHolder(e.target.value)}
                                          className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-slate-800"
                                          required
                                        />
                                      </div>
                                    </>
                                  )}

                                  <div className="flex items-center gap-2 py-1">
                                    <input
                                      type="checkbox"
                                      id="isPrimaryCheckbox"
                                      checked={newPaymentIsPrimary}
                                      onChange={(e) => setNewPaymentIsPrimary(e.target.checked)}
                                      className="rounded text-slate-900 focus:ring-slate-900 h-4 w-4"
                                    />
                                    <label htmlFor="isPrimaryCheckbox" className="text-[11px] font-bold text-slate-700 cursor-pointer select-none">
                                      ডিফল্ট প্রাইমারি পেমেন্ট মেথড হিসেবে সেট করুন
                                    </label>
                                  </div>

                                  <div className="flex gap-3 pt-2">
                                    <button
                                      type="button"
                                      onClick={() => setShowAddPaymentModal(false)}
                                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                                    >
                                      বাতিল করুন
                                    </button>
                                    <button
                                      type="submit"
                                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                                    >
                                      সংরক্ষণ করুন
                                    </button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    </div>

                  </div>

                </div>
              )}
            </>
          )}

          {/* ================================================================ */}
          {/* ====================== MERCHANT FLOW =========================== */}
          {/* ================================================================ */}
          {userType === "merchant" && (
            <>
              {/* Merchant Registration */}
              {mode === "register" && (
                <div className="space-y-3 sm:space-y-4" id="merchant-register-step">
                  <div className="text-center space-y-0.5">
                    <h4 className="text-sm font-display font-bold text-[#f85606] uppercase tracking-wide">
                      ZSHOP BD Seller Registration (মার্চেন্ট অ্যাকাউন্ট খুলুন)
                    </h4>
                    <p className="text-[11px] text-gray-500 font-sans leading-tight">
                      আপনার নিজস্ব দোকান খুলে সরাসরি কাস্টমারের কাছে প্রোডাক্ট বিক্রি শুরু করুন!
                    </p>
                  </div>

                  {merchError && (
                    <div className="p-3 bg-red-55/10 text-red-650 text-xs rounded-xl flex items-center gap-2.5 border border-red-100">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <p className="font-semibold">{merchError}</p>
                    </div>
                  )}

                  {merchSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2.5 border border-emerald-100">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                      <p className="font-semibold">মার্চেন্ট বায়ার শপ রেজিস্ট্রেশন সফল! অনুগ্রহ করে লগইন করুন।</p>
                    </div>
                  )}

                  <form onSubmit={handleMerchantRegisterSubmit} className="space-y-2.5 sm:space-y-3">
                    <div className="flex flex-col items-center justify-center p-2 border border-dashed border-gray-200 rounded-xl bg-slate-50/40 space-y-1">
                      <p className="text-[9px] uppercase font-mono tracking-wider text-gray-400 font-bold">Shop Avatar (দোকানের লোগো)</p>
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 bg-gray-100 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                          {merchAvatar ? (
                            <img src={merchAvatar} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <button
                            type="button"
                            className="py-1 px-2.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold hover:bg-slate-800 flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Upload className="w-3 h-3" />
                            <span>আপলোড করুন</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono tracking-wider text-gray-500 uppercase mb-0.5">
                        Seller / Owner Name (বিক্রেতার নাম)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="যেমনঃ মোঃ আবির হোসাইন"
                        value={merchName}
                        onChange={(e) => setMerchName(e.target.value)}
                        className="w-full px-3 py-1.5 sm:py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl text-xs text-slate-800 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono tracking-wider text-gray-500 uppercase mb-0.5 font-bold">
                        Shop Name / Brand Name (অনলাইন দোকান/ব্র্যান্ডের নাম) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="যেমনঃ Royal Fashion BD"
                        value={merchShopName}
                        onChange={(e) => setMerchShopName(e.target.value)}
                        className="w-full px-3 py-1.5 sm:py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl text-xs text-slate-800 focus:outline-none font-bold transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono tracking-wider text-gray-500 uppercase mb-0.5 font-bold">
                        Merchant Mobile Phone (লগইন নম্বর) *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="যেমনঃ 01888223470"
                        value={merchPhone}
                        onChange={(e) => setMerchPhone(e.target.value)}
                        className="w-full px-3 py-1.5 sm:py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl text-xs text-slate-800 focus:outline-none font-mono transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono tracking-wider text-gray-500 uppercase mb-0.5">
                        Address / Warehouse (ঠিকানা/অফিস)
                      </label>
                      <input
                        type="text"
                        placeholder="যেমনঃ বনানী, ঢাকা"
                        value={merchAddress}
                        onChange={(e) => setMerchAddress(e.target.value)}
                        className="w-full px-3 py-1.5 sm:py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl text-xs text-slate-800 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono tracking-wider text-gray-500 uppercase mb-0.5">
                        Merchant Login Password (মার্চেন্ট পাসওয়ার্ড) *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড"
                        value={merchPassword}
                        onChange={(e) => setMerchPassword(e.target.value)}
                        className="w-full px-3 py-1.5 sm:py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl text-xs text-slate-800 focus:outline-none transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 sm:py-3 bg-rose-600 hover:bg-rose-700 text-white font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                    >
                      Establish online Merchant Shop
                    </button>
                  </form>

                  <div className="border-t border-gray-150 pt-2 text-center mt-1 sm:mt-2">
                    <p className="text-xs text-gray-500">
                      ইতিমধ্যে মার্চেন্ট হ্যান্ডেল আছে? {" "}
                      <button 
                        type="button"
                        onClick={() => setMode("login")}
                        className="text-rose-600 font-bold hover:underline cursor-pointer ml-1"
                      >
                        মার্চেন্ট লগইন করুন
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* Merchant Login */}
              {mode === "login" && (
                <div className="space-y-3 sm:space-y-4" id="merchant-login-step">
                  <div className="text-center space-y-0.5">
                    <h4 className="text-sm font-display font-bold text-slate-900 uppercase tracking-wide">
                      ZSHOP BD Seller Center (অনলাইন বিক্রেতা লগইন)
                    </h4>
                    <p className="text-[11px] text-gray-500 font-sans leading-tight">
                      মোবাইল নম্বর ও বিক্রেতা পাসওয়ার্ড দিয়ে আপনার মার্চেন্ট প্যানেলে প্রবেশ করুন
                    </p>
                  </div>

                  {merchError && (
                    <div className="p-3 bg-red-55/10 text-red-650 text-xs rounded-xl flex items-center gap-2.5 border border-red-101">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <p className="font-semibold">{merchError}</p>
                    </div>
                  )}

                  <form onSubmit={handleMerchantLoginSubmit} className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-[9px] font-mono tracking-wider text-gray-500 uppercase mb-0.5">
                        Seller Registration Phone (বিক্রেতার মোবাইল নম্বর)
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-2.5 sm:top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          placeholder="como: 01888223470"
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-1.5 sm:py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl text-xs text-slate-800 focus:outline-none font-mono transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono tracking-wider text-gray-500 uppercase mb-0.5">
                        Seller Center Password (বিক্রেতার পাসওয়ার্ড)
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 sm:top-3 w-4 h-4 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full pl-9 pr-9 py-1.5 sm:py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl text-xs text-slate-800 focus:outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 sm:top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 sm:py-3 bg-rose-600 hover:bg-rose-700 text-white font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                    >
                      Authenticate and Access Store
                    </button>
                  </form>

                  <div className="border-t border-gray-150 pt-2 text-center mt-1 sm:mt-2">
                    <p className="text-xs text-gray-500">
                      অনলাইন দোকান দিতে চান? {" "}
                      <button 
                        type="button"
                        onClick={() => setMode("register")}
                        className="text-rose-600 font-bold hover:underline cursor-pointer font-sans ml-1"
                      >
                        নতুন মার্চেন্ট সাইন আপ (ZSHOP BD Seller Center)
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* Merchant Dashboard Area */}
              {mode === "profile" && activeMerchant && (
                <div className="space-y-6" id="merchant-control-panel-dashboard">
                  
                  {/* Shop Details header box */}
                  <div className="bg-rose-600 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden shadow-md">
                    <div className="flex items-center gap-3.5 z-10">
                      <div className="relative w-12 h-12 group">
                        <div className="w-full h-full bg-white/20 border border-white/30 rounded-full flex items-center justify-center overflow-hidden shrink-0 relative shadow-inner">
                          {activeMerchant.avatar ? (
                            <img src={activeMerchant.avatar} alt="logo" className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-6 h-6 text-white" />
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Camera className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer z-25 rounded-full"
                          title="আপনার শপের লোগো/প্রোফাইল পিকচার পরিবর্তন করুন"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700/60 text-white rounded-full p-1 shadow-md flex items-center justify-center pointer-events-none z-10">
                          <Camera className="w-2.5 h-2.5" />
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-display font-black text-white uppercase tracking-wider">{activeMerchant.shopName}</h4>
                          <span className="bg-amber-450 text-slate-900 font-extrabold text-[8px] px-1.5 py-0.2 rounded uppercase tracking-wider">ZSHOP BD MALL SELLER</span>
                        </div>
                        <p className="text-[10px] text-rose-100 flex items-center gap-1">
                          <User className="w-3 h-3 text-rose-200" />
                          <span>Owner: {activeMerchant.name} ({activeMerchant.phone})</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 z-10">
                      {/* Close button inside dashboard */}
                      <button 
                        onClick={handleLogout}
                        className="py-1.5 px-3 bg-white/15 hover:bg-white/25 active:bg-white/35 text-white text-[10px] font-bold uppercase rounded-lg border border-white/20 hover:border-white/30 transition-all flex items-center gap-1 cursor-pointer"
                        title="বিক্রেতা প্যানেল থেকে লগআউট"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>

                  {/* Dashboard Tab selectors */}
                  <div className="flex bg-slate-50 border border-gray-200 rounded-xl p-1 gap-1">
                    <button 
                      type="button" onClick={() => setMerchantTab("summary")}
                      className={`flex-1 py-2 text-[10px] sm:text-xs font-bold text-center rounded-lg transition-all cursor-pointer ${merchantTab === "summary" ? "bg-rose-650 text-white shadow-xs" : "text-gray-550 hover:text-slate-800"}`}
                    >
                      📊 বিবরণী
                    </button>
                    <button 
                      type="button" onClick={() => setMerchantTab("add")}
                      className={`flex-1 py-1 text-[10px] sm:text-xs font-bold text-center rounded-lg transition-all cursor-pointer ${merchantTab === "add" ? "bg-rose-650 text-white shadow-xs" : "text-gray-550 hover:text-slate-800"}`}
                    >
                      ➕ প্রোডাক্ট যোগ
                    </button>
                    <button 
                      type="button" onClick={() => setMerchantTab("products")}
                      className={`flex-1 py-2 text-[10px] sm:text-xs font-bold text-center rounded-lg transition-all cursor-pointer ${merchantTab === "products" ? "bg-rose-650 text-white shadow-xs" : "text-gray-550 hover:text-slate-800"}`}
                    >
                      🛍️ প্রোডাক্ট তালিকা
                    </button>
                    <button 
                      type="button" onClick={() => setMerchantTab("orders")}
                      className={`flex-1 py-2 text-[10px] sm:text-xs font-bold text-center rounded-lg transition-all cursor-pointer ${merchantTab === "orders" ? "bg-rose-650 text-white shadow-xs" : "text-gray-550 hover:text-slate-800"}`}
                    >
                      📦 অর্ডার্স ({connectedMerchantOrders.length})
                    </button>
                  </div>
                  {merchantTab === "summary" && (
                    <div className="space-y-6 text-slate-800 font-sans animate-fade-in" id="merchant-high-fidelity-dashboard-view">
                      
                      {/* Premium Welcome Banner */}
                      <div className="bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-100 p-6 rounded-2xl shadow-xs relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-4 translate-x-4">
                          <Store className="w-48 h-48 text-rose-600" />
                        </div>
                        <div className="space-y-1.5 max-w-xl relative z-10">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-rose-600 text-white font-black rounded-sm px-2 py-0.5 uppercase tracking-wider">SELLER PARTNER HUB</span>
                            {activeMerchant.isVerified ? (
                              <span className="text-[10px] bg-slate-900 text-white font-bold rounded-sm px-2 py-0.5 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span>Verified Shop</span>
                              </span>
                            ) : (
                              <span className="text-[10px] bg-slate-200 text-slate-600 font-bold rounded-sm px-2 py-0.5 uppercase tracking-wider flex items-center gap-1">
                                <span>Standard Seller</span>
                              </span>
                            )}
                          </div>
                          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-sans">
                            স্বাগতম, {activeMerchant.name}! 👋
                          </h2>
                          <p className="text-xs text-gray-600 font-medium leading-relaxed">
                            আপনার অনলাইন শপ <strong className="text-rose-600">{activeMerchant.shopName}</strong> এর ড্যাশবোর্ডে আপনাকে স্বাগতম। এখান থেকে সহজেই আপনার প্রোডাক্ট স্টক, বিক্রয় বিবরণী এবং কাস্টমার অর্ডার প্রসেস করুন।
                          </p>
                        </div>
                      </div>

                      {/* STATS SUMMARY BAR (4 bento-grid metrics) */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        
                        {/* Metric 1: Total Revenue */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-3 shadow-3xs hover:border-emerald-200 transition-all relative group">
                          <div className="flex items-center justify-between">
                            <span className="block text-gray-400 text-[10px] font-black uppercase tracking-widest leading-none">Total Sales (মোট বিক্রি)</span>
                            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <Coins className="w-5 h-5 text-emerald-600" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-sans truncate">
                              ৳{formatBDT(completedEarnings)}
                            </p>
                            <p className="text-[9px] text-emerald-600 font-bold mt-1">✓ Delivered Orders Only</p>
                          </div>
                        </div>

                        {/* Metric 2: Total Orders */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-3 shadow-3xs hover:border-amber-200 transition-all relative group">
                          <div className="flex items-center justify-between">
                            <span className="block text-gray-400 text-[10px] font-black uppercase tracking-widest leading-none">Total Orders (মোট অর্ডার)</span>
                            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <FileText className="w-5 h-5 text-amber-600" />
                            </div>
                          </div>
                          <div>
                            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                              {connectedMerchantOrders.length.toLocaleString()}
                            </p>
                            <p className="text-[9px] text-amber-600 font-bold mt-1">📦 All Connected Orders</p>
                          </div>
                        </div>

                        {/* Metric 3: Active Products */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-3 shadow-3xs hover:border-rose-200 transition-all relative group">
                          <div className="flex items-center justify-between">
                            <span className="block text-gray-400 text-[10px] font-black uppercase tracking-widest leading-none">Active Products (সক্রিয় পণ্য)</span>
                            <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <Tag className="w-5 h-5 text-rose-600" />
                            </div>
                          </div>
                          <div>
                            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                              {merchantProducts.length.toLocaleString()}
                            </p>
                            <p className="text-[9px] text-rose-500 font-bold mt-1">🏷️ Live in Store Directory</p>
                          </div>
                        </div>

                        {/* Metric 4: Avg. Rating */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-3 shadow-3xs hover:border-purple-200 transition-all relative group">
                          <div className="flex items-center justify-between">
                            <span className="block text-gray-400 text-[10px] font-black uppercase tracking-widest leading-none">Store Rating (গড় রেটিং)</span>
                            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <Star className="w-5 h-5 text-purple-600 fill-purple-100" />
                            </div>
                          </div>
                          <div>
                            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                              {(() => {
                                if (!merchantProducts || merchantProducts.length === 0) return "5.0 / 5";
                                const ratings = merchantProducts.map(p => p.rating || 5);
                                const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
                                return `${avg.toFixed(1)} / 5`;
                              })()}
                            </p>
                            <p className="text-[9px] text-purple-600 font-bold mt-1">⭐️ Based on Product reviews</p>
                          </div>
                        </div>

                      </div>

                      {/* TWO-COLUMN LAYOUT */}
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        
                        {/* LEFT WIDGETS (7 Columns) */}
                        <div className="xl:col-span-7 space-y-6">
                          
                          {/* Top Selling Products Component */}
                          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                              <div className="flex items-center gap-2">
                                <ShoppingBag className="w-4.5 h-4.5 text-rose-600 animate-pulse" />
                                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-sans">Top Selling Products</h4>
                              </div>
                              <button onClick={() => setMerchantTab("products")} className="text-rose-600 font-bold hover:underline text-[10px] uppercase cursor-pointer">
                                Show All
                              </button>
                            </div>

                            <div className="space-y-3">
                              {(() => {
                                if (!merchantProducts || merchantProducts.length === 0) {
                                  return (
                                    <div className="text-center py-10 px-4 bg-slate-50/40 border border-slate-150 border-dashed rounded-2xl">
                                      <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                      <p className="text-xs text-gray-500 font-medium">কোনো পণ্য পাওয়া যায়নি!</p>
                                      <p className="text-[10px] text-gray-400 mt-1">প্রোডাক্ট যোগ করুন এবং অর্ডার পেলে এখানে টপ সেলিং প্রোডাক্টগুলো দেখতে পাবেন।</p>
                                      <button 
                                        onClick={() => setMerchantTab("add")}
                                        className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:underline cursor-pointer bg-white px-3 py-1.5 border border-rose-100 rounded-lg shadow-3xs"
                                      >
                                        <span>নতুন প্রোডাক্ট যোগ করুন</span>
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  );
                                }

                                // Count sales from connectedMerchantOrders
                                const salesMap = new Map<string, number>();
                                connectedMerchantOrders.forEach(ord => {
                                  ord.cartItems.forEach(item => {
                                    salesMap.set(item.productId, (salesMap.get(item.productId) || 0) + item.quantity);
                                  });
                                });

                                const dynamicTopProducts = merchantProducts
                                  .map(prod => ({
                                    ...prod,
                                    salesCount: salesMap.get(prod.id) || 0,
                                    rating: prod.rating || 5,
                                    reviewsCount: prod.reviewsCount || 0
                                  }))
                                  .sort((a, b) => b.salesCount - a.salesCount)
                                  .slice(0, 4);

                                return dynamicTopProducts.map((item) => {
                                  const ratingVal = Math.round(item.rating);
                                  return (
                                    <div key={item.id} className="flex items-center gap-3 bg-slate-50/30 hover:bg-slate-50 border border-slate-100 rounded-xl p-2.5 transition-colors">
                                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-white border border-gray-100">
                                        <img 
                                          referrerPolicy="no-referrer"
                                          src={item.image} 
                                          alt={item.title} 
                                          className="w-full h-full object-cover" 
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h5 className="font-bold text-slate-950 text-xs truncate leading-snug">{item.title}</h5>
                                        <div className="flex items-center gap-2 mt-1">
                                          <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                              <Star 
                                                key={i} 
                                                className={`w-3 h-3 ${i < ratingVal ? "text-amber-450 fill-current" : "text-gray-200 fill-current"}`} 
                                              />
                                            ))}
                                          </div>
                                          <span className="text-[10px] text-gray-400">({item.reviewsCount} reviews)</span>
                                          {item.salesCount > 0 ? (
                                            <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md font-bold font-sans">
                                              {item.salesCount} Sold
                                            </span>
                                          ) : (
                                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-semibold font-sans">
                                              0 Sold
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <span className="font-extrabold font-mono text-xs text-slate-900 block">৳{item.price}</span>
                                        {item.originalPrice && (
                                          <span className="line-through text-[10px] text-gray-400 block">৳{item.originalPrice}</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>

                          {/* Chat & Support Settings */}
                          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-sans border-b border-gray-100 pb-3 flex items-center gap-2">
                              <span>💬</span>
                              <span>Chat & Custom Support Settings</span>
                            </h4>
                            <form onSubmit={handleUpdateMerchantFbUrl} className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                  Facebook Page URL or Messenger Link (ঐচ্ছিক)
                                </label>
                                <div className="relative">
                                  <input 
                                    type="url"
                                    value={merchantFbUrl}
                                    onChange={(e) => setMerchantFbUrl(e.target.value)}
                                    placeholder="যেমনঃ https://m.me/your_fb_page"
                                    className="w-full px-3 py-3 bg-[#FAFAFA] border border-gray-200 focus:border-rose-500 rounded-xl focus:outline-none text-xs font-sans text-slate-800 transition-colors"
                                  />
                                </div>
                                <span className="text-[10px] text-gray-400 block leading-relaxed">
                                  প্রোডাক্ট পেইজের নিচে কাস্টমার <strong>"Chat with Shop"</strong> বাটনে ক্লিক করলে সরাসরি আপনার দেওয়া এই লিংকে মেসেজ করতে পারবে।
                                </span>
                              </div>
                              {fbUrlSuccessMsg && (
                                <p className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 animate-fade-in">
                                  ✓ {fbUrlSuccessMsg}
                                </p>
                              )}
                              <button 
                                type="submit"
                                disabled={isSavingFbUrl}
                                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                              >
                                {isSavingFbUrl ? "সংরক্ষণ করা হচ্ছে..." : "সংরক্ষণ করুন (Save Support Link)"}
                              </button>
                            </form>
                          </div>

                        </div>

                        {/* RIGHT WIDGETS (5 Columns) */}
                        <div className="xl:col-span-5 space-y-6">
                          
                          {/* Orders Quick Process Widget */}
                          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-sans">Recent active orders</h4>
                              <button onClick={() => setMerchantTab("orders")} className="text-xs text-rose-600 font-extrabold hover:underline">
                                View All ({connectedMerchantOrders.length})
                              </button>
                            </div>

                            <div className="divide-y divide-slate-100 text-xs">
                              {(() => {
                                const activeOnly = connectedMerchantOrders.filter(
                                  (ord) => ord.status !== "Delivered" && ord.status !== "Cancelled"
                                );

                                if (activeOnly.length === 0) {
                                  return (
                                    <div className="py-8 text-center text-gray-400 font-medium">
                                      প্রক্রিয়া করার জন্য কোনো নতুন সক্রিয় অর্ডার নেই।
                                    </div>
                                  );
                                }

                                return activeOnly.slice(0, 4).map((row) => {
                                  let dateStr = "N/A";
                                  try {
                                    const d = new Date(row.timestamp);
                                    if (!isNaN(d.getTime())) {
                                      dateStr = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                                    }
                                  } catch {}

                                  return (
                                    <div 
                                      key={row.id} 
                                      className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-1 rounded-lg transition-colors cursor-pointer"
                                      onClick={() => {
                                        setSelectedMerchantOrderId(row.id);
                                        setMerchantTab("orders");
                                      }}
                                    >
                                      <div className="space-y-0.5">
                                        <span className="font-extrabold font-mono text-slate-950 block text-[11px]">
                                          #{row.id.replace("ord-", "").slice(0, 7).toUpperCase()}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-medium block">
                                          {row.customerName} • <span className="font-mono text-gray-400 text-[9px]">{dateStr}</span>
                                        </span>
                                      </div>
                                      <span className={`inline-block px-2 py-0.5 text-[9px] font-black rounded uppercase font-sans tracking-wide ${
                                        row.status === "Pending" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                        row.status === "Confirmed" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                        row.status === "Shipped" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                        "bg-slate-50 text-slate-600"
                                      }`}>
                                        {row.status}
                                      </span>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>

                          {/* Inventory Health status widget */}
                          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-sans border-b border-gray-100 pb-3">
                              Inventory Health & Stock Info
                            </h4>
                            <div className="space-y-3.5 text-xs">
                              <div>
                                <div className="flex justify-between font-bold text-slate-700 mb-1">
                                  <span>In Stock Rate</span>
                                  <span className="text-emerald-600 font-mono font-extrabold">
                                    {merchantProducts.length > 0 
                                      ? `${Math.round((merchantProducts.filter(p => p.inStock).length / merchantProducts.length) * 100)}%` 
                                      : "100%"}
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-500 rounded-full transition-all"
                                    style={{ 
                                      width: merchantProducts.length > 0 
                                        ? `${(merchantProducts.filter(p => p.inStock).length / merchantProducts.length) * 100}%` 
                                        : "100%" 
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2.5 pt-2 text-center">
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                                  <span className="block text-[9px] text-gray-400 font-extrabold uppercase">Total Items</span>
                                  <span className="text-sm font-black text-slate-900 font-mono">{merchantProducts.length}</span>
                                </div>
                                <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-2.5">
                                  <span className="block text-[9px] text-emerald-600 font-extrabold uppercase">In Stock</span>
                                  <span className="text-sm font-black text-emerald-700 font-mono">{merchantProducts.filter(p => p.inStock).length}</span>
                                </div>
                                <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-2.5">
                                  <span className="block text-[9px] text-rose-500 font-extrabold uppercase">Out of Stock</span>
                                  <span className="text-sm font-black text-rose-700 font-mono">{merchantProducts.filter(p => !p.inStock).length}</span>
                                </div>
                              </div>

                              <button 
                                onClick={() => setMerchantTab("add")}
                                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-3xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add New Products to Inventory</span>
                              </button>
                            </div>
                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* TAB 2: ADD NEW PRODUCT FORM */}
                  {merchantTab === "add" && (
                    <form onSubmit={handleMerchantAddProduct} className="space-y-6 bg-white border border-slate-100 p-5 rounded-2xl text-xs font-sans animate-fade-in">
                      <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Plus className="w-4.5 h-4.5 text-rose-600 animate-pulse" />
                            <span>পণ্য বিক্রির জন্য যোগ করুন (Add New Product)</span>
                          </h4>
                          <p className="text-[10px] text-gray-400 font-medium">কাস্টমারদের কাছে আপনার পণ্যটি আকর্ষণীয়ভাবে তুলে ধরুন।</p>
                        </div>
                      </div>

                      {isNewProdSuccess && (
                        <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold flex items-center gap-2 border border-emerald-100 animate-fade-in">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>প্রোডাক্ট সফলভাবে যুক্ত হয়েছে! প্রোডাক্ট লিস্টে রিডাইরেক্ট করা হচ্ছে...</span>
                        </div>
                      )}

                      <div className="space-y-4">
                        
                        {/* Section 1: Basic Info */}
                        <div className="bg-slate-50/30 border border-slate-100 p-4 rounded-xl space-y-3.5">
                          <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">১. পণ্যের সাধারণ তথ্য (General Information)</h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] text-gray-500 font-semibold tracking-wider uppercase mb-1">প্রোডাক্টের নাম *</label>
                              <input 
                                type="text" required placeholder="যেমনঃ Premium Designer Silk Punjabi"
                                value={prodTitle} onChange={e => setProdTitle(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl focus:outline-none text-xs font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-gray-500 font-semibold tracking-wider uppercase mb-1">ক্যাটাগরি নির্ধারণ করুন *</label>
                              <select 
                                value={prodCategory} onChange={e => setProdCategory(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl focus:outline-none text-xs font-bold"
                              >
                                <option value="clothing">Clothing & Fashion (পাঞ্জাবি ও ফ্যাশন)</option>
                                <option value="watches">Luxury Watches (লাক্সারি ঘড়ি)</option>
                                <option value="electronics">Electronics (স্মার্ট ইলেকট্রনিক্স)</option>
                                <option value="kitchen">Home & Kitchen (কিচেন ও হোম)</option>
                                <option value="sports">Sports & Outdoors (স্পোর্টিং গিয়ার)</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] text-gray-500 font-semibold tracking-wider uppercase mb-1">উপলব্ধ সাইজসমূহ (Sizes - কমা দিয়ে লিখুন)</label>
                              <input 
                                type="text" placeholder="যেমনঃ S, M, L, XL"
                                value={prodSizes} onChange={e => setProdSizes(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl focus:outline-none text-xs font-mono font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-gray-500 font-semibold tracking-wider uppercase mb-1">উপলব্ধ রংসমূহ (Colors - কমা দিয়ে লিখুন)</label>
                              <input 
                                type="text" placeholder="যেমনঃ Black, White, Maroon"
                                value={prodColors} onChange={e => setProdColors(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl focus:outline-none text-xs font-medium"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] text-gray-500 font-semibold tracking-wider uppercase mb-1">পণ্যের বিস্তারিত বিবরণ (Description)</label>
                            <textarea 
                              rows={3} placeholder="পণ্যটি সম্পর্কে বিস্তারিত বিবরণ লিখুন..."
                              value={prodDescription} onChange={e => setProdDescription(e.target.value)}
                              className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl focus:outline-none text-xs font-medium"
                            />
                          </div>
                        </div>

                        {/* Section 2: Pricing & Affiliate Program */}
                        <div className="bg-slate-50/30 border border-slate-100 p-4 rounded-xl space-y-4">
                          <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">২. পণ্যের মূল্য এবং এফিলিয়েট প্রোগ্রাম (Pricing & Affiliate Configuration)</h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] text-gray-500 font-semibold tracking-wider uppercase mb-1">বিক্রয় মূল্য (৳ Price) *</label>
                              <input 
                                type="number" required placeholder="যেমনঃ 2450"
                                value={prodPrice} onChange={e => setProdPrice(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl focus:outline-none text-xs font-bold font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-gray-500 font-semibold tracking-wider uppercase mb-1">পূর্বের মূল্য (৳ Original Price - ঐচ্ছিক)</label>
                              <input 
                                type="number" placeholder="যেমনঃ 3200"
                                value={prodOriginalPrice} onChange={e => setProdOriginalPrice(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl focus:outline-none text-xs font-medium font-mono"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 p-1.5">
                            <input 
                              type="checkbox" id="merchInStock"
                              checked={prodInStock} onChange={e => setProdInStock(e.target.checked)}
                              className="w-4.5 h-4.5 accent-rose-650 cursor-pointer"
                            />
                            <label htmlFor="merchInStock" className="font-extrabold text-slate-800 cursor-pointer text-xs select-none">
                              পণ্যটি বর্তমানে স্টকে আছে (Item is In Stock)
                            </label>
                          </div>

                          {/* Affiliate Integration Toggle */}
                          <div className="p-3 bg-white border border-slate-100 rounded-xl space-y-3 shadow-3xs">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <label htmlFor="merchIsAffiliate" className="font-extrabold text-slate-900 cursor-pointer select-none text-xs">
                                  পণ্যটি এফিলিয়েট প্রোগ্রামে যুক্ত করতে চান?
                                </label>
                                <p className="text-[10px] text-gray-400">
                                  টিক দিলে আমাদের এফিলিয়েটরা এই পণ্যটি শেয়ার ও মার্কেটিং করে বিক্রির জন্য কমিশন পাবে।
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                id="merchIsAffiliate"
                                checked={prodIsAffiliateReady}
                                onChange={(e) => setProdIsAffiliateReady(e.target.checked)}
                                className="w-5 h-5 cursor-pointer accent-rose-650 shrink-0"
                              />
                            </div>

                            {prodIsAffiliateReady && (
                              <div className="pt-3 border-t border-slate-100 animate-fade-in space-y-1.5">
                                <label className="block text-[10px] text-rose-600 font-bold tracking-wider uppercase">
                                  প্রতি পিস বিক্রিতে এফিলিয়েট কমিশন (৳ Taka Taka Amount) *
                                </label>
                                <div className="flex items-center bg-slate-50 border border-gray-200 focus-within:border-rose-500 rounded-xl px-3 max-w-xs transition-colors">
                                  <span className="font-bold text-gray-500 pr-2">৳</span>
                                  <input
                                    type="number"
                                    required={prodIsAffiliateReady}
                                    placeholder="যেমনঃ 120"
                                    value={prodAffiliateCommission}
                                    onChange={(e) => setProdAffiliateCommission(e.target.value)}
                                    className="w-full bg-transparent border-none focus:outline-none py-2 text-xs font-black text-slate-800 font-mono"
                                  />
                                </div>
                                <span className="text-[9px] text-gray-400 block">
                                  এফিলিয়েট প্রতি পিস বিক্রিতে এই কমিশন টাকা সরাসরি পাবে।
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Section 3: Media Attachment */}
                        <div className="bg-slate-50/30 border border-slate-100 p-4 rounded-xl space-y-3.5">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">৩. প্রোডাক্টের ছবি ও ভিডিও (Product Media)</h5>
                            <div className="flex border border-gray-200 rounded-lg overflow-hidden shrink-0 shadow-3xs">
                              <button 
                                type="button" onClick={() => setProdImageSource("link")}
                                className={`px-2.5 py-1 text-[10px] font-bold transition-all ${prodImageSource === "link" ? "bg-slate-900 text-white" : "bg-gray-100 text-gray-500"}`}
                              >
                                URLs লিংক
                              </button>
                              <button 
                                type="button" onClick={() => setProdImageSource("upload")}
                                className={`px-2.5 py-1 text-[10px] font-bold transition-all ${prodImageSource === "upload" ? "bg-slate-900 text-white" : "bg-gray-100 text-gray-500"}`}
                              >
                                গ্যালারি আপলোড
                              </button>
                            </div>
                          </div>

                          {prodImageSource === "link" ? (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-[9px] text-gray-400 font-mono tracking-wider uppercase mb-1">ছবির লিংক সমূহ (কমা দিয়ে একাধিক লিংক দিতে পারেন)</label>
                                <textarea 
                                  rows={2}
                                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                  value={prodImages.filter(img => !img.startsWith("data:")).join(", ")}
                                  onChange={e => {
                                    const list = e.target.value.split(",").map(url => url.trim()).filter(Boolean);
                                    setProdImages(list);
                                    if (list[0]) setProdImage(list[0]);
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-rose-500 rounded-xl focus:outline-none font-mono text-[10px] leading-relaxed"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-gray-400 font-mono tracking-wider uppercase mb-1">ভিডিও লিংক সমূহ (ঐচ্ছিক, কমা দিয়ে একাধিক লিংক দিতে পারেন)</label>
                                <textarea 
                                  rows={2}
                                  placeholder="https://example.com/video1.mp4, https://example.com/video2.mp4"
                                  value={prodVideos.filter(vid => !vid.startsWith("data:")).join(", ")}
                                  onChange={e => {
                                    const list = e.target.value.split(",").map(url => url.trim()).filter(Boolean);
                                    setProdVideos(list);
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-rose-500 rounded-xl focus:outline-none font-mono text-[10px] leading-relaxed"
                                />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-white hover:bg-slate-50 transition relative cursor-pointer group shadow-3xs">
                                <input 
                                  type="file" 
                                  accept="image/*,video/*" 
                                  multiple 
                                  onChange={handleProductMediaUpload}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="text-center pointer-events-none space-y-1.5">
                                  <span className="text-2xl block animate-bounce">📸</span>
                                  <p className="text-xs font-black text-slate-800">ক্লিক করে আপনার গ্যালারি থেকে ছবি ও ভিডিও সিলেক্ট করুন</p>
                                  <p className="text-[10px] text-gray-400">একসাথে একাধিক হাই-কোয়ালিটি ফাইল সিলেক্ট করতে পারেন</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Previews Grid */}
                          {(prodImages.length > 0 || prodVideos.length > 0) && (
                            <div className="space-y-2 pt-3 border-t border-slate-100">
                              <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">যুক্ত করা মিডিয়া ফাইলসমূহ ({prodImages.length} ছবি, {prodVideos.length} ভিডিও):</h5>
                              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                {prodImages.map((img, idx) => (
                                  <div key={`img-${idx}`} className="relative aspect-square border border-gray-250 rounded-xl overflow-hidden bg-white shadow-3xs group">
                                    <img src={img} alt="prev" className="w-full h-full object-cover" />
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        const updated = prodImages.filter((_, i) => i !== idx);
                                        setProdImages(updated);
                                        if (idx === 0) setProdImage(updated[0] || "");
                                      }}
                                      className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-xs"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}

                                {prodVideos.map((vid, idx) => (
                                  <div key={`vid-${idx}`} className="relative aspect-square border border-gray-250 rounded-xl overflow-hidden bg-slate-900 shadow-3xs group">
                                    <video src={vid} className="w-full h-full object-cover opacity-85" />
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        setProdVideos(prodVideos.filter((_, i) => i !== idx));
                                      }}
                                      className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-xs"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                      </div>

                      <button 
                        type="submit"
                        className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>নতুন প্রোডাক্ট লাইভ করুন (Publish Product)</span>
                      </button>
                    </form>
                  )}

                  {/* TAB 3: CONTROL PORTAL LIST OF PRODUCTS */}
                  {merchantTab === "products" && (
                    <div className="space-y-4 font-sans text-xs animate-fade-in">
                      
                      {/* Subheader with search bar */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-100 p-4 rounded-2xl shadow-3xs">
                        <div>
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <span>🛍️ সক্রিয় স্টোর প্রোডাক্ট তালিকা ({merchantProducts.length})</span>
                          </h4>
                          <p className="text-[10px] text-gray-400 font-medium">আপনার অনলাইন স্টোরে যোগকৃত সকল প্রোডাক্টের তালিকা ও স্টক স্ট্যাটাস পরিচালনা করুন।</p>
                        </div>

                        {/* Live search box inside product list */}
                        <div className="relative min-w-[200px]">
                          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                          <input 
                            type="text"
                            placeholder="প্রোডাক্ট খুঁজুন (Search)..."
                            value={merchantSearchQuery}
                            onChange={(e) => setMerchantSearchQuery(e.target.value)}
                            className="w-full pl-8.5 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-xl focus:outline-none text-[11px] font-sans text-slate-800 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Filter products locally based on search query */}
                      {(() => {
                        const filteredProds = merchantProducts.filter(p => {
                          const query = merchantSearchQuery.toLowerCase().trim();
                          if (!query) return true;
                          return (
                            p.title.toLowerCase().includes(query) ||
                            (p.category && p.category.toLowerCase().includes(query)) ||
                            p.price.toString().includes(query)
                          );
                        });

                        if (filteredProds.length === 0) {
                          return (
                            <div className="bg-white border border-slate-150 p-10 rounded-2xl text-center text-gray-400 text-xs shadow-3xs">
                              <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-2.5" />
                              <p className="font-bold text-slate-700">কোনো প্রোডাক্ট পাওয়া যায়নি!</p>
                              {merchantSearchQuery ? (
                                <p className="text-[10px] text-gray-400 mt-1">আপনার অনুসন্ধান করা কীওয়ার্ড দিয়ে কোনো ম্যাচ পাওয়া যায়নি।</p>
                              ) : (
                                <p className="text-[10px] text-gray-400 mt-1">অনুগ্রহ করে "প্রোডাক্ট যোগ" ট্যাব থেকে প্রোডাক্ট যুক্ত করুন।</p>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredProds.map((p) => (
                              <div key={p.id} className="bg-white p-4 border border-slate-100 rounded-2xl flex items-start justify-between gap-4 shadow-3xs hover:shadow-xs transition-all">
                                <div className="flex items-start gap-3.5 min-w-0">
                                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 relative">
                                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                                    {!p.inStock && (
                                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[8px] text-white font-extrabold uppercase">
                                        Sold Out
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 space-y-1">
                                    <h5 className="font-black text-slate-900 truncate leading-snug text-xs">{p.title}</h5>
                                    <p className="text-rose-600 font-mono font-extrabold text-[11px] flex items-center gap-1.5">
                                      <span>৳{formatBDT(p.price)}</span>
                                      {p.originalPrice && (
                                        <span className="line-through text-[9px] text-gray-400 font-medium">৳{formatBDT(p.originalPrice)}</span>
                                      )}
                                    </p>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[8px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md font-mono font-extrabold uppercase tracking-wide">
                                        {p.category}
                                      </span>
                                      <button 
                                        onClick={() => handleToggleProductStock(p)}
                                        className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase transition-all shadow-3xs border ${
                                          p.inStock 
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/60" 
                                            : "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100/60"
                                        }`}
                                        title="স্টক স্ট্যাটাস টগল করুন"
                                      >
                                        {p.inStock ? "🟢 In Stock" : "🔴 Stock Out"}
                                      </button>
                                    </div>

                                    {/* Inline Affiliate Controls */}
                                    <div className="flex items-center gap-1.5 mt-1.5 bg-slate-50 border border-gray-150 p-1.5 rounded-xl w-fit">
                                      <label className="flex items-center gap-1.5 font-bold text-gray-600 cursor-pointer select-none text-[10px]">
                                        <input
                                          type="checkbox"
                                          checked={!!p.isAffiliateReady}
                                          onChange={async (e) => {
                                            const updated = { 
                                              ...p, 
                                              isAffiliateReady: e.target.checked,
                                              affiliateCommission: p.affiliateCommission ?? 100
                                            };
                                            try {
                                              const res = await fetch("/api/products/update", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ product: updated })
                                              });
                                              const d = await res.json();
                                              if (d.success) {
                                                fetchMerchantData(activeMerchant.phone);
                                                window.dispatchEvent(new Event("products_db_sync_update"));
                                              }
                                            } catch (err) {
                                              console.error(err);
                                            }
                                          }}
                                          className="w-3.5 h-3.5 accent-rose-650 rounded cursor-pointer"
                                        />
                                        <span>এফিলিয়েট মার্কেটিং</span>
                                      </label>

                                      {p.isAffiliateReady && (
                                        <div className="flex items-center ml-1.5 border-l border-gray-300 pl-2 gap-0.5 text-[10px]">
                                          <span className="text-gray-400">৳</span>
                                          <input
                                            type="number"
                                            value={p.affiliateCommission ?? 100}
                                            onChange={async (e) => {
                                              const val = parseFloat(e.target.value) || 0;
                                              const updated = { 
                                                ...p, 
                                                affiliateCommission: val,
                                                affCommission: Math.round((val / p.price) * 100) || 10
                                              };
                                              try {
                                                const res = await fetch("/api/products/update", {
                                                  method: "POST",
                                                  headers: { "Content-Type": "application/json" },
                                                  body: JSON.stringify({ product: updated })
                                                });
                                                const d = await res.json();
                                                if (d.success) {
                                                  fetchMerchantData(activeMerchant.phone);
                                                  window.dispatchEvent(new Event("products_db_sync_update"));
                                                }
                                              } catch (err) {
                                                console.error(err);
                                              }
                                            }}
                                            className="w-11 bg-transparent text-rose-600 font-extrabold text-center py-0 p-0 border-none focus:outline-none focus:ring-0"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 shrink-0">
                                  {/* Direct Copy Product Link */}
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      try {
                                        const url = `${window.location.origin}${window.location.pathname}?product=${p.id}`;
                                        navigator.clipboard.writeText(url);
                                        setCopiedProductId(p.id);
                                        setTimeout(() => setCopiedProductId(null), 2000);
                                      } catch (err) {
                                        console.error(err);
                                      }
                                    }}
                                    className={`p-1.5 px-2.5 rounded-lg cursor-pointer transition-all active:scale-95 flex items-center gap-1 font-bold border text-[10px] ${
                                      copiedProductId === p.id 
                                        ? "text-emerald-700 bg-emerald-50 border-emerald-200" 
                                        : "text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-100"
                                    }`}
                                    title="কপি ডাইরেক্ট প্রোডাক্ট লিংক"
                                  >
                                    {copiedProductId === p.id ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>কপি হয়েছে!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Link className="w-3.5 h-3.5 text-amber-500" />
                                        <span>লিংক কপি</span>
                                      </>
                                    )}
                                  </button>

                                  <button 
                                    type="button"
                                    onClick={() => handleMerchantDeleteProduct(p.id)}
                                    className="text-gray-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg cursor-pointer transition-all active:scale-95"
                                    title="মুছে ফেলুন"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* TAB 4: ORDERS MANAGEMENT */}
                  {merchantTab === "orders" && (
                    <div className="space-y-4 font-sans text-xs animate-fade-in">
                      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-3xs">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          📦 কাস্টমার অর্ডারস ব্যবস্থাপনা ({connectedMerchantOrders.length})
                        </h4>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">আপনার স্টোরের পণ্য অর্ডার দেওয়া কাস্টমারদের ডাটা ও শিপমেন্ট প্রসেস করুন।</p>
                      </div>

                      {connectedMerchantOrders.length === 0 ? (
                        <div className="bg-white border border-slate-150 p-10 rounded-2xl text-center text-gray-400 font-medium">
                          কোনো কাস্টমার অর্ডার পাওয়া যায়নি।
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                          
                          {/* Order List (Master) */}
                          <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-4 space-y-3 max-h-[60vh] overflow-y-auto shadow-3xs">
                            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">অর্ডার তালিকা</span>
                            <div className="space-y-2">
                              {connectedMerchantOrders.map((ord) => {
                                const isSelected = selectedMerchantOrderId === ord.id || (!selectedMerchantOrderId && connectedMerchantOrders[0].id === ord.id);
                                let dateStr = "N/A";
                                try {
                                  const d = new Date(ord.timestamp);
                                  if (!isNaN(d.getTime())) {
                                    dateStr = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                                  }
                                } catch {}

                                return (
                                  <div 
                                    key={ord.id}
                                    onClick={() => setSelectedMerchantOrderId(ord.id)}
                                    className={`p-3.5 border rounded-2xl cursor-pointer transition-all hover:border-rose-500 ${
                                      isSelected ? "bg-rose-50/30 border-rose-650 shadow-3xs" : "bg-slate-50/40 border-gray-150"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-black font-mono text-slate-950 text-[11px] flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full ${
                                          ord.status === "Pending" ? "bg-amber-450" :
                                          ord.status === "Confirmed" ? "bg-emerald-500" :
                                          ord.status === "Shipped" ? "bg-blue-500" :
                                          ord.status === "Delivered" ? "bg-green-500" : "bg-rose-600"
                                        }`} />
                                        <span>#{ord.id.replace("ord-", "").slice(0, 7).toUpperCase()}</span>
                                      </span>
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                        ord.status === "Pending" ? "bg-amber-50 text-amber-700" :
                                        ord.status === "Confirmed" ? "bg-emerald-50 text-emerald-700" :
                                        ord.status === "Shipped" ? "bg-blue-50 text-blue-700" :
                                        ord.status === "Delivered" ? "bg-green-100 text-green-800" :
                                        "bg-rose-50 text-rose-700"
                                      }`}>
                                        {ord.status}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-2.5 text-[10px]">
                                      <span className="text-slate-800 font-bold">{ord.customerName}</span>
                                      <span className="text-gray-400 font-mono">{dateStr}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Selected Order Details (Detail) */}
                          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-5 space-y-5 shadow-3xs">
                            {(() => {
                              const currentOrder = connectedMerchantOrders.find(o => o.id === (selectedMerchantOrderId || connectedMerchantOrders[0].id));
                              if (!currentOrder) {
                                return (
                                  <div className="h-full flex items-center justify-center text-center p-6 text-gray-400">
                                    তালিকা থেকে যেকোনো একটি অর্ডার সিলেক্ট করুন।
                                  </div>
                                );
                              }

                              const merchantItems = currentOrder.cartItems.filter(item => 
                                merchantProducts.some(p => p.id === item.productId)
                              );

                              const merchantSubtotal = merchantItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

                              return (
                                <div className="space-y-4 text-slate-800">
                                  {/* Order Title and quick status action */}
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                                    <div>
                                      <h5 className="font-extrabold text-slate-900 text-xs">
                                        অর্ডার ডিটেইলস (Order Specification)
                                      </h5>
                                      <p className="text-[10px] font-mono text-gray-400">ID: {currentOrder.id}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-gray-500 uppercase">স্ট্যাটাস:</span>
                                      <select 
                                        value={currentOrder.status}
                                        onChange={(e) => handleUpdateOrderStatus(currentOrder.id, e.target.value as any)}
                                        className="bg-slate-50 border border-slate-200 text-xs font-black rounded-xl px-3 py-1.5 focus:outline-none focus:border-rose-500 cursor-pointer shadow-3xs"
                                      >
                                        <option value="Pending">Pending (অপেক্ষমান)</option>
                                        <option value="Confirmed">Confirmed (নিশ্চিত)</option>
                                        <option value="Shipped">Shipped (শিপড)</option>
                                        <option value="Delivered">Delivered (ডেলিভার্ড)</option>
                                        <option value="Cancelled">Cancelled (বাতিলকৃত)</option>
                                      </select>
                                    </div>
                                  </div>

                                  {/* Customer Billing Info Card */}
                                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                                    <h6 className="font-black text-[9px] text-gray-400 uppercase tracking-wider">কাস্টমার ও ডেলিভারি তথ্য</h6>
                                    <div className="grid grid-cols-2 gap-3 text-[11px] leading-relaxed">
                                      <div>
                                        <span className="text-gray-400 block text-[9px] uppercase font-bold">নাম:</span>
                                        <span className="font-extrabold text-slate-900">{currentOrder.customerName}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400 block text-[9px] uppercase font-bold">মোবাইল নম্বর:</span>
                                        <span className="font-black font-mono text-slate-900">{currentOrder.phone}</span>
                                      </div>
                                      <div className="col-span-2">
                                        <span className="text-gray-400 block text-[9px] uppercase font-bold">ডেলিভারি ঠিকানা:</span>
                                        <span className="font-semibold text-slate-700">{currentOrder.address}, {currentOrder.district}</span>
                                      </div>
                                      {currentOrder.instructions && (
                                        <div className="col-span-2 bg-amber-50 border border-amber-100 p-2.5 rounded-lg text-amber-800 text-[10px]">
                                          <span className="font-black block text-[9px] uppercase">কাস্টমার স্পেশাল নোট:</span>
                                          <span>{currentOrder.instructions}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Ordered Items list */}
                                  <div className="space-y-2.5">
                                    <h6 className="font-black text-[9px] text-gray-400 uppercase tracking-wider">অর্ডারকৃত পণ্য তালিকা ({merchantItems.length})</h6>
                                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                      {merchantItems.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 bg-slate-50/30 p-2.5 border border-slate-100 rounded-xl">
                                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 bg-white shrink-0">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h6 className="font-bold text-slate-950 truncate leading-snug text-[11px]">{item.title}</h6>
                                            <div className="flex items-center gap-2 mt-1 text-[9px] text-gray-400 font-medium">
                                              {item.color && <span>রং: {item.color}</span>}
                                              {item.size && <span>সাইজ: {item.size}</span>}
                                              <span>Qty: {item.quantity}</span>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <span className="font-bold font-mono text-slate-950 block">৳{item.price * item.quantity}</span>
                                            <span className="text-[9px] font-mono text-gray-400 block">৳{item.price} x {item.quantity}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Total invoice subtotal */}
                                  <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between">
                                    <span className="text-gray-400 font-black uppercase tracking-wider text-[10px]">স্টোর সাব-টোটাল (Subtotal):</span>
                                    <span className="font-black text-rose-600 font-mono text-sm bg-rose-50/50 px-3.5 py-1 rounded-xl border border-rose-100">৳{formatBDT(merchantSubtotal)}</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ================================================================ */}
          {/* ===================== AFFILIATE FLOW =========================== */}
          {/* ================================================================ */}
          {userType === "affiliate" && (
            <>
              {/* Affiliate Registration */}
              {mode === "register" && (
                <div className="space-y-3 sm:space-y-4" id="affiliate-register-step">
                  <div className="text-center space-y-0.5">
                    <h4 className="text-sm font-display font-bold text-emerald-500 uppercase tracking-wide">
                      ZSHOP BD Affiliate Account (এফিলিয়েট পার্টনার অ্যাকাউন্ট খুলুন)
                    </h4>
                    <p className="text-[11px] text-gray-500 font-sans leading-tight">
                      আমাদের যেকোনো প্রোডাক্ট শেয়ার করে প্রতি সেলে আকর্ষণীয় কমিশন ইনকাম করুন!
                    </p>
                  </div>

                  {affError && (
                    <div className="p-3 bg-red-55/10 text-red-650 text-xs rounded-xl flex items-center gap-2.5 border border-red-100">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <p className="font-semibold">{affError}</p>
                    </div>
                  )}

                  {affSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2.5 border border-emerald-100">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                      <p className="font-semibold">এফিলিয়েট অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! অনুগ্রহ করে লগইন করুন।</p>
                    </div>
                  )}

                  <form onSubmit={handleAffiliateRegisterSubmit} className="space-y-2.5 sm:space-y-3">
                    <div className="flex flex-col items-center justify-center p-2 border border-dashed border-gray-200 rounded-xl bg-slate-50/40 space-y-1">
                      <p className="text-[9px] uppercase font-mono tracking-wider text-gray-400 font-bold">Affiliate Avatar (আপনার ছবি)</p>
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 bg-gray-100 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                          {affAvatar ? (
                            <img src={affAvatar} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <button
                            type="button"
                            className="py-1 px-2.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold hover:bg-slate-800 flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Upload className="w-3 h-3" />
                            <span>আপলোড করুন</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono tracking-wider text-gray-500 uppercase mb-0.5">
                        Full Name (আপনার পূর্ণ নাম)
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-2 sm:top-2.5 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          placeholder="যেমন: Kabir Hosen"
                          value={affName}
                          onChange={(e) => setAffName(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-1.5 sm:py-2.5 bg-white border border-gray-200 focus:border-emerald-400 rounded-xl text-xs text-slate-800 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono tracking-wider text-gray-500 uppercase mb-0.5">
                        Mobile Number (মোবাইল নম্বর - যা এফিলিয়েট আইডি হিসেবে কাজ করবে)
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-2 sm:top-2.5 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          placeholder="যেমন: 01712345678"
                          value={affPhone}
                          onChange={(e) => setAffPhone(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-1.5 sm:py-2.5 bg-white border border-gray-200 focus:border-emerald-400 rounded-xl text-xs text-slate-800 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">
                        Password (পাসওয়ার্ড)
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          required
                          placeholder="কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড"
                          value={affPassword}
                          onChange={(e) => setAffPassword(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 focus:border-emerald-400 rounded-xl text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-display font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                    >
                      Create Affiliate Partner Account
                    </button>
                  </form>

                  <div className="border-t border-gray-150 pt-3 text-center">
                    <p className="text-xs text-gray-555">
                      ইতিমধ্যে এফিলিয়েট অ্যাকাউন্ট আছে? {" "}
                      <button 
                        type="button"
                        onClick={() => setMode("login")}
                        className="text-emerald-500 font-bold hover:underline cursor-pointer"
                      >
                        এফিলিয়েট লগইন করুন
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* Affiliate Login */}
              {mode === "login" && (
                <div className="space-y-5" id="affiliate-login-step">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-display font-bold text-slate-900 uppercase tracking-wide">
                      ZSHOP BD Affiliate Center (এফিলিয়েট মেম্বার লগইন)
                    </h4>
                    <p className="text-[11px] text-gray-500 font-sans">
                      মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে আপনার এফিলিয়েট ড্যাশবোর্ডে প্রবেশ করুন
                    </p>
                  </div>

                  {affError && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-2.5 border border-red-100">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <p className="font-semibold">{affError}</p>
                    </div>
                  )}

                  <form onSubmit={handleAffiliateLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">
                        Affiliate Mobile Number (এফিলিয়েট মোবাইল নম্বর)
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          placeholder="যেমন: 01712345678"
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 focus:border-emerald-400 rounded-xl text-xs text-slate-800 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">
                        Affiliate Password (এফিলিয়েট পাসওয়ার্ড)
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 focus:border-emerald-400 rounded-xl text-xs text-slate-800 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-display font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                    >
                      Authenticate and Access Affiliate Center
                    </button>
                  </form>

                  <div className="border-t border-gray-150 pt-3 text-center">
                    <p className="text-xs text-gray-555">
                      নতুন এফিলিয়েট অ্যাকাউন্ট খুলতে চান? {" "}
                      <button 
                        type="button"
                        onClick={() => setMode("register")}
                        className="text-emerald-500 font-bold hover:underline cursor-pointer font-sans"
                      >
                        এখানে এফিলিয়েট অ্যাকাউন্ট সাইন আপ করুন
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* Affiliate Dashboard Area */}
              {mode === "profile" && activeAffiliate && (
                <div className="space-y-6 text-slate-800 font-sans" id="affiliate-high-fidelity-dashboard-view">
                  
                  {/* Part 1: Welcome Banner (high-fidelity custom premium design matching image) */}
                  <div className="bg-[#0b1329] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-center relative overflow-hidden shadow-xl min-h-[160px] sm:min-h-[190px]">
                    {/* Artistic gradient meshes */}
                    <div className="absolute right-[-40px] top-[-40px] w-80 h-80 bg-gradient-to-tr from-[#1e293b] via-[#334155] to-indigo-900 opacity-40 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute left-[-20px] bottom-[-20px] w-60 h-60 bg-[#10b981] opacity-10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="relative z-10 space-y-1.5">
                      <span className="inline-block px-2.5 py-0.5 bg-slate-800 border border-slate-700/60 rounded text-[9px] font-mono font-bold uppercase tracking-widest text-[#f85606]">
                        ZSHOP BD Affiliate Partner
                      </span>
                      <h2 className="text-xl sm:text-3xl font-black text-white font-sans tracking-tight">
                        Welcome back, <span className="text-[#facc15]">{activeAffiliate.name}</span>!
                      </h2>
                      <p className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-none pt-0.5">
                        Your Affiliate Dashboard
                      </p>
                    </div>
                  </div>

                  {/* Part 2: Quick Metrics Stats Grid (4 Cards matching the image layout) */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Metric 1: Overall Earnings */}
                    <div className="bg-white border border-gray-150 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-3xs relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="block text-slate-500 text-[10px] font-extrabold uppercase tracking-widest leading-none">Overall Earnings</span>
                        <div className="w-8 h-8 bg-[#FFF9F2] rounded-full flex items-center justify-center shrink-0">
                          <Coins className="w-4 h-4 text-amber-500" />
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-lg sm:text-xl font-black text-slate-900 font-sans leading-none">
                          BDT {formatBDT(activeAffiliate.earnings || 0)}
                        </p>
                        <p className="text-[9px] text-[#10b981] font-bold flex items-center gap-0.5 leading-none pt-0.5">
                          <span>▲ BDT growth</span>
                        </p>
                      </div>
                    </div>

                    {/* Metric 2: Monthly Conversions */}
                    <div className="bg-white border border-gray-150 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-3xs relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="block text-slate-500 text-[10px] font-extrabold uppercase tracking-widest leading-none">Monthly Conversions</span>
                        <div className="w-8 h-8 bg-[#E7F7EE] rounded-full flex items-center justify-center shrink-0">
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-lg sm:text-xl font-black text-slate-900 font-sans leading-none">
                          {activeAffiliate.salesCount || 0}
                        </p>
                        <p className="text-[9px] text-gray-400 font-bold leading-none pt-0.5">
                          {activeAffiliate.clicks && activeAffiliate.clicks > 0 
                            ? `${((activeAffiliate.salesCount / activeAffiliate.clicks) * 100).toFixed(1)}% conversion rate`
                            : "0.0% conversion rate"}
                        </p>
                      </div>
                    </div>

                    {/* Metric 3: Unique Clicks */}
                    <div className="bg-white border border-gray-150 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-3xs relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="block text-slate-500 text-[10px] font-extrabold uppercase tracking-widest leading-none">Unique Clicks</span>
                        <div className="w-8 h-8 bg-[#FFF2EE] rounded-full flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-[#f85606]" />
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-lg sm:text-xl font-black text-slate-900 font-sans leading-none">
                          {(activeAffiliate.clicks || 0).toLocaleString()}
                        </p>
                        <p className="text-[9px] text-gray-400 font-bold leading-none pt-0.5">
                          Total unique visitor tracking
                        </p>
                      </div>
                    </div>

                    {/* Metric 4: Traffic Sources (Progress listing inside card) */}
                    <div className="bg-white border border-gray-150 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 pb-3 shadow-3xs relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="block text-slate-500 text-[10px] font-extrabold uppercase tracking-widest leading-none">Traffic Sources</span>
                        <div className="w-8 h-8 bg-[#FAF1FF] rounded-full flex items-center justify-center shrink-0">
                          <Layers className="w-4 h-4 text-purple-500" />
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-[9px] font-sans text-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="truncate">Direct Links</span>
                          <span className="font-mono font-bold text-slate-800 ml-1">
                            {Math.round((activeAffiliate.clicks || 0) * 0.7)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="truncate">Product Shares</span>
                          <span className="font-mono font-bold text-slate-800 ml-1">
                            {Math.round((activeAffiliate.clicks || 0) * 0.3)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="truncate text-gray-400">Other Sources</span>
                          <span className="font-mono font-bold text-gray-400 ml-1">0</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Part 3: Top Performing Affiliate Links (Visual sliders matching image) */}
                  <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-[#f85606]" />
                        <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest font-sans">
                          Top Performing Affiliate Links
                        </h4>
                      </div>
                      
                      {/* Left and right chevron navigations */}
                      <div className="flex items-center gap-1">
                        <button className="p-1 px-2 border border-gray-150 rounded-lg bg-gray-50 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-xs">
                          ‹
                        </button>
                        <button className="p-1 px-2 border border-gray-150 rounded-lg bg-gray-50 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-xs">
                          ›
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                      {(() => {
                        const affiliateProducts = allProducts.filter(p => p.isAffiliateReady === true);
                        const mockPerformers = [
                          {
                            id: "aff-mock-1",
                            title: "Stumen's Woyal Georgette Embroidered Kurti",
                            price: 550,
                            image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300",
                            clicks: "1.00",
                            traffics: "60%",
                            metricName: "Traffics"
                          },
                          {
                            id: "aff-mock-2",
                            title: "Luxury Leather Wallet Pocket Black Edition",
                            price: 550,
                            image: "https://images.unsplash.com/photo-1627124118123-fecc544ae9c6?auto=format&fit=crop&q=80&w=300",
                            clicks: "1.00",
                            traffics: "60%",
                            metricName: "Traffics"
                          },
                          {
                            id: "aff-mock-3",
                            title: "Ultra Precision Gear Lens Body Kit Duo",
                            price: 550,
                            image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=300",
                            clicks: "1.00",
                            traffics: "60%",
                            metricName: "Trollies"
                          },
                          {
                            id: "aff-mock-4",
                            title: "Wireless Over-Ear Studio ANC Headphones Black",
                            price: 550,
                            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300",
                            clicks: "1.00",
                            traffics: "60%",
                            metricName: "Traffizs"
                          },
                          {
                            id: "aff-mock-5",
                            title: "Special Floral Embroidered Wedding Attire Kurti",
                            price: 550,
                            image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=300",
                            clicks: "1.00",
                            traffics: "60%",
                            metricName: "Clicks"
                          }
                        ];

                        const activeShowcase = affiliateProducts.length > 0 
                          ? affiliateProducts.map((p, ix) => {
                              const commRate = p.affCommission || 8;
                              const commVal = p.affiliateCommission !== undefined && p.affiliateCommission >= 0 
                                ? p.affiliateCommission 
                                : Math.round(p.price * commRate / 100);
                              return {
                                id: p.id,
                                title: p.title,
                                price: p.price,
                                image: p.image,
                                clicks: String(Math.round((activeAffiliate.clicks || 120) * (0.35 - ix * 0.05) + 12)),
                                commission: `৳${commVal}`,
                                rate: `${commRate}%`
                              };
                            })
                          : mockPerformers.map((item, ix) => ({
                              id: item.id,
                              title: item.title,
                              price: item.price,
                              image: item.image,
                              clicks: String(185 - ix * 25),
                              commission: `৳${Math.round(item.price * 0.08)}`,
                              rate: "8%"
                            }));

                        return activeShowcase.slice(0, 5).map((item) => {
                          const refLink = `${window.location.origin}?affiliate=${activeAffiliate.phone}&product=${item.id}`;
                          const isCopied = copiedProductId === item.id;

                          return (
                            <div key={item.id} className="bg-white border border-gray-150 rounded-xl overflow-hidden hover:border-[#f85606] transition-all flex flex-col justify-between shadow-2xs group relative">
                              <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                                <img 
                                  referrerPolicy="no-referrer"
                                  src={item.image} 
                                  alt="product" 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" 
                                />
                              </div>

                              <div className="p-2 space-y-2 bg-[#FCFCFD]">
                                {/* Product link generate copy trigger */}
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(refLink);
                                    setCopiedProductId(item.id);
                                    setTimeout(() => setCopiedProductId(null), 2000);
                                  }}
                                  className={`w-full py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                                    isCopied 
                                      ? "bg-slate-900 text-white" 
                                      : "bg-slate-950 text-white hover:bg-slate-800"
                                  }`}
                                >
                                  {isCopied ? <Check className="w-3 h-3 text-amber-400" /> : <Link className="w-3 h-3 shrink-0" />}
                                  <span>{isCopied ? "Link Copied" : "Product Link"}</span>
                                </button>

                                {/* Bottom metrics card layout */}
                                <div className="grid grid-cols-3 gap-0.5 text-center text-[9px] border-t border-gray-100 pt-2 font-mono text-slate-500">
                                  <div>
                                    <p className="font-extrabold text-slate-900 text-[10px] leading-tight">৳{item.price}</p>
                                    <p className="text-gray-400 text-[8px] truncate">মূল্য</p>
                                  </div>
                                  <div>
                                    <p className="font-extrabold text-slate-900 text-[10px] leading-tight">{item.clicks}</p>
                                    <p className="text-gray-400 text-[8px] truncate">ক্লিক</p>
                                  </div>
                                  <div>
                                    <p className="font-extrabold text-[#10b981] text-[10px] leading-tight">{item.commission}</p>
                                    <p className="text-gray-400 text-[8px] truncate leading-none mt-0.5">কমিশন ({item.rate})</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Part 4: Marketing Tools Carousel bar matching image exactly */}
                  <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest font-sans">
                        Marketing Tools
                      </h4>
                      <p className="text-[10px] text-gray-400 font-medium font-sans">
                        Quick-access to useers and resources
                      </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                      
                      {/* Pill 1: Quick Access */}
                      <button 
                        onClick={() => setMarketingToolActiveTab("quick")}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          marketingToolActiveTab === "quick" 
                            ? "bg-[#0b1329] border-[#0b1329] text-white" 
                            : "bg-gray-50 border-gray-150 text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg shrink-0 ${marketingToolActiveTab === "quick" ? "bg-amber-500/20 text-amber-400" : "bg-indigo-50 text-indigo-600"}`}>
                            <Store className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold leading-tight">Quick Access</p>
                            <p className={`text-[8px] leading-none mt-0.5 ${marketingToolActiveTab === "quick" ? "text-slate-400" : "text-gray-450"}`}>Caness quick access</p>
                          </div>
                        </div>
                      </button>

                      {/* Pill 2: Banners */}
                      <button 
                        onClick={() => setMarketingToolActiveTab("banners")}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          marketingToolActiveTab === "banners" 
                            ? "bg-[#0b1329] border-[#0b1329] text-white" 
                            : "bg-gray-50 border-gray-150 text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg shrink-0 ${marketingToolActiveTab === "banners" ? "bg-amber-500/20 text-amber-400" : "bg-amber-50 text-amber-600"}`}>
                            <Tag className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold leading-tight">Banners</p>
                            <p className={`text-[8px] leading-none mt-0.5 ${marketingToolActiveTab === "banners" ? "text-slate-400" : "text-gray-450"}`}>Banners and banners</p>
                          </div>
                        </div>
                      </button>

                      {/* Pill 3: Text Links */}
                      <button 
                        onClick={() => setMarketingToolActiveTab("text_links")}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          marketingToolActiveTab === "text_links" 
                            ? "bg-[#0b1329] border-[#0b1329] text-white" 
                            : "bg-gray-50 border-gray-150 text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg shrink-0 ${marketingToolActiveTab === "text_links" ? "bg-amber-500/20 text-amber-400" : "bg-purple-50 text-purple-600"}`}>
                            <Layers className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold leading-tight">Text Links</p>
                            <p className={`text-[8px] leading-none mt-0.5 ${marketingToolActiveTab === "text_links" ? "text-slate-400" : "text-gray-450"}`}>Banner and text links</p>
                          </div>
                        </div>
                      </button>

                      {/* Pill 4: Text Link */}
                      <button 
                        onClick={() => setMarketingToolActiveTab("text_link")}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          marketingToolActiveTab === "text_link" 
                            ? "bg-[#0b1329] border-[#0b1329] text-white" 
                            : "bg-gray-50 border-gray-150 text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg shrink-0 ${marketingToolActiveTab === "text_link" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-50 text-emerald-600"}`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold leading-tight">Text Link</p>
                            <p className={`text-[8px] leading-none mt-0.5 ${marketingToolActiveTab === "text_link" ? "text-slate-400" : "text-gray-450"}`}>Senrar and text link</p>
                          </div>
                        </div>
                      </button>

                    </div>

                    {/* Miniature slider dots */}
                    <div className="flex justify-center items-center gap-1.5 pt-2 border-b border-gray-100 pb-4">
                      <span className={`h-1.5 rounded-full transition-all duration-300 ${marketingToolActiveTab === "quick" ? "w-4 bg-rose-600" : "w-1.5 bg-gray-250"}`} />
                      <span className={`h-1.5 rounded-full transition-all duration-300 ${marketingToolActiveTab === "banners" ? "w-4 bg-rose-600" : "w-1.5 bg-gray-250"}`} />
                      <span className={`h-1.5 rounded-full transition-all duration-300 ${marketingToolActiveTab === "text_links" ? "w-4 bg-rose-600" : "w-1.5 bg-gray-250"}`} />
                      <span className={`h-1.5 rounded-full transition-all duration-300 ${marketingToolActiveTab === "text_link" ? "w-4 bg-rose-600" : "w-1.5 bg-gray-250"}`} />
                    </div>

                    {/* Active Tab Panel Content */}
                    <div className="p-4 sm:p-5 bg-slate-50 border border-gray-150 rounded-xl space-y-4">
                      {marketingToolActiveTab === "quick" && (
                        <div className="space-y-3 font-sans">
                          <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                            কিভাবে এফিলিয়েট মার্কেটিং শুরু করবেন? (Quick Start Guide)
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs text-slate-700">
                            <div className="bg-white p-3.5 border border-gray-150 rounded-xl space-y-1 shadow-3xs">
                              <p className="font-black text-indigo-600 flex items-center gap-1">
                                <span className="bg-indigo-50 text-indigo-700 w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px]">১</span>
                                লিংক সিলেক্ট করুন
                              </p>
                              <p className="text-[11px] leading-relaxed text-slate-500">
                                নিচের লিংক জেনারেটর বা টপ প্রোডাক্ট থেকে আপনার ইউনিক এফিলিয়েট লিংক জেনারেট বা কপি করুন।
                              </p>
                            </div>
                            <div className="bg-white p-3.5 border border-gray-150 rounded-xl space-y-1 shadow-3xs">
                              <p className="font-black text-amber-600 flex items-center gap-1">
                                <span className="bg-amber-50 text-amber-700 w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px]">২</span>
                                সোশ্যাল মিডিয়ায় শেয়ার করুন
                              </p>
                              <p className="text-[11px] leading-relaxed text-slate-500">
                                আপনার তৈরি করা লিংক ফেসবুক পেজ, গ্রুপ, ইউটিউব ডেসক্রিপশন বা হোয়াটসঅ্যাপের মাধ্যমে বন্ধুদের সাথে শেয়ার করুন।
                              </p>
                            </div>
                            <div className="bg-white p-3.5 border border-gray-150 rounded-xl space-y-1 shadow-3xs">
                              <p className="font-black text-emerald-600 flex items-center gap-1">
                                <span className="bg-emerald-50 text-emerald-700 w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px]">৩</span>
                                রিয়েল-টাইম কমিশন বুঝে নিন
                              </p>
                              <p className="text-[11px] leading-relaxed text-slate-500">
                                কাস্টমাররা আপনার রেফারেল লিংক ব্যবহার করে অর্ডার করলে সফলভাবে প্রোডাক্ট ডেলিভারির পর আপনার ব্যালেন্সে কমিশন যোগ হবে।
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {marketingToolActiveTab === "banners" && (
                        <div className="space-y-4 font-sans">
                          <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            প্রমোশনাল ব্যানার কোড (Website Banner Widgets)
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-2 bg-white p-3.5 border border-gray-150 rounded-xl shadow-3xs">
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-slate-800">Leaderboard Banner (728 x 90)</span>
                                <button
                                  onClick={() => {
                                    const code = `<a href="${window.location.origin}?affiliate=${activeAffiliate.phone}" target="_blank" rel="noopener noreferrer"><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=728" alt="ZSHOP BD Mega Deal" style="border-radius:8px; width:100%; max-width:728px;" /></a>`;
                                    navigator.clipboard.writeText(code);
                                    alert("Leaderboard banner HTML code copied to clipboard!");
                                  }}
                                  className="text-[10px] text-rose-600 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>কোড কপি করুন</span>
                                </button>
                              </div>
                              <div className="p-2 bg-slate-50 rounded-lg text-[9px] font-mono text-gray-500 max-h-16 overflow-y-auto border border-gray-200">
                                {`<a href="${window.location.origin}?affiliate=${activeAffiliate.phone}" target="_blank"><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=728" alt="ZSHOP BD" /></a>`}
                              </div>
                            </div>

                            <div className="space-y-2 bg-white p-3.5 border border-gray-150 rounded-xl shadow-3xs">
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-slate-800">Square Sidebar Banner (300 x 250)</span>
                                <button
                                  onClick={() => {
                                    const code = `<a href="${window.location.origin}?affiliate=${activeAffiliate.phone}" target="_blank" rel="noopener noreferrer"><img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=300" alt="ZSHOP BD Premium Collection" style="border-radius:12px; width:100%; max-width:300px;" /></a>`;
                                    navigator.clipboard.writeText(code);
                                    alert("Square sidebar banner HTML code copied to clipboard!");
                                  }}
                                  className="text-[10px] text-rose-600 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>কোড কপি করুন</span>
                                </button>
                              </div>
                              <div className="p-2 bg-slate-50 rounded-lg text-[9px] font-mono text-gray-500 max-h-16 overflow-y-auto border border-gray-200">
                                {`<a href="${window.location.origin}?affiliate=${activeAffiliate.phone}" target="_blank"><img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=300" alt="ZSHOP BD" /></a>`}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {marketingToolActiveTab === "text_links" && (
                        <div className="space-y-3 font-sans">
                          <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                            কাস্টম টেক্সট লিংক মেকার (Custom Anchor Link)
                          </h5>
                          <div className="bg-white p-4 border border-gray-150 rounded-xl shadow-3xs space-y-3 text-xs">
                            <p className="text-[11px] text-slate-500 leading-normal">
                              আপনি আপনার ওয়েবসাইটের লেখার ভেতর এফিলিয়েট লিংক এম্বেড করতে চাইলে নিচে লেখার টেক্সটটি লিখে "কোড কপি করুন" এ চাপুন।
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input 
                                type="text"
                                placeholder="লিংকের লেখা (যেমন: সেরা দামে ট্রেন্ডি থ্রিপিস ও শাড়ি কিনতে ক্লিক করুন)"
                                id="custom-anchor-text-input"
                                className="flex-1 px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs text-slate-800 outline-none focus:border-rose-500 font-medium"
                              />
                              <button
                                onClick={() => {
                                  const inputEl = document.getElementById("custom-anchor-text-input") as HTMLInputElement;
                                  const text = inputEl?.value || "সেরা মূল্যে কেনাকাটা করুন";
                                  const htmlCode = `<a href="${window.location.origin}?affiliate=${activeAffiliate.phone}" style="color:#e11d48; font-weight:bold; text-decoration:underline;" target="_blank" rel="noopener noreferrer">${text}</a>`;
                                  navigator.clipboard.writeText(htmlCode);
                                  alert("Custom anchor tag code copied successfully!");
                                }}
                                className="px-5 py-2 bg-[#0b1329] hover:bg-slate-900 text-white font-bold rounded-xl transition-colors cursor-pointer text-center text-xs"
                              >
                                কোড কপি করুন
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {marketingToolActiveTab === "text_link" && (
                        <div className="space-y-3 font-sans">
                          <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            সোশ্যাল মিডিয়া রেডি পোস্ট টেমপ্লেট (Social Media Sharing Post)
                          </h5>
                          <div className="bg-white p-4 border border-gray-150 rounded-xl shadow-3xs space-y-3 text-xs">
                            <p className="text-[11px] text-slate-500 leading-normal">
                              সোশ্যাল মিডিয়ায় শেয়ার করার জন্য একটি সম্পূর্ণ প্রমোশনাল পোস্ট সাজিয়ে দেওয়া হয়েছে। আপনার রেফারেল লিংকটি নিচে স্বয়ংক্রিয়ভাবে যুক্ত আছে:
                            </p>
                            <textarea
                              rows={4}
                              readOnly
                              value={`আসসালামু আলাইকুম! আপনারা যারা ঘরে বসে আকর্ষণীয় ডিসকাউন্টে ও সেরা দামে বাংলাদেশের সেরা প্রিমিয়াম কোয়ালিটির থ্রিপিস, শাড়ি, কুর্তি, ওয়ালেট ও ঘড়ি কেনাকাটা করতে চান, আজই ভিজিট করুন ZSHOP BD-তে! দেশজুড়ে অত্যন্ত দ্রুত হোম ডেলিভারি ও ফুল চেক-ইন ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। 🌟\n\nনিচের লিংকে ক্লিক করে এখনই সংগ্রহ করুন আপনার পছন্দের পণ্যটি:\n👉 ${window.location.origin}?affiliate=${activeAffiliate.phone}`}
                              className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs text-slate-700 outline-none resize-none font-medium leading-relaxed"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  const text = `আসসালামু আলাইকুম! আপনারা যারা ঘরে বসে আকর্ষণীয় ডিসকাউন্টে ও সেরা দামে বাংলাদেশের সেরা প্রিমিয়াম কোয়ালিটির থ্রিপিস, শাড়ি, কুর্তি, ওয়ালেট ও ঘড়ি কেনাকাটা করতে চান, আজই ভিজিট করুন ZSHOP BD-তে! দেশজুড়ে অত্যন্ত দ্রুত হোম ডেলিভারি ও ফুল চেক-ইন ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। 🌟\n\nনিচের লিংকে ক্লিক করে এখনই সংগ্রহ করুন আপনার পছন্দের পণ্যটি:\n👉 ${window.location.origin}?affiliate=${activeAffiliate.phone}`;
                                  navigator.clipboard.writeText(text);
                                  alert("সোশ্যাল পোস্ট কপি হয়েছে! এখন ফেসবুক বা হোয়াটসঅ্যাপে পেস্ট করে দিন।");
                                }}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
                              >
                                কপি করুন (Copy Text)
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Part 5: Splitted Dual-Column Layout: Graphs vs Payment History */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    
                    {/* LEFT COLUMN: Graphics representation panels */}
                    <div className="space-y-6">
                      
                      {/* Graphics 1: Sales Overview spline area */}
                      {(() => {
                        const now = new Date();
                        const salesGraphData: { label: string; value: number }[] = [];

                        if (salesTimeframe === "monthly") {
                          // Last 6 months
                          for (let i = 5; i >= 0; i--) {
                            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                            const label = d.toLocaleString("bn-BD", { month: "short" }) || d.toLocaleString("en-US", { month: "short" });
                            const year = d.getFullYear();
                            const month = d.getMonth();
                            
                            let sum = 0;
                            connectedAffiliateOrders.forEach((ord) => {
                              try {
                                const ordDate = new Date(ord.timestamp);
                                if (isNaN(ordDate.getTime())) return;
                                if (ordDate.getFullYear() === year && ordDate.getMonth() === month) {
                                  if (salesOverviewMetric === "revenue") {
                                    let earned = 0;
                                    (ord.cartItems || []).forEach((item: any) => {
                                      const prodObj = allProducts.find(p => String(p.id) === String(item.productId));
                                      if (prodObj) {
                                        if (prodObj.affiliateCommission !== undefined && prodObj.affiliateCommission >= 0) {
                                          earned += item.quantity * prodObj.affiliateCommission;
                                        } else {
                                          const commissionRate = prodObj.affCommission > 0 ? (prodObj.affCommission / 100) : 0.08;
                                          earned += (item.price * item.quantity) * commissionRate;
                                        }
                                      } else {
                                        earned += (item.price * item.quantity) * 0.08;
                                      }
                                    });
                                    sum += earned;
                                  } else {
                                    sum += 1;
                                  }
                                }
                              } catch {}
                            });

                            salesGraphData.push({ label, value: sum });
                          }
                        } else {
                          // Last 7 days
                          for (let i = 6; i >= 0; i--) {
                            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                            const label = `${d.getDate()} ${d.toLocaleString("bn-BD", { month: "short" }) || d.toLocaleString("en-US", { month: "short" })}`;
                            const year = d.getFullYear();
                            const month = d.getMonth();
                            const dateVal = d.getDate();

                            let sum = 0;
                            connectedAffiliateOrders.forEach((ord) => {
                              try {
                                const ordDate = new Date(ord.timestamp);
                                if (isNaN(ordDate.getTime())) return;
                                if (ordDate.getFullYear() === year && ordDate.getMonth() === month && ordDate.getDate() === dateVal) {
                                  if (salesOverviewMetric === "revenue") {
                                    let earned = 0;
                                    (ord.cartItems || []).forEach((item: any) => {
                                      const prodObj = allProducts.find(p => String(p.id) === String(item.productId));
                                      if (prodObj) {
                                        if (prodObj.affiliateCommission !== undefined && prodObj.affiliateCommission >= 0) {
                                          earned += item.quantity * prodObj.affiliateCommission;
                                        } else {
                                          const commissionRate = prodObj.affCommission > 0 ? (prodObj.affCommission / 100) : 0.08;
                                          earned += (item.price * item.quantity) * commissionRate;
                                        }
                                      } else {
                                        earned += (item.price * item.quantity) * 0.08;
                                      }
                                    });
                                    sum += earned;
                                  } else {
                                    sum += 1;
                                  }
                                }
                              } catch {}
                            });

                            salesGraphData.push({ label, value: sum });
                          }
                        }

                        const maxVal = Math.max(...salesGraphData.map(d => d.value));
                        
                        const svgWidth = 500;
                        const svgHeight = 160;
                        const paddingXLeft = 45;
                        const paddingXRight = 45;
                        const paddingYTop = 30;
                        const paddingYBottom = 30;

                        const chartPoints = salesGraphData.map((d, i) => {
                          const totalPoints = salesGraphData.length;
                          const x = paddingXLeft + (i * (svgWidth - paddingXLeft - paddingXRight) / (totalPoints - 1));
                          const y = maxVal > 0 
                            ? svgHeight - paddingYBottom - ((d.value / maxVal) * (svgHeight - paddingYTop - paddingYBottom))
                            : svgHeight - paddingYBottom;
                          return { x, y, label: d.label, value: d.value };
                        });

                        const linePathD = chartPoints.length > 0 
                          ? "M " + chartPoints.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ")
                          : "";

                        const areaPathD = chartPoints.length > 0
                          ? `${linePathD} L ${chartPoints[chartPoints.length - 1].x.toFixed(1)} ${(svgHeight - paddingYBottom).toFixed(1)} L ${chartPoints[0].x.toFixed(1)} ${(svgHeight - paddingYBottom).toFixed(1)} Z`
                          : "";

                        return (
                          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                              <div className="space-y-0.5">
                                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-widest font-sans flex items-center gap-1.5">
                                  <span>Sales Overview</span>
                                  <span className="text-[10px] px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded-full font-bold lowercase tracking-normal">live</span>
                                </h4>
                                <p className="text-[10px] text-gray-400 font-medium">
                                  {salesTimeframe === "monthly" 
                                    ? "আপনার স্টোরের গত ৬ মাসের বিক্রয় বিবরণী গ্রাফ।" 
                                    : "আপনার স্টোরের গত ৭ দিনের বিক্রয় বিবরণী গ্রাফ।"}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <select
                                  value={salesOverviewMetric}
                                  onChange={(e) => setSalesOverviewMetric(e.target.value as any)}
                                  className="text-[9px] font-extrabold border border-gray-200 px-2 py-1 rounded-lg text-slate-750 bg-gray-50 focus:outline-none focus:border-rose-500 cursor-pointer"
                                >
                                  <option value="revenue">৳ মোট আয়</option>
                                  <option value="orders">📦 অর্ডারস</option>
                                </select>

                                <select
                                  value={salesTimeframe}
                                  onChange={(e) => setSalesTimeframe(e.target.value as any)}
                                  className="text-[9px] font-extrabold border border-gray-200 px-2 py-1 rounded-lg text-slate-755 bg-gray-50 focus:outline-none focus:border-rose-500 cursor-pointer"
                                >
                                  <option value="monthly">মাসিক</option>
                                  <option value="weekly">সাপ্তাহিক</option>
                                </select>
                              </div>
                            </div>

                            {/* Spline area graph representation */}
                            <div className="w-full h-48 relative bg-slate-50/50 border border-gray-100 rounded-xl p-2 flex flex-col justify-between">
                              <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                                <defs>
                                  <linearGradient id="indigoAreaGraph" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#e11d48" stopOpacity="0.22" />
                                    <stop offset="100%" stopColor="#e11d48" stopOpacity="0.00" />
                                  </linearGradient>
                                </defs>
                                
                                {/* Horizontal light grid lines representing scales */}
                                <line x1="15" y1="20" x2="485" y2="20" stroke="#EBEEF2" strokeWidth="1" strokeDasharray="2 2" />
                                <line x1="15" y1="50" x2="485" y2="50" stroke="#EBEEF2" strokeWidth="1" strokeDasharray="2 2" />
                                <line x1="15" y1="80" x2="485" y2="80" stroke="#EBEEF2" strokeWidth="1" strokeDasharray="2 2" />
                                <line x1="15" y1="110" x2="485" y2="110" stroke="#EBEEF2" strokeWidth="1" strokeDasharray="2 2" />
                                <line x1="15" y1="140" x2="485" y2="140" stroke="#94A3B8" strokeWidth="1" />

                                {/* Wavy spline area representing clicks/sales */}
                                {maxVal > 0 && chartPoints.length > 0 && (
                                  <>
                                    <path 
                                      d={areaPathD} 
                                      fill="url(#indigoAreaGraph)" 
                                    />
                                    <path 
                                      d={linePathD} 
                                      fill="none" 
                                      stroke="#e11d48" 
                                      strokeWidth="2.5" 
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </>
                                )}

                                {/* Hover tooltip guide vertical line */}
                                {hoveredPointIdx !== null && chartPoints[hoveredPointIdx] && (
                                  <line 
                                    x1={chartPoints[hoveredPointIdx].x} 
                                    y1={20} 
                                    x2={chartPoints[hoveredPointIdx].x} 
                                    y2={140} 
                                    stroke="#cbd5e1" 
                                    strokeWidth="1.5" 
                                    strokeDasharray="3 3" 
                                  />
                                )}

                                {/* Circles on apex points */}
                                {maxVal > 0 && chartPoints.map((p, idx) => (
                                  <circle 
                                    key={idx}
                                    cx={p.x} 
                                    cy={p.y} 
                                    r={hoveredPointIdx === idx ? "5" : "3.5"} 
                                    fill={hoveredPointIdx === idx ? "#e11d48" : "#fff"} 
                                    stroke="#e11d48" 
                                    strokeWidth="2" 
                                    className="cursor-pointer transition-all duration-150"
                                    onMouseEnter={() => setHoveredPointIdx(idx)}
                                    onMouseLeave={() => setHoveredPointIdx(null)}
                                  />
                                ))}
                              </svg>

                              {/* Interactive hovered tooltip absolute card */}
                              {hoveredPointIdx !== null && chartPoints[hoveredPointIdx] && (
                                <div 
                                  className="absolute bg-slate-900 text-white rounded-lg px-2.5 py-1.5 text-[10px] font-sans font-bold shadow-md pointer-events-none transition-all duration-100 border border-slate-700 flex flex-col items-center"
                                  style={{
                                    left: `${(chartPoints[hoveredPointIdx].x / 500) * 100}%`,
                                    top: `${Math.min(100, Math.max(10, ((chartPoints[hoveredPointIdx].y - 35) / 160) * 100))}%`,
                                    transform: 'translateX(-50%)'
                                  }}
                                >
                                  <span className="text-gray-300 text-[8px] uppercase">{chartPoints[hoveredPointIdx].label}</span>
                                  <span className="text-white text-xs mt-0.5 font-bold font-mono">
                                    {salesOverviewMetric === "revenue" 
                                      ? `৳${formatBDT(chartPoints[hoveredPointIdx].value)}` 
                                      : `${chartPoints[hoveredPointIdx].value}টি অর্ডার`}
                                  </span>
                                </div>
                              )}
                              
                              {/* X-Axis Labels */}
                              <div className="flex justify-between text-[9px] font-extrabold text-gray-500 font-sans px-3 pt-1.5 border-t border-gray-150 bg-white/50 rounded-b-lg">
                                {salesGraphData.map((d, i) => (
                                  <span key={i} className="cursor-pointer hover:text-rose-600" onMouseEnter={() => setHoveredPointIdx(i)} onMouseLeave={() => setHoveredPointIdx(null)}>
                                    {d.label}
                                  </span>
                                ))}
                              </div>

                              {/* Empty State overlay */}
                              {maxVal === 0 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[0.5px] p-4 text-center rounded-xl pointer-events-none">
                                  <TrendingUp className="w-6 h-6 text-rose-500 mb-1 animate-pulse" />
                                  <p className="text-[10px] font-extrabold text-slate-700">কোনো সেলস ডেটা নেই</p>
                                  <p className="text-[9px] text-gray-400 mt-0.5 font-medium">আপনার স্টোর থেকে প্রোডাক্ট বিক্রি শুরু হলে এখানে রিয়েল-টাইম অটোমেটিক সেলস গ্রাফ দেখতে পাবেন।</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Graphics 2: Promoted Product details */}
                      <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-black text-slate-905 uppercase tracking-wider font-sans">
                              Promoted Product (promoted Product)
                            </h4>
                            <p className="text-[10px] text-gray-500 font-bold">
                              Conversions: BDT30, <span className="text-[#10b981]">৳1300</span>
                            </p>
                          </div>
                          <div>
                            <button className="text-[9px] font-bold border border-gray-200 px-2 py-1 rounded bg-gray-50 flex items-center gap-1 text-slate-705">
                              <span>Convrroted product</span>
                              <ChevronDown className="w-2.5 h-2.5 text-gray-400" />
                            </button>
                          </div>
                        </div>

                        {/* Orange curve graph */}
                        <div className="w-full h-32 select-none relative bg-slate-50/50 border border-gray-100 rounded-xl p-2 flex flex-col justify-between">
                          <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="orangeAreaGraph" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#f97316" stopOpacity="0.00" />
                              </linearGradient>
                            </defs>

                            <path 
                              d="M 15 100 C 50 80, 100 95, 130 50 C 160 20, 200 110, 250 100 C 300 90, 350 40, 400 80 C 440 10, 485 30 L 485 100 L 15 100 Z" 
                              fill="url(#orangeAreaGraph)" 
                            />
                            <path 
                              d="M 15 100 C 50 80, 100 95, 130 50 C 160 20, 200 110, 250 100 C 300 90, 350 40, 400 80 C 440 10, 485 30" 
                              fill="none" 
                              stroke="#f97316" 
                              strokeWidth="2" 
                            />
                            
                            <circle cx="130" cy="50" r="3" fill="#f97316" stroke="#fff" strokeWidth="1" />
                            <circle cx="440" cy="10" r="3" fill="#f97316" stroke="#fff" strokeWidth="1" />
                          </svg>

                          {/* X-axis labels */}
                          <div className="flex justify-between text-[8px] font-mono text-gray-400 pt-1 border-t border-gray-150">
                            <span>Jan 20</span>
                            <span>Feb 21</span>
                            <span>Mar 18</span>
                            <span>Apr 29</span>
                            <span>May 21</span>
                            <span>Sep 29</span>
                            <span>Jun 21</span>
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* RIGHT COLUMN: Payment History Ledger (exactly like image) */}
                    <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="border-b border-gray-100 pb-3">
                          <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest font-sans">
                            Payment History
                          </h4>
                        </div>

                        {/* Horizontal header table representation */}
                        <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase tracking-wider font-extrabold px-1 border-b border-gray-100 pb-1.5 mb-1">
                          <span>Payment</span>
                          <span>Amount</span>
                        </div>

                        {/* List of referred orders and earnings */}
                        <div className="divide-y divide-gray-100 text-xs">
                          {(() => {
                            const referredOrders = serverOrders.filter(ord => ord.affiliatePhone === activeAffiliate.phone);
                            if (referredOrders.length === 0) {
                              return (
                                <div className="py-8 text-center text-gray-400 text-xs space-y-1">
                                  <p className="font-bold">কোনো বিক্রয় ইতিহাস নেই</p>
                                  <p className="text-[10px]">পণ্য শেয়ার করে সেল জেনারেট করুন!</p>
                                </div>
                              );
                            }
                            return referredOrders.slice(0, 7).map((ord, pIndex) => {
                              // Calculate commission earned
                              let earned = 0;
                              (ord.cartItems || []).forEach((item: any) => {
                                const prodObj = allProducts.find(p => String(p.id) === String(item.productId));
                                if (prodObj) {
                                  if (prodObj.affiliateCommission !== undefined && prodObj.affiliateCommission >= 0) {
                                    earned += item.quantity * prodObj.affiliateCommission;
                                  } else {
                                    const commissionRate = prodObj.affCommission > 0 ? (prodObj.affCommission / 100) : 0.08;
                                    earned += (item.price * item.quantity) * commissionRate;
                                  }
                                } else {
                                  earned += (item.price * item.quantity) * 0.08;
                                }
                              });
                              const orderDate = new Date(ord.timestamp).toLocaleDateString("bn-BD", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                              });
                              const isGold = pIndex === 0;

                              return (
                                <div key={ord.id} className="flex items-center justify-between py-2.5 hover:bg-[#FCFCFD] px-1 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isGold ? "bg-[#FFF9F2] text-amber-500" : "bg-[#E7F7EE] text-emerald-600"}`}>
                                      {isGold ? <Coins className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                    </div>
                                    <div className="space-y-0.5">
                                      <p className="font-bold text-slate-900">অর্ডার #{ord.id}</p>
                                      <p className="text-[10px] text-gray-400 font-mono leading-none">{orderDate}</p>
                                    </div>
                                  </div>
                                  <span className="font-black font-mono text-emerald-600 text-right">+৳{formatBDT(Math.round(earned))}</span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Part 6: Link tracker block matching bottom item */}
                  <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h4 className="text-sm font-extrabold text-[#0b1329] uppercase tracking-widest font-sans">
                        Affiliate Link Creation and Tracking
                      </h4>
                      <div className="relative">
                        <button className="text-[10px] font-bold border border-gray-200 px-2.5 py-1.5 rounded-lg text-slate-700 bg-gray-50 flex items-center gap-1 hover:bg-slate-100 cursor-pointer">
                          <span>View Performance</span>
                          <ChevronDown className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Product selection input for Link Generation */}
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                          Generate Links
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <div className="flex-1 relative">
                            <input 
                              type="text" 
                              readOnly
                              value={
                                affSelectedProdId 
                                  ? `${window.location.origin}?affiliate=${activeAffiliate.phone}&product=${affSelectedProdId}`
                                  : `${window.location.origin}?affiliate=${activeAffiliate.phone}`
                              }
                              className="w-full pl-3 pr-10 py-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-xs font-mono text-slate-500 outline-none select-all"
                            />
                            <Link className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 cursor-pointer" />
                          </div>
                          <button 
                            onClick={() => {
                              const linkText = affSelectedProdId 
                                ? `${window.location.origin}?affiliate=${activeAffiliate.phone}&product=${affSelectedProdId}`
                                : `${window.location.origin}?affiliate=${activeAffiliate.phone}`;
                              navigator.clipboard.writeText(linkText);
                              setIsAffLinkCopied(true);
                              setTimeout(() => setIsAffLinkCopied(false), 2000);
                            }}
                            className="px-6 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors shrink-0 flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            {isAffLinkCopied ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Link className="w-3.5 h-3.5 text-white shrink-0" />}
                            <span>{isAffLinkCopied ? "Link Copied!" : "Generate Link"}</span>
                          </button>
                        </div>
                        <p className="mt-2 text-[9px] text-gray-400 leading-normal font-sans">
                          Generate link, to drew wave link cen tram-et/an your view more nents aed features.
                        </p>
                      </div>

                      {/* Searchable Product Referral Directory */}
                      <div className="pt-4 border-t border-gray-100 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest font-sans">
                              Product Referral Directory
                            </h5>
                            <p className="text-[10px] text-gray-400 font-medium font-sans">
                              Browse products, view commission rates, and grab referral links
                            </p>
                          </div>

                          {/* Search Input */}
                          <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="পণ্য খুঁজুন... (e.g. kurti)"
                              value={affSearchQuery}
                              onChange={(e) => setAffSearchQuery(e.target.value)}
                              className="w-full pl-8.5 pr-3.5 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs text-slate-700 outline-none focus:border-rose-500 font-medium transition-colors"
                            />
                          </div>
                        </div>

                        {/* Product Grid/List with Search and Real commission values */}
                        <div className="max-h-96 overflow-y-auto border border-gray-150 rounded-xl divide-y divide-gray-100 bg-white">
                          {(() => {
                            const filteredProducts = allProducts.filter(p => 
                              p.title.toLowerCase().includes(affSearchQuery.toLowerCase()) ||
                              (p.category || "").toLowerCase().includes(affSearchQuery.toLowerCase())
                            );

                            if (filteredProducts.length === 0) {
                              return (
                                <div className="py-12 text-center text-xs text-gray-400 font-medium">
                                  কোনো প্রোডাক্ট পাওয়া যায়নি। অন্য কিছু টাইপ করুন!
                                </div>
                              );
                            }

                            return filteredProducts.map((p) => {
                              const commRate = p.affCommission || 8;
                              const commVal = p.affiliateCommission !== undefined && p.affiliateCommission >= 0 
                                ? p.affiliateCommission 
                                : Math.round(p.price * commRate / 100);
                              
                              const prodLink = `${window.location.origin}?affiliate=${activeAffiliate.phone}&product=${p.id}`;
                              const isCopied = copiedProductId === p.id;

                              // Calculate real referrals for this product
                              const prodSales = connectedAffiliateOrders.filter(ord => 
                                (ord.cartItems || []).some(item => String(item.productId) === String(p.id))
                              ).length;

                              return (
                                <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-slate-50 transition-colors gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-gray-150">
                                      <img 
                                        referrerPolicy="no-referrer"
                                        src={p.image} 
                                        alt={p.title} 
                                        className="w-full h-full object-cover" 
                                      />
                                    </div>
                                    <div className="space-y-0.5 min-w-0">
                                      <p className="font-extrabold text-xs text-slate-800 truncate max-w-xs sm:max-w-md">{p.title}</p>
                                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-gray-400 font-medium">
                                        <span className="text-slate-900 font-bold font-mono font-sans text-xs">৳{p.price}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                                        <span className="text-[#10b981] font-bold">কমিশন: ৳{commVal} ({commRate}%)</span>
                                        {prodSales > 0 && (
                                          <>
                                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                                            <span className="text-indigo-600 font-semibold font-mono">{prodSales} referred sale{prodSales > 1 ? "s" : ""}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-end sm:self-center">
                                    <button
                                      onClick={() => {
                                        setAffSelectedProdId(p.id === affSelectedProdId ? "" : p.id);
                                      }}
                                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-extrabold cursor-pointer transition-all ${
                                        affSelectedProdId === p.id 
                                          ? "bg-rose-50 border-rose-200 text-rose-600" 
                                          : "bg-white border-gray-200 text-slate-600 hover:bg-slate-50"
                                      }`}
                                    >
                                      {affSelectedProdId === p.id ? "Selected" : "Select"}
                                    </button>

                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(prodLink);
                                        setCopiedProductId(p.id);
                                        setTimeout(() => setCopiedProductId(null), 2000);
                                      }}
                                      className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                                        isCopied 
                                          ? "bg-emerald-600 text-white" 
                                          : "bg-slate-950 text-white hover:bg-slate-800"
                                      }`}
                                    >
                                      {isCopied ? <Check className="w-3 h-3 text-white" /> : <Link className="w-3 h-3 text-white" />}
                                      <span>{isCopied ? "Copied" : "Copy Link"}</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Part 7: Log out option block */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-3">
                    <button
                      onClick={handleLogout}
                      className="flex-1 py-3 bg-rose-50 hover:bg-rose-105 text-rose-600 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-rose-150"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>ప్రস্থান করুন (Logout Affiliate Center)</span>
                    </button>
                  </div>

                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
}
