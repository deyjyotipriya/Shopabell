import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { sellerId, productId, buyerPhone } = await request.json()

    // Validate required fields
    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      )
    }

    // Get or create buyer user
    let buyerId = null
    if (buyerPhone) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', buyerPhone)
        .eq('type', 'buyer')
        .single()

      if (existingUser) {
        buyerId = existingUser.id
      } else {
        // Create new buyer user
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            phone: buyerPhone,
            type: 'buyer',
            status: 'active'
          })
          .select('id')
          .single()

        if (userError) {
          console.error('Error creating buyer:', userError)
          return NextResponse.json(
            { error: 'Failed to create buyer account' },
            { status: 500 }
          )
        }
        buyerId = newUser.id
      }
    }

    // Check if chat already exists between buyer and seller for this product
    if (buyerId && productId) {
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('seller_id', sellerId)
        .eq('buyer_id', buyerId)
        .eq('product_id', productId)
        .eq('status', 'active')
        .single()

      if (existingChat) {
        return NextResponse.json({ 
          chatId: existingChat.id,
          isExisting: true 
        })
      }
    }

    // Create new chat session
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert({
        seller_id: sellerId,
        buyer_id: buyerId,
        product_id: productId,
        status: 'active',
        last_message_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (chatError) {
      console.error('Error creating chat:', chatError)
      return NextResponse.json(
        { error: 'Failed to create chat' },
        { status: 500 }
      )
    }

    // Send initial automated message if product is attached
    if (productId && buyerId) {
      const { data: product } = await supabase
        .from('products')
        .select('name')
        .eq('id', productId)
        .single()

      const initialMessage = {
        chat_id: chat.id,
        sender_id: buyerId,
        message_type: 'text',
        content: `Hi! I'm interested in ${product?.name || 'this product'}. Is it still available?`,
        metadata: {}
      }
      
      await supabase
        .from('messages')
        .insert(initialMessage)

      // Update last message timestamp
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chat.id)
    }

    return NextResponse.json({ 
      chatId: chat.id,
      chat,
      isExisting: false 
    })
  } catch (error) {
    console.error('Error creating chat:', error)
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    )
  }
}