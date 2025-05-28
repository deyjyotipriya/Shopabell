import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { processScreenshot } from '@/app/lib/livestream-capture'

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

    // Process the screenshot with AI
    const detectedProducts = await processScreenshot(screenshot)

    // Group similar products
    const groupedProducts = groupSimilarProducts(detectedProducts)

    // Create product entries
    const productsToInsert = groupedProducts.map(product => ({
      livestream_id: livestreamId,
      title: product.title,
      description: product.description,
      price: product.price,
      image: product.image,
      captured_at: new Date(timestamp).toISOString(),
      confidence: product.confidence,
      status: 'pending',
      ai_metadata: product.metadata,
    }))

    const { data: createdProducts, error: insertError } = await supabase
      .from('livestream_products')
      .insert(productsToInsert)
      .select()

    if (insertError) {
      throw insertError
    }

    // Update livestream stats
    const { error: updateError } = await supabase
      .from('livestreams')
      .update({
        products_captured: livestream.products_captured + createdProducts.length,
      })
      .eq('id', livestreamId)

    if (updateError) {
      throw updateError
    }

    // Update analytics
    const { data: analytics } = await supabase
      .from('livestream_analytics')
      .select('*')
      .eq('livestream_id', livestreamId)
      .single()

    if (analytics) {
      const productCaptures = analytics.product_captures || []
      productCaptures.push({
        time: new Date().toISOString(),
        count: createdProducts.length,
      })

      const { error: analyticsError } = await supabase
        .from('livestream_analytics')
        .update({
          product_captures: productCaptures,
        })
        .eq('livestream_id', livestreamId)

      if (analyticsError) {
        console.error('Failed to update analytics:', analyticsError)
      }
    }

    return NextResponse.json({
      productsDetected: createdProducts.length,
      products: createdProducts,
    })
  } catch (error) {
    console.error('Failed to process capture:', error)
    return NextResponse.json(
      { error: 'Failed to process capture' },
      { status: 500 }
    )
  }
}

function groupSimilarProducts(products: any[]) {
  // Simple grouping algorithm based on similarity
  const grouped = []
  const processed = new Set()

  for (let i = 0; i < products.length; i++) {
    if (processed.has(i)) continue

    const group = [products[i]]
    processed.add(i)

    for (let j = i + 1; j < products.length; j++) {
      if (processed.has(j)) continue

      // Check similarity based on title and price
      const similarity = calculateSimilarity(products[i], products[j])
      if (similarity > 0.8) {
        group.push(products[j])
        processed.add(j)
      }
    }

    // Merge group into single product
    const merged = mergeProducts(group)
    grouped.push(merged)
  }

  return grouped
}

function calculateSimilarity(product1: any, product2: any): number {
  // Simple similarity calculation
  const titleSimilarity = stringSimilarity(product1.title, product2.title)
  const priceSimilarity = 1 - Math.abs(product1.price - product2.price) / Math.max(product1.price, product2.price)
  
  return (titleSimilarity * 0.7 + priceSimilarity * 0.3)
}

function stringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

function mergeProducts(products: any[]) {
  // Take the product with highest confidence
  const best = products.reduce((prev, current) => 
    prev.confidence > current.confidence ? prev : current
  )
  
  // Average the confidence scores
  const avgConfidence = products.reduce((sum, p) => sum + p.confidence, 0) / products.length
  
  return {
    ...best,
    confidence: avgConfidence,
    metadata: {
      ...best.metadata,
      mergedCount: products.length,
      allProducts: products,
    },
  }
}