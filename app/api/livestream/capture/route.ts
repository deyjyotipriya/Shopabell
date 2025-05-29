import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { generateProductMetadata } from '@/app/lib/ai-service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      livestreamId, 
      screenshot, // Legacy field for backward compatibility
      processedImage, // New: pre-processed image from client
      thumbnail, // New: thumbnail from client
      detection, // New: product detection results from client
      metadata, // New: image metadata from client
      timestamp 
    } = body

    // Verify livestream exists and belongs to user
    const { data: livestream } = await supabase
      .from('livestreams')
      .select('*')
      .eq('id', livestreamId)
      .eq('user_id', user.id)
      .eq('status', 'live')
      .single()

    if (!livestream) {
      return NextResponse.json(
        { error: 'Livestream not found or not active' },
        { status: 404 }
      )
    }

    // Check if we have pre-processed data from client
    if (processedImage && detection) {
      // Client-side processing path - no product detected
      if (!detection.isProduct || detection.confidence < 0.7) {
        return NextResponse.json({
          productsDetected: 0,
          products: [],
          message: 'No product detected in this capture'
        })
      }
    } else if (screenshot) {
      // Legacy server-side processing path
      // This should be removed once all clients are updated
      return NextResponse.json(
        { error: 'Server-side processing is no longer supported. Please update your client.' },
        { status: 400 }
      )
    } else {
      return NextResponse.json(
        { error: 'Missing required image data' },
        { status: 400 }
      )
    }

    // Generate SEO metadata
    const seoMetadata = await generateProductMetadata(
      detection.name || `Product from livestream`,
      detection.category || 'Other',
      detection.description
    )

    // Create product entry with client-processed data
    const productToInsert = {
      seller_id: user.id,
      name: detection.name || `Product from livestream`,
      description: detection.description || '',
      images: JSON.stringify([
        processedImage, // Already processed and optimized
        thumbnail // Include thumbnail
      ]),
      category: detection.category || 'Other',
      price: detection.suggestedPrice || 0,
      stock: 1,
      status: 'active',
      source: 'livestream',
      source_metadata: JSON.stringify({
        livestreamId,
        timestamp,
        detection,
        imageMetadata: metadata,
        seoMetadata,
        processingType: 'client-side'
      }),
      tags: [...(detection.tags || []), ...(seoMetadata.hashTags || [])]
    }

    const { data: createdProduct, error: insertError } = await supabase
      .from('products')
      .insert([productToInsert])
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Update livestream stats
    const { error: updateError } = await supabase
      .from('livestreams')
      .update({
        products_captured: livestream.products_captured + 1,
      })
      .eq('id', livestreamId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      productsDetected: 1,
      product: {
        id: createdProduct.id,
        name: createdProduct.name,
        description: createdProduct.description,
        price: createdProduct.price,
        images: JSON.parse(createdProduct.images),
        category: createdProduct.category,
        confidence: detection.confidence,
        aiDetection: detection,
        processingType: 'client-side'
      },
    })
  } catch (error) {
    console.error('Failed to process capture:', error)
    return NextResponse.json(
      { error: 'Failed to process capture' },
      { status: 500 }
    )
  }
}