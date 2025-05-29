import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { generateProductMetadata } from '@/app/lib/ai-service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ClientProcessedImage {
  processedImage: string // Base64 WebP/JPEG, <100KB
  thumbnail: string // Base64 thumbnail
  detection: {
    isProduct: boolean
    confidence: number
    category?: string
    name?: string
    description?: string
    suggestedPrice?: number
    tags?: string[]
    boundingBox?: {
      x: number
      y: number
      width: number
      height: number
    }
  }
  metadata: {
    width: number
    height: number
    size: number
    format: string
    timestamp: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      livestreamId, 
      processedImage,
      thumbnail,
      detection,
      metadata,
      timestamp 
    } = body as {
      livestreamId: string
      timestamp: string
    } & ClientProcessedImage

    // Validate required fields
    if (!livestreamId || !processedImage || !detection) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

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

    // Skip if no product detected or low confidence
    if (!detection.isProduct || detection.confidence < 0.7) {
      return NextResponse.json({
        productsDetected: 0,
        products: [],
        message: 'No product detected with sufficient confidence',
        confidence: detection.confidence
      })
    }

    // Validate image size (should be <100KB)
    if (metadata.size > 100 * 1024) {
      return NextResponse.json(
        { error: 'Processed image too large. Must be under 100KB' },
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
      name: detection.name || `Product ${Date.now()}`,
      description: detection.description || '',
      images: JSON.stringify([processedImage, thumbnail]),
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
        processingType: 'client-side-v2'
      }),
      tags: [...(detection.tags || []), ...(seoMetadata.hashTags || [])]
    }

    const { data: createdProduct, error: insertError } = await supabase
      .from('products')
      .insert([productToInsert])
      .select()
      .single()

    if (insertError) {
      console.error('Product insert error:', insertError)
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
      console.error('Livestream update error:', updateError)
    }

    // Track analytics
    await supabase
      .from('analytics_events')
      .insert({
        user_id: user.id,
        event_type: 'product_captured',
        event_data: {
          livestreamId,
          productId: createdProduct.id,
          category: detection.category,
          confidence: detection.confidence,
          processingType: 'client-side-v2',
          imageSize: metadata.size,
          imageFormat: metadata.format
        }
      })

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
        processingType: 'client-side-v2'
      },
      message: 'Product successfully added to catalog'
    })
  } catch (error) {
    console.error('Failed to process capture:', error)
    return NextResponse.json(
      { error: 'Failed to process capture' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve processed products for a livestream
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const livestreamId = searchParams.get('livestreamId')

    if (!livestreamId) {
      return NextResponse.json(
        { error: 'Missing livestreamId parameter' },
        { status: 400 }
      )
    }

    // Verify livestream belongs to user
    const { data: livestream } = await supabase
      .from('livestreams')
      .select('id')
      .eq('id', livestreamId)
      .eq('user_id', user.id)
      .single()

    if (!livestream) {
      return NextResponse.json(
        { error: 'Livestream not found' },
        { status: 404 }
      )
    }

    // Get all products from this livestream
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
      .eq('source', 'livestream')
      .contains('source_metadata', { livestreamId })
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        images: JSON.parse(product.images),
        category: product.category,
        createdAt: product.created_at,
        metadata: JSON.parse(product.source_metadata)
      })),
      total: products.length
    })
  } catch (error) {
    console.error('Failed to get products:', error)
    return NextResponse.json(
      { error: 'Failed to get products' },
      { status: 500 }
    )
  }
}