import { useState, useEffect, useMemo } from "react";
import { 
  SlidersHorizontal, 
  Sparkles, 
  ShoppingBag, 
  TrendingUp, 
  ArrowUp, 
  Heart,
  ChevronDown,
  LayoutGrid,
  Shirt,
  Watch,
  Smartphone,
  ChefHat,
  Trophy,
  CheckCircle2,
  PhoneCall
} from "lucide-react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import CartDrawer from "./components/CartDrawer";
import ProductDetailModal from "./components/ProductDetailModal";
import Footer from "./components/Footer";
import AdminPanel from "./components/AdminPanel";
import { initMetaPixel, trackPixelEvent } from "./lib/metaPixel";
import CustomerProfile from "./components/CustomerProfile";
import FlashSale from "./components/FlashSale";
import SearchResultsView from "./components/SearchResultsView";
import { Product, CartItem, Order } from "./types";
import { PRODUCTS, CATEGORIES } from "./data";

export default function App() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && data.products) {
        const merchantProducts = data.products || [];
        const merged = [...PRODUCTS];
        // Merge merchant products that are not already present
        merchantProducts.forEach((mp: Product) => {
          const index = merged.findIndex(p => p.id === mp.id);
          if (index !== -1) {
            merged[index] = mp; // Update in place
          } else {
            merged.unshift(mp); // Prepend new seller products
          }
        });
        setProducts(merged);
        localStorage.setItem("zshop_bd_products_v1", JSON.stringify(merged));
      }
    } catch (err) {
      console.error("Failed to load products from server:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
        localStorage.setItem("zshop_bd_orders_v1", JSON.stringify(data.orders));
      }
    } catch (err) {
      console.error("Failed to fetch server orders:", err);
    }
  };

  // Keep products state persistent and sync on mount
  useEffect(() => {
    fetchProducts();
    fetchOrders();

    // Initialize Facebook Meta Pixel
    initMetaPixel();

    const handlePixelConfigChange = () => {
      initMetaPixel();
    };

    window.addEventListener("products_db_sync_update", fetchProducts);
    window.addEventListener("zshop_bd_pixel_config_updated", handlePixelConfigChange);
    
    return () => {
      window.removeEventListener("products_db_sync_update", fetchProducts);
      window.removeEventListener("zshop_bd_pixel_config_updated", handlePixelConfigChange);
    };
  }, []);

  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isCustomerProfileOpen, setIsCustomerProfileOpen] = useState<boolean>(false);

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const savedOrders = localStorage.getItem("zshop_bd_orders_v1");
      return savedOrders ? JSON.parse(savedOrders) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleOrdersSync = () => {
      try {
        const savedOrders = localStorage.getItem("zshop_bd_orders_v1");
        setOrders(savedOrders ? JSON.parse(savedOrders) : []);
      } catch (err) {
        console.error(err);
      }
    };
    window.addEventListener("storage_orders_update", handleOrdersSync);
    return () => window.removeEventListener("storage_orders_update", handleOrdersSync);
  }, []);

  // Sync Shopping Cart state in browser local storage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("zshop_bd_cart_v1");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // State managers
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [cartInitialStep, setCartInitialStep] = useState<"cart" | "form">("cart");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  
  // Custom sorting & range utilities
  const [priceRange, setPriceRange] = useState<"all" | "low" | "mid" | "high">("all");
  const [sortBy, setSortBy] = useState<"default" | "priceAsc" | "priceDesc" | "rating">("default");
  const [isFilterTrayExpanded, setIsFilterTrayExpanded] = useState<boolean>(false);

  // Scroll to view helper
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Sync effect updates cart value in localstorage
  useEffect(() => {
    try {
      localStorage.setItem("zshop_bd_cart_v1", JSON.stringify(cart));
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }, [cart]);

  // Back to top scrolling watcher
  useEffect(() => {
    const checkScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", checkScroll);
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  // Deep-link parsing for individual product share links
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const prodId = params.get("product");
      if (prodId && products.length > 0) {
        const match = products.find((p) => String(p.id) === String(prodId));
        if (match) {
          setSelectedProduct(match);
          setIsDetailModalOpen(true);
        }
      }

      // Check for affiliate referral telephone
      const affiliateId = params.get("affiliate");
      if (affiliateId) {
        localStorage.setItem("zshop_bd_referred_affiliate_id", affiliateId.trim());
        
        // Post tracking to server in background
        fetch("/api/affiliates/track-click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: affiliateId.trim() })
        }).catch(err => console.error("Error logging click stats:", err));
      }
    } catch (e) {
      console.error("Deep link parse error:", e);
    }
  }, [products]);

  // Format currency helper
  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper to map category icon names
  const renderCategoryIcon = (iconName: string, active: boolean) => {
    const cls = `w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`;
    switch (iconName) {
      case "Shirt": return <Shirt className={cls} />;
      case "Watch": return <Watch className={cls} />;
      case "Smartphone": return <Smartphone className={cls} />;
      case "ChefHat": return <ChefHat className={cls} />;
      case "Trophy": return <Trophy className={cls} />;
      default: return <LayoutGrid className={cls} />;
    }
  };

  // 1. ADD ITEM TO CART (Standard Simple Trigger)
  const handleAddToCart = (product: Product) => {
    // Generate a unique ID based on product and defaults
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : undefined;
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined;
    const itemUniqueId = `${product.id}-${defaultColor || ""}-${defaultSize || ""}`;

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((item) => item.id === itemUniqueId);
      if (existingIdx > -1) {
        const copy = [...prevCart];
        copy[existingIdx].quantity += 1;
        return copy;
      } else {
        return [
          ...prevCart,
          {
            id: itemUniqueId,
            product,
            quantity: 1,
            selectedColor: defaultColor,
            selectedSize: defaultSize,
          },
        ];
      }
    });

    // Track Meta Pixel standard event
    trackPixelEvent("AddToCart", {
      content_ids: [product.id],
      content_name: product.title,
      content_type: "product",
      value: product.price,
      currency: "BDT"
    });

    // Set cart to standard view and open
    setCartInitialStep("cart");
    setIsCartOpen(true);
  };

  // 1b. INSTANT EXPRESS CHECKOUT ORDER NOW TRIGGER
  const handleOrderNow = (product: Product) => {
    // Generate a unique ID based on product and defaults
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : undefined;
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined;
    const itemUniqueId = `${product.id}-${defaultColor || ""}-${defaultSize || ""}`;

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((item) => item.id === itemUniqueId);
      if (existingIdx > -1) {
        const copy = [...prevCart];
        copy[existingIdx].quantity += 1;
        return copy;
      } else {
        return [
          ...prevCart,
          {
            id: itemUniqueId,
            product,
            quantity: 1,
            selectedColor: defaultColor,
            selectedSize: defaultSize,
          },
        ];
      }
    });

    // Track Meta Pixel standard AddToCart & InitiateCheckout events
    trackPixelEvent("AddToCart", {
      content_ids: [product.id],
      content_name: product.title,
      content_type: "product",
      value: product.price,
      currency: "BDT"
    });
    trackPixelEvent("InitiateCheckout", {
      content_ids: [product.id],
      value: product.price,
      currency: "BDT"
    });

    // Directly skip to checkout form and open
    setCartInitialStep("form");
    setIsCartOpen(true);
  };

  // 2. ADD ITEM TO CART WITH CUSTOM SPECIFICATIONS
  const handleAddToCartWithSpecs = (
    product: Product,
    quantity: number,
    color?: string,
    size?: string
  ) => {
    const itemUniqueId = `${product.id}-${color || ""}-${size || ""}`;

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((item) => item.id === itemUniqueId);
      if (existingIdx > -1) {
        const copy = [...prevCart];
        copy[existingIdx].quantity += quantity;
        return copy;
      } else {
        return [
          ...prevCart,
          {
            id: itemUniqueId,
            product,
            quantity,
            selectedColor: color,
            selectedSize: size,
          },
        ];
      }
    });

    // Track Meta Pixel standard event
    trackPixelEvent("AddToCart", {
      content_ids: [product.id],
      content_name: product.title,
      content_type: "product",
      value: product.price * quantity,
      currency: "BDT"
    });

    setCartInitialStep("cart");
  };

  // 3. REMOVE OR CHANGE QUANTITY INDIVIDUAL ROW
  const handleUpdateCartQuantity = (id: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // 4. OPEN PRODUCT MODAL DETAIL DIALOG
  const handleOpenQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);

    trackPixelEvent("ViewContent", {
      content_ids: [product.id],
      content_name: product.title,
      content_category: product.category,
      value: product.price,
      currency: "BDT"
    });
  };

  // Clean filters and redirect CTA category transitions
  const handleCtaCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const gridTitle = document.getElementById("catalog-interactive-anchor");
    if (gridTitle) {
      gridTitle.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Filter & Sort Logic Pipeline
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    
    return products.filter((prod) => {
      // Category compliance
      const matchesCategory = selectedCategory === "all" || prod.category === selectedCategory;
      
      // Keyword queries matches title, description, or tags
      const matchesQuery = 
        !query ||
        prod.title.toLowerCase().includes(query) ||
        prod.category.toLowerCase().includes(query) ||
        prod.description.toLowerCase().includes(query);

      // Price limits
      let matchesPrice = true;
      if (priceRange === "low") matchesPrice = prod.price < 3000;
      else if (priceRange === "mid") matchesPrice = prod.price >= 3000 && prod.price <= 8000;
      else if (priceRange === "high") matchesPrice = prod.price > 8000;

      return matchesCategory && matchesQuery && matchesPrice;
    }).sort((a, b) => {
      // Custom Sorters
      if (sortBy === "priceAsc") return a.price - b.price;
      if (sortBy === "priceDesc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0; // default order
    });
  }, [selectedCategory, searchQuery, priceRange, sortBy]);

  // Extract separate visual row listings for Home Page dashboard
  const trendingProducts = useMemo(() => {
    return filteredProducts.filter((p) => p.isTrending);
  }, [filteredProducts]);

  const newArrivalProducts = useMemo(() => {
    return filteredProducts.filter((p) => p.isNewArrival);
  }, [filteredProducts]);

  const activeCategoryDetail = CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900" id="applet-viewport">
      
      {/* 1. Header Navigation elements */}
      <Navbar
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenProfile={() => setIsCustomerProfileOpen(true)}
        products={products}
      />

      <main className="flex-1">
        {/* 2. Top Promotional Banner Slider */}
        <Hero onCtaClick={handleCtaCategoryClick} />

        {/* 3. Horizontal Rounded Category Badges Grid */}
        <section className="w-full bg-linear-to-b from-white to-gray-50/50 py-10 px-4 sm:px-6 lg:px-8 border-b border-gray-100" id="quick-categories-tray">
          <div className="max-w-7xl mx-auto text-center">
            <span className="text-[10px] tracking-[0.2em] uppercase font-mono font-black text-slate-400 block mb-2">
              RETAIL DEPARTMENTS
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-black text-slate-950 tracking-tight mb-8">
              Browse by Shopping Category
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      document.getElementById("catalog-interactive-anchor")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`p-5 rounded-2xl border-2 text-center flex flex-col items-center justify-center gap-3 transition-all duration-300 group cursor-pointer focus:outline-none ${isActive ? 'bg-slate-950 border-slate-950 text-white shadow-lg' : 'bg-white border-gray-150 text-gray-700 hover:border-amber-400 hover:shadow-md'}`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-slate-800' : 'bg-slate-50 group-hover:bg-amber-100 group-hover:scale-105'}`}>
                      {renderCategoryIcon(cat.icon, isActive)}
                    </div>
                    <div>
                      <p className={`text-xs font-display font-extrabold ${isActive ? 'text-white' : 'text-slate-900 group-hover:text-amber-600'}`}>
                        {cat.name}
                      </p>
                      <p className={`text-[9px] mt-0.5 line-clamp-1 leading-none ${isActive ? 'text-slate-300' : 'text-gray-400 font-medium'}`}>
                        {cat.id === "all" ? "Whole Store catalog" : `${cat.id} items`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Dynamic Flash Sale Component */}
        <FlashSale
          products={products}
          orders={orders}
          onAddToCart={handleAddToCart}
          onOrderNow={handleOrderNow}
          onOpenQuickView={handleOpenQuickView}
        />

        {/* 4. Filter Panel Box */}
        <section className="w-full bg-white pt-10 px-4 sm:px-6 lg:px-8 border-b border-gray-100" id="catalog-interactive-anchor">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 pb-4 border-b border-gray-100">
            <div className="text-left w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-amber-500 rounded-full inline-block" />
                <span className="text-xs font-mono font-bold tracking-widest text-amber-600 uppercase">
                  {selectedCategory === "all" ? "STORE GENERAL CATALOG" : `${activeCategoryDetail?.name.toUpperCase()}`}
                </span>
              </div>
              <h1 className="text-2xl font-display font-black text-slate-950 mt-1">
                {searchQuery ? `Searching for: "${searchQuery}"` : activeCategoryDetail?.name}
              </h1>
              <p className="text-xs text-gray-400 font-medium mt-1 font-sans">
                {searchQuery 
                  ? `Showing ${filteredProducts.length} results matching keywords` 
                  : `Showing authentic products curated for Bangladeshi buyers`
                }
              </p>
            </div>

            {/* Expander Drawer Tray Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={() => setIsFilterTrayExpanded(!isFilterTrayExpanded)}
                className={`px-4.5 py-2.5 rounded-xl border flex items-center gap-2.5 text-xs font-display font-bold transition-all focus:outline-none cursor-pointer ${isFilterTrayExpanded ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-800 border-gray-200 hover:bg-gray-50"}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filter & Sort Options</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isFilterTrayExpanded ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          {/* Collapsible Filters Bar */}
          {isFilterTrayExpanded && (
            <div className="max-w-7xl mx-auto py-5 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn" id="collapsible-filters-drawer">
              
              {/* Category selector */}
              <div className="space-y-2 text-left">
                <label className="block text-xs font-display font-bold text-slate-900 uppercase tracking-wide">
                  Shopping Category
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 focus:outline-none font-sans font-semibold appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Price Ranges Filter */}
              <div className="space-y-2 text-left">
                <label className="block text-xs font-display font-bold text-slate-900 uppercase tracking-wide">
                  Filter by Price BDT
                </label>
                <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-1 rounded-xl border border-gray-150">
                  {(["all", "low", "mid", "high"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setPriceRange(r)}
                      className={`py-2 px-1 text-[10px] font-display font-extrabold rounded-lg capitalize transition-colors focus:outline-none cursor-pointer ${priceRange === r ? "bg-white text-slate-900 shadow-xs" : "text-gray-500 hover:text-slate-900"}`}
                    >
                      {r === "all" && "All Prices"}
                      {r === "low" && "< 3k"}
                      {r === "mid" && "3k - 8k"}
                      {r === "high" && "> 8k"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sorter Selector */}
              <div className="space-y-2 text-left">
                <label className="block text-xs font-display font-bold text-slate-900 uppercase tracking-wide">
                  Order / Sort By
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 focus:outline-none font-sans font-semibold appearance-none cursor-pointer"
                  >
                    <option value="default">Release Date (Default)</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                    <option value="rating">Top Customer Ratings</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

            </div>
          )}
        </section>

        {/* 5. Main Catalog Layout */}
        <section className="w-full bg-white py-12 px-4 sm:px-6 lg:px-8" id="catalog-products-listings">
          <div className="max-w-7xl mx-auto">
            
            {/* SEARCH OR CUSTOM FILTER ACTIVE: Unified Single grid list */}
            {searchQuery || priceRange !== "all" || selectedCategory !== "all" ? (
              <div>
                {filteredProducts.length === 0 ? (
                  <div className="py-20 text-center" id="no-matching-results-fallback">
                    <div className="w-16 h-16 bg-slate-50 border border-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
                      <ShoppingBag className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-display font-bold text-slate-950">No Products Found</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1.5">
                      We couldn't locate any products in category "{selectedCategory}" matching your constraints. Clear filters and try again!
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                        setPriceRange("all");
                        setSortBy("default");
                      }}
                      className="mt-6 px-6 py-2.5 bg-slate-950 text-white text-xs font-display font-bold rounded-xl hover:bg-amber-400 hover:text-slate-950 transition-colors cursor-pointer focus:outline-none"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onOrderNow={handleOrderNow}
                        onOpenQuickView={handleOpenQuickView}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // DEFAULT HOMEPAGE FEED (Separated Sections)
              <div className="space-y-16">
                
                {/* A. Trending collection */}
                <div id="home-trending-section">
                  <div className="flex items-center justify-between mb-8">
                    <div className="text-left">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
                        <TrendingUp className="w-3.5 h-3.5 fill-amber-500/10" />
                        <span>Most Wanted Right Now</span>
                      </div>
                      <h2 className="text-1.5xl sm:text-2xl font-display font-black text-slate-950 mt-1">
                        Trending Products
                      </h2>
                    </div>
                    <div className="h-0.5 bg-gray-100 flex-1 mx-6 hidden sm:block" />
                    <span className="text-[10px] font-mono uppercase bg-slate-50 text-slate-500 border border-gray-150 rounded-lg py-1 px-2.5 font-medium">
                      Fast Selling
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {trendingProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onOrderNow={handleOrderNow}
                        onOpenQuickView={handleOpenQuickView}
                      />
                    ))}
                  </div>
                </div>

                {/* B. New Arrivals section */}
                <div id="home-new-arrivals-section">
                  <div className="flex items-center justify-between mb-8">
                    <div className="text-left">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-500">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Fresh Off The Factory</span>
                      </div>
                      <h2 className="text-1.5xl sm:text-2xl font-display font-black text-slate-950 mt-1">
                        New Arrivals
                      </h2>
                    </div>
                    <div className="h-0.5 bg-gray-100 flex-1 mx-6 hidden sm:block" />
                    <span className="text-[10px] font-mono uppercase bg-slate-50 text-slate-500 border border-gray-150 rounded-lg py-1 px-2.5 font-medium">
                      Fresh Batch
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {newArrivalProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onOrderNow={handleOrderNow}
                        onOpenQuickView={handleOpenQuickView}
                      />
                    ))}
                  </div>
                </div>

                {/* C. Overall Store Catalog Section (Satisfies rich grid) */}
                <div id="home-full-catalog-section">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                    <div className="text-left">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Explore Entire Inventory
                      </p>
                      <h2 className="text-1.5xl sm:text-2xl font-display font-black text-slate-950 mt-1">
                        All Curated Items
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onOrderNow={handleOrderNow}
                        onOpenQuickView={handleOpenQuickView}
                      />
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </section>

        {/* 6. Professional trust details banner */}
        <section className="bg-slate-50 py-16 px-4 border-t border-gray-200/80" id="trust-details-banner">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h3 className="text-lg sm:text-xl font-display font-black uppercase text-slate-950">
              Why Shops of Bangladesh trust us?
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">
              We pledge 100% customer protection. Each clothing weave, luxury chronograph movement, and micro-component of home electronics goes through strict manual inspection procedures in Dhaka warehouses before courier labels are printed. No fake knockoffs, no cheap clones — we sell only verified premium authenticity at realistic prices.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-700 bg-white px-3.5 py-2 border border-gray-200/60 rounded-xl font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Dhaka Hub Call Verification
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-700 bg-white px-3.5 py-2 border border-gray-200/60 rounded-xl font-semibold opacity-95">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Bangladeshi Power Plug Compliant
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-700 bg-white px-3.5 py-2 border border-gray-200/60 rounded-xl font-semibold opacity-90">
                <PhoneCall className="w-4 h-4 text-emerald-500" />
                Instant Phone Hotline support
              </span>
            </div>
          </div>
        </section>

      </main>

      {/* 7. Primary footer section */}
      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Dynamic admin workspace control system */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onUpdateProducts={(updated) => setProducts(updated)}
      />

      {/* Dynamic customer dashboard portal */}
      <CustomerProfile
        isOpen={isCustomerProfileOpen}
        onClose={() => setIsCustomerProfileOpen(false)}
        orders={orders}
        onSearchSelect={(term) => {
          setSearchQuery(term);
          const gridTitle = document.getElementById("catalog-interactive-anchor");
          if (gridTitle) {
            gridTitle.scrollIntoView({ behavior: "smooth" });
          }
        }}
      />

      {/* Floating sliding Shopping Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        initialStep={cartInitialStep}
      />

      {/* Floating detailed modal popup */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCartWithSpecs={(prod, qty, col, sz) => {
          handleAddToCartWithSpecs(prod, qty, col, sz);
          // Wait, after they add from modal details, we can trigger the sidebar opening!
          setIsDetailModalOpen(false);
          setTimeout(() => {
            setIsCartOpen(true);
          }, 150);
        }}
      />

      {/* Smooth back to top trigger */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 p-3 bg-slate-950 text-white hover:bg-amber-400 hover:text-slate-950 rounded-full transition-all cursor-pointer z-30 shadow-lg border border-slate-800"
          title="Scroll back to top"
          id="scroll-to-top-button"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Interactive Search Results Page */}
      <SearchResultsView
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        products={products}
        onAddToCart={handleAddToCart}
        onOrderNow={handleOrderNow}
        onOpenQuickView={handleOpenQuickView}
      />

    </div>
  );
}
