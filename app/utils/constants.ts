// App Configuration
export const APP_CONFIG = {
  name: 'Shopabell',
  description: 'Your one-stop shop for all your needs',
  version: '1.0.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: 30000, // 30 seconds
  },
  support: {
    email: 'support@shopabell.com',
    phone: '+91 98765 43210',
  },
} as const;

// Authentication
export const AUTH_CONFIG = {
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
  refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  otpExpiry: 10 * 60 * 1000, // 10 minutes
  maxLoginAttempts: 5,
  lockoutDuration: 30 * 60 * 1000, // 30 minutes
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  VENDOR: 'vendor',
  CUSTOMER: 'customer',
  GUEST: 'guest',
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  FAILED: 'failed',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  UPI: 'upi',
  NET_BANKING: 'net_banking',
  WALLET: 'wallet',
  COD: 'cod',
} as const;

// Product Categories
export const PRODUCT_CATEGORIES = {
  ELECTRONICS: 'electronics',
  FASHION: 'fashion',
  HOME: 'home',
  BEAUTY: 'beauty',
  SPORTS: 'sports',
  BOOKS: 'books',
  TOYS: 'toys',
  GROCERIES: 'groceries',
  HEALTH: 'health',
  AUTOMOTIVE: 'automotive',
} as const;

// Pagination
export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
  limitOptions: [10, 20, 50, 100],
} as const;

// File Upload
export const FILE_UPLOAD = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  imageExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  documentExtensions: ['.pdf', '.doc', '.docx'],
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  USER_NOT_FOUND: 'User not found.',
  EMAIL_EXISTS: 'An account with this email already exists.',
  INVALID_OTP: 'Invalid or expired OTP.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  OUT_OF_STOCK: 'This product is out of stock.',
  CART_EMPTY: 'Your cart is empty.',
  ORDER_NOT_FOUND: 'Order not found.',
  PRODUCT_NOT_FOUND: 'Product not found.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logout successful!',
  REGISTER: 'Registration successful! Please verify your email.',
  OTP_SENT: 'OTP sent successfully!',
  OTP_VERIFIED: 'OTP verified successfully!',
  PASSWORD_RESET: 'Password reset successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  ADDRESS_ADDED: 'Address added successfully!',
  ADDRESS_UPDATED: 'Address updated successfully!',
  ADDRESS_DELETED: 'Address deleted successfully!',
  CART_UPDATED: 'Cart updated successfully!',
  ORDER_PLACED: 'Order placed successfully!',
  ORDER_CANCELLED: 'Order cancelled successfully!',
  REVIEW_SUBMITTED: 'Review submitted successfully!',
  WISHLIST_UPDATED: 'Wishlist updated successfully!',
} as const;

// Regular Expressions
export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[6-9]\d{9}$/,
  pincode: /^[1-9][0-9]{5}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  gst: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  aadhaar: /^[2-9]{1}[0-9]{11}$/,
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

// Date Formats
export const DATE_FORMATS = {
  display: 'DD MMM YYYY',
  displayWithTime: 'DD MMM YYYY, hh:mm A',
  input: 'YYYY-MM-DD',
  api: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
} as const;

// Currency
export const CURRENCY = {
  code: 'INR',
  symbol: '₹',
  locale: 'en-IN',
} as const;

// Delivery
export const DELIVERY = {
  freeDeliveryThreshold: 499,
  standardDeliveryCharge: 40,
  expressDeliveryCharge: 99,
  estimatedDays: {
    standard: '5-7 business days',
    express: '2-3 business days',
  },
} as const;

// Cart
export const CART = {
  maxQuantityPerItem: 10,
  maxItemsInCart: 50,
} as const;

// Review
export const REVIEW = {
  minRating: 1,
  maxRating: 5,
  minCommentLength: 10,
  maxCommentLength: 500,
} as const;

// Search
export const SEARCH = {
  minQueryLength: 2,
  debounceDelay: 300, // milliseconds
  maxSuggestions: 10,
} as const;

// Social Media
export const SOCIAL_MEDIA = {
  facebook: 'https://facebook.com/shopabell',
  twitter: 'https://twitter.com/shopabell',
  instagram: 'https://instagram.com/shopabell',
  youtube: 'https://youtube.com/shopabell',
  linkedin: 'https://linkedin.com/company/shopabell',
} as const;

// SEO
export const SEO = {
  defaultTitle: 'Shopabell - Your one-stop shop',
  titleTemplate: '%s | Shopabell',
  defaultDescription: 'Shop from a wide range of products at the best prices. Electronics, Fashion, Home & more.',
  defaultKeywords: ['shopping', 'online shopping', 'ecommerce', 'electronics', 'fashion', 'home'],
  defaultImage: '/images/og-image.jpg',
  twitterHandle: '@shopabell',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  cart: 'shopabell_cart',
  wishlist: 'shopabell_wishlist',
  recentlyViewed: 'shopabell_recently_viewed',
  searchHistory: 'shopabell_search_history',
  preferences: 'shopabell_preferences',
  theme: 'shopabell_theme',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  verifyOtp: '/auth/verify-otp',
  
  // User
  profile: '/user/profile',
  updateProfile: '/user/profile',
  changePassword: '/user/change-password',
  addresses: '/user/addresses',
  
  // Products
  products: '/products',
  productDetails: '/products/:id',
  categories: '/categories',
  
  // Cart
  cart: '/cart',
  addToCart: '/cart/add',
  updateCart: '/cart/update',
  removeFromCart: '/cart/remove',
  
  // Orders
  orders: '/orders',
  orderDetails: '/orders/:id',
  createOrder: '/orders/create',
  cancelOrder: '/orders/:id/cancel',
  
  // Wishlist
  wishlist: '/wishlist',
  addToWishlist: '/wishlist/add',
  removeFromWishlist: '/wishlist/remove',
  
  // Reviews
  reviews: '/reviews',
  createReview: '/reviews/create',
  
  // Search
  search: '/search',
  suggestions: '/search/suggestions',
} as const;