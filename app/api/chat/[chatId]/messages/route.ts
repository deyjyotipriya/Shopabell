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
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const before = searchParams.get('before') // For pagination

    // Build query
    let query = supabase
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
      .order('created_at', { ascending: false })
      .limit(limit)

    if (before) {
      query = query.lt('created_at', before)
    }

    const { data: messages, error } = await query

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    // Transform and reverse messages (newest first to oldest first)
    const transformedMessages = messages?.map(message => ({
      ...message,
      isSellerMessage: message.sender?.type === 'seller'
    })).reverse() || []

    return NextResponse.json({ messages: transformedMessages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = params.chatId
    const { content, senderId, messageType = 'text', metadata = {} } = await request.json()

    // Validate required fields
    if (!content || !senderId) {
      return NextResponse.json(
        { error: 'Content and sender ID are required' },
        { status: 400 }
      )
    }

    // Verify chat exists and user is participant
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('seller_id, buyer_id')
      .eq('id', chatId)
      .single()

    if (chatError || !chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      )
    }

    // Verify sender is participant
    const { data: sender } = await supabase
      .from('users')
      .select('id, type')
      .eq('id', senderId)
      .single()

    if (!sender) {
      return NextResponse.json(
        { error: 'Invalid sender' },
        { status: 403 }
      )
    }

    const isSeller = sender.type === 'seller'
    const isValidParticipant = 
      (isSeller && chat.seller_id === senderId) ||
      (!isSeller && chat.buyer_id === senderId)

    if (!isValidParticipant) {
      return NextResponse.json(
        { error: 'Sender is not a participant in this chat' },
        { status: 403 }
      )
    }

    // Check if it's a sell command
    let processedMetadata = { ...metadata }
    if (content.toLowerCase().startsWith('/sell ')) {
      const match = content.match(/\/sell\s+(\d+(?:\.\d{2})?)/i)
      if (match) {
        processedMetadata.sellCommand = {
          amount: parseFloat(match[1]),
          pending: true
        }
      }
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        message_type: messageType,
        content,
        metadata: processedMetadata
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
      console.error('Error creating message:', messageError)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

    // Update chat's last message timestamp
    await supabase
      .from('chats')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', chatId)

    // Transform message
    const transformedMessage = {
      ...message,
      isSellerMessage: message.sender?.type === 'seller'
    }

    // Process sell command if present
    if (processedMetadata.sellCommand && isSeller) {
      // Trigger sell command processing
      const sellResponse = await fetch(
        `${request.nextUrl.origin}/api/chat/sell-command`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId,
            messageId: message.id,
            amount: processedMetadata.sellCommand.amount
          })
        }
      )

      if (sellResponse.ok) {
        const sellData = await sellResponse.json()
        transformedMessage.metadata.sellCommand = {
          ...processedMetadata.sellCommand,
          pending: false,
          checkoutUrl: sellData.checkoutUrl,
          sessionId: sellData.sessionId
        }
      }
    }

    return NextResponse.json({ message: transformedMessage })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}