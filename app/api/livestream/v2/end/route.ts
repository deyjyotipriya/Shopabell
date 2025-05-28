import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verify JWT token
async function verifyAuth(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const sellerId = await verifyAuth(request);
    if (!sellerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { livestreamId } = await request.json();

    if (!livestreamId) {
      return NextResponse.json(
        { error: 'Livestream ID is required' },
        { status: 400 }
      );
    }

    // Get livestream details
    const { data: livestream } = await supabase
      .from('livestreams')
      .select('*')
      .eq('id', livestreamId)
      .eq('seller_id', sellerId)
      .single();

    if (!livestream) {
      return NextResponse.json(
        { error: 'Livestream not found' },
        { status: 404 }
      );
    }

    if (livestream.status !== 'live') {
      return NextResponse.json(
        { error: 'Livestream is not active' },
        { status: 400 }
      );
    }

    // Calculate duration
    const startTime = new Date(livestream.started_at);
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    // Update livestream status
    const { error: updateError } = await supabase
      .from('livestreams')
      .update({
        status: 'ended',
        ended_at: endTime.toISOString(),
        duration
      })
      .eq('id', livestreamId);

    if (updateError) {
      console.error('Livestream update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to end livestream' },
        { status: 500 }
      );
    }

    // Create event
    await supabase
      .from('events')
      .insert({
        user_id: sellerId,
        event_type: 'livestream_ended',
        event_data: {
          livestream_id: livestreamId,
          duration,
          stats: {
            products_captured: livestream.products_captured,
            orders_generated: livestream.orders_generated,
            gmv_generated: livestream.gmv_generated,
            viewer_count: livestream.viewer_count
          }
        }
      });

    // Get captured products
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price')
      .eq('seller_id', sellerId)
      .eq('source', 'livestream')
      .eq('source_metadata->>livestream_id', livestreamId);

    // Generate summary
    const summary = {
      duration: formatDuration(duration),
      stats: {
        productsCaptured: livestream.products_captured,
        ordersGenerated: livestream.orders_generated,
        revenue: livestream.gmv_generated,
        averageViewers: livestream.viewer_count,
        conversionRate: livestream.viewer_count > 0 
          ? ((livestream.orders_generated / livestream.viewer_count) * 100).toFixed(2) + '%'
          : '0%'
      },
      products: products || [],
      recommendations: generateRecommendations(livestream)
    };

    return NextResponse.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('End livestream error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

function generateRecommendations(livestream: any): string[] {
  const recommendations = [];
  
  if (livestream.duration < 1800) { // Less than 30 minutes
    recommendations.push('Try to stream for at least 30 minutes to maximize engagement');
  }
  
  if (livestream.products_captured < 5) {
    recommendations.push('Show more products during your livestream to increase sales opportunities');
  }
  
  if (livestream.orders_generated === 0) {
    recommendations.push('Engage with viewers more actively and highlight product benefits');
  }
  
  if (livestream.viewer_count < 10) {
    recommendations.push('Promote your livestream in advance on social media to attract more viewers');
  }
  
  const conversionRate = livestream.viewer_count > 0 
    ? (livestream.orders_generated / livestream.viewer_count) * 100 
    : 0;
    
  if (conversionRate < 5 && livestream.viewer_count > 10) {
    recommendations.push('Focus on demonstrating product value and creating urgency');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Great job! Keep up the excellent livestreaming performance');
  }
  
  return recommendations;
}