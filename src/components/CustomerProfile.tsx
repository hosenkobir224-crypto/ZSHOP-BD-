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
  Camera
} from "lucide-react";
import { Order, Product } from "../types";

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
}

export default function CustomerProfile({
  isOpen,
  onClose,
  orders: clientOrders,
  onSearchSelect
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
  const [isNewProdSuccess, setIsNewProdSuccess] = useState(false);

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
    }
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
        affCommission: parseFloat(prodCommission) || 10
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden" 
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
      <div className="relative w-full max-w-2xl bg-white border border-gray-150 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] text-left">
        
        {/* Header navigation tabs (Only in Auth login/reg view) */}
        {mode !== "profile" ? (
          <div className="bg-slate-950 text-white flex flex-col">
            <div className="px-5 pt-4 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg ${
                  userType === "customer" 
                    ? "bg-amber-400 text-slate-950" 
                    : userType === "merchant"
                      ? "bg-rose-600 text-white"
                      : "bg-indigo-600 text-white"
                } flex items-center justify-center font-display font-black text-sm`}>
                  Z
                </div>
                <div>
                  <h3 className="font-display font-black text-sm tracking-wider text-white uppercase">
                    {userType === "customer" 
                      ? "Customer Portal (গ্রাহক)" 
                      : userType === "merchant" 
                        ? "Seller Center (মার্চেন্ট বিক্রেতা)"
                        : "Affiliate Portal (অ্যাফিলিয়েট)"}
                  </h3>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1 px-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector tab switch - ZSHOP BD UI aesthetics */}
            <div className="flex bg-slate-900 px-1 border-t border-slate-850">
              <button 
                type="button"
                onClick={() => { setUserType("customer"); setMode("login"); }}
                className={`flex-1 py-3 text-[10px] sm:text-xs font-bold text-center transition-all cursor-pointer ${
                  userType === "customer" 
                    ? "border-b-2 border-amber-400 text-amber-400 font-extrabold" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🛍️ গ্রাহক (Buyer)
              </button>
              <button 
                type="button"
                onClick={() => { setUserType("merchant"); setMode("login"); }}
                className={`flex-1 py-3 text-[10px] sm:text-xs font-bold text-center transition-all cursor-pointer ${
                  userType === "merchant" 
                    ? "border-b-2 border-rose-500 text-rose-500 font-extrabold" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🏪 মার্চেন্ট (Seller)
              </button>
              <button 
                type="button"
                onClick={() => { setUserType("affiliate"); setMode("login"); }}
                className={`flex-1 py-3 text-[10px] sm:text-xs font-bold text-center transition-all cursor-pointer ${
                  userType === "affiliate" 
                    ? "border-b-2 border-indigo-400 text-indigo-400 font-extrabold" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🤝 এফিলিয়েট (Affiliate)
              </button>
            </div>
          </div>
        ) : (
          /* Profile Mode Header */
          <div className="px-5 py-4 border-b border-gray-100 bg-slate-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
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
                <h3 className="font-display font-extrabold text-xs tracking-wider uppercase text-slate-200">
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
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/50">

          {/* ================================================================ */}
          {/* ====================== CUSTOMER FLOW =========================== */}
          {/* ================================================================ */}
          {userType === "customer" && (
            <>
              {/* Customer Registration */}
              {mode === "register" && (
                <div className="space-y-5" id="customer-register-step">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-display font-bold text-slate-900 uppercase tracking-wide">
                      নতুন গ্রাহক অ্যাকাউন্ট রেজিস্টার করুন
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      নিচের ফর্মটি পূরণ করে আজই ZSHOP BD গ্রাহক পরিবারের অংশ হোন (যেকোনো মোবাইল থেকে অ্যাক্সেসযোগ্য!)
                    </p>
                  </div>

                  {regError && (
                    <div className="p-3 bg-red-50 text-red-650 text-xs rounded-xl flex items-center gap-2.5 border border-red-100">
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

                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="flex flex-col items-center justify-center p-3 border border-dashed border-gray-200 rounded-xl bg-white space-y-2">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-bold">Profile Photo (প্রোফাইল ছবি)</p>
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 bg-gray-100 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                          {regAvatar ? (
                            <img src={regAvatar} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-gray-400" />
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
                            className="py-1.5 px-3 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-850 flex items-center gap-1 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>আপলোড করুন</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">
                        Your Name (আপনার নাম)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="जैसे: মোঃ জাহিদ হাসান"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-amber-500 rounded-xl text-xs text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">
                        Phone number (মোবাইল নম্বর)
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="যেমনঃ 01712345678"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-amber-500 rounded-xl text-xs text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">
                        Password (পাসওয়ার্ড)
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-amber-500 rounded-xl text-xs text-slate-800 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-display font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                    >
                      Create Customer Account
                    </button>
                  </form>

                  <div className="border-t border-gray-150 pt-3 text-center">
                    <p className="text-xs text-gray-550">
                      ইতিমধ্যে অ্যাকাউন্ট আছে? {" "}
                      <button 
                        type="button"
                        onClick={() => setMode("login")}
                        className="text-amber-600 font-bold hover:underline cursor-pointer font-sans"
                      >
                        লগইন করুন
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* Customer Login */}
              {mode === "login" && (
                <div className="space-y-5" id="customer-login-step">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-display font-bold text-slate-900 uppercase tracking-wide">
                      গ্রাহক লগইন
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে আপনার স্থায়ী প্রোফাইলে প্রবেশ করুন
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-red-55/10 text-red-650 text-xs rounded-xl flex items-center gap-2.5 border border-red-100">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <p className="font-semibold">{loginError}</p>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">
                        Phone Identification (মোবাইল নম্বর)
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          placeholder="como: 01712345678"
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 focus:border-amber-500 rounded-xl text-xs text-slate-800 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">
                        Verify Password (পাসওয়ার্ড)
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 focus:border-amber-500 rounded-xl text-xs text-slate-800 focus:outline-none"
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
                      className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-display font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                    >
                      Verify and Login Account
                    </button>
                  </form>

                  <div className="border-t border-gray-150 pt-3 text-center">
                    <p className="text-xs text-gray-555">
                      নতুন গ্রাহক? {" "}
                      <button 
                        type="button"
                        onClick={() => setMode("register")}
                        className="text-amber-600 font-bold hover:underline cursor-pointer"
                      >
                        অ্যাকাউন্ট তৈরি করুন (রেজিস্ট্রেশন)
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* Customer Profile Dashboard */}
              {mode === "profile" && activeCustomer && (
                <div className="space-y-6" id="customer-active-profile">
                  <div className="bg-slate-950 text-white rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 relative overflow-hidden shadow-md">
                    <div className="flex items-center gap-3.5 z-10">
                      <div className="relative w-14 h-14 bg-slate-900 border border-slate-800 rounded-full shrink-0">
                        <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                          {activeCustomer.avatar ? (
                            <img src={activeCustomer.avatar} alt={activeCustomer.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <label className="absolute -bottom-1 -right-1 bg-amber-500 hover:bg-amber-600 text-slate-950 p-1 rounded-full cursor-pointer shadow border border-slate-900 flex items-center justify-center" title="ছবি পরিবর্তন করুন">
                          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                          <Camera className="w-3 h-3 text-slate-950" />
                        </label>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-display font-extrabold text-white">
                          {activeCustomer.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-amber-400" />
                          <span>{activeCustomer.phone}</span>
                        </p>
                      </div>
                    </div>

                    <div className="z-10 bg-slate-900/50 p-2 rounded-xl backdrop-blur flex flex-col justify-between items-center text-center shrink-0 border border-slate-850">
                      <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider">মোট অর্ডার</span>
                      <p className="text-sm font-display font-black text-amber-400 mt-0.5">{activeOrders.length}</p>
                    </div>
                  </div>

                  {/* Order History */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-display font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                      <span>অর্ডার ট্র্যাকিং ও ইতিহাস ({activeOrders.length})</span>
                    </h5>

                    {activeOrders.length === 0 ? (
                      <div className="bg-white border border-gray-150 p-6 rounded-xl text-center text-slate-450 text-xs">
                        <p>আপনি এখন পর্যন্ত কোনো অর্ডার করেননি।</p>
                        <p className="text-[10px] text-slate-400 mt-1">দোকানের যেকোনো প্রোডাক্ট সিলেক্ট করে অর্ডার করুন, তা এখানে দেখাবে।</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeOrders.map((ord) => (
                          <div key={ord.id} className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-3 shadow-xs text-xs">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-mono text-[11px] font-bold text-slate-900">
                                  Order ID: <span className="text-amber-650">{ord.id}</span>
                                </p>
                                <p className="text-[9px] text-gray-400 font-mono">
                                  {new Date(ord.timestamp).toLocaleDateString([], { dateStyle: 'medium' })}
                                </p>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider
                                ${ord.status === "Pending" ? "bg-amber-100 text-amber-800" : ""}
                                ${ord.status === "Confirmed" ? "bg-emerald-100 text-emerald-800" : ""}
                                ${ord.status === "Shipped" ? "bg-indigo-150 text-indigo-800" : ""}
                                ${ord.status === "Delivered" ? "bg-cyan-100 text-cyan-800" : ""}
                                ${ord.status === "Cancelled" ? "bg-rose-100 text-rose-800" : ""}
                              `}>
                                {ord.status}
                              </span>
                            </div>
                            <div className="space-y-1 border-t border-gray-100 pt-2 text-[11px]">
                              {ord.cartItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-gray-700">
                                  <span className="line-clamp-1">{item.title}</span>
                                  <span className="shrink-0 font-mono text-gray-500">Qty {item.quantity} × ৳{formatBDT(item.price)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between font-bold border-t border-gray-100 pt-2 text-xs">
                              <span className="text-gray-550 font-normal">COD Payable:</span>
                              <span>৳{formatBDT(ord.total)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Search history logs */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-display font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-slate-500" />
                        <span>স্মার্ট সার্চ ইতিহাস ({userSearches.length})</span>
                      </h5>
                      {userSearches.length > 0 && (
                        <button onClick={handleClearSearches} className="text-[10px] font-mono text-rose-500 hover:underline cursor-pointer">
                          Clear
                        </button>
                      )}
                    </div>
                    {userSearches.length === 0 ? (
                      <div className="bg-white border border-gray-150 p-4 rounded-xl text-center text-slate-450 text-[11px]">
                        কোনো সার্চ ইতিহাস পাওয়া যায়নি।
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {userSearches.map((term, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (onSearchSelect) {
                                onSearchSelect(term);
                                onClose();
                              }
                            }}
                            className="px-2.5 py-1 text-[11px] bg-white hover:bg-amber-50 border border-gray-200 text-slate-700 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                          >
                            <History className="w-3 h-3 text-slate-405 shrink-0" />
                            <span className="truncate max-w-[120px]">{term}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-rose-150"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out of this Account</span>
                  </button>
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
                <div className="space-y-5" id="merchant-register-step">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-display font-bold text-[#f85606] uppercase tracking-wide">
                      ZSHOP BD Seller Registration (মার্চেন্ট অ্যাকাউন্ট খুলুন)
                    </h4>
                    <p className="text-[11px] text-gray-500 font-sans">
                      আপনার নিজস্ব দোকান খুলে সরাসরি কাস্টমারের কাছে প্রোডাক্ট বিক্রি শুরু করুন!
                    </p>
                  </div>

                  {merchError && (
                    <div className="p-3 bg-red-50 text-red-650 text-xs rounded-xl flex items-center gap-2.5 border border-red-100">
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

                  <form onSubmit={handleMerchantRegisterSubmit} className="space-y-4">
                    <div className="flex flex-col items-center justify-center p-3 border border-dashed border-gray-200 rounded-xl bg-white space-y-2">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-bold">Shop Avatar (দোকানের লোগো)</p>
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 bg-gray-100 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                          {merchAvatar ? (
                            <img src={merchAvatar} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-6 h-6 text-gray-400" />
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
                            className="py-1.5 px-3 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-850 flex items-center gap-1 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>আপলোড করুন</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">
                        Seller / Owner Name (বিক্রেতার নাম)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="যেমনঃ মোঃ আবির হোসাইন"
                        value={merchName}
                        onChange={(e) => setMerchName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl text-xs text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">
                        Shop Name / Brand Name (অনলাইন দোকান/ব্র্যান্ডের নাম) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="যেমনঃ Royal Fashion BD"
                        value={merchShopName}
                        onChange={(e) => setMerchShopName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl text-xs text-slate-800 focus:outline-none font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">
                        Merchant Mobile Phone (লগইন নম্বর) *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="যেমনঃ 01888223470"
                        value={merchPhone}
                        onChange={(e) => setMerchPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl text-xs text-slate-800 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">
                        Address / Warehouse (ঠিকানা/অফিস)
                      </label>
                      <input
                        type="text"
                        placeholder="যেমনঃ বনানী, ঢাকা"
                        value={merchAddress}
                        onChange={(e) => setMerchAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl text-xs text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">
                        Merchant Login Password (মার্চেন্ট পাসওয়ার্ড) *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড"
                        value={merchPassword}
                        onChange={(e) => setMerchPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl text-xs text-slate-800 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-display font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                    >
                      Establish online Merchant Shop
                    </button>
                  </form>

                  <div className="border-t border-gray-150 pt-3 text-center">
                    <p className="text-xs text-gray-555">
                      ইতিমধ্যে মার্চেন্ট হ্যান্ডেল আছে? {" "}
                      <button 
                        type="button"
                        onClick={() => setMode("login")}
                        className="text-rose-600 font-bold hover:underline cursor-pointer"
                      >
                        মার্চেন্ট লগইন করুন
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* Merchant Login */}
              {mode === "login" && (
                <div className="space-y-5" id="merchant-login-step">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-display font-bold text-slate-900 uppercase tracking-wide">
                      ZSHOP BD Seller Center (অনলাইন বিক্রেতা লগইন)
                    </h4>
                    <p className="text-[11px] text-gray-500 font-sans">
                      মোবাইল নম্বর ও বিক্রেতা পাসওয়ার্ড দিয়ে আপনার মার্চেন্ট প্যানেলে প্রবেশ করুন
                    </p>
                  </div>

                  {merchError && (
                    <div className="p-3 bg-red-55/10 text-red-650 text-xs rounded-xl flex items-center gap-2.5 border border-red-101">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <p className="font-semibold">{merchError}</p>
                    </div>
                  )}

                  <form onSubmit={handleMerchantLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">
                        Seller Registration Phone (বিক্রেতার মোবাইল নম্বর)
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          placeholder="como: 01888223470"
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl text-xs text-slate-800 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">
                        Seller Center Password (বিক্রেতার পাসওয়ার্ড)
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 focus:border-rose-500 rounded-xl text-xs text-slate-800 focus:outline-none"
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
                      className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-display font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                    >
                      Authenticate and Access Store
                    </button>
                  </form>

                  <div className="border-t border-gray-150 pt-3 text-center">
                    <p className="text-xs text-gray-555">
                      অনলাইন দোকান দিতে চান? {" "}
                      <button 
                        type="button"
                        onClick={() => setMode("register")}
                        className="text-rose-600 font-bold hover:underline cursor-pointer font-sans"
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
                    <div className="space-y-4 font-sans text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-white border border-gray-200 rounded-xl flex items-center gap-3">
                          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block uppercase font-mono">লাইভ প্রোডাক্ট</span>
                            <span className="text-sm font-bold text-slate-900">{merchantProducts.length} টি</span>
                          </div>
                        </div>

                        <div className="p-4 bg-white border border-gray-200 rounded-xl flex items-center gap-3">
                          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block uppercase font-mono">মোট অর্ডার জেনারেট</span>
                            <span className="text-sm font-bold text-slate-900">{connectedMerchantOrders.length} টি</span>
                          </div>
                        </div>

                        <div className="p-4 bg-white border border-gray-200 rounded-xl flex items-center gap-3">
                          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Coins className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block uppercase font-mono">মোট আয় (Completed)</span>
                            <span className="text-sm font-bold text-emerald-650">৳{formatBDT(completedEarnings)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Merchant operational notes */}
                      <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-slate-700 flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-rose-900">মার্চেন্ট তথ্য:</p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                            অনলাইন স্টোরে আপনার আপলোড করা প্রতিটা প্রোডাক্ট সরাসরি ZSHOP BD-এর সার্চ মেকানিজম এবং লাইভ লিস্টে যুক্ত হয়ে গেছে। গ্রাহকরা এখন সরাসরি তাদের ডিভাইস থেকে এটি কিনতে পারবেন!
                          </p>
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
                                </div>
                              </div>

                              <button 
                                type="button" onClick={() => handleMerchantDeleteProduct(p.id)}
                                className="p-2 bg-red-50 hover:bg-red-100 text-rose-650 hover:text-rose-700 hover:border-red-250 border border-transparent rounded-lg cursor-pointer transition-colors shrink-0"
                                title="পণ্যটি মুছে ফেলুন (Delete Product)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: SHOP INCOMING CUSTOMER ORDERS */}
                  {merchantTab === "orders" && (
                    <div className="space-y-3 font-sans text-xs">
                      <h4 className="text-xs font-bold text-gray-750 uppercase flex items-center justify-between">
                        <span>আপনার স্টোরের কাস্টমার অর্ডার তালিকা ({connectedMerchantOrders.length})</span>
                      </h4>

                      {connectedMerchantOrders.length === 0 ? (
                        <div className="bg-white border border-gray-200 p-8 rounded-xl text-center text-slate-450 text-[11px]">
                          আপনার পণ্যের ওপর এখন পর্যন্ত কোনো অর্ডার আসে নি।
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                          {connectedMerchantOrders.map((ord) => {
                            // Filter only products belonging to this seller in this order
                            const shopCartItems = ord.cartItems.filter(item => 
                              merchantProducts.some(p => p.id === item.productId)
                            );
                            const totalShopEarnings = shopCartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

                            return (
                              <div key={ord.id} className="bg-white p-3 border border-gray-250 rounded-xl space-y-2 shadow-xs text-[11px]">
                                <div className="flex items-center justify-between font-mono font-bold">
                                  <div>
                                    <p className="text-slate-900 text-[11px]">OrderID: <span className="text-[#f85606]">{ord.id}</span></p>
                                    <p className="text-[9px] text-gray-400 font-normal">{new Date(ord.timestamp).toLocaleDateString()}</p>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider
                                    ${ord.status === "Pending" ? "bg-amber-100 text-amber-800" : ""}
                                    ${ord.status === "Confirmed" ? "bg-emerald-100 text-emerald-800" : ""}
                                    ${ord.status === "Shipped" ? "bg-indigo-150 text-indigo-800" : ""}
                                    ${ord.status === "Delivered" ? "bg-cyan-100 text-cyan-800" : ""}
                                    ${ord.status === "Cancelled" ? "bg-rose-100 text-rose-800" : ""}
                                  `}>
                                    {ord.status}
                                  </span>
                                </div>

                                <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-gray-150">
                                  <p className="font-semibold text-slate-800 text-[10px] uppercase font-mono">গ্রাহক বিবরণ (Shipping Info):</p>
                                  <p className="font-medium text-slate-900">Name: <span className="font-normal">{ord.customerName}</span></p>
                                  <p className="font-medium text-slate-900">Contact: <span className="font-normal">{ord.phone}</span></p>
                                  <p className="font-medium text-slate-900">Address: <span className="font-normal">{ord.deliveryAddress} ({ord.district})</span></p>
                                </div>

                                <div className="space-y-1">
                                  <p className="font-semibold text-slate-400 text-[9px] uppercase font-mono">অর্ডার আইটেম (Ordered Items):</p>
                                  {shopCartItems.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-slate-800">
                                      <p className="truncate pr-4 flex-1">{item.title}</p>
                                      <p className="shrink-0 font-mono font-bold">Qty {item.quantity} × ৳{formatBDT(item.price)}</p>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex justify-between items-center font-bold border-t border-dashed pt-1.5">
                                  <span className="text-gray-450 font-normal">Merchant Receivable Amount:</span>
                                  <span className="text-emerald-650">৳{formatBDT(totalShopEarnings)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-rose-150"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>विक्रेতা লগ আউট (Logout Seller Center)</span>
                  </button>
                </div>
              )}
            </>
          )}

          {/* ================================================================ */}
          {/* ====================== AFFILIATE FLOW ========================== */}
          {/* ================================================================ */}
          {userType === "affiliate" && (
            <>
              {/* Affiliate Registration */}
              {mode === "register" && (
                <div className="space-y-5" id="affiliate-register-step">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-display font-bold text-emerald-500 uppercase tracking-wide">
                      ZSHOP BD Affiliate Account (এফিলিয়েট পার্টনার অ্যাকাউন্ট খুলুন)
                    </h4>
                    <p className="text-[11px] text-gray-500 font-sans">
                      আমাদের যেকোনো প্রোডাক্ট শেয়ার করে প্রতি সেলে আকর্ষণীয় কমিশন ইনকাম করুন!
                    </p>
                  </div>

                  {affError && (
                    <div className="p-3 bg-red-50 text-red-650 text-xs rounded-xl flex items-center gap-2.5 border border-red-100">
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

                  <form onSubmit={handleAffiliateRegisterSubmit} className="space-y-4">
                    <div className="flex flex-col items-center justify-center p-3 border border-dashed border-gray-200 rounded-xl bg-white space-y-2">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-bold">Affiliate Avatar (আপনার ছবি)</p>
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 bg-gray-100 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                          {affAvatar ? (
                            <img src={affAvatar} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-gray-400" />
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
                            className="py-1.5 px-3 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-850 flex items-center gap-1 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>আপলোড করুন</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">
                        Full Name (আপনার পূর্ণ নাম)
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          placeholder="যেমন: Kabir Hosen"
                          value={affName}
                          onChange={(e) => setAffName(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 focus:border-emerald-400 rounded-xl text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-gray-500 uppercase mb-1">
                        Mobile Number (মোবাইল নম্বর - যা এফিলিয়েট আইডি হিসেবে কাজ করবে)
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          placeholder="যেমন: 01712345678"
                          value={affPhone}
                          onChange={(e) => setAffPhone(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 focus:border-emerald-400 rounded-xl text-xs text-slate-800 focus:outline-none font-mono"
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
                <div className="space-y-6" id="affiliate-control-panel-dashboard">
                  {/* Affiliate Header banner */}
                  <div className="bg-emerald-600 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden shadow-md">
                    <div className="flex items-center gap-3.5 z-10">
                      <div className="relative w-12 h-12">
                        <div className="w-full h-full bg-white/20 border border-white/30 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                          {activeAffiliate.avatar ? (
                            <img src={activeAffiliate.avatar} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <label className="absolute -bottom-1 -right-1 bg-amber-500 hover:bg-amber-600 text-slate-950 p-1 rounded-full cursor-pointer shadow border border-emerald-600 flex items-center justify-center" title="ছবি পরিবর্তন করুন">
                          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                          <Camera className="w-2.5 h-2.5 text-slate-950" />
                        </label>
                      </div>
                      <div className="space-y-0.5">
                        <span className="inline-block px-1.5 py-0.5 bg-black/30 rounded text-[8px] font-mono font-bold uppercase tracking-wider">OFFICIAL AFFILIATE PARTNER</span>
                        <h4 className="text-sm font-display font-extrabold text-white">
                          {activeAffiliate.name}
                        </h4>
                        <p className="text-[10px] text-emerald-250 font-mono">
                          📱 Phone: {activeAffiliate.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 z-10 font-mono text-center">
                      <div className="bg-black/20 p-2 text-white rounded-xl backdrop-blur-md shrink-0 border border-white/10 min-w-[70px]">
                        <span className="text-[8px] uppercase tracking-wider block text-emerald-200">মোট ক্লিকস</span>
                        <span className="text-xs font-black">{activeAffiliate.clicks || 0}</span>
                      </div>
                      <div className="bg-black/20 p-2 text-white rounded-xl backdrop-blur-md shrink-0 border border-white/10 min-w-[70px]">
                        <span className="text-[8px] uppercase tracking-wider block text-emerald-200">মোট অর্ডার</span>
                        <span className="text-xs font-black">{activeAffiliate.salesCount || 0}</span>
                      </div>
                      <div className="bg-black/30 border-2 border-emerald-300 p-2 text-white rounded-xl backdrop-blur-md shrink-0 min-w-[80px]">
                        <span className="text-[8px] uppercase tracking-wider block text-emerald-100 font-bold font-sans">মোট ইনকাম</span>
                        <span className="text-xs font-black">৳{formatBDT(activeAffiliate.earnings || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tabs: dashboard (Link Generator) */}
                  <div className="flex border-b border-gray-150 gap-2">
                    <button
                      onClick={() => setAffiliateTab("dashboard")}
                      className={`py-2 px-3 text-xs font-bold border-b-2 cursor-pointer transition-all ${
                        affiliateTab === "dashboard"
                          ? "border-emerald-500 text-emerald-600 font-extrabold"
                          : "border-transparent text-gray-500 hover:text-slate-800"
                      }`}
                    >
                      🚀 প্রোডাক্ট তালিকা ও এফিলিয়েট লিংক
                    </button>
                  </div>

                  {/* Tab Contents: dashboard */}
                  {affiliateTab === "dashboard" && (
                    <div className="space-y-4">
                      <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-3 rounded-xl text-xs space-y-1">
                        <p className="font-bold">💡 এফিলিয়েট লিংক কীভাবে কাজ করে?</p>
                        <p className="leading-relaxed font-sans">
                          যেকোনো প্রোডাক্টের <strong>লিংক কপি করুন</strong> বা <strong>ছবি ডাউনলোড</strong> বা সরাসরি ফেসবুকে শেয়ার করুন। আপনার লিংকে ক্লিক করে কেউ কিছু অর্ডার করলে আপনি সাথে সাথে কমিশন পাবেন!
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="text-xs font-bold text-slate-800 px-1 flex items-center justify-between">
                          <span>প্রোডাক্ট সংখ্যা: {allProducts.length} টি</span>
                          <span className="text-[10px] text-gray-400 font-normal">কমিশন রেট এবং জেনারেটর</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {allProducts.map((prod) => {
                            const refLink = `${window.location.origin}?affiliate=${activeAffiliate.phone}&product=${prod.id}`;
                            const isCopied = copiedProductId === prod.id;
                            const currentCommissionRate = prod.affCommission || 8;
                            const estimateEarnings = Math.round((prod.price * currentCommissionRate) / 100);

                            return (
                              <div key={prod.id} className="bg-white border border-gray-150 rounded-xl p-3 flex flex-col justify-between hover:border-emerald-300 transition-all shadow-sm">
                                <div className="flex gap-2.5">
                                  <div className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                                    <img src={prod.image} alt={prod.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    <span className="absolute top-1 left-1 bg-emerald-500 text-white font-bold text-[8px] px-1 py-0.5 rounded font-mono">
                                      {currentCommissionRate}%
                                    </span>
                                  </div>
                                  <div className="space-y-1 min-w-0 flex-1">
                                    <h5 className="font-bold text-slate-900 text-xs truncate">{prod.title}</h5>
                                    <div className="flex items-center gap-2">
                                      <p className="text-amber-500 font-mono font-black text-xs">৳{formatBDT(prod.price)}</p>
                                      {prod.oldPrice && (
                                        <p className="text-[10px] text-gray-400 line-through font-mono">৳{formatBDT(prod.oldPrice)}</p>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-emerald-600 font-medium font-sans">
                                      কমিশন ইনকাম: <strong>৳{formatBDT(estimateEarnings)}</strong>
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-1.5 mt-3 pt-2.5 border-t border-dashed border-gray-150">
                                  <div className="flex items-center gap-1.5 bg-slate-50 border border-gray-150 p-1 px-2 rounded-lg">
                                    <Link className="w-3 h-3 text-slate-400 shrink-0" />
                                    <input 
                                      type="text" 
                                      readOnly 
                                      value={refLink} 
                                      className="bg-transparent border-none text-[8px] font-mono text-slate-500 outline-none w-full cursor-default select-all" 
                                    />
                                  </div>

                                  <div className="flex gap-1.5 mt-0.5">
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(refLink);
                                        setCopiedProductId(prod.id);
                                        setTimeout(() => setCopiedProductId(null), 2000);
                                      }}
                                      className={`flex-1 py-1.5 text-[10px] rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                                        isCopied 
                                          ? "bg-emerald-50 text-emerald-600 border border-emerald-250" 
                                          : "bg-slate-900 text-white hover:bg-slate-850"
                                      }`}
                                    >
                                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                      <span>{isCopied ? "লিংক কপিড!" : "কপি লিংক"}</span>
                                    </button>

                                    <button
                                      onClick={() => handleDownloadProductImage(prod.image, prod.title)}
                                      className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] rounded-lg font-bold border border-gray-200 flex items-center justify-center gap-1 cursor-pointer shrink-0"
                                      title="ডাউনলোড প্রোডাক্ট ইমেজ"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      <span>ডাউনলোড ইমেজ</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Affiliate Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-rose-150"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>প্রস্থান করুন (Logout Affiliate Center)</span>
                  </button>
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
}
