import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = params.chatId

    // Fetch chat details with seller and product info
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select(`
        *,
        seller:sellers!seller_id (
          user_id,
          business_name,
          store_url,
          user:users!user_id (
            name,
            phone
          )
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
          status
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

    // Fetch messages for this chat
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id (
          id,
          name,
          phone,
          type
        )
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    // Transform messages to include isSellerMessage flag
    const transformedMessages = messages?.map(message => ({
      ...message,
      isSellerMessage: message.sender?.type === 'seller'
    })) || []

    return NextResponse.json({ chat, messages: transformedMessages })
  } catch (error) {
    console.error('Error fetching chat:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat' },
      { status: 500 }
    )
  }
}

// Mark messages as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = params.chatId
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Mark all unread messages in this chat as read for the user
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('chat_id', chatId)
      .neq('sender_id', userId)
      .is('read_at', null)

    if (error) {
      console.error('Error marking messages as read:', error)
      return NextResponse.json(
        { error: 'Failed to mark messages as read' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating chat:', error)
    return NextResponse.json(
      { error: 'Failed to update chat' },
      { status: 500 }
    )
  }
}