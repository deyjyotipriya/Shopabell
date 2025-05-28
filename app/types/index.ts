export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  type: 'seller' | 'buyer' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Seller {
  userId: string;
  businessName: string;
  category?: string;
  upiId?: string;
  pan?: string;
  gstNumber?: string;
  virtualAccount?: string;
  ifsc: string;
  tier: 'free' | 'growth' | 'premium';
  onboardingSource: string;
  referralCode?: string;
  referredBy?: string;
  commissionRate: number;
  totalGmv: number;
  totalOrders: number;
  rating: number;
  shiprocketToken?: string;
  storeUrl?: string;
  settings: Record<string, any>;
  createdAt: Date;
}

export interface Product {
  id: string;
  sellerId?: string;
  storeId?: string;
  name: string;
  description?: string;
  images: string[];
  category?: string;
  subcategory?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock?: number;
  reservedStock?: number;
  sku?: string;
  weight?: number;
  status?: 'active' | 'paused' | 'deleted';
  source?: 'livestream' | 'upload' | 'import' | 'whatsapp';
  sourceMetadata?: Record<string, any>;
  tags?: string[];
  inStock?: boolean;
  specifications?: Record<string, string>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  attributes: Record<string, string>;
  price?: number;
  stock: number;
  sku?: string;
  createdAt: Date;
}

export interface Order {
  id: string;
  orderNumber?: string;
  storeId?: string;
  sellerId?: string;
  buyerId?: string;
  buyerEmail?: string;
  buyerName?: string;
  buyerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCharge?: number;
  shipping?: number;
  codCharge?: number;
  discount?: number;
  tax?: number;
  totalAmount?: number;
  total?: number;
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'processing' | 'verified' | 'failed' | 'refunded' | 'paid';
  paymentReference?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  awbNumber?: string;
  courierName?: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: Date;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled' | 'returned';

export interface OrderItem {
  id?: string;
  productId?: string;
  variantId?: string;
  productName?: string;
  name?: string;
  quantity: number;
  price: number;
  totalPrice?: number;
  image?: string;
}

export interface Address {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  transactionId: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  status: string;
  gatewayResponse: Record<string, any>;
  utrNumber?: string;
  payerVpa?: string;
  verifiedAt?: Date;
  createdAt: Date;
}

export interface Store {
  id: string;
  name: string;
  url?: string;
  description?: string;
  logo?: string;
  phone?: string;
  location?: string;
  sellerId?: string;
  createdAt?: string;
}

export interface Chat {
  id: string;
  sellerId?: string;
  buyerId?: string;
  storeId?: string;
  productId?: string;
  product?: Product;
  store?: Store;
  status: 'active' | 'archived';
  lastMessageAt?: Date;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId?: string;
  messageType?: 'text' | 'image' | 'product' | 'order';
  content: string;
  isSellerMessage?: boolean;
  attachments?: any[];
  metadata?: Record<string, any>;
  readAt?: Date;
  createdAt: string;
}

export interface CheckoutSession {
  id: string;
  chatId: string;
  storeId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  expiresAt?: string;
  createdAt?: string;
}

export interface Livestream {
  id: string;
  sellerId: string;
  title?: string;
  platform: 'facebook' | 'instagram' | 'youtube';
  streamUrl?: string;
  status: 'scheduled' | 'live' | 'ended';
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  viewerCount: number;
  productsCaptured: number;
  ordersGenerated: number;
  gmvGenerated: number;
  createdAt: Date;
}

export interface AdminGroup {
  id: string;
  adminId: string;
  groupName: string;
  groupId?: string;
  platform: string;
  memberCount: number;
  sellersOnboarded: number;
  totalGmv: number;
  commissionRate: number;
  totalEarnings: number;
  settings: Record<string, any>;
  createdAt: Date;
}

export interface Shipment {
  id: string;
  orderId: string;
  shipmentId: string;
  courierId?: number;
  courierName?: string;
  awbNumber?: string;
  pickupToken?: string;
  pickupScheduledDate?: Date;
  estimatedDelivery?: Date;
  actualCost: number;
  chargedCost: number;
  profit: number;
  status: string;
  trackingEvents: TrackingEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TrackingEvent {
  status: string;
  date: Date;
  location?: string;
  description: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'payment' | 'shipment' | 'system';
  title: string;
  message: string;
  metadata?: Record<string, any>;
  readAt?: Date;
  createdAt: Date;
}

export interface WhatsAppMessage {
  from: string;
  to: string;
  type: 'text' | 'image' | 'template';
  content: string;
  templateName?: string;
  templateParams?: Record<string, any>;
  mediaUrl?: string;
  messageId?: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}