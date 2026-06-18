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
  
  // Add Product Form State
  const [prodTitle, setProdTitle] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodOriginalPrice, setProdOriginalPrice] = useState("");
  const [prodCategory, setProdCategory] = useState("clothing");
  const [prodImage, setProdImage] = useState("");
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

  // ==================== Merchant Custom Dashboard States ====================
  const [forumOrderId, setForumOrderId] = useState("");
  const [forumCustomerName, setForumCustomerName] = useState("");
  const [forumEmailDate, setForumEmailDate] = useState("");
  const [forumStatus, setForumStatus] = useState("Pending");
  const [forumSearch, setForumSearch] = useState("");

  // ==================== Affiliate Custom Dashboard States ====================
  const [affSelectedProdId, setAffSelectedProdId] = useState<string>("");
  const [affGeneratedLinkInput, setAffGeneratedLinkInput] = useState<string>("");
  const [isAffLinkCopied, setIsAffLinkCopied] = useState(false);
  const [marketingToolActiveTab, setMarketingToolActiveTab] = useState<"quick" | "banners" | "text_links" | "text_link">("quick");
  const [graphFilter, setGraphFilter] = useState("all-time");

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
        // Fetch all products
        try {
          const res = await fetch("/api/products");
          const d = await res.json();
          if (d.success) {
            setAllProducts(d.products || []);
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
      if (file.size > 2 * 1024 * 1024) {
        alert("ইমেজ সাইজ অত্যন্ত বড়! দয়া করে ২ মেগাবাইটের নিচের ফাইল দিন।");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
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
      if (file.size > 2.5 * 1024 * 1024) {
        alert("ছবির সাইজ অত্যন্ত বড়! দয়া করে ২.৫ মেগাবাইটের নিচের ছবি আপলোড করুন।");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProdImage(reader.result as string);
      };
      reader.readAsDataURL(file);
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

      const productPayload = {
        title: prodTitle.trim(),
        price: parseFloat(prodPrice),
        originalPrice: prodOriginalPrice ? parseFloat(prodOriginalPrice) : undefined,
        discountTag: discountPct || undefined,
        image: prodImage || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
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

  // Filter orders related to this active merchant's products
  const connectedMerchantOrders = userType === "merchant" && activeMerchant
    ? serverOrders.filter(ord => 
        ord.cartItems.some(item => merchantProducts.some(p => p.id === item.productId))
      )
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
              {/* Customer Registration */}
              {mode === "register" && (
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

                  <div className="border-t border-gray-100 pt-3 sm:pt-4 text-center mt-1.5 sm:mt-3">
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
                  </div>
                </div>
              )}

              {/* Customer Login */}
              {mode === "login" && (
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

                  <div className="border-t border-gray-100 pt-3 sm:pt-4 text-center mt-1.5 sm:mt-3">
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
                          
                          {/* Welcome Header */}
                          <div className="space-y-0.5">
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
                              Welcome, {activeCustomer.name || "Sarah"}!
                            </h3>
                            <p className="text-xs text-gray-550 font-medium">
                              Here's your account overview.
                            </p>
                          </div>

                          {/* Stats Summary Panel Gird */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            
                            {/* Card 1: Total Orders */}
                            <div className="bg-[#DCE1EC] border border-[#CBD1E1] rounded-2xl p-5 flex justify-between items-center relative overflow-hidden shadow-2xs">
                              <div className="space-y-0.5">
                                <span className="block text-slate-700 text-[10px] font-bold uppercase tracking-wider">Total Orders</span>
                                <p className="text-3xl font-black text-slate-950 tracking-tight font-sans">
                                  {Math.max(5, activeOrders.length).toString().padStart(2, '0')}
                                </p>
                              </div>
                              <div className="p-2.5 bg-white/45 rounded-lg shrink-0 text-slate-700">
                                <FileText className="w-5 h-5" />
                              </div>
                            </div>

                            {/* Card 2: Recent Order */}
                            <div className="bg-[#EFE9DB] border border-[#E3DABF] rounded-2xl p-5 flex justify-between items-center relative overflow-hidden shadow-2xs">
                              <div className="space-y-0.5">
                                <span className="block text-slate-705 text-[10px] font-bold uppercase tracking-wider">Recent Order</span>
                                <p className="text-lg font-black text-slate-950 tracking-wide font-mono">#202606A</p>
                                <span className="inline-block text-[10px] font-mono font-bold text-slate-650">Shipped</span>
                              </div>
                              <div className="p-2.5 bg-white/45 rounded-lg shrink-0 text-slate-700">
                                <ArrowUpRight className="w-5 h-5" />
                              </div>
                            </div>

                            {/* Card 3: Wishlist items count */}
                            <div className="bg-[#E3DCF1] border border-[#D5CBEF] rounded-2xl p-5 flex justify-between items-center relative overflow-hidden shadow-2xs">
                              <div className="space-y-0.5">
                                <span className="block text-slate-700 text-[10px] font-bold uppercase tracking-wider">Wishlist Items</span>
                                <p className="text-3xl font-black text-slate-950 tracking-tight font-sans">12</p>
                              </div>
                              <div className="p-2.5 bg-white/45 rounded-lg shrink-0 text-[#9A81E4]">
                                <Heart className="w-5 h-5 fill-current" />
                              </div>
                            </div>

                          </div>

                          {/* Recent Orders Box Table */}
                          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-sans">Recent Orders</h4>
                              
                              <div className="text-[10px] font-bold border border-gray-200.5 px-2.5 py-1.5 rounded-lg text-slate-700 bg-gray-50 flex items-center gap-1 cursor-pointer">
                                <span>Main Orders</span>
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
                                  {/* High fidelity design table rows matching image */}
                                  {[
                                    { id: "#202606A", date: "07/07/2023", status: "Shipped", total: "৳10,500" },
                                    { id: "#202606A", date: "07/07/2023", status: "Completed", total: "৳7,500" },
                                    { id: "#202606A", date: "10/07/2023", status: "Completed", total: "৳16,000" },
                                    { id: "#202606A", date: "13/07/2023", status: "Completed", total: "৳20.00" }
                                  ].map((row, index) => (
                                    <tr key={index} className="hover:bg-[#FAFAFA] transition-colors">
                                      <td className="py-3.5 font-mono font-bold text-slate-800">{row.id}</td>
                                      <td className="py-3.5 text-gray-500 font-mono text-[11px]">{row.date}</td>
                                      <td className="py-3.5">
                                        {row.status === "Shipped" ? (
                                          <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                                            <Truck className="w-4 h-4 shrink-0 text-emerald-500" />
                                            <span>Shipped</span>
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1.5 text-[#529e72] font-bold text-[11px]">
                                            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                                            <span>Completed</span>
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-3.5 font-bold text-slate-900 font-mono">{row.total}</td>
                                      <td className="py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                          <button className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 border border-gray-200 rounded-lg text-slate-600 shrink-0 cursor-pointer" title="Edit/View Order">
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                          <button className="p-1 px-1.5 bg-slate-50 hover:bg-red-50 hover:text-red-650 border border-gray-200 rounded-lg text-slate-500 shrink-0 cursor-pointer text-red-500" title="Delete Order">
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Account Information Section */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider font-sans">Account Information</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              
                              {/* Stack: Contact details + Shipping address card */}
                              <div className="space-y-4">
                                
                                {/* Contact Details Card */}
                                <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs relative">
                                  <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                                    <h5 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider">Contact Details</h5>
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
                                    <div className="space-y-3 pt-2 text-xs">
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
                                        }}
                                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
                                      >
                                        Save Changes
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="space-y-1.5 text-slate-650 text-xs leading-normal">
                                      <p className="font-extrabold text-slate-900">{activeCustomer.name || "Sarah Sarah!"}</p>
                                      <p className="font-mono">{activeCustomer.phone || "0188-345-7739"}</p>
                                      <p>Email: <span className="text-slate-800 font-medium">{custEmail}</span></p>
                                    </div>
                                  )}
                                </div>

                                {/* Shipping Address Card */}
                                <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs relative">
                                  <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                                    <h5 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider">Shipping Address</h5>
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
                                    <div className="space-y-3 pt-2 text-xs">
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
                                        }}
                                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
                                      >
                                        Save Address
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="space-y-1 text-xs text-slate-650 leading-relaxed font-sans whitespace-pre-line">
                                      <p className="font-extrabold text-slate-950">Shipping Address</p>
                                      <p>{custAddress}</p>
                                    </div>
                                  )}
                                </div>

                              </div>

                              {/* Right Card Panel: Empty white styled card with top-right Edit button */}
                              <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs relative h-full flex flex-col justify-between min-h-[220px]">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2 w-full">
                                  <span className="block invisible" />
                                  <button className="bg-slate-950 hover:bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all uppercase tracking-wider">
                                    Edit
                                  </button>
                                </div>
                                <div className="flex-1 flex items-center justify-center">
                                  <div className="text-center space-y-1 opacity-20">
                                    <span className="block text-slate-500 font-mono text-[9px] uppercase tracking-widest font-black">Secure Shell block</span>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* Wishlist Quick View Card */}
                          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-4">
                            <h4 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider font-sans">Wishlist Quick View</h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              
                              {/* Product 1: Luxury Watch B */}
                              <div className="border border-gray-150 rounded-2xl p-3.5 flex flex-col justify-between space-y-3 bg-white hover:shadow-xs transition-shadow">
                                <div className="w-full h-32 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center relative">
                                  <img 
                                    referrerPolicy="no-referrer"
                                    src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600" 
                                    alt="Luxury Watch B" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-xs font-extrabold text-slate-950 truncate font-sans">Luxury Watch B</p>
                                </div>
                                <button 
                                  onClick={() => {
                                    const prod = PRODUCTS.find(p => p.id === "wt-1") || PRODUCTS[0];
                                    if (prod && onAddToCart) {
                                      onAddToCart(prod);
                                    }
                                  }}
                                  className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors uppercase tracking-wider"
                                >
                                  Add to Cart
                                </button>
                              </div>

                              {/* Product 2: Georgette Kurti Red */}
                              <div className="border border-gray-150 rounded-2xl p-3.5 flex flex-col justify-between space-y-3 bg-white hover:shadow-xs transition-shadow">
                                <div className="w-full h-32 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center relative">
                                  <img 
                                    referrerPolicy="no-referrer"
                                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600" 
                                    alt="Georgette Kurti Red" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-xs font-extrabold text-slate-950 truncate font-sans">Georgette Kurti Red</p>
                                </div>
                                <button 
                                  onClick={() => {
                                    const prod = PRODUCTS.find(p => p.id === "cl-3") || PRODUCTS[0];
                                    if (prod && onAddToCart) {
                                      onAddToCart(prod);
                                    }
                                  }}
                                  className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors uppercase tracking-wider"
                                >
                                  Add to Cart
                                </button>
                              </div>

                              {/* Product 3: Headphones X */}
                              <div className="border border-gray-150 rounded-2xl p-3.5 flex flex-col justify-between space-y-3 bg-white hover:shadow-xs transition-shadow">
                                <div className="w-full h-32 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center relative">
                                  <img 
                                    referrerPolicy="no-referrer"
                                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600" 
                                    alt="Headphones X" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-xs font-extrabold text-slate-950 truncate font-sans">Headphones X</p>
                                </div>
                                <button 
                                  onClick={() => {
                                    const prod = PRODUCTS.find(p => p.id === "el-1") || PRODUCTS[0];
                                    if (prod && onAddToCart) {
                                      onAddToCart(prod);
                                    }
                                  }}
                                  className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors uppercase tracking-wider"
                                >
                                  Add to Cart
                                </button>
                              </div>

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

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {/* Detailed product item list */}
                            {[
                              { id: "wt-1", name: "Luxury Watch B", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600", price: 12500, label: "Premium Leather Chronograph" },
                              { id: "cl-3", name: "Georgette Kurti Red", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600", price: 4200, label: "Beautiful Traditional Festival 3-Piece" },
                              { id: "el-1", name: "Headphones X", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600", price: 6500, label: "ANC High Definition Acoustic Audio" }
                            ].map((prod) => (
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
                                  <p className="text-[10px] text-gray-400 font-medium line-clamp-1">{prod.label}</p>
                                  <p className="text-xs font-black text-amber-600 font-mono">৳{formatBDT(prod.price)}</p>
                                </div>
                                <button
                                  onClick={() => {
                                    const actual = PRODUCTS.find(p=>p.id === prod.id) || PRODUCTS[0];
                                    if (actual && onAddToCart) {
                                      onAddToCart(actual);
                                    }
                                  }}
                                  className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors uppercase tracking-wider"
                                >
                                  Add to Cart
                                </button>
                              </div>
                            ))}
                          </div>
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
                          <div className="border-b border-gray-100 pb-3">
                            <h4 className="text-sm font-black text-slate-950 uppercase tracking-widest flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4 text-slate-800" />
                              <span>নথিভুক্ত পেমেন্ট মেথড (Payment Options)</span>
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-mono">
                            
                            {/* Bkash Saved Account Card Layout */}
                            <div className="bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-2xl p-5 space-y-6 shadow-md relative overflow-hidden select-none">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-widest font-extrabold bg-white/20 px-2 py-1 rounded">bKash Personal</span>
                                <span className="font-sans font-black text-sm italic">bKash</span>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] opacity-75">Saved Wallet Account</p>
                                <p className="text-base tracking-widest font-bold">0188-***-7739</p>
                              </div>
                              <div className="flex justify-between items-end text-xs">
                                <div>
                                  <p className="text-[9px] opacity-75 uppercase">Account Holder</p>
                                  <p className="font-sans font-bold text-[11px]">{activeCustomer.name}</p>
                                </div>
                                <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded">Primary</span>
                              </div>
                            </div>

                            {/* MasterCard Saved Card Custom Mock */}
                            <div className="bg-gradient-to-br from-slate-800 to-slate-950 text-white rounded-2xl p-5 space-y-6 shadow-md relative overflow-hidden select-none">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-widest font-extrabold bg-white/10 px-2 py-1 rounded">MasterCard Premium</span>
                                <span className="font-black text-sm italic">MasterCard</span>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] opacity-75">Card Number</p>
                                <div className="flex items-center gap-1 text-sm tracking-widest font-bold">
                                  <span>••••</span>
                                  <span>••••</span>
                                  <span>••••</span>
                                  <span>4327</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-end text-xs">
                                <div>
                                  <p className="text-[9px] opacity-75 uppercase">Cardholder</p>
                                  <p className="font-sans font-bold text-[11px] uppercase">{activeCustomer.name}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] opacity-75 uppercase">Expires</p>
                                  <p className="font-bold text-[11px]">08/30</p>
                                </div>
                              </div>
                            </div>

                          </div>
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
                      <div className="relative w-12 h-12">
                        <div className="w-full h-full bg-white/20 border border-white/30 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                          {activeMerchant.avatar ? (
                            <img src={activeMerchant.avatar} alt="logo" className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-6 h-6 text-white" />
                          )}
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

                  {/* TAB 1: SUMMARY */}
                  {merchantTab === "summary" && (
                    <div className="space-y-6 text-slate-800 font-sans" id="merchant-high-fidelity-dashboard-view">
                      
                      {/* Dashboard header bar */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-tr from-[#FFF9F2] to-white border border-[#E9E1D5] p-5 rounded-2xl shadow-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] bg-slate-900 text-white rounded px-2 py-0.5 font-bold uppercase tracking-wider">Workspace</span>
                          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-sans">
                            Merchant Dashboard: Quick Overview
                          </h2>
                          <p className="text-xs text-gray-400 font-medium">
                            ZSHOP BD Mall Seller Partner portal summary of performance and transactions.
                          </p>
                        </div>
                        <div className="flex items-center gap-3.5 shrink-0">
                          <button className="px-3.5 py-1.5 bg-slate-50 border border-gray-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 font-sans transition-colors cursor-pointer flex items-center gap-1">
                            <span>Log In</span>
                          </button>
                          <div className="bg-white border border-gray-205 p-2 py-1.5 rounded-xl flex items-center gap-2 text-xs font-sans shadow-2xs select-none">
                            <Store className="w-4 h-4 text-slate-500" />
                            <div>
                              <p className="text-[9px] text-gray-400 leading-none">Merchant Profile</p>
                              <p className="font-extrabold text-[#f85606] leading-snug mt-0.5">{activeMerchant.shopName || "Elegant Fashions"}</p>
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
                          </div>
                        </div>
                      </div>

                      {/* STATS SUMMARY BAR (4 metrics) */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        
                        {/* Metric 1: Total Orders */}
                        <div className="bg-white border border-gray-150 rounded-2xl p-5 flex flex-col justify-between space-y-3 shadow-3xs relative overflow-hidden">
                          <div className="flex items-center justify-between">
                            <span className="block text-slate-500 text-[10px] font-extrabold uppercase tracking-widest leading-none">Total Orders:</span>
                            <div className="w-8 h-8 bg-[#FAF1E3] rounded-full flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-amber-600" />
                            </div>
                          </div>
                          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                            {Math.max(1450, connectedMerchantOrders.length).toLocaleString()}
                          </p>
                        </div>

                        {/* Metric 2: Total Revenue */}
                        <div className="bg-white border border-gray-150 rounded-2xl p-5 flex flex-col justify-between space-y-3 shadow-3xs relative overflow-hidden">
                          <div className="flex items-center justify-between">
                            <span className="block text-slate-500 text-[10px] font-extrabold uppercase tracking-widest leading-none">Total Revenue:</span>
                            <div className="w-8 h-8 bg-[#E7F7EE] rounded-full flex items-center justify-center shrink-0">
                              <Coins className="w-4 h-4 text-emerald-600" />
                            </div>
                          </div>
                          <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-sans truncate">
                            BDT {formatBDT(Math.max(625000, completedEarnings))}
                          </p>
                        </div>

                        {/* Metric 3: Active Products */}
                        <div className="bg-white border border-gray-150 rounded-2xl p-5 flex flex-col justify-between space-y-3 shadow-3xs relative overflow-hidden">
                          <div className="flex items-center justify-between">
                            <span className="block text-slate-500 text-[10px] font-extrabold uppercase tracking-widest leading-none">Active Products:</span>
                            <div className="w-8 h-8 bg-[#E8F2FA] rounded-full flex items-center justify-center shrink-0">
                              <Tag className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>
                          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                            {Math.max(320, merchantProducts.length).toLocaleString()}
                          </p>
                        </div>

                        {/* Metric 4: Avg. Rating */}
                        <div className="bg-white border border-gray-150 rounded-2xl p-5 flex flex-col justify-between space-y-3 shadow-3xs relative overflow-hidden">
                          <div className="flex items-center justify-between">
                            <span className="block text-slate-500 text-[10px] font-extrabold uppercase tracking-widest leading-none">Avg. Rating:</span>
                            <div className="w-8 h-8 bg-[#F3EBFD] rounded-full flex items-center justify-center shrink-0">
                              <Star className="w-4 h-4 text-purple-600 fill-purple-200" />
                            </div>
                          </div>
                          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                            4.8 / 5
                          </p>
                        </div>

                      </div>

                      {/* MAIN GRID LAYOUT - SPLIT DOUBLE COLUMNS */}
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        
                        {/* LEFT COLUMN GROUP */}
                        <div className="space-y-6">
                          
                          {/* Sales Overview Component */}
                          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-[#f85606]" />
                                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest font-sans">Sales Overview</h4>
                              </div>
                              <div className="relative">
                                <button className="text-[10px] font-bold border border-gray-200 px-2.5 py-1.5 rounded-lg text-slate-700 bg-gray-50 flex items-center gap-1 hover:bg-slate-100 cursor-pointer">
                                  <span>Manage</span>
                                  <ChevronDown className="w-3 h-3 text-gray-500" />
                                </button>
                              </div>
                            </div>

                            {/* Chart Labels */}
                            <div className="flex items-center gap-4 text-[10px] font-semibold text-gray-500 ml-1">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#1e40af]" />
                                <span>Sales</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" />
                                <span>Hnit</span>
                              </div>
                            </div>

                            {/* Custom SVG Line Chart */}
                            <div className="w-full h-48 sm:h-56 select-none relative bg-[#FCFCFD] border border-gray-100 rounded-xl p-2 flex flex-col justify-between">
                              <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                                <defs>
                                  <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#1e40af" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#1e40af" stopOpacity="0.01" />
                                  </linearGradient>
                                  <linearGradient id="redAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#dc2626" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#dc2626" stopOpacity="0.01" />
                                  </linearGradient>
                                </defs>

                                {/* Y-axis horizontal gridlines */}
                                <line x1="40" y1="20" x2="480" y2="20" stroke="#EBEEF2" strokeWidth="1" strokeDasharray="3 3" />
                                <line x1="40" y1="45" x2="480" y2="45" stroke="#EBEEF2" strokeWidth="1" strokeDasharray="3 3" />
                                <line x1="40" y1="70" x2="480" y2="70" stroke="#EBEEF2" strokeWidth="1" strokeDasharray="3 3" />
                                <line x1="40" y1="95" x2="480" y2="95" stroke="#EBEEF2" strokeWidth="1" strokeDasharray="3 3" />
                                <line x1="40" y1="120" x2="480" y2="120" stroke="#EBEEF2" strokeWidth="1" strokeDasharray="3 3" />
                                <line x1="40" y1="145" x2="480" y2="145" stroke="#EBEEF2" strokeWidth="1" strokeDasharray="3 3" />
                                <line x1="40" y1="160" x2="480" y2="160" stroke="#94A3B8" strokeWidth="1" />

                                {/* Y-axis Labels */}
                                <text x="15" y="24" className="text-[9px] fill-[#64748B] font-mono" textAnchor="middle">600</text>
                                <text x="15" y="49" className="text-[9px] fill-[#64748B] font-mono" textAnchor="middle">500</text>
                                <text x="15" y="74" className="text-[9px] fill-[#64748B] font-mono" textAnchor="middle">400</text>
                                <text x="15" y="99" className="text-[9px] fill-[#64748B] font-mono" textAnchor="middle">300</text>
                                <text x="15" y="124" className="text-[9px] fill-[#64748B] font-mono" textAnchor="middle">200</text>
                                <text x="15" y="149" className="text-[9px] fill-[#64748B] font-mono" textAnchor="middle">100</text>
                                <text x="15" y="164" className="text-[9px] fill-[#64748B] font-mono" textAnchor="middle">0</text>

                                {/* Sales Area & Path (Blue line) */}
                                <path 
                                  d="M 40 145 C 90 110, 150 90, 200 110 C 250 130, 290 50, 360 40 C 420 30, 440 120, 480 80 L 480 160 L 40 160 Z" 
                                  fill="url(#blueAreaGrad)" 
                                />
                                <path 
                                  d="M 40 145 C 90 110, 150 90, 200 110 C 250 130, 290 50, 360 40 C 420 30, 440 120, 480 80" 
                                  fill="none" 
                                  stroke="#1e40af" 
                                  strokeWidth="2.5" 
                                />

                                {/* Hnit Area & Path (Red line) */}
                                <path 
                                  d="M 40 155 C 80 130, 140 120, 200 80 C 260 40, 310 115, 360 100 C 410 85, 440 130, 480 50 L 480 160 L 40 160 Z" 
                                  fill="url(#redAreaGrad)" 
                                />
                                <path 
                                  d="M 40 155 C 80 130, 140 120, 200 80 C 260 40, 310 115, 360 100 C 410 85, 440 130, 480 50" 
                                  fill="none" 
                                  stroke="#dc2626" 
                                  strokeWidth="2.5" 
                                />

                                {/* Interactive Dots */}
                                <circle cx="40" cy="145" r="4.5" fill="#1e40af" stroke="#ffffff" strokeWidth="1.5" />
                                <circle cx="200" cy="110" r="4.5" fill="#1e40af" stroke="#ffffff" strokeWidth="1.5" />
                                <circle cx="360" cy="40" r="4.5" fill="#1e40af" stroke="#ffffff" strokeWidth="1.5" />
                                <circle cx="480" cy="80" r="4.5" fill="#1e40af" stroke="#ffffff" strokeWidth="1.5" />

                                <circle cx="40" cy="155" r="4.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                                <circle cx="200" cy="80" r="4.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                                <circle cx="360" cy="100" r="4.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                                <circle cx="480" cy="50" r="4.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />

                                {/* X Axis Labels */}
                                <text x="40" y="176" className="text-[9px] fill-[#64748B] font-mono" textAnchor="middle">2023</text>
                                <text x="113" y="176" className="text-[9px] fill-[#64748B] font-mono" textAnchor="middle">2024</text>
                                <text x="186" y="176" className="text-[9px] fill-[#64748B] font-mono" textAnchor="middle">2025</text>
                                <text x="260" y="176" className="text-[9px] fill-[#64748B] font-mono" textAnchor="middle">2026</text>
                                <text x="333" y="176" className="text-[9px] fill-[#64748B] font-mono" textAnchor="middle">2012</text>
                                <text x="406" y="176" className="text-[9px] fill-[#64748B] font-mono" textAnchor="middle">2028</text>
                                <text x="480" y="176" className="text-[9px] fill-[#64748B] font-mono" textAnchor="middle">2023</text>
                              </svg>
                            </div>
                          </div>

                          {/* Top Selling Products Component */}
                          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                              <div className="flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-[#f85606]" />
                                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest font-sans">Top Selling Products</h4>
                              </div>
                              <button onClick={() => setMerchantTab("products")} className="text-blue-600 font-bold hover:underline text-[10px] uppercase cursor-pointer">
                                Show All
                              </button>
                            </div>

                            <div className="space-y-3.5">
                              {[
                                {
                                  title: "Stumen's Woyal Georgette Embroidered Kurti",
                                  price: 4200,
                                  rating: 4.8,
                                  reviews: 13,
                                  image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300"
                                },
                                {
                                  title: "Stomen's Royal Georgettte Embroidered Kurti",
                                  price: 4200,
                                  rating: 4.5,
                                  reviews: 33,
                                  image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=300"
                                },
                                {
                                  title: "Stunning Women Rari Georgette Kri Embroidered Kurti",
                                  price: 4500,
                                  rating: 4.9,
                                  reviews: 47,
                                  image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=300"
                                }
                              ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-[#FCFCFD] border border-gray-150 rounded-xl p-2.5">
                                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-white border border-gray-100 animate-pulse-slow">
                                    <img 
                                      referrerPolicy="no-referrer"
                                      src={item.image} 
                                      alt="kurti" 
                                      className="w-full h-full object-cover" 
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-bold text-slate-900 text-xs truncate leading-snug">{item.title}</h5>
                                    <div className="flex items-center gap-0.5 mt-0.5">
                                      {[...Array(4)].map((_, i) => (
                                        <Star key={i} className="w-3 h-3 text-amber-450 fill-current" />
                                      ))}
                                      <Star className="w-3 h-3 text-gray-300 fill-current" />
                                      <span className="text-[10px] text-gray-400 font-medium ml-1">({item.reviews})</span>
                                    </div>
                                  </div>
                                  <span className="font-bold font-mono text-xs pr-1 text-slate-900">৳{item.price}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Product Management */}
                          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest font-sans border-b border-gray-100 pb-3">
                              Product Management
                            </h4>
                            <div className="flex flex-col gap-3">
                              <button 
                                onClick={() => setMerchantTab("add")}
                                className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                              >
                                <span>Add New Product</span>
                              </button>
                              <button 
                                onClick={() => setMerchantTab("products")}
                                className="w-full py-3.5 bg-white border-2 border-slate-950 text-slate-950 hover:bg-slate-50 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                              >
                                <span>Manage Categories</span>
                              </button>
                            </div>
                          </div>

                        </div>

                        {/* RIGHT COLUMN GROUP */}
                        <div className="space-y-6">
                          
                          {/* Orders to Process Component */}
                          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest font-sans">Orders to Process</h4>
                              <div className="relative">
                                <button className="text-[10px] font-bold border border-gray-200 px-2.5 py-1.5 rounded-lg text-slate-700 bg-gray-50 flex items-center gap-1 hover:bg-slate-100 cursor-pointer">
                                  <span>Share All</span>
                                  <ChevronDown className="w-3 h-3 text-gray-500" />
                                </button>
                              </div>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs align-middle">
                                <thead>
                                  <tr className="border-b border-gray-150 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="pb-3 text-left">Order ID</th>
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3">Customer Name</th>
                                    <th className="pb-3 text-right">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs">
                                  {[
                                    { id: "0220301", date: "24-05-2023", name: "Rish Stnier", status: "Pending" },
                                    { id: "0220302", date: "24-05-2023", name: "Dirian Hinaur", status: "Shipped" },
                                    { id: "0220303", date: "24-05-2023", name: "Avah Hantin", status: "Shipped" },
                                    { id: "0220304", date: "24-05-2023", name: "Jane Smith", status: "Processing" },
                                  ].map((row, index) => (
                                    <tr key={index} className="hover:bg-[#FCFCFD]">
                                      <td className="py-3 font-bold font-mono text-slate-900">{row.id}</td>
                                      <td className="py-3 font-mono text-gray-400 text-[11px]">{row.date}</td>
                                      <td className="py-3 font-medium text-slate-700">{row.name}</td>
                                      <td className="py-3 text-right">
                                        <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded uppercase font-sans tracking-wide ${
                                          row.status === "Pending" ? "bg-[#FFF9E6] text-[#cc8e00]" :
                                          row.status === "Shipped" ? "bg-[#EBF7FF] text-[#0066b2]" :
                                          row.status === "Processing" ? "bg-[#F5EDFD] text-[#5e2ca8]" :
                                          "bg-gray-100 text-gray-700"
                                        }`}>
                                          {row.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <div className="flex justify-end pt-2">
                              <button 
                                onClick={() => {
                                  if (connectedMerchantOrders.length > 0) {
                                    setMerchantTab("orders");
                                  } else {
                                    alert("প্রক্রিয়া করার জন্য কোনো নতুন অর্ডার নেই।");
                                  }
                                }}
                                className="px-5 py-2.5 bg-[#f85606] hover:bg-[#e04d05] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-xs"
                              >
                                Submit Order
                              </button>
                            </div>
                          </div>

                          {/* Orders Order Forum Component */}
                          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest font-sans border-b border-gray-100 pb-3">
                              Orders Order Forum
                            </h4>

                            <div className="grid grid-cols-1 gap-4 text-xs font-sans">
                              
                              {/* Order ID Input Form */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Order ID</label>
                                <input 
                                  type="text" 
                                  value={forumOrderId}
                                  onChange={(e) => setForumOrderId(e.target.value)}
                                  placeholder="Order Forum"
                                  className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl focus:border-[#f85606] focus:outline-none"
                                />
                              </div>

                              {/* Customer Name & Email block */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Customer Name</label>
                                  <input 
                                    type="text" 
                                    value={forumCustomerName}
                                    onChange={(e) => setForumCustomerName(e.target.value)}
                                    placeholder="Customer Name"
                                    className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl focus:border-[#f85606] focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                                  <input 
                                    type="text" 
                                    value={forumEmailDate}
                                    onChange={(e) => setForumEmailDate(e.target.value)}
                                    placeholder="Date"
                                    className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl focus:border-[#f85606] focus:outline-none"
                                  />
                                </div>
                              </div>

                              {/* Customer Status Select dropdown */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Customer status</label>
                                <div className="relative">
                                  <select 
                                    value={forumStatus}
                                    onChange={(e) => setForumStatus(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl focus:border-[#f85606] focus:outline-none appearance-none"
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                  <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                              </div>

                              {/* Bottom search input row + red Search button */}
                              <div className="flex gap-2.5 mt-2">
                                <input 
                                  type="text" 
                                  value={forumSearch}
                                  onChange={(e) => setForumSearch(e.target.value)}
                                  placeholder="Search"
                                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-[#f85606] focus:outline-none text-xs"
                                />
                                <button 
                                  onClick={() => {
                                    alert(`অর্ডার ফোরাম এ ফিল্টারিং হচ্ছে:\nআইডি: ${forumOrderId || "সব"}\nনাম: ${forumCustomerName || "সব"}\nতারিখ: ${forumEmailDate || "সব"}\nঅবস্থা: ${forumStatus}\nসার্চ কুয়েরি: ${forumSearch || "নেই"}`);
                                  }}
                                  className="px-6 py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                                >
                                  Search
                                </button>
                              </div>

                            </div>
                          </div>

                          {/* Inventory Status Component */}
                          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest font-sans border-b border-gray-100 pb-3">
                              Inventory Status
                            </h4>
                            <div className="space-y-0 text-xs">
                              <div className="flex items-center justify-between py-3 border-b border-[#EBEEF2]">
                                <span className="font-semibold text-slate-700">Inventory Status</span>
                                <span className="text-emerald-600 font-bold font-sans">Completed</span>
                              </div>
                              <div className="flex items-center justify-between py-3 border-b border-[#EBEEF2]">
                                <span className="font-semibold text-slate-700">Inventory Status</span>
                                <span className="text-slate-400 font-medium font-sans">Not Postored</span>
                              </div>
                              <div className="flex items-center justify-between py-3">
                                <span className="font-semibold text-slate-700">Inventory Status</span>
                                <span className="text-emerald-600 font-bold font-sans">Completed</span>
                              </div>
                            </div>
                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* TAB 2: ADD NEW PRODUCT FORM */}
                  {merchantTab === "add" && (
                    <form onSubmit={handleMerchantAddProduct} className="space-y-4 bg-white border border-gray-200 p-4 rounded-xl text-xs font-sans">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5 border-b pb-2">
                        <Plus className="w-4 h-4 text-rose-600" />
                        নতুন পণ্য বিক্রির জন্য পোস্ট করুন
                      </h4>

                      {isNewProdSuccess && (
                        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span>প্রোডাক্ট সফলভাবে যুক্ত হয়েছে!</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-gray-500 font-mono tracking-wider uppercase mb-1">প্রোডাক্টের নাম *</label>
                          <input 
                            type="text" required placeholder="যেমনঃ Premium Designer Silk Punjabi"
                            value={prodTitle} onChange={e => setProdTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-rose-500 rounded-lg focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 font-mono tracking-wider uppercase mb-1">ক্যাটাগরি নির্ধারণ করুন *</label>
                          <select 
                            value={prodCategory} onChange={e => setProdCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-rose-500 rounded-lg focus:outline-none"
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
                          <label className="block text-[10px] text-gray-500 font-mono tracking-wider uppercase mb-1">মূল্য (৳ Price) *</label>
                          <input 
                            type="number" required placeholder="যেমনঃ 2450"
                            value={prodPrice} onChange={e => setProdPrice(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-rose-500 rounded-lg focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 font-mono tracking-wider uppercase mb-1">পূর্বের মূল্য (৳ Original Price - ঐচ্ছিক)</label>
                          <input 
                            type="number" placeholder="যেমনঃ 3200"
                            value={prodOriginalPrice} onChange={e => setProdOriginalPrice(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-rose-500 rounded-lg focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Photo selector (Url vs File) */}
                      <div className="space-y-2">
                        <label className="block text-[10px] text-gray-500 font-mono tracking-wider uppercase">পণ্যর ছবি *</label>
                        <div className="flex border border-gray-200 rounded-lg overflow-hidden shrink-0">
                          <button 
                            type="button" onClick={() => setProdImageSource("link")}
                            className={`flex-1 text-center py-1.5 text-[10px] font-bold ${prodImageSource === "link" ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-500"}`}
                          >
                            ছবি লিংক দিন
                          </button>
                          <button 
                            type="button" onClick={() => setProdImageSource("upload")}
                            className={`flex-1 text-center py-1.5 text-[10px] font-bold ${prodImageSource === "upload" ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-500"}`}
                          >
                            গ্যালারি থেকে ফটো আপলোড
                          </button>
                        </div>

                        {prodImageSource === "link" ? (
                          <input 
                            type="url" placeholder="https://images.unsplash.com/photo-..."
                            value={prodImage.startsWith("data") ? "" : prodImage} onChange={e => setProdImage(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-rose-500 rounded-lg focus:outline-none font-mono"
                          />
                        ) : (
                          <div className="flex flex-col md:flex-row items-center gap-3 p-3 bg-slate-50 border border-gray-250 rounded-xl">
                            <input 
                              type="file" accept="image/*" onChange={handleProductPhotoUpload}
                              className="text-xs text-gray-555"
                            />
                            {prodImage && (
                              <img src={prodImage} alt="sample" className="w-12 h-12 object-cover bg-white border rounded shadow shrink-0" />
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-gray-500 font-mono tracking-wider uppercase mb-1">এভেইলেবল সাইজসমূহ (Sizes)</label>
                          <input 
                            type="text" placeholder="যেমনঃ S, M, L, XL"
                            value={prodSizes} onChange={e => setProdSizes(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-rose-500 rounded-lg focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 font-mono tracking-wider uppercase mb-1">এভেইলেবল রংসমূহ (Colors)</label>
                          <input 
                            type="text" placeholder="যেমনঃ Black, White, Maroon"
                            value={prodColors} onChange={e => setProdColors(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-rose-500 rounded-lg focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-500 font-mono tracking-wider uppercase mb-1">পণ্যর বিস্তারিত বিবরণ</label>
                        <textarea 
                          rows={3} placeholder="পণ্যটি সম্পর্কে বিস্তারিত বিবরণ লিখুন..."
                          value={prodDescription} onChange={e => setProdDescription(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-rose-500 rounded-lg focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" id="merchInStock"
                          checked={prodInStock} onChange={e => setProdInStock(e.target.checked)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="merchInStock" className="font-semibold text-slate-850 cursor-pointer">পণ্যটি বর্তমানে স্টকে আছে (In Stock)</label>
                      </div>

                      {/* Merchant Affiliate program settings */}
                      <div className="p-3 border border-gray-200 rounded-lg space-y-3 bg-gray-50 text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <label htmlFor="merchIsAffiliate" className="font-bold text-slate-850 cursor-pointer select-none">
                              পণ্যটি এফিলিয়েটদের জন্য দিতে চান? (Add to Affiliate Program)
                            </label>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              এটি টিক দিলে এফিলিয়েটরা এই পণ্যটি তাদের ড্যাশবোর্ডে লিংক মার্কেটিং এর জন্য দেখতে পাবে।
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            id="merchIsAffiliate"
                            checked={prodIsAffiliateReady}
                            onChange={(e) => setProdIsAffiliateReady(e.target.checked)}
                            className="w-4 h-4 cursor-pointer accent-rose-650 shrink-0"
                          />
                        </div>

                        {prodIsAffiliateReady && (
                          <div className="pt-2.5 border-t border-gray-200">
                            <label className="block text-[10px] text-gray-500 font-mono tracking-wider uppercase mb-1">
                              এফিলিয়েটদের জন্য কমিশন রেট (৳ Amount / Taka) *
                            </label>
                            <div className="flex items-center bg-white border border-gray-200 focus-within:border-rose-500 rounded-lg px-2.5">
                              <span className="font-bold text-gray-500 pr-1.5">৳</span>
                              <input
                                type="number"
                                required={prodIsAffiliateReady}
                                placeholder="যেমনঃ 100"
                                value={prodAffiliateCommission}
                                onChange={(e) => setProdAffiliateCommission(e.target.value)}
                                className="w-full bg-transparent border-none focus:outline-none py-1.5 font-bold text-slate-800"
                              />
                            </div>
                            <p className="text-[9px] text-gray-400 mt-1">
                              এফিলিয়েট আপনার এই প্রোডাক্ট বিক্রি করলে সে সরাসরি এই নির্ধারিত টাকার অংকটি প্রতি পিস বিক্রিতে কমিশন পাবে।
                            </p>
                          </div>
                        )}
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wide rounded-lg transition-colors cursor-pointer"
                      >
                        নতুন প্রোডাক্ট লাইভ করুন (Publish Product)
                      </button>
                    </form>
                  )}

                  {/* TAB 3: CONTROL PORTAL LIST OF PRODUCTS */}
                  {merchantTab === "products" && (
                    <div className="space-y-3 font-sans text-xs">
                      <h4 className="text-xs font-bold text-gray-750 uppercase flex items-center justify-between">
                        <span>সক্রিয় স্টোর প্রোডাক্ট তালিকা ({merchantProducts.length})</span>
                      </h4>

                      {merchantProducts.length === 0 ? (
                        <div className="bg-white border border-gray-200 p-8 rounded-xl text-center text-slate-450 text-[11px]">
                          কোনো প্রোডাক্ট পাওয়া যায়নি। অনুগ্রহ করে "নতুন প্রোডাক্ট যোগ" ট্যাব থেকে প্রোডাক্ট যুক্ত করুন।
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                          {merchantProducts.map((p) => (
                            <div key={p.id} className="bg-white p-3 border border-gray-200 rounded-xl flex items-center justify-between gap-3 shadow-xs text-[11px]">
                              <div className="flex items-center gap-3 min-w-0">
                                <img src={p.image} alt="p" className="w-12 h-12 rounded object-cover bg-gray-50 border shrink-0" />
                                <div className="min-w-0 space-y-0.5">
                                  <h5 className="font-bold text-slate-900 truncate leading-snug">{p.title}</h5>
                                  <p className="text-gray-450 font-mono tracking-wider font-semibold">
                                    ৳{formatBDT(p.price)} {p.originalPrice && <span className="line-through text-[10px]">৳{formatBDT(p.originalPrice)}</span>}
                                  </p>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[8px] bg-slate-100 text-slate-700 px-1 py-0.2 rounded font-mono font-bold uppercase">{p.category}</span>
                                    <button 
                                      onClick={() => handleToggleProductStock(p)}
                                      className={`px-1 rounded text-[8px] font-bold ${p.inStock ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}
                                    >
                                      {p.inStock ? "In Stock 🟢" : "Stock Out 🔴"}
                                    </button>
                                  </div>

                                  {/* Merchant inline affiliate controller */}
                                  {activeMerchant && (
                                    <div className="flex items-center gap-1 mt-1 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded-lg text-[9px] w-fit">
                                      <label className="flex items-center gap-1 font-semibold text-gray-700 cursor-pointer select-none">
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
                                              console.error("Failed to update affiliate settings for merchant product:", err);
                                            }
                                          }}
                                          className="w-3 h-3 accent-rose-600 rounded cursor-pointer"
                                        />
                                        <span>এফিলিয়েট সচল</span>
                                      </label>

                                      {p.isAffiliateReady && (
                                        <div className="flex items-center ml-1 border-l border-gray-300 pl-1.5 gap-0.5">
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
                                            className="w-10 bg-transparent text-rose-600 font-bold text-center py-0 p-0 border-none focus:outline-none"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button 
                                  type="button"
                                  onClick={() => {
                                    try {
                                      const url = `${window.location.origin}${window.location.pathname}?product=${p.id}`;
                                      navigator.clipboard.writeText(url);
                                      setCopiedProductId(p.id);
                                      setTimeout(() => setCopiedProductId(null), 2000);
                                    } catch (err) {
                                      console.error("Failed to copy link:", err);
                                    }
                                  }}
                                  className={`p-1.5 px-2.5 rounded-lg cursor-pointer transition-all active:scale-95 flex items-center gap-1 font-bold border ${
                                    copiedProductId === p.id 
                                      ? "text-emerald-700 bg-emerald-50 border-emerald-200" 
                                      : "text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-100"
                                  }`}
                                  title="কপি প্রোডাক্ট লিংক (Copy Direct Link)"
                                >
                                  {copiedProductId === p.id ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      <span className="text-[9px] font-sans">কপি হয়েছে!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Link className="w-3.5 h-3.5 text-amber-500" />
                                      <span className="text-[9px] font-sans text-amber-700">লিংক কপি</span>
                                    </>
                                  )}
                                </button>

                                <button 
                                  type="button"
                                  onClick={() => handleMerchantDeleteProduct(p.id)}
                                  className="text-red-500 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors active:scale-95"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
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
                          BDT {formatBDT(activeAffiliate.earnings || 24070)}
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
                          {activeAffiliate.salesCount || 28}
                        </p>
                        <p className="text-[9px] text-gray-400 font-bold leading-none pt-0.5">
                          15% conversion rate
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
                          {(activeAffiliate.clicks || 1339350).toLocaleString()}
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
                          <span className="truncate">Common Elections</span>
                          <span className="font-mono font-bold text-slate-800 ml-1">108</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="truncate">Conovries</span>
                          <span className="font-mono font-bold text-slate-800 ml-1">8</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="truncate text-gray-400">Traffic Sources</span>
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
                          ? affiliateProducts.map((p, ix) => ({
                              id: p.id,
                              title: p.title,
                              price: p.price,
                              image: p.image,
                              clicks: "1.00",
                              traffics: "60%",
                              metricName: ix % 3 === 0 ? "Traffics" : ix % 3 === 1 ? "Trollies" : "Traffizs"
                            }))
                          : mockPerformers;

                        return activeShowcase.slice(0, 5).map((item) => {
                          const refLink = `${window.location.origin}?affiliate=${activeAffiliate.phone}&product=${item.id}`;
                          const isCopied = copiedProductId === item.id;

                          return (
                            <div key={item.id} className="bg-white border border-gray-150 rounded-xl overflow-hidden hover:border-[#f85606] transition-all flex flex-col justify-between shadow-2xs group relative">
                              <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                                <img 
                                  referrerPolicy="no-referrer"
                                  src={item.image} 
                                  alt="kurti" 
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
                                <div className="grid grid-cols-3 gap-0.5 text-center text-[9px] border-t border-gray-100 pt-2 font-mono text-slate-505">
                                  <div>
                                    <p className="font-extrabold text-slate-900 text-[10px] leading-tight">{item.price}</p>
                                    <p className="text-gray-400 text-[8px] truncate">Product</p>
                                  </div>
                                  <div>
                                    <p className="font-extrabold text-slate-900 text-[10px] leading-tight">{item.clicks}</p>
                                    <p className="text-gray-400 text-[8px] truncate">Clicks</p>
                                  </div>
                                  <div>
                                    <p className="font-extrabold text-slate-900 text-[10px] leading-tight">{item.traffics}</p>
                                    <p className="text-gray-400 text-[8px] truncate leading-none mt-0.5">{item.metricName}</p>
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
                    <div className="flex justify-center items-center gap-1.5 pt-2">
                      <span className="w-4 h-1.5 rounded-full bg-rose-600" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-250" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-250" />
                    </div>
                  </div>

                  {/* Part 5: Splitted Dual-Column Layout: Graphs vs Payment History */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    
                    {/* LEFT COLUMN: Graphics representation panels */}
                    <div className="space-y-6">
                      
                      {/* Graphics 1: Sales Overview spline area */}
                      <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <div className="space-y-0.5">
                            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest font-sans">
                              Sales Overview
                            </h4>
                            <p className="text-[10px] text-gray-400 font-medium">
                              Interactive process zene line graph
                            </p>
                          </div>
                          <div className="relative">
                            <button className="text-[9px] font-extrabold border border-gray-200 px-2 py-1 rounded-lg text-slate-700 bg-gray-50 flex items-center gap-1 hover:bg-slate-100 cursor-pointer">
                              <span>Interactive in graph</span>
                              <ChevronDown className="w-2.5 h-2.5 text-gray-500" />
                            </button>
                          </div>
                        </div>

                        {/* Spline area graph representation */}
                        <div className="w-full h-44 select-none relative bg-slate-50/50 border border-gray-100 rounded-xl p-2 flex flex-col justify-between">
                          <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="indigoAreaGraph" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#1e40af" stopOpacity="0.22" />
                                <stop offset="100%" stopColor="#1e40af" stopOpacity="0.00" />
                              </linearGradient>
                            </defs>
                            
                            {/* Horizontal light grid lines representing scales */}
                            <line x1="15" y1="20" x2="485" y2="20" stroke="#EBEEF2" strokeWidth="1" strokeDasharray="2 2" />
                            <line x1="15" y1="50" x2="485" y2="50" stroke="#EBEEF2" strokeWidth="1" strokeDasharray="2 2" />
                            <line x1="15" y1="80" x2="485" y2="80" stroke="#EBEEF2" strokeWidth="1" strokeDasharray="2 2" />
                            <line x1="15" y1="110" x2="485" y2="110" stroke="#EBEEF2" strokeWidth="1" strokeDasharray="2 2" />
                            <line x1="15" y1="140" x2="485" y2="140" stroke="#94A3B8" strokeWidth="1" />

                            {/* Wavy spline line representing clicks/sales */}
                            <path 
                              d="M 15 140 C 45 60, 75 100, 105 120 C 135 140, 165 95, 195 90 C 225 85, 255 110, 285 100 C 315 90, 345 50, 375 60 C 405 70, 435 110, 455 100 L 485 30 L 485 140 Z" 
                              fill="url(#indigoAreaGraph)" 
                            />
                            <path 
                              d="M 15 140 C 45 60, 75 100, 105 120 C 135 140, 165 95, 195 90 C 225 85, 255 110, 285 100 C 315 90, 345 50, 375 60 C 405 70, 435 110, 455 100 L 485 30" 
                              fill="none" 
                              stroke="#0f172a" 
                              strokeWidth="2" 
                            />

                            {/* Circles on apex points */}
                            <circle cx="15" cy="140" r="3.5" fill="#0f172a" stroke="#fff" strokeWidth="1.5" />
                            <circle cx="105" cy="120" r="3.5" fill="#0f172a" stroke="#fff" strokeWidth="1.5" />
                            <circle cx="195" cy="90" r="3.5" fill="#0f172a" stroke="#fff" strokeWidth="1.5" />
                            <circle cx="285" cy="100" r="3.5" fill="#0f172a" stroke="#fff" strokeWidth="1.5" />
                            <circle cx="375" cy="60" r="3.5" fill="#0f172a" stroke="#fff" strokeWidth="1.5" />
                            <circle cx="485" cy="30" r="3.5" fill="#0f172a" stroke="#fff" strokeWidth="1.5" />
                          </svg>
                          
                          {/* X-Axis Month labels */}
                          <div className="flex justify-between text-[9px] font-semibold text-gray-400 font-sans px-1 pt-1 border-t border-gray-150">
                            <span>Jan 1</span>
                            <span>Feb 2</span>
                            <span>Mar 3</span>
                            <span>Apr 4</span>
                            <span>May 1</span>
                            <span>Aug 6</span>
                            <span>Sep 13</span>
                            <span>Oct 15</span>
                            <span>Nov 19</span>
                            <span>Dec 21</span>
                          </div>
                        </div>
                      </div>

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

                        {/* List of 7 matching payments */}
                        <div className="divide-y divide-gray-100 text-xs">
                          {[
                            { date: "Jan 16, 2023", price: "550.00", isGold: true },
                            { date: "Jan 15, 2023", price: "350.00", isGold: false },
                            { date: "Feb 13, 2023", price: "350.00", isGold: false },
                            { date: "Jan 1, 2023", price: "350.00", isGold: false },
                            { date: "Feb 18, 2023", price: "250.00", isGold: false },
                            { date: "Feb 18, 2023", price: "150.00", isGold: false },
                            { date: "Feb 18, 2023", price: "150.00", isGold: false }
                          ].map((pay, pIndex) => (
                            <div key={pIndex} className="flex items-center justify-between py-2.5 hover:bg-[#FCFCFD] px-1 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${pay.isGold ? "bg-[#FFF9F2] text-amber-500" : "bg-[#E7F7EE] text-emerald-600"}`}>
                                  {pay.isGold ? <Coins className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                </div>
                                <div className="space-y-0.5">
                                  <p className="font-bold text-slate-900">Paymented</p>
                                  <p className="text-[10px] text-gray-400 font-mono leading-none">{pay.date}</p>
                                </div>
                              </div>
                              <span className="font-black font-mono text-slate-900 text-right">BDT {pay.price}</span>
                            </div>
                          ))}
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

                      {/* Tool performance with selectable active product */}
                      <div className="overflow-x-auto pt-2">
                        <table className="w-full text-left text-xs align-middle">
                          <thead>
                            <tr className="border-b border-gray-150 text-slate-450 font-bold uppercase tracking-wider text-[10px]">
                              <th className="pb-2.5">Tools</th>
                              <th className="pb-2.5">Performance</th>
                              <th className="pb-2.5 text-right">Totali <span className="font-sans text-[8px] text-gray-400 lowercase">rns</span></th>
                            </tr>
                          </thead>
                          <tbody className="text-xs font-sans">
                            <tr className="hover:bg-[#FCFCFD]">
                              <td className="py-3 pr-4">
                                <div className="space-y-1">
                                  <select
                                    value={affSelectedProdId}
                                    onChange={(e) => setAffSelectedProdId(e.target.value)}
                                    className="px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-slate-700 outline-none text-xs font-semibold hover:border-[#f85606] transition-colors cursor-pointer max-w-sm"
                                  >
                                    <option value="">Choose General Referral URL</option>
                                    {allProducts.map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.title} (Commission rate: {p.affCommission || 8}%)
                                      </option>
                                    ))}
                                  </select>
                                  <p className="text-[10px] text-gray-400 font-medium">
                                    Affiliate Selected
                                  </p>
                                </div>
                              </td>
                              <td className="py-3 font-mono font-bold text-slate-700">323</td>
                              <td className="py-3 text-right font-mono font-black text-[#10b981]">
                                29.88%
                              </td>
                            </tr>
                          </tbody>
                        </table>
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
