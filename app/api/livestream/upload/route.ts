import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Maximum file size: 500MB
const MAX_FILE_SIZE = 500 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const video = formData.get('video') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!video) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      )
    }

    // Validate file size
    if (video.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 500MB limit' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!video.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a video file.' },
        { status: 400 }
      )
    }

    // Create livestream record with 'processing' status
    const { data: livestream, error: dbError } = await supabase
      .from('livestreams')
      .insert({
        user_id: user.id,
        title: title || 'Uploaded Video',
        description,
        platform: 'upload',
        status: 'processing',
        stream_url: null,
        stream_key: null,
        started_at: new Date().toISOString(),
        source_type: 'upload',
        processing_status: 'uploading'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to create livestream record' },
        { status: 500 }
      )
    }

    // Upload video to Supabase Storage
    const videoId = uuidv4()
    const fileExt = video.name.split('.').pop()
    const fileName = `${user.id}/${livestream.id}/${videoId}.${fileExt}`

    const arrayBuffer = await video.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('livestream-videos')
      .upload(fileName, buffer, {
        contentType: video.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      
      // Clean up database record
      await supabase
        .from('livestreams')
        .delete()
        .eq('id', livestream.id)

      return NextResponse.json(
        { error: 'Failed to upload video' },
        { status: 500 }
      )
    }

    // Get public URL for the uploaded video
    const { data: urlData } = supabase.storage
      .from('livestream-videos')
      .getPublicUrl(fileName)

    // Update livestream record with video URL
    const { error: updateError } = await supabase
      .from('livestreams')
      .update({
        stream_url: urlData.publicUrl,
        processing_status: 'queued',
        metadata: {
          videoFile: fileName,
          originalName: video.name,
          fileSize: video.size,
          mimeType: video.type,
          uploadedAt: new Date().toISOString()
        }
      })
      .eq('id', livestream.id)

    if (updateError) {
      console.error('Update error:', updateError)
    }

    // Queue video processing job
    // In a production environment, this would be handled by a background job queue
    // For now, we'll trigger processing asynchronously
    processVideoAsync(livestream.id, urlData.publicUrl, user.id)

    return NextResponse.json({
      id: livestream.id,
      message: 'Video uploaded successfully. Processing will begin shortly.',
      status: 'processing'
    })

  } catch (error) {
    console.error('Failed to handle video upload:', error)
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    )
  }
}

// Async function to process video in the background
async function processVideoAsync(
  livestreamId: string, 
  videoUrl: string,
  userId: string
) {
  try {
    // Update status to processing
    await supabase
      .from('livestreams')
      .update({
        processing_status: 'processing',
        metadata: {
          processingStartedAt: new Date().toISOString()
        }
      })
      .eq('id', livestreamId)

    // In a real implementation, this would:
    // 1. Extract frames from the video at regular intervals
    // 2. Process each frame through the AI detection system
    // 3. Group similar products
    // 4. Create product entries in the database
    
    // For now, we'll simulate processing with a delay
    setTimeout(async () => {
      // Simulate frame extraction and processing
      const frameCount = 10 // Simulate extracting 10 frames
      const productsDetected = Math.floor(Math.random() * 5) + 1 // Simulate 1-5 products

      // Update livestream with results
      await supabase
        .from('livestreams')
        .update({
          status: 'ended',
          processing_status: 'completed',
          ended_at: new Date().toISOString(),
          products_captured: productsDetected,
          metadata: {
            processingCompletedAt: new Date().toISOString(),
            framesProcessed: frameCount,
            productsDetected
          }
        })
        .eq('id', livestreamId)

      // Create sample products (in production, these would be real detected products)
      const products = []
      for (let i = 0; i < productsDetected; i++) {
        products.push({
          seller_id: userId,
          name: `Product ${i + 1} from video`,
          description: 'Detected product from uploaded video',
          price: Math.floor(Math.random() * 100) + 10,
          stock: 1,
          category: 'Other',
          images: JSON.stringify(['/images/product-placeholder.jpg']),
          status: 'active',
          source: 'livestream',
          source_metadata: JSON.stringify({
            livestreamId,
            frameIndex: i * 2,
            confidence: 0.85 + Math.random() * 0.15
          })
        })
      }

      if (products.length > 0) {
        await supabase
          .from('products')
          .insert(products)
      }

    }, 5000) // Simulate 5 seconds of processing

  } catch (error) {
    console.error('Video processing error:', error)
    
    // Update status to failed
    await supabase
      .from('livestreams')
      .update({
        status: 'ended',
        processing_status: 'failed',
        ended_at: new Date().toISOString(),
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          failedAt: new Date().toISOString()
        }
      })
      .eq('id', livestreamId)
  }
}