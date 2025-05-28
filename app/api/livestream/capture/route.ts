import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { processLivestreamCapture, generateProductMetadata } from '@/app/lib/ai-service'
import { uploadImage } from '@/app/lib/cloudinary'

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
    const { livestreamId, screenshot, timestamp } = body

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

    // Upload screenshot to Cloudinary first
    const uploadedImageUrl = await uploadImage(screenshot, {
      folder: `livestreams/${livestreamId}`,
      enhance: true
    })

    // Process the screenshot with AI
    const processedProduct = await processLivestreamCapture(
      uploadedImageUrl,
      timestamp,
      livestreamId
    )

    if (!processedProduct) {
      return NextResponse.json({
        productsDetected: 0,
        products: [],
        message: 'No product detected in this capture'
      })
    }

    // Generate metadata for SEO
    const metadata = await generateProductMetadata(
      processedProduct.detection.name || 'Product',
      processedProduct.detection.category || 'Other',
      processedProduct.detection.description
    )

    // Create product entry
    const productToInsert = {
      seller_id: user.id,
      name: processedProduct.detection.name || `Product from livestream`,
      description: processedProduct.detection.description || '',
      images: JSON.stringify([
        processedProduct.processedImageUrl,
        ...(processedProduct.variants?.map(v => v.imageUrl) || [])
      ]),
      category: processedProduct.detection.category,
      price: processedProduct.detection.suggestedPrice || 0,
      stock: 1,
      status: 'active',
      source: 'livestream',
      source_metadata: JSON.stringify({
        livestreamId,
        timestamp,
        originalImage: processedProduct.originalImageUrl,
        detection: processedProduct.detection,
        metadata
      }),
      tags: [...(processedProduct.detection.tags || []), ...(metadata.hashTags || [])]
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
        confidence: processedProduct.detection.confidence,
        aiDetection: processedProduct.detection
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