import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Typing indicator endpoint
export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = params.chatId
    const { userId, isTyping } = await request.json()

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

    // Get user info
    const { data: user } = await supabase
      .from('users')
      .select('name, type')
      .eq('id', userId)
      .single()

    // Broadcast typing status via Supabase Realtime
    // This would be handled by the subscribe endpoint
    // For now, we'll just acknowledge the request
    
    // In a production app, you might want to store this in Redis
    // or use Supabase's broadcast feature
    
    return NextResponse.json({ 
      success: true,
      typing: {
        userId,
        userName: user?.name || 'User',
        userType: user?.type,
        isTyping,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error updating typing status:', error)
    return NextResponse.json(
      { error: 'Failed to update typing status' },
      { status: 500 }
    )
  }
}