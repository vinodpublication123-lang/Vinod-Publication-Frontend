export type EntityStatus = "Active" | "Inactive" | "Draft" | "Published" | "Archived";

export type ProductStatus = "Active" | "Low Stock" | "Out of Stock" | "Draft" | "Archived";

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Completed"
  | "Cancelled";

export type InquiryStatus = "New" | "Read" | "Replied" | "Archived";

export interface Address {
  fullName: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
}

export interface SubVariant {
  id: string;
  name: string;
  stock: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  stock: number;
  subVariants?: SubVariant[];
}

export interface ProductVariantGroup {
  id: string;
  name: string;
  options: ProductVariant[];
}

export interface Product {
  id: string;
  name: string;
  category: "Merchandise" | "Apparel" | "Accessories";
  price: string;
  stock: number;
  status: ProductStatus;
  date: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  date: string;
  qrStatus: "Enabled" | "Disabled";
}

export interface Author {
  id: string;
  photo: string;
  name: string;
  booksPublished: number;
  status: "Active" | "Inactive";
  date: string;
}

export interface OrderItem {
  name: string;
  quantity?: number;
  variantLabel?: string;
  price?: string;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  amount: string;
  date: string;
  status: OrderStatus;
  tracking: string;
}

export interface AccountOrder {
  id: string;
  date: string;
  total: string;
  status: OrderStatus;
  products: string[];
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  date: string;
  status: InquiryStatus;
}

export interface TrackingInfo {
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  supportPhone?: string;
  currency: "INR" | "USD";
  defaultDeliveryCharge: number;
  freeShippingThreshold: number;
}
