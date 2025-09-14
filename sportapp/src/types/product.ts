export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory: string;
  brand: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  images: string[];
  features: string[];
  specifications: Record<string, string>;
  tags: string[];
  sizes?: string[];
  colors?: string[];
}

export interface Subcategory {
  id: string;
  name: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  subcategories: Subcategory[];
}

export interface ProductData {
  categories: Category[];
  products: Product[];
  featuredProducts: string[];
  bestSellers: string[];
  newArrivals: string[];
  saleProducts: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isLoggedIn: boolean;
}

export interface Address {
  id: string;
  type: "shipping" | "billing";
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}
