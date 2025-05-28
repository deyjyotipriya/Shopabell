import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Search chats and messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userType = searchParams.get('userType') // 'seller' or 'buyer'
    const query = searchParams.get('query')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userId || !userType || !query) {
      return NextResponse.json(
        { error: 'User ID, type, and search query are required' },
        { status: 400 }
      )
    }

    // Search in messages
    const messageQuery = supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        chat_id,
        chat:chats!chat_id (
          id,
          seller_id,
          buyer_id,
          product:products!product_id (
            id,
            name,
            images
          ),
          seller:sellers!seller_id (
            business_name,
            user:users!user_id (
              name
            )
          ),
          buyer:users!buyer_id (
            name,
            phone
          )
        )
      `)
      .ilike('content', `%${query}%`)
      .limit(limit)

    // Filter by user's chats
    if (userType === 'seller') {
      messageQuery.eq('chat.seller_id', userId)
    } else {
      messageQuery.eq('chat.buyer_id', userId)
    }

    const { data: messageResults, error: messageError } = await messageQuery

    if (messageError) {
      console.error('Error searching messages:', messageError)
      return NextResponse.json(
        { error: 'Failed to search messages' },
        { status: 500 }
      )
    }

    // Search in buyer names/phones (for sellers)
    let userResults: any[] = []
    if (userType === 'seller') {
      const { data: buyers } = await supabase
        .from('users')
        .select(`
          id,
          name,
          phone,
          chats!buyer_id (
            id,
            seller_id,
            created_at,
            last_message_at,
            product:products!product_id (
              id,
              name,
              images
            )
          )
        `)
        .eq('type', 'buyer')
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(limit)

      userResults = buyers?.filter(buyer => 
        buyer.chats?.some((chat: any) => chat.seller_id === userId)
      ).map(buyer => ({
        type: 'user',
        user: buyer,
        chats: buyer.chats?.filter((chat: any) => chat.seller_id === userId)
      })) || []
    }

    // Search in product names
    const { data: productChats } = await supabase
      .from('chats')
      .select(`
        id,
        created_at,
        last_message_at,
        seller_id,
        buyer_id,
        product:products!product_id (
          id,
          name,
          images
        ),
        seller:sellers!seller_id (
          business_name,
          user:users!user_id (
            name
          )
        ),
        buyer:users!buyer_id (
          name,
          phone
        )
      `)
      .eq(userType === 'seller' ? 'seller_id' : 'buyer_id', userId)
      .ilike('product.name', `%${query}%`)
      .limit(limit)

    // Combine and format results
    const results = {
      messages: messageResults?.map(msg => ({
        type: 'message',
        id: msg.id,
        content: msg.content,
        chatId: msg.chat_id,
        chat: msg.chat,
        createdAt: msg.created_at,
        highlight: highlightMatch(msg.content, query)
      })) || [],
      users: userResults,
      products: productChats?.map(chat => ({
        type: 'product',
        chatId: chat.id,
        product: chat.product,
        chat: {
          id: chat.id,
          seller: chat.seller,
          buyer: chat.buyer,
          createdAt: chat.created_at,
          lastMessageAt: chat.last_message_at
        }
      })) || []
    }

    return NextResponse.json({
      results,
      totalResults: results.messages.length + results.users.length + results.products.length,
      query
    })
  } catch (error) {
    console.error('Error searching chats:', error)
    return NextResponse.json(
      { error: 'Failed to search chats' },
      { status: 500 }
    )
  }
}

// Helper function to highlight search matches
function highlightMatch(text: string, query: string): string {
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}