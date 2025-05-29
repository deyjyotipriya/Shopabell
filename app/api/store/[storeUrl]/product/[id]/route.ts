import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { storeUrl: string; id: string } }
) {
  try {
    const { storeUrl, id } = params;

    // Verify the store exists
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('user_id')
      .eq('store_url', storeUrl)
      .single();

    if (sellerError || !seller) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Get product details with related data
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        product_images (
          id,
          image_url,
          alt_text,
          display_order
        ),
        product_variants (
          id,
          name,
          options,
          price,
          stock,
          sku
        )
      `)
      .eq('id', id)
      .eq('seller_id', seller.user_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get related products from the same seller
    const { data: relatedProducts } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        images,
        stock,
        product_images (
          image_url
        )
      `)
      .eq('seller_id', seller.user_id)
      .eq('category', product.category)
      .neq('id', id)
      .limit(4);

    // Track product view
    await supabase.rpc('increment_product_views', { product_id: id });

    return NextResponse.json({
      product: {
        ...product,
        images: product.product_images?.length > 0 
          ? product.product_images.sort((a: any, b: any) => a.display_order - b.display_order).map((img: any) => ({
              url: img.image_url,
              alt: img.alt_text || product.name
            }))
          : product.images?.map((url: string) => ({ url, alt: product.name })) || [],
        variants: product.product_variants || []
      },
      relatedProducts: relatedProducts?.map(p => ({
        ...p,
        images: p.product_images?.length > 0
          ? [p.product_images[0].image_url]
          : p.images || []
      })) || []
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}