import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { batchProcessLivestreamCaptures, generateProductMetadata } from '@/app/lib/ai-service';
import { uploadImage } from '@/app/lib/cloudinary';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CaptureRequest {
  livestreamId: string;
  screenshot: string; // base64 encoded image
  timestamp: string;
  metadata?: {
    platform?: string;
    viewerCount?: number;
  };
}

// Verify widget token
async function verifyWidgetToken(token: string): Promise<any | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token from header or query
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 401 }
      );
    }

    const tokenData = await verifyWidgetToken(token);
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const data: CaptureRequest = await request.json();

    // Validate livestream
    if (data.livestreamId !== tokenData.livestreamId) {
      return NextResponse.json(
        { error: 'Livestream ID mismatch' },
        { status: 403 }
      );
    }

    // Check if livestream is active
    const { data: livestream } = await supabase
      .from('livestreams')
      .select('id, status, seller_id')
      .eq('id', data.livestreamId)
      .single();

    if (!livestream || livestream.status !== 'live') {
      return NextResponse.json(
        { error: 'Livestream not active' },
        { status: 400 }
      );
    }

    // Upload screenshot first
    const screenshotUrl = await uploadImage(data.screenshot, {
      folder: `livestream/${data.livestreamId}/captures`,
      enhance: true
    });

    // Process screenshot using AI
    const processedProducts = await batchProcessLivestreamCaptures(
      [{ imageUrl: screenshotUrl, timestamp: parseInt(data.timestamp) }],
      data.livestreamId
    );

    if (processedProducts.length === 0) {
      return NextResponse.json({
        captured: false,
        message: 'No products detected in screenshot'
      });
    }

    // Upload and create products
    const createdProducts = [];
    
    for (const product of processedProducts) {
      // Only process high-confidence detections
      if (product.detection.confidence < 0.7) continue;

      // Generate SEO metadata
      const metadata = await generateProductMetadata(
        product.detection.name || 'Product',
        product.detection.category || 'Other',
        product.detection.description
      );

      // Check for similar products captured recently (deduplication)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: similarProduct } = await supabase
        .from('products')
        .select('id')
        .eq('seller_id', livestream.seller_id)
        .eq('source', 'livestream')
        .ilike('name', `%${product.detection.name?.split(' ').slice(0, 3).join(' ')}%`)
        .gte('created_at', fiveMinutesAgo)
        .single();

      if (similarProduct) {
        // Update existing product with new image
        const { data: existingProduct } = await supabase
          .from('products')
          .select('images')
          .eq('id', similarProduct.id)
          .single();
          
        const existingImages = existingProduct?.images || [];
        await supabase
          .from('products')
          .update({
            images: [...existingImages, product.processedImageUrl]
          })
          .eq('id', similarProduct.id);
          
        createdProducts.push({ 
          id: similarProduct.id, 
          updated: true,
          name: product.detection.name 
        });
      } else {
        // Create new product
        const productId = uuidv4();
        const { error } = await supabase
          .from('products')
          .insert({
            id: productId,
            seller_id: livestream.seller_id,
            name: product.detection.name || 'Product from livestream',
            description: product.detection.description || `Product showcased during livestream on ${new Date().toLocaleDateString()}`,
            images: [
              product.processedImageUrl,
              ...(product.variants?.map(v => v.imageUrl) || [])
            ],
            category: product.detection.category || 'Other',
            price: product.detection.suggestedPrice || 0,
            compare_at_price: (product.detection.suggestedPrice || 0) * 1.5, // 50% markup for comparison
            stock: 50, // Default stock for livestream products
            status: 'active',
            source: 'livestream',
            source_metadata: {
              livestream_id: data.livestreamId,
              capture_timestamp: data.timestamp,
              confidence: product.detection.confidence,
              platform: data.metadata?.platform,
              detection: product.detection,
              metadata
            },
            tags: [
              'livestream',
              product.detection.category?.toLowerCase(),
              data.metadata?.platform,
              ...(product.detection.tags || []),
              ...(metadata.hashTags || [])
            ].filter(Boolean)
          });

        if (!error) {
          createdProducts.push({ 
            id: productId, 
            created: true,
            name: product.detection.name,
            price: product.detection.suggestedPrice
          });
        }
      }
    }

    // Update livestream stats
    if (createdProducts.length > 0) {
      await supabase.rpc('increment_livestream_products', {
        p_livestream_id: data.livestreamId,
        p_count: createdProducts.filter(p => p.created).length
      });
    }

    // Update viewer count if provided
    if (data.metadata?.viewerCount) {
      await supabase
        .from('livestreams')
        .update({ viewer_count: data.metadata.viewerCount })
        .eq('id', data.livestreamId);
    }

    return NextResponse.json({
      captured: true,
      products: createdProducts,
      message: `Captured ${createdProducts.length} product(s) from livestream`
    });
  } catch (error) {
    console.error('Capture error:', error);
    return NextResponse.json(
      { error: 'Failed to process capture' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve captured products for a livestream
export async function GET(request: NextRequest) {
  try {
    const livestreamId = request.nextUrl.searchParams.get('livestreamId');
    
    if (!livestreamId) {
      return NextResponse.json(
        { error: 'Livestream ID required' },
        { status: 400 }
      );
    }

    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, images, created_at')
      .eq('source', 'livestream')
      .eq('source_metadata->>livestream_id', livestreamId)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      livestreamId,
      productCount: products?.length || 0,
      products: products || []
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve products' },
      { status: 500 }
    );
  }
}