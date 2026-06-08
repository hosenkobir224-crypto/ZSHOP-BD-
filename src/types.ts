export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountTag?: string;
  image: string;
  category: string;
  rating: number;
  reviewsCount: number;
  isTrending: boolean;
  isNewArrival: boolean;
  inStock: boolean;
  sizes?: string[];
  colors?: string[];
  merchantPhone?: string;
  merchantShopName?: string;
}

export interface CartItem {
  id: string; // unique cart item id (e.g. productId + selectedColor + selectedSize)
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  ctaText: string;
  bgGradient: string;
  link: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  image: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  district: string;
  instructions: string;
  cartItems: OrderItem[];
  deliveryFee: number;
  itemsSubtotal: number;
  total: number;
  timestamp: string;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  paymentMethod?: string;
  paymentDetails?: string;
}

