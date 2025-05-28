import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { chatId, messageId, amount } = await request.json()

    // Validate inputs
    if (!chatId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      )
    }

    // Get chat details with product and seller info
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select(`
        *,
        seller:sellers!seller_id (
          user_id,
          business_name,
          upi_id,
          virtual_account,
          ifsc
        ),
        buyer:users!buyer_id (
          id,
          name,
          phone
        ),
        product:products!product_id (
          id,
          name,
          description,
          price,
          images,
          stock,
          weight,
          sku
        )
      `)
      .eq('id', chatId)
      .single()

    if (chatError || !chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      )
    }

    if (!chat.product) {
      return NextResponse.json(
        { error: 'No product associated with this chat' },
        { status: 400 }
      )
    }

    // Check product availability
    if (chat.product.stock <= 0) {
      return NextResponse.json(
        { error: 'Product is out of stock' },
        { status: 400 }
      )
    }

    // Calculate totals
    const subtotal = amount
    const shippingCharge = 60.00 // Default shipping
    const codCharge = 0 // Will be added if COD is selected
    const tax = 0 // Simplified for now
    const total = subtotal + shippingCharge + codCharge + tax

    // Create checkout session
    const sessionId = uuidv4()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store checkout session in a temporary table or cache
    // For now, we'll encode it in the URL
    const checkoutData = {
      sessionId,
      chatId,
      sellerId: chat.seller_id,
      buyerId: chat.buyer_id,
      items: [{
        productId: chat.product.id,
        name: chat.product.name,
        price: amount,
        quantity: 1,
        image: chat.product.images?.[0] || '',
        sku: chat.product.sku || '',
        weight: chat.product.weight || 0.5
      }],
      subtotal,
      shippingCharge,
      codCharge,
      tax,
      total,
      sellerUpiId: chat.seller?.upi_id,
      sellerVirtualAccount: chat.seller?.virtual_account,
      sellerIfsc: chat.seller?.ifsc,
      expiresAt: expiresAt.toISOString()
    }

    // Create a secure token for the checkout session
    const checkoutToken = Buffer.from(JSON.stringify(checkoutData)).toString('base64')
    const checkoutUrl = `/checkout?session=${sessionId}&token=${checkoutToken}`

    // Create system message with checkout link
    const { data: systemMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: chat.seller_id,
        message_type: 'text',
        content: `Great! I've created a checkout link for ₹${amount.toFixed(2)}. Click below to complete your purchase:`,
        metadata: {
          type: 'checkout',
          checkoutUrl,
          sessionId,
          amount: amount.toFixed(2),
          expiresAt: expiresAt.toISOString()
        }
      })
      .select(`
        *,
        sender:users!sender_id (
          id,
          name,
          phone,
          type
        )
      `)
      .single()

    if (messageError) {
      console.error('Error creating checkout message:', messageError)
      return NextResponse.json(
        { error: 'Failed to create checkout message' },
        { status: 500 }
      )
    }

    // Update the original message to mark sell command as processed
    if (messageId) {
      await supabase
        .from('messages')
        .update({
          metadata: {
            sellCommand: {
              amount,
              pending: false,
              checkoutUrl,
              sessionId
            }
          }
        })
        .eq('id', messageId)
    }

    // Update chat's last message timestamp
    await supabase
      .from('chats')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', chatId)

    return NextResponse.json({ 
      checkoutUrl,
      sessionId,
      message: {
        ...systemMessage,
        isSellerMessage: true
      }
    })
  } catch (error) {
    console.error('Error processing sell command:', error)
    return NextResponse.json(
      { error: 'Failed to process sell command' },
      { status: 500 }
    )
  }
}