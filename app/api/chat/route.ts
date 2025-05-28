import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Get all chats for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userType = searchParams.get('userType') // 'seller' or 'buyer'
    const status = searchParams.get('status') || 'active'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId || !userType) {
      return NextResponse.json(
        { error: 'User ID and type are required' },
        { status: 400 }
      )
    }

    // Build query based on user type
    let query = supabase
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
          price,
          images
        ),
        last_message:messages (
          id,
          content,
          message_type,
          created_at,
          sender:users!sender_id (
            id,
            type
          )
        )
      `)
      .eq('status', status)
      .order('last_message_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by user type
    if (userType === 'seller') {
      query = query.eq('seller_id', userId)
    } else {
      query = query.eq('buyer_id', userId)
    }

    const { data: chats, error, count } = await query

    if (error) {
      console.error('Error fetching chats:', error)
      return NextResponse.json(
        { error: 'Failed to fetch chats' },
        { status: 500 }
      )
    }

    // Get unread counts for each chat
    const chatIds = chats?.map(chat => chat.id) || []
    const unreadCounts: Record<string, number> = {}

    if (chatIds.length > 0) {
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('chat_id')
        .in('chat_id', chatIds)
        .neq('sender_id', userId)
        .is('read_at', null)

      unreadMessages?.forEach(msg => {
        unreadCounts[msg.chat_id] = (unreadCounts[msg.chat_id] || 0) + 1
      })
    }

    // Transform chats with last message and unread count
    const transformedChats = chats?.map(chat => ({
      ...chat,
      unreadCount: unreadCounts[chat.id] || 0,
      lastMessage: chat.last_message?.[0] || null
    })) || []

    return NextResponse.json({
      chats: transformedChats,
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    )
  }
}

// Archive/Delete a chat
export async function DELETE(request: NextRequest) {
  try {
    const { chatId, userId } = await request.json()

    if (!chatId || !userId) {
      return NextResponse.json(
        { error: 'Chat ID and user ID are required' },
        { status: 400 }
      )
    }

    // Verify user is participant
    const { data: chat } = await supabase
      .from('chats')
      .select('seller_id, buyer_id')
      .eq('id', chatId)
      .single()

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      )
    }

    const isParticipant = chat.seller_id === userId || chat.buyer_id === userId
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Archive the chat instead of deleting
    const { error } = await supabase
      .from('chats')
      .update({ status: 'archived' })
      .eq('id', chatId)

    if (error) {
      console.error('Error archiving chat:', error)
      return NextResponse.json(
        { error: 'Failed to archive chat' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting chat:', error)
    return NextResponse.json(
      { error: 'Failed to delete chat' },
      { status: 500 }
    )
  }
}