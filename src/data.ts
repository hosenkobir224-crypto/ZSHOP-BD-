import { Product, Category, Promotion } from "./types";

export const CATEGORIES: Category[] = [
  {
    id: "all",
    name: "All Categories",
    icon: "LayoutGrid",
    description: "Explore all products across categories"
  },
  {
    id: "clothing",
    name: "Clothing & Fashion",
    icon: "Shirt",
    description: "Traditional Punjabi, casual shirts, designer kurtis, and modern footwear"
  },
  {
    id: "watches",
    name: "Luxury Watches",
    icon: "Watch",
    description: "Premium quartz, automatic chronograph, and smart premium watches"
  },
  {
    id: "electronics",
    name: "Smart Electronics",
    icon: "Smartphone",
    description: "Active noise-cancelling headphones, soundbars, neckbands, and smart gadgets"
  },
  {
    id: "kitchen",
    name: "Home & Kitchen",
    icon: "ChefHat",
    description: "Smart air fryers, multi-functional blenders, and premium coffee makers"
  },
  {
    id: "sports",
    name: "Sports & Outdoors",
    icon: "Trophy",
    description: "Premium fitness trackers, durable backpacks, and athletic gear"
  }
];

export const PROMOTIONS: Promotion[] = [
  {
    id: "promo-1",
    title: "Eid-ul-Adha Special Festivity",
    subtitle: "Up to 50% Off on designer Punjabi, Kurti, and Premium Leather Watches. Live the premium authentic style.",
    badge: "Special Eid Sale 🕌",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200",
    ctaText: "Shop Festival Collection",
    bgGradient: "from-amber-600 via-orange-850 to-amber-950",
    link: "clothing"
  },
  {
    id: "promo-2",
    title: "Revolutionize Your Audio Experience",
    subtitle: "Experience authentic Acoustic Bass with state-of-the-art Noise Cancellation. Verified original brands.",
    badge: "Trending Gadgets 🎧",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=1200",
    ctaText: "Explore Audio Tech",
    bgGradient: "from-blue-600 via-indigo-900 to-slate-950",
    link: "electronics"
  }
];

export const PRODUCTS: Product[] = [
  // --- CLOTHING ---
  {
    id: "cl-punjabi-1",
    title: "Classic Cotton Punjabi",
    description: "Traditional elegant Punjabi made from authentic combed cotton fabric. Featuring signature high-density chest neckline embroidery, dynamic comfort-fit styling, and high-quality premium thread finishes.",
    price: 2950,
    originalPrice: 3599,
    discountTag: "18% OFF",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600",
    category: "clothing",
    rating: 4.7,
    reviewsCount: 95,
    isTrending: true,
    isNewArrival: true,
    inStock: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Classic White", "Royal Navy", "Emerald Green", "Crimson Maroon"]
  },
  {
    id: "cl-punjabi-2",
    title: "Silk Punjabi",
    description: "A spectacular rich traditional men's wear made from luxury silk blend yarn. Styled with subtle texture, precise button placket design, and deep premium dark navy accents. Exquisite touch for festive celebrations.",
    price: 3300,
    originalPrice: 3950,
    discountTag: "13% OFF",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600",
    category: "clothing",
    rating: 4.7,
    reviewsCount: 39,
    isTrending: true,
    isNewArrival: true,
    inStock: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Royal Navy", "Indigo Blue"]
  },
  {
    id: "cl-punjabi-3",
    title: "Classic White Punjabi",
    description: "Premium classic white Punjabi tailored with luxury blended linen and luxury threads. Features dual side vents, regular straight-fit measurements, and custom embroidery detailing.",
    price: 2950,
    originalPrice: 3599,
    discountTag: "18% OFF",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600",
    category: "clothing",
    rating: 4.7,
    reviewsCount: 95,
    isTrending: true,
    isNewArrival: false,
    inStock: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Ivory White"]
  },
  {
    id: "cl-punjabi-4",
    title: "Silk Punjabi",
    description: "Sophisticated traditional silk Punjabi featuring vibrant deep colored weaves, classic collor styling, premium luxury buttons, and dynamic fit lines.",
    price: 3750,
    originalPrice: 4350,
    discountTag: "14% OFF",
    image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=600",
    category: "clothing",
    rating: 4.7,
    reviewsCount: 109,
    isTrending: true,
    isNewArrival: false,
    inStock: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Royal Blue", "Midnight Gold"]
  },
  {
    id: "cl-1",
    title: "Men's Premium Semi-Fit Embroidered Punjabi",
    description: "Elevate your Eid and ceremonial style with our beautifully crafted semi-fit Punjabi. Made from ultra-breathable high-grade luxury cotton, featuring gorgeous high-density chest embroidery, custom logo buttons, and rich double-stitched durability perfect for the tropical elements of Bangladesh.",
    price: 3650,
    originalPrice: 4850,
    discountTag: "25% OFF",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600",
    category: "clothing",
    rating: 4.8,
    reviewsCount: 142,
    isTrending: true,
    isNewArrival: false,
    inStock: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Classic White", "Royal Navy", "Emerald Green", "Crimson Maroon"]
  },
  {
    id: "cl-2",
    title: "Premium Soft-Touch Linen Slim Fit Casual Shirt",
    description: "A timeless, ultra-soft classic crafted from organic premium Irish linen. Breathable, structured, and featuring standard spread collars and double-button barrel cuffs. Ideal for corporate casual look or an afternoon date in Dhaka.",
    price: 2450,
    originalPrice: 3200,
    discountTag: "৳750 Discount",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600",
    category: "clothing",
    rating: 4.6,
    reviewsCount: 88,
    isTrending: false,
    isNewArrival: true,
    inStock: true,
    sizes: ["M", "L", "XL"],
    colors: ["Sky Blue", "Blush Pink", "Soft Olive", "Classic Beige"]
  },
  {
    id: "cl-3",
    title: "Women's Royal Georgette Embroidered Kurti",
    description: "Stunning festive 3-piece inspired kurti featuring delicate Zari embroidery and mirror work on the neckline. Tailored with premium digital floral prints, lightweight high-grade georgette with comfortable inner cotton lining. Perfect for family events or traditional celebrations.",
    price: 4200,
    originalPrice: 5500,
    discountTag: "Top Rated",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600",
    category: "clothing",
    rating: 4.9,
    reviewsCount: 204,
    isTrending: true,
    isNewArrival: true,
    inStock: true,
    sizes: ["36", "38", "40", "42", "44"],
    colors: ["Pastel Lavender", "Cerise Pink", "Crimson Gold"]
  },
  {
    id: "cl-4",
    title: "ZSHOP Signature Men's Comfort Denim Jacket",
    description: "Premium pre-washed heavy denim jacket with dual button flap chest pockets and adjustable waist buttons. Extremely robust, with a vintage faded blue wash that pairs seamlessly with any casual wear. Handcrafted for a lifetime of street-smart fashion.",
    price: 2890,
    originalPrice: 3800,
    discountTag: "Best Value",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=600",
    category: "clothing",
    rating: 4.7,
    reviewsCount: 95,
    isTrending: false,
    isNewArrival: false,
    inStock: true,
    sizes: ["M", "L", "XL"],
    colors: ["Indigo Faded Blue", "Midnight Charcoal"]
  },

  // --- WATCHES ---
  {
    id: "wt-1",
    title: "Chrono-Elite Automatic Men's Leather Watch",
    description: "A breathtaking mechanical masterpiece with a transparent open-heart view showing the high-density Japanese movement. Wrapped in premium hand-stitched alligator pattern leather, offering genuine scratch-resistant sapphire mineral glass and water resistance up to 50m.",
    price: 12500,
    originalPrice: 16500,
    discountTag: "24% OFF",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600",
    category: "watches",
    rating: 4.9,
    reviewsCount: 67,
    isTrending: true,
    isNewArrival: true,
    inStock: true,
    colors: ["Classic Brown Leather", "Carbon Black Leather"]
  },
  {
    id: "wt-2",
    title: "Sleek Gold-Traced Minimalist Dress Watch",
    description: "Refined minimalist dress watch featuring an ultra-thin 7mm profile case with 18k yellow gold-plated steel wrapping, dual-needle Swiss quartz movement, and custom fine mesh breathable gold-coated mesh strap. Designed for modern executives who value subtle luxury.",
    price: 8800,
    originalPrice: 11000,
    discountTag: "Free Shipping",
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600",
    category: "watches",
    rating: 4.5,
    reviewsCount: 43,
    isTrending: false,
    isNewArrival: false,
    inStock: true,
    colors: ["Champagne Gold", "Rose Gold", "Sleek Silver"]
  },
  {
    id: "wt-3",
    title: "FitLife AMOLED Rugged Smart Sports Watch",
    description: "A military-grade rugged smartwatch featuring an ultra-bright always-on 1.43\" AMOLED display, dual-band multisatellite GPS, active heart-rate dynamic tracking, blood-oxygen index monitor, and more than 110 sports monitoring metrics. Outstanding 14-day standby battery designed for true resilience.",
    price: 4690,
    originalPrice: 6500,
    discountTag: "Popular",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=600",
    category: "watches",
    rating: 4.7,
    reviewsCount: 112,
    isTrending: true,
    isNewArrival: false,
    inStock: true,
    colors: ["Tactical Black", "Desert Sand", "Forest Green"]
  },

  // --- SMART ELECTRONICS ---
  {
    id: "el-1",
    title: "AeroSound Pro Hybrid ANC Wireless Headphones",
    description: "Experience absolute acoustic purity. Outfitted with high-fidelity 40mm beryllium drivers, feedback-hybrid active noise cancellation (ANC) blocks up to 45dB of exterior roar, coupled with premium slow-rebound memory foam ear cups and an industry-leading 60-hour continuous playback battery.",
    price: 6500,
    originalPrice: 8500,
    discountTag: "Sale ৳2000 Off",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
    category: "electronics",
    rating: 4.8,
    reviewsCount: 382,
    isTrending: true,
    isNewArrival: false,
    inStock: true,
    colors: ["Matte Black", "Platinum Gray", "Aurora White"]
  },
  {
    id: "el-2",
    title: "ZSound Portable IP67 Waterproof Bluetooth Speaker",
    description: "Take high-definition sound on any adventure. Equipped with dual passive radiators and 30W powerful stereo audio drivers for a heavy-thumping rich acoustic performance. Completely dustproof and waterproof with floating physical frame, offering 20 hours of non-stop poolside music.",
    price: 3800,
    originalPrice: 4800,
    discountTag: "New Launch",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=600",
    category: "electronics",
    rating: 4.6,
    reviewsCount: 52,
    isTrending: false,
    isNewArrival: true,
    inStock: true,
    colors: ["Deep Space Blue", "Military Green", "Cyberpunk Red"]
  },
  {
    id: "el-3",
    title: "VibeBand Super-Bass Bluetooth Neckband",
    description: "Premium ergonomic magnetic earbuds on a liquid silicone neckband. Powered by 12mm deep-bass composite drivers, ultra-low latency game mode, integrated AI calling noise cancellation with dual MEMS mics, and rapid fast charge (10 mins charge gives 12 hours playback).",
    price: 1850,
    originalPrice: 2500,
    discountTag: "Budget King 👑",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=600",
    category: "electronics",
    rating: 4.7,
    reviewsCount: 231,
    isTrending: true,
    isNewArrival: false,
    inStock: true,
    colors: ["Carbon Black", "Teal Blue"]
  },

  // --- HOME & KITCHEN ---
  {
    id: "kt-1",
    title: "NutriCook 5.5L Digital Visible Air Fryer",
    description: "Fry smarter, eat healthier with 85% less cooking oil. Features a fully visible transparent double-layered safety window so you can watch your food crisp up, 360-degree intelligent cyclonic convection heating, and 8 preset digital smart touch control layouts. Bangladesh electrical plug and local warranty included.",
    price: 7900,
    originalPrice: 10500,
    discountTag: "Best Home Seller",
    image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=600",
    category: "kitchen",
    rating: 4.8,
    reviewsCount: 74,
    isTrending: true,
    isNewArrival: true,
    inStock: true
  },
  {
    id: "kt-2",
    title: "BaristaPro Italian Espresso Coffee Machine",
    description: "Enjoy state-of-the-art cafe style coffee in your kitchen. High pressure 19-bar professional extraction pump, dual thermoblock rapid steam systems, dynamic commercial-grade milk micro-frothing wand, and custom precise single or double espresso touch buttons. Heavy duty stainless steel outer styling.",
    price: 14500,
    originalPrice: 19500,
    discountTag: "Exclusive Import",
    image: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&q=80&w=600",
    category: "kitchen",
    rating: 4.9,
    reviewsCount: 39,
    isTrending: false,
    isNewArrival: true,
    inStock: true
  },
  {
    id: "kt-3",
    title: "SmartShield Pro 1200W High Speed Blender",
    description: "Unleash extreme blending force with a peak 1250W multi-speed motor easily turning ice, seeds, and root ginger into flawless smooth purees in seconds. Includes two double-insulated safety travel cups and full self-cleaning dynamic cycle.",
    price: 4300,
    originalPrice: 5800,
    discountTag: "25% OFF",
    image: "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&q=80&w=600",
    category: "kitchen",
    rating: 4.6,
    reviewsCount: 61,
    isTrending: false,
    isNewArrival: false,
    inStock: false
  },

  // --- SPORTS & OUTDOORS ---
  {
    id: "sp-1",
    title: "Vanguard 40L Waterproof Tactical Backpack",
    description: "Engineered with triple-density military tactical Oxford polyester, fully waterproof coating, modular tactical loops, dual hydration water bottle side sleeves, and cushioned biomechanical airmesh shoulder straps. Excellent for heavy travels or outdoor camping across Sylhet & Bandarban.",
    price: 2950,
    originalPrice: 3900,
    discountTag: "Must-Have Travel",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600",
    category: "sports",
    rating: 4.7,
    reviewsCount: 79,
    isTrending: false,
    isNewArrival: true,
    inStock: true
  }
];
