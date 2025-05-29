import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Handle file uploads for chat attachments
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const chatId = formData.get('chatId') as string
    const userId = formData.get('userId') as string

    if (!file || !chatId || !userId) {
      return NextResponse.json(
        { error: 'File, chat ID, and user ID are required' },
        { status: 400 }
      )
    }

    // Verify user is participant in the chat
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

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images and PDFs are allowed.' },
        { status: 400 }
      )
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `chat/${chatId}/${uuidv4()}.${fileExt}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('chat-attachments')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(fileName)

    // Return attachment data
    const attachment = {
      id: uuidv4(),
      url: publicUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadedAt: new Date().toISOString()
    }

    return NextResponse.json({ attachment })
  } catch (error) {
    console.error('Error handling file upload:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

// Delete uploaded file
export async function DELETE(request: NextRequest) {
  try {
    const { fileUrl, userId, chatId } = await request.json()

    if (!fileUrl || !userId || !chatId) {
      return NextResponse.json(
        { error: 'File URL, user ID, and chat ID are required' },
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

    // Extract file path from URL
    const urlParts = fileUrl.split('/storage/v1/object/public/chat-attachments/')
    if (urlParts.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid file URL' },
        { status: 400 }
      )
    }

    const filePath = urlParts[1]

    // Delete from storage
    const { error } = await supabase.storage
      .from('chat-attachments')
      .remove([filePath])

    if (error) {
      console.error('Error deleting file:', error)
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}