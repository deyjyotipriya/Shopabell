import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Server-Sent Events for real-time chat updates
export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const chatId = params.chatId
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
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

  // Create a readable stream for SSE
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
      )

      // Set up Supabase real-time subscription
      const channel = supabase
        .channel(`chat:${chatId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${chatId}`
          },
          async (payload) => {
            // Fetch complete message with sender info
            const { data: message } = await supabase
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
              .eq('id', payload.new.id)
              .single()

            if (message) {
              const event = {
                type: 'new_message',
                message: {
                  ...message,
                  isSellerMessage: message.sender?.type === 'seller'
                }
              }
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
              )
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${chatId}`
          },
          async (payload) => {
            // Handle message updates (e.g., read receipts)
            const event = {
              type: 'message_updated',
              messageId: payload.new.id,
              updates: payload.new
            }
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
            )
          }
        )
        .subscribe()

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch (error) {
          clearInterval(heartbeat)
          channel.unsubscribe()
        }
      }, 30000) // Every 30 seconds

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        channel.unsubscribe()
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}