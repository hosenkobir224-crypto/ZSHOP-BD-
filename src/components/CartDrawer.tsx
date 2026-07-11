import React, { useState } from "react";
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ChevronRight, 
  Truck, 
  Info,
  CheckCircle2,
  CalendarDays,
  ShieldCheck,
  Copy,
  Check
} from "lucide-react";
import { CartItem } from "../types";
import { trackPixelEvent } from "../lib/metaPixel";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  initialStep?: "cart" | "form";
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  initialStep = "cart",
}: CartDrawerProps) {
  // Checkout states
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "form" | "success">("cart");

  // Synchronize step with initialStep prop when the drawer is opened/closed
  React.useEffect(() => {
    if (isOpen) {
      setCheckoutStep(initialStep);
    } else {
      setCheckoutStep("cart");
    }
  }, [isOpen, initialStep]);

  React.useEffect(() => {
    if (isOpen) {
      try {
        const raw = localStorage.getItem("zshop_bd_active_customer_session_v1");
        if (raw) {
          const session = JSON.parse(raw);
          if (session.name) setName(session.name);
          if (session.phone) setPhone(session.phone);
        }
      } catch (err) {
        console.error("Failed to load active user session inside CartDrawer:", err);
      }
    }
  }, [isOpen]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("dhaka"); // 'dhaka' or 'outside'
  const [instructions, setInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bkash" | "nagad" | "visa" | "mastercard">("cod");
  const [walletNumber, setWalletNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [cardName, setCardName] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [walletCopied, setWalletCopied] = useState(false);
  
  // Simulated Order Details
  const [placedOrder, setPlacedOrder] = useState<{
    id: string;
    total: number;
    deliveryFee: number;
  } | null>(null);

  if (!isOpen) return null;

  // Formatting helper
  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const selectDeliveryFee = () => {
    return district === "dhaka" ? 60 : 120; // ৳60 Inside Dhaka, ৳120 Outside Dhaka
  };

  const itemsSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalAmount = itemsSubtotal + selectDeliveryFee();

  const handleValidationAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!name.trim()) errors.name = "Full Name is required / নাম প্রয়োজন";
    if (!phone.trim()) {
      errors.phone = "Phone Number is required / মোবাইল নম্বর প্রয়োজন";
    } else if (!/^(?:\+88|88)?(01[3-9]\d{8})$/.test(phone.replace(/\s+/g, ""))) {
      errors.phone = "Please enter a valid Bangladeshi phone number (e.g., 01712345678)";
    }
    if (!address.trim()) errors.address = "Full Shipping Address is required / ঠিকানা প্রয়োজন";

    // Payment validation
    if (paymentMethod === "bkash" || paymentMethod === "nagad") {
      if (!walletNumber.trim()) {
        errors.walletNumber = "Personal account number is required / অ্যাকাউন্ট নম্বর দিন";
      } else if (!/^01[3-9]\d{8}$/.test(walletNumber.replace(/\s+/g, ""))) {
        errors.walletNumber = "Please enter a valid 11-digit mobile wallet number / সঠিক নম্বর দিন";
      }
      if (!transactionId.trim()) {
        errors.transactionId = "Transaction ID (TrxID) is required for validation / ট্রানজেকশন আইডি দিন";
      }
    } else if (paymentMethod === "visa" || paymentMethod === "mastercard") {
      if (!cardNumber.trim()) {
        errors.cardNumber = "Card Number is required / কার্ড নম্বর দিন";
      }
      if (!cardExpiry.trim()) {
        errors.cardExpiry = "Expiry (MM/YY) is required / মেয়াদ দিন";
      }
      if (!cardCVV.trim()) {
        errors.cardCVV = "CVV code is required / সিভিসি দিন";
      }
      if (!cardName.trim()) {
        errors.cardName = "Cardholder Name is required / কার্ডের নাম দিন";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    
    // Success State
    const simulatedOrderId = `ZSB-${Math.floor(100000 + Math.random() * 900000)}`;
    setPlacedOrder({
      id: simulatedOrderId,
      total: totalAmount,
      deliveryFee: selectDeliveryFee(),
    });

    // Logging order persistently to localStorage for Admin Panel tracking
    try {
      const referrerPhone = localStorage.getItem("zshop_bd_referred_affiliate_id") || undefined;
      const newOrder = {
        id: simulatedOrderId,
        customerName: name,
        phone: phone,
        address: address,
        district: district,
        instructions: instructions || "None",
        affiliatePhone: referrerPhone,
        cartItems: cart.map(item => ({
          id: item.id,
          productId: item.product.id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          color: item.selectedColor || "",
          size: item.selectedSize || "",
          image: item.product.image
        })),
        deliveryFee: selectDeliveryFee(),
        itemsSubtotal: itemsSubtotal,
        total: totalAmount,
        timestamp: new Date().toISOString(),
        status: "Pending" as const,
        paymentMethod: paymentMethod === "cod" ? "Cash On Delivery" : paymentMethod.toUpperCase(),
        paymentDetails: paymentMethod === "cod" 
          ? "Unpaid (Cash on Delivery)" 
          : (paymentMethod === "bkash" || paymentMethod === "nagad")
            ? `Wallet: ${walletNumber}, Transaction ID: ${transactionId}`
            : `Card spacing: ${cardNumber.replace(/(.{4})/g, "$1 ").trim()}, Name: ${cardName} (Simulated Payment)`
      };

      // Send order to server for persistent global storage
      fetch("/api/orders/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newOrder })
      }).catch(err => console.error("Server order write error:", err));

      const existingRaw = localStorage.getItem("zshop_bd_orders_v1");
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem("zshop_bd_orders_v1", JSON.stringify([newOrder, ...existing]));
      
      // Dispatch a storage event so that if the admin panel is loaded, it refreshes reactively
      window.dispatchEvent(new Event("storage_orders_update"));

      // Track Facebook Meta Pixel Purchase event with transaction specs
      trackPixelEvent("Purchase", {
        value: totalAmount,
        currency: "BDT",
        content_name: `Order #${newOrder.id}`,
        content_type: "product",
        content_ids: newOrder.cartItems.map(item => item.productId)
      });
    } catch (err) {
      console.error("Local storage order write error", err);
    }

    setCheckoutStep("success");
  };

  const handleOrderResetFinish = () => {
    onClearCart();
    setCheckoutStep("cart");
    setName("");
    setPhone("");
    setAddress("");
    setDistrict("dhaka");
    setInstructions("");
    setPaymentMethod("cod");
    setWalletNumber("");
    setTransactionId("");
    setCardNumber("");
    setCardExpiry("");
    setCardCVV("");
    setCardName("");
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex justify-end" 
      id="cart-drawer-panel"
      role="dialog"
      aria-modal="true"
    >
      {/* Background Mask Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 transition-opacity backdrop-blur-xs" 
        onClick={() => {
          if (checkoutStep !== "success") onClose();
        }}
        id="cart-drawer-backdrop"
      />

      {/* Main Drawer Panel Box */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 overflow-hidden font-sans">
        
        {/* Drawer Header */}
        <div className="px-5 py-4.5 border-b border-gray-150 flex items-center justify-between bg-slate-950 text-white">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <div>
              <p className="font-display font-black text-sm tracking-wide">
                {checkoutStep === "cart" && "YOUR SHOPPING CART"}
                {checkoutStep === "form" && "SHIPPING & DELIVERY INFO"}
                {checkoutStep === "success" && "ORDER CONFIRMED! 🎉"}
              </p>
              {checkoutStep === "cart" && (
                <span className="text-[10px] text-slate-300 font-mono">
                  {cart.length} unique items added
                </span>
              )}
            </div>
          </div>
          
          {checkoutStep !== "success" && (
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-905 focus:outline-none cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Dynamic Content Module */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          
          {/* STEP 1: View Cart Itinerary */}
          {checkoutStep === "cart" && (
            <>
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center" id="empty-cart-view">
                  <div className="w-20 h-20 bg-slate-50 border border-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4 animate-pulse">
                    <ShoppingBag className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-display font-bold text-slate-950">Your Cart is Empty</h3>
                  <p className="text-xs text-gray-500 max-w-xs mt-1.5">
                    Browse our premium clothing, high-capacity kitchen accessories, and luxury watches to find the best deals.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 px-6 py-2.5 bg-slate-950 text-white hover:bg-amber-400 hover:text-slate-950 text-xs font-display font-bold rounded-xl transition-colors cursor-pointer focus:outline-none"
                  >
                    Start Shopping Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4" id="cart-items-list-container">
                  {cart.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex gap-4 p-3 bg-slate-50 border border-gray-200/80 rounded-xl hover:bg-white hover:shadow-xs transition-all duration-200 relative"
                      id={`cart-row-${item.id}`}
                    >
                      {/* Product Thumbnail */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                        <img 
                          src={item.product.image} 
                          alt={item.product.title} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content Details */}
                      <div className="flex-1 text-left flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-display font-medium text-slate-950 line-clamp-1 leading-snug">
                            {item.product.title}
                          </p>
                          {(item.selectedColor || item.selectedSize) && (
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5 font-semibold">
                              {item.selectedColor && `Color: ${item.selectedColor}`}
                              {item.selectedColor && item.selectedSize && " | "}
                              {item.selectedSize && `Size: ${item.selectedSize}`}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-xs font-display font-extrabold text-slate-950">
                            ৳{formatBDT(item.product.price)}
                          </p>
                          
                          {/* Stepper Inputs */}
                          <div className="flex items-center border border-gray-200 bg-white rounded-lg">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  onUpdateQuantity(item.id, item.quantity - 1);
                                }
                              }}
                              className="p-1 px-1.5 text-gray-500 hover:text-slate-950 hover:bg-gray-50 focus:outline-none cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-mono font-bold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="p-1 px-1.5 text-gray-500 hover:text-slate-950 hover:bg-gray-50 focus:outline-none cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Delete Trigger */}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none cursor-pointer"
                        title="Remove product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* STEP 2: Checkout Form Frame */}
          {checkoutStep === "form" && (
            <form onSubmit={handleValidationAndSubmit} className="space-y-4 text-left" id="checkout-validate-form">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-800 rounded-xl flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <p className="text-[11px] font-sans font-medium leading-relaxed">
                  We verify all phone numbers via call before dispatching the parcels. Enjoy <strong>100% Cash on Delivery</strong> all over Bangladesh.
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-display font-bold text-slate-900 mb-1.5">
                  Full Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your name (e.g., Kobir Hosen)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border-1.5 text-xs text-slate-800 bg-white rounded-xl focus:outline-none focus:border-slate-950 font-sans font-medium ${formErrors.name ? "border-red-400 bg-red-50/10" : "border-gray-200"}`}
                />
                {formErrors.name && (
                  <p className="text-[10px] text-red-500 mt-1 font-sans">{formErrors.name}</p>
                )}
              </div>

              {/* Phone Num */}
              <div>
                <label className="block text-xs font-display font-bold text-slate-900 mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g., 01712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border-1.5 text-xs text-slate-800 bg-white rounded-xl focus:outline-none focus:border-slate-950 font-sans font-medium ${formErrors.phone ? "border-red-400 bg-red-50/10" : "border-gray-200"}`}
                />
                {formErrors.phone && (
                  <p className="text-[10px] text-red-500 mt-1 font-sans">{formErrors.phone}</p>
                )}
              </div>

              {/* Shipping Address */}
              <div>
                <label className="block text-xs font-display font-bold text-slate-900 mb-1.5">
                  Full Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="House No, Road No, Area Name, Post Office, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border-1.5 text-xs text-slate-800 bg-white rounded-xl focus:outline-none focus:border-slate-950 font-sans font-medium ${formErrors.address ? "border-red-400 bg-red-50/10" : "border-gray-200"}`}
                />
                {formErrors.address && (
                  <p className="text-[10px] text-red-500 mt-1 font-sans">{formErrors.address}</p>
                )}
              </div>

              {/* Segment Delivery Location Dropdown */}
              <div>
                <label className="block text-xs font-display font-bold text-slate-900 mb-1.5">
                  Delivery Region / District / ডেলিভারি এলাকা <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label 
                    onClick={() => setDistrict("dhaka")}
                    className={`p-3 border-2 rounded-xl flex items-center justify-between gap-1.5 cursor-pointer hover:bg-slate-50 transition-colors ${district === "dhaka" ? "border-slate-950 bg-slate-50/50" : "border-gray-100 bg-white"}`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-950 font-display">Inside Dhaka</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Shipping: ৳60 BDT</p>
                    </div>
                    <input 
                      type="radio" 
                      name="district" 
                      checked={district === "dhaka"} 
                      onChange={() => setDistrict("dhaka")}
                      className="text-slate-950"
                    />
                  </label>

                  <label 
                    onClick={() => setDistrict("outside")}
                    className={`p-3 border-2 rounded-xl flex items-center justify-between gap-1.5 cursor-pointer hover:bg-slate-50 transition-colors ${district === "outside" ? "border-slate-950 bg-slate-50/50" : "border-gray-100 bg-white"}`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-950 font-display">Outside Dhaka</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Shipping: ৳120 BDT</p>
                    </div>
                    <input 
                      type="radio" 
                      name="district" 
                      checked={district === "outside"} 
                      onChange={() => setDistrict("outside")}
                      className="text-slate-950"
                    />
                  </label>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3 pt-1 border-t border-gray-100">
                <label className="block text-xs font-display font-bold text-slate-900">
                  পেমেন্ট পদ্ধতি নির্ধারণ করুন / Select Payment Method <span className="text-red-500">*</span>
                </label>
                
                <div className="space-y-2">
                  {/* Cash On Delivery (COD) Option */}
                  <div 
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-3.5 border-2 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer hover:bg-slate-50 transition-all ${paymentMethod === "cod" ? "border-slate-950 bg-slate-50/50 shadow-xs" : "border-gray-150 bg-white"}`}
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                        <Truck className="w-5 h-5 text-slate-700" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 font-display">ক্যাশ অন ডেলিভারি (Cash on Delivery)</p>
                        <p className="text-[10px] text-gray-500 font-sans">পণ্য হাতে পেয়ে মূল্য পরিশোধ করতে পছন্দ করুন</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === "cod" ? "border-slate-950 bg-slate-950" : "border-gray-300"}`}>
                      {paymentMethod === "cod" && <div className="w-1 h-1 bg-white rounded-full" />}
                    </div>
                  </div>

                  {/* Mobile & Card Payments Grid */}
                  <div className="grid grid-cols-2 gap-2 text-left">
                    
                    {/* bKash */}
                    <div 
                      onClick={() => setPaymentMethod("bkash")}
                      className={`p-3 border-2 rounded-xl flex flex-col justify-between cursor-pointer hover:bg-pink-50/20 transition-all min-h-[72px] ${paymentMethod === "bkash" ? "border-[#E2125B] bg-[#E2125B]/5 shadow-xs" : "border-gray-150 bg-white"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-[#E2125B] font-display">বিকাশ (bKash)</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentMethod === "bkash" ? "border-[#E2125B] bg-[#E2125B]" : "border-gray-300"}`}>
                          {paymentMethod === "bkash" && <div className="w-1 h-1 bg-white rounded-full" />}
                        </div>
                      </div>
                      <p className="text-[9px] text-gray-500 leading-tight font-sans mt-1">bKash wallet transfer</p>
                    </div>

                    {/* Nagad */}
                    <div 
                      onClick={() => setPaymentMethod("nagad")}
                      className={`p-3 border-2 rounded-xl flex flex-col justify-between cursor-pointer hover:bg-orange-50/20 transition-all min-h-[72px] ${paymentMethod === "nagad" ? "border-[#F15A22] bg-[#F15A22]/5 shadow-xs" : "border-gray-150 bg-white"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-[#F15A22] font-display">নগদ (Nagad)</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentMethod === "nagad" ? "border-[#F15A22] bg-[#F15A22]" : "border-gray-300"}`}>
                          {paymentMethod === "nagad" && <div className="w-1 h-1 bg-white rounded-full" />}
                        </div>
                      </div>
                      <p className="text-[9px] text-gray-500 leading-tight font-sans mt-1">Nagad wallet transfer</p>
                    </div>

                    {/* Visa Card */}
                    <div 
                      onClick={() => setPaymentMethod("visa")}
                      className={`p-3 border-2 rounded-xl flex flex-col justify-between cursor-pointer hover:bg-blue-50/20 transition-all min-h-[72px] ${paymentMethod === "visa" ? "border-[#1A1F71] bg-[#1A1F71]/5 shadow-xs" : "border-gray-150 bg-white"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-[#1A1F71] font-display">ভিসা কার্ড (Visa)</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentMethod === "visa" ? "border-[#1A1F71] bg-[#1A1F71]" : "border-gray-300"}`}>
                          {paymentMethod === "visa" && <div className="w-1 h-1 bg-white rounded-full" />}
                        </div>
                      </div>
                      <p className="text-[9px] text-gray-500 leading-tight font-sans mt-1">Visa Credit/Debit card</p>
                    </div>

                    {/* Mastercard */}
                    <div 
                      onClick={() => setPaymentMethod("mastercard")}
                      className={`p-3 border-2 rounded-xl flex flex-col justify-between cursor-pointer hover:bg-red-50/10 transition-all min-h-[72px] ${paymentMethod === "mastercard" ? "border-[#eb001b] bg-[#eb001b]/5 shadow-xs" : "border-gray-150 bg-white"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-[#eb001b] font-display">মাস্টার কার্ড (Mastercard)</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentMethod === "mastercard" ? "border-[#eb001b] bg-[#eb001b]" : "border-gray-300"}`}>
                          {paymentMethod === "mastercard" && <div className="w-1 h-1 bg-white rounded-full" />}
                        </div>
                      </div>
                      <p className="text-[9px] text-gray-500 leading-tight font-sans mt-1">Mastercard transaction</p>
                    </div>

                  </div>
                </div>

                {/* Sub-form fields based on Payment Method */}
                {(paymentMethod === "bkash" || paymentMethod === "nagad") && (
                  <div className="p-3.5 bg-slate-50 border border-gray-200/80 rounded-xl space-y-3 font-sans">
                    <div className="flex gap-2.5 items-start">
                      <div className={`w-1 h-9 rounded shrink-0 ${paymentMethod === "bkash" ? "bg-[#E2125B]" : "bg-[#F15A22]"}`} />
                      <div>
                        <p className="text-[11px] font-bold text-slate-800 leading-tight capitalize">
                          {paymentMethod} পেমেন্ট নির্দেশনা:
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 leading-normal flex flex-wrap items-center gap-1.5">
                          <span>আমাদের পার্সোনাল ওয়ালেট নম্বর</span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-200/60 text-slate-900 rounded font-bold font-mono text-[10px] shadow-2xs border border-gray-300">
                            01712-345678
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText("01712345678");
                                setWalletCopied(true);
                                setTimeout(() => setWalletCopied(false), 2000);
                              }}
                              className="text-slate-500 hover:text-slate-850 active:scale-95 cursor-pointer ml-0.5 focus:outline-none"
                              title="কপি করুন"
                            >
                              {walletCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </span>
                          {walletCopied && <span className="text-[9px] text-emerald-600 font-bold font-sans animate-bounce">(কপি হয়েছে!)</span>}
                          <span>-এ টাকা পাঠিয়ে (Send Money) নিচের বক্সে সঠিক তথ্য দিন।</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-left">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">
                          মোবাইল ওয়ালেট নম্বর <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="tel"
                          placeholder="যেমন- 01712345678"
                          value={walletNumber}
                          onChange={(e) => setWalletNumber(e.target.value)}
                          className={`w-full px-3 py-2 text-xs text-slate-800 bg-white border rounded-lg focus:outline-none focus:border-slate-900 ${formErrors.walletNumber ? 'border-red-400 bg-red-50/10' : 'border-gray-250'}`}
                        />
                        {formErrors.walletNumber && (
                          <p className="text-[9px] text-red-500 mt-0.5 leading-tight">{formErrors.walletNumber}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1 font-display">
                          Transaction ID (TrxID) <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text"
                          placeholder="যেমন- AH89FD23"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                          className={`w-full px-3 py-2 text-xs text-slate-800 bg-white border rounded-lg focus:outline-none focus:border-slate-900 ${formErrors.transactionId ? 'border-red-400 bg-red-50/10' : 'border-gray-250'}`}
                        />
                        {formErrors.transactionId && (
                          <p className="text-[9px] text-red-500 mt-0.5 leading-tight">{formErrors.transactionId}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {(paymentMethod === "visa" || paymentMethod === "mastercard") && (
                  <div className="p-3.5 bg-slate-50 border border-gray-200/80 rounded-xl space-y-2.5 font-sans">
                    <div className="flex gap-2.5 items-start">
                      <div className={`w-1 h-9 rounded shrink-0 ${paymentMethod === "visa" ? "bg-[#1A1F71]" : "bg-[#eb001b]"}`} />
                      <div>
                        <p className="text-[11px] font-bold text-slate-800 leading-tight">
                          {paymentMethod === "visa" ? "Visa" : "Mastercard"} কার্ডের তথ্য প্রদান করুন:
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 leading-normal text-left">
                          আপনার ক্রেডিট/ডেবিট কার্ড নাম্বার এবং নিরাপত্তা কোড দিয়ে পেমেন্ট সম্পূর্ণ করুন।
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">
                          কার্ড হোল্ডারের নাম (Name on Card) <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text"
                          placeholder="যেমন- KOBIR HOSEN"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value.toUpperCase())}
                          className={`w-full px-3 py-2 text-xs text-slate-800 bg-white border rounded-lg focus:outline-none focus:border-slate-900 ${formErrors.cardName ? 'border-red-400 bg-red-50/10' : 'border-gray-250'}`}
                        />
                        {formErrors.cardName && (
                          <p className="text-[9px] text-red-500 mt-0.5 leading-tight">{formErrors.cardName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">
                          কার্ড নম্বর (Card Number) <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text"
                          placeholder="4000 1234 5678 9010"
                          value={cardNumber}
                          maxLength={19}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setCardNumber(val);
                          }}
                          className={`w-full px-3 py-2 text-xs text-slate-800 bg-white border rounded-lg focus:outline-none focus:border-slate-900 font-mono tracking-wider ${formErrors.cardNumber ? 'border-red-400 bg-red-50/10' : 'border-gray-250'}`}
                        />
                        {formErrors.cardNumber && (
                          <p className="text-[9px] text-red-500 mt-0.5 leading-tight">{formErrors.cardNumber}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-left">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-1">
                            মেয়াদ শেষ (MM/YY) <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="text"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className={`w-full px-3 py-2 text-xs text-slate-800 bg-white border rounded-lg focus:outline-none focus:border-slate-900 font-mono text-center ${formErrors.cardExpiry ? 'border-red-400 bg-red-50/10' : 'border-gray-250'}`}
                          />
                          {formErrors.cardExpiry && (
                            <p className="text-[9px] text-red-500 mt-0.5 leading-tight">{formErrors.cardExpiry}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-1">
                            সিভিসি (CVV/CVC) <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="password"
                            placeholder="***"
                            maxLength={3}
                            value={cardCVV}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              setCardCVV(val);
                            }}
                            className={`w-full px-3 py-2 text-xs text-slate-800 bg-white border rounded-lg focus:outline-none focus:border-slate-900 font-mono text-center ${formErrors.cardCVV ? 'border-red-400 bg-red-50/10' : 'border-gray-250'}`}
                          />
                          {formErrors.cardCVV && (
                            <p className="text-[9px] text-red-500 mt-0.5 leading-tight">{formErrors.cardCVV}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Special Instructions (Optional) */}
              <div>
                <label className="block text-xs font-display font-medium text-slate-700 mb-1.5">
                  Special Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Deliver after 3 PM, Call before arriving"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 border-1.5 border-gray-200 text-xs text-slate-800 bg-white rounded-xl focus:outline-none focus:border-slate-950 font-sans"
                />
              </div>

              {/* Standard Hidden Submit Action */}
              <button type="submit" className="hidden" id="submit-hidden-trigger" />
            </form>
          )}

          {/* STEP 3: Order Completed Confirmation Screen */}
          {checkoutStep === "success" && placedOrder && (
            <div className="h-full flex flex-col items-center justify-center py-6 text-center" id="order-success-screen">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h3 className="text-base sm:text-lg font-display font-black text-slate-950 uppercase tracking-tight">
                Order Received successfully!
              </h3>
              <p className="text-xs text-emerald-600 font-sans font-medium mt-1">
                {paymentMethod === "cod" ? "Cash on Delivery (COD) order placed" : "Online Payment Logged successfully"}
              </p>

              {/* Elegant Order Invoice Slip */}
              <div className="w-full bg-slate-50 border border-gray-200/80 rounded-2xl p-5 my-6 text-left space-y-3.5 font-sans relative overflow-hidden">
                <div className="absolute top-0 right-0 py-1.5 px-3 bg-amber-500/15 text-amber-800 text-[9px] font-mono font-extrabold rounded-bl-xl tracking-wider">
                  PENDING CALL VERIFICATION
                </div>
                
                <h4 className="text-[11px] font-mono tracking-wider font-extrabold text-slate-400 uppercase">
                  ORDER INVOICE RECEIPT
                </h4>

                <div className="space-y-2 border-b border-gray-200/60 pb-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Order ID:</span>
                    <span className="font-mono font-bold text-slate-950">{placedOrder.id}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Customer:</span>
                    <span className="font-semibold text-slate-950">{name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Phone:</span>
                    <span className="font-mono font-semibold text-slate-900">{phone}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Payment:</span>
                    <span className="font-semibold text-slate-950 uppercase">{paymentMethod === "cod" ? "Cash On Delivery" : paymentMethod}</span>
                  </div>
                  {paymentMethod !== "cod" && (
                    <div className="flex justify-between items-start text-xs pt-0.5">
                      <span className="text-gray-400 font-medium shrink-0">Details:</span>
                      <span className="text-[10px] font-mono text-gray-600 text-right max-w-[200px] break-all">
                        {paymentMethod === "bkash" || paymentMethod === "nagad"
                          ? `Wallet: ${walletNumber} (TrxID: ${transactionId})`
                          : `Card: **** **** **** ${cardNumber.slice(-4)}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <p className="text-[10px] font-mono tracking-widest text-slate-400 font-extrabold uppercase">
                    Delivery Summary
                  </p>
                  <p className="font-medium text-slate-800 line-clamp-2 leading-relaxed">
                    {address}
                  </p>
                  <div className="flex items-center gap-1.5 pt-1 text-[11px] text-gray-500">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    <span>Estimated delivery: <strong>2 - 4 working days</strong></span>
                  </div>
                </div>

                <div className="border-t border-gray-200/60 pt-3 flex justify-between items-center">
                  <span className="text-xs font-display font-medium text-slate-600">
                    {paymentMethod === "cod" ? "Total Billed Amt (COD):" : "Total Bill Amount:"}
                  </span>
                  <span className="text-sm sm:text-base font-display font-black text-slate-950">
                    ৳{formatBDT(placedOrder.total)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-left justify-center p-3.5 bg-slate-50 border border-gray-200 rounded-xl w-full">
                <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  Our dispatch manager will contact you in 2-3 hours on your number <strong>{phone}</strong> to confirm this delivery. Thank you!
                </p>
              </div>

              <button
                onClick={handleOrderResetFinish}
                className="w-full mt-6 py-3 bg-slate-950 text-white hover:bg-amber-400 hover:text-slate-950 text-xs font-display font-bold rounded-xl transition-colors cursor-pointer focus:outline-none"
              >
                Go Back to Shopping
              </button>
            </div>
          )}

        </div>

        {/* Drawer Bottom Actions Area */}
        {cart.length > 0 && checkoutStep !== "success" && (
          <div className="p-5 border-t border-gray-150 bg-slate-50 rounded-t-2xl shrink-0 text-left">
            
            {/* Calculation summary list */}
            <div className="space-y-2 mb-4.5 font-sans">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Items Subtotal</span>
                <span className="font-mono font-semibold text-slate-950">৳{formatBDT(itemsSubtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Estimated Shipping</span>
                <span className="font-mono font-semibold text-slate-950">
                  {checkoutStep === "cart" ? "Calculated at next step" : `৳${formatBDT(selectDeliveryFee())}`}
                </span>
              </div>
              
              <div className="border-t border-gray-150/65 pt-2.5 flex justify-between items-center text-slate-950">
                <span className="text-xs font-display font-bold">Total Bill (approximateBdt)</span>
                <span className="text-base sm:text-lg font-display font-black">
                  ৳{formatBDT(checkoutStep === "cart" ? itemsSubtotal : totalAmount)}
                </span>
              </div>
            </div>

            {/* Navigation control row */}
            <div className="space-y-2">
              {checkoutStep === "cart" ? (
                <button
                  onClick={() => {
                    setCheckoutStep("form");
                    trackPixelEvent("InitiateCheckout", {
                      value: itemsSubtotal,
                      currency: "BDT",
                      num_items: cart.reduce((acc, c) => acc + c.quantity, 0)
                    });
                  }}
                  className="w-full py-3.5 bg-slate-950 hover:bg-amber-400 text-white hover:text-slate-950 text-xs font-display font-bold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer focus:outline-none"
                >
                  <span>Proceed to Delivery Info</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setCheckoutStep("cart")}
                    className="w-1/3 py-3.5 bg-white border border-gray-150 hover:bg-gray-50 text-slate-800 text-xs font-display font-bold rounded-xl transition-colors cursor-pointer focus:outline-none"
                  >
                    Back to Cart
                  </button>
                  <button
                    onClick={() => {
                      // Trigger validation and submit
                      const triggerBtn = document.getElementById("submit-hidden-trigger");
                      if (triggerBtn) triggerBtn.click();
                    }}
                    className="w-2/3 py-3.5 bg-slate-950 hover:bg-emerald-600 text-white text-xs font-display font-bold rounded-xl transition-colors cursor-pointer focus:outline-none flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Place Order (৳{formatBDT(totalAmount)})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
