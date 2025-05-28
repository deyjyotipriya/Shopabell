import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, PERMISSIONS } from '@/app/lib/auth-service';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const GET = requireAuth([PERMISSIONS.FULL_ACCESS])(
  async (request: NextRequest & { user: any }) => {
    try {
      // Get potential fraud indicators
      const alerts = [];
      
      // 1. Check for sellers with sudden spike in orders
      const { data: sellerOrders } = await supabase
        .from('orders')
        .select('seller_id, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
        
      const ordersBySeller = new Map<string, number>();
      sellerOrders?.forEach(order => {
        ordersBySeller.set(order.seller_id, (ordersBySeller.get(order.seller_id) || 0) + 1);
      });
      
      // Flag sellers with more than 50 orders in 24 hours
      for (const [sellerId, count] of ordersBySeller.entries()) {
        if (count > 50) {
          const { data: seller } = await supabase
            .from('sellers')
            .select('business_name, created_at')
            .eq('user_id', sellerId)
            .single();
            
          if (seller) {
            alerts.push({
              id: `spike-${sellerId}`,
              type: 'ORDER_SPIKE',
              severity: 'high',
              message: `Unusual order spike: ${count} orders in 24 hours`,
              seller: {
                id: sellerId,
                name: seller.business_name,
              },
              data: {
                orderCount: count,
                timeframe: '24h',
              },
              createdAt: new Date().toISOString(),
              status: 'pending',
            });
          }
        }
      }
      
      // 2. Check for high cancellation rates
      const { data: cancellations } = await supabase
        .from('orders')
        .select('seller_id')
        .eq('status', 'cancelled')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        
      const cancellationsBySeller = new Map<string, number>();
      cancellations?.forEach(order => {
        cancellationsBySeller.set(order.seller_id, (cancellationsBySeller.get(order.seller_id) || 0) + 1);
      });
      
      // Flag sellers with more than 20% cancellation rate
      for (const [sellerId, cancelCount] of cancellationsBySeller.entries()) {
        const totalOrders = ordersBySeller.get(sellerId) || 0;
        if (totalOrders > 10 && (cancelCount / totalOrders) > 0.2) {
          const { data: seller } = await supabase
            .from('sellers')
            .select('business_name')
            .eq('user_id', sellerId)
            .single();
            
          if (seller) {
            alerts.push({
              id: `cancel-${sellerId}`,
              type: 'HIGH_CANCELLATION',
              severity: 'medium',
              message: `High cancellation rate: ${((cancelCount / totalOrders) * 100).toFixed(1)}%`,
              seller: {
                id: sellerId,
                name: seller.business_name,
              },
              data: {
                cancellations: cancelCount,
                totalOrders,
                rate: (cancelCount / totalOrders) * 100,
              },
              createdAt: new Date().toISOString(),
              status: 'pending',
            });
          }
        }
      }
      
      // 3. Check for duplicate products (potential spam)
      const { data: products } = await supabase
        .from('products')
        .select('seller_id, name')
        .eq('status', 'active');
        
      const productsBySeller = new Map<string, Set<string>>();
      products?.forEach(product => {
        if (!productsBySeller.has(product.seller_id)) {
          productsBySeller.set(product.seller_id, new Set());
        }
        productsBySeller.get(product.seller_id)?.add(product.name.toLowerCase());
      });
      
      // Flag sellers with too many similar products
      for (const [sellerId, productNames] of productsBySeller.entries()) {
        const nameArray = Array.from(productNames);
        let duplicates = 0;
        
        for (let i = 0; i < nameArray.length; i++) {
          for (let j = i + 1; j < nameArray.length; j++) {
            if (similarity(nameArray[i], nameArray[j]) > 0.9) {
              duplicates++;
            }
          }
        }
        
        if (duplicates > 10) {
          const { data: seller } = await supabase
            .from('sellers')
            .select('business_name')
            .eq('user_id', sellerId)
            .single();
            
          if (seller) {
            alerts.push({
              id: `duplicate-${sellerId}`,
              type: 'DUPLICATE_PRODUCTS',
              severity: 'low',
              message: `Potential spam: ${duplicates} similar product names detected`,
              seller: {
                id: sellerId,
                name: seller.business_name,
              },
              data: {
                duplicateCount: duplicates,
                totalProducts: productNames.size,
              },
              createdAt: new Date().toISOString(),
              status: 'pending',
            });
          }
        }
      }

      return NextResponse.json({
        alerts,
        total: alerts.length,
        success: true,
      });
    } catch (error) {
      console.error('Fraud alerts error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch fraud alerts' },
        { status: 500 }
      );
    }
  }
);

// Simple string similarity function
function similarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}