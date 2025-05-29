import { supabase, supabaseAdmin } from './supabase'
import { v4 as uuidv4 } from 'uuid'

// User Management
export async function createUser(phone: string, name?: string, type: 'seller' | 'buyer' = 'buyer') {
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      phone,
      name,
      type,
      status: 'active'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserByPhone(phone: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getUserById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

// Seller Management
export async function createSeller(userId: string, businessData: {
  businessName: string
  category: string
  upiId: string
  phone: string
}) {
  // Generate unique store URL
  const storeUrl = businessData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '') + Date.now()
  
  // Generate virtual account
  const virtualAccount = `${process.env.VIRTUAL_ACCOUNT_PREFIX}${Date.now()}`
  
  const { data, error } = await supabaseAdmin
    .from('sellers')
    .insert({
      user_id: userId,
      business_name: businessData.businessName,
      category: businessData.category,
      upi_id: businessData.upiId,
      virtual_account: virtualAccount,
      store_url: storeUrl,
      referral_code: uuidv4().slice(0, 8).toUpperCase()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getSellerByUserId(userId: string) {
  const { data, error } = await supabase
    .from('sellers')
    .select(`
      *,
      user:users(*)
    `)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getSellerByStoreUrl(storeUrl: string) {
  const { data, error } = await supabase
    .from('sellers')
    .select(`
      *,
      user:users(*)
    `)
    .eq('store_url', storeUrl)
    .single()

  if (error) throw error
  return data
}

// Alias for getSellerByUserId for backward compatibility
export async function getSeller(userId: string) {
  return getSellerByUserId(userId)
}

export async function updateSeller(userId: string, updates: any) {
  const { data, error } = await supabaseAdmin
    .from('sellers')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateUser(userId: string, updates: any) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Product Management
export async function createProduct(sellerId: string, productData: any) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      seller_id: sellerId,
      ...productData
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getProductsBySeller(sellerId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', sellerId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      seller:sellers(
        *,
        user:users(*)
      ),
      variants:product_variants(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Order Management
export async function createOrder(orderData: {
  sellerId: string
  buyerId: string
  items: any[]
  subtotal: number
  shippingCharge: number
  totalAmount: number
  paymentMethod: string
  shippingAddress: any
}) {
  const orderNumber = 'ORD' + Date.now()
  
  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert({
      order_number: orderNumber,
      seller_id: orderData.sellerId,
      buyer_id: orderData.buyerId,
      items: orderData.items,
      subtotal: orderData.subtotal,
      shipping_charge: orderData.shippingCharge,
      total_amount: orderData.totalAmount,
      payment_method: orderData.paymentMethod,
      shipping_address: orderData.shippingAddress,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getOrderById(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      seller:sellers(
        *,
        user:users(*)
      ),
      buyer:users!buyer_id(*)
    `)
    .eq('id', orderId)
    .single()

  if (error) throw error
  return data
}

export async function getOrdersBySeller(sellerId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      buyer:users!buyer_id(*)
    `)
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Chat Management
export async function createChat(sellerId: string, buyerId: string, productId?: string) {
  const { data, error } = await supabaseAdmin
    .from('chats')
    .insert({
      seller_id: sellerId,
      buyer_id: buyerId,
      product_id: productId
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getChatMessages(chatId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:users!sender_id(*)
    `)
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function sendMessage(chatId: string, senderId: string, content: string, metadata?: any) {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_id: senderId,
      content,
      metadata,
      message_type: metadata?.type || 'text'
    })
    .select()
    .single()

  if (error) throw error
  
  // Update chat last message time
  await supabaseAdmin
    .from('chats')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', chatId)

  return data
}

// Livestream Management
export async function createLivestream(sellerId: string, title: string, platform: string) {
  const { data, error } = await supabaseAdmin
    .from('livestreams')
    .insert({
      seller_id: sellerId,
      title,
      platform,
      status: 'scheduled'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateLivestreamStatus(livestreamId: string, status: 'live' | 'ended') {
  const updates: any = { status }
  
  if (status === 'live') {
    updates.started_at = new Date().toISOString()
  } else if (status === 'ended') {
    updates.ended_at = new Date().toISOString()
  }

  const { data, error } = await supabaseAdmin
    .from('livestreams')
    .update(updates)
    .eq('id', livestreamId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Analytics
export async function getSellerAnalytics(sellerId: string) {
  // Get total orders and revenue
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .eq('seller_id', sellerId)
    .eq('payment_status', 'verified')

  if (ordersError) throw ordersError

  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0
  const totalOrders = orders?.length || 0

  // Get product count
  const { count: productCount, error: productError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', sellerId)
    .eq('status', 'active')

  if (productError) throw productError

  // Get customer count
  const uniqueCustomers = new Set(orders?.map((order: any) => order.buyer_id))
  const customerCount = uniqueCustomers.size

  return {
    totalRevenue,
    totalOrders,
    productCount: productCount || 0,
    customerCount
  }
}

// Transaction Management
export async function createTransaction(transactionData: {
  orderId: string
  transactionId: string
  paymentMethod: string
  amount: number
  status: string
  gatewayResponse?: any
}) {
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .insert({
      order_id: transactionData.orderId,
      transaction_id: transactionData.transactionId,
      payment_method: transactionData.paymentMethod,
      amount: transactionData.amount,
      status: transactionData.status,
      gateway_response: transactionData.gatewayResponse
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function verifyPayment(orderId: string, transactionId: string) {
  // Update transaction status
  await supabaseAdmin
    .from('transactions')
    .update({ 
      status: 'verified',
      verified_at: new Date().toISOString()
    })
    .eq('transaction_id', transactionId)

  // Update order payment status
  await supabaseAdmin
    .from('orders')
    .update({ 
      payment_status: 'verified',
      payment_reference: transactionId,
      status: 'confirmed'
    })
    .eq('id', orderId)
}