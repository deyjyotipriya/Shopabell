import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { storeUrl: string } }
) {
  try {
    const { storeUrl } = params;

    // Get store details
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select(`
        user_id,
        business_name,
        category,
        rating,
        total_orders,
        store_url,
        users!inner(phone)
      `)
      .eq('store_url', storeUrl)
      .single();

    if (sellerError || !seller) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Get products for this seller
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', seller.user_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Products fetch error:', productsError);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Format store data
    const store = {
      id: seller.user_id,
      name: seller.business_name,
      url: seller.store_url,
      category: seller.category,
      rating: seller.rating,
      totalOrders: seller.total_orders,
      phone: (seller.users as any)?.phone,
      description: `Welcome to ${seller.business_name} - Your trusted ${seller.category} store on ShopAbell`,
      sellerId: seller.user_id
    };

    return NextResponse.json({
      store,
      products: products || []
    });
  } catch (error) {
    console.error('Store fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}