import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface StartLivestreamRequest {
  title: string;
  description?: string;
  platform: 'facebook' | 'instagram' | 'youtube';
  streamUrl?: string;
  scheduledFor?: string;
}

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

    const data: StartLivestreamRequest = await request.json();

    // Validate required fields
    if (!data.title || !data.platform) {
      return NextResponse.json(
        { error: 'Title and platform are required' },
        { status: 400 }
      );
    }

    // Check if seller has an active livestream
    const { data: activeLivestream } = await supabase
      .from('livestreams')
      .select('id')
      .eq('seller_id', sellerId)
      .eq('status', 'live')
      .single();

    if (activeLivestream) {
      return NextResponse.json(
        { error: 'You already have an active livestream' },
        { status: 409 }
      );
    }

    // Create livestream session
    const livestreamId = uuidv4();
    const { error: livestreamError } = await supabase
      .from('livestreams')
      .insert({
        id: livestreamId,
        seller_id: sellerId,
        title: data.title,
        platform: data.platform,
        stream_url: data.streamUrl,
        status: data.scheduledFor ? 'scheduled' : 'live',
        started_at: data.scheduledFor ? null : new Date().toISOString(),
        viewer_count: 0,
        products_captured: 0,
        orders_generated: 0,
        gmv_generated: 0
      });

    if (livestreamError) {
      console.error('Livestream creation error:', livestreamError);
      return NextResponse.json(
        { error: 'Failed to start livestream' },
        { status: 500 }
      );
    }

    // Create initial event
    await supabase
      .from('events')
      .insert({
        user_id: sellerId,
        event_type: 'livestream_started',
        event_data: {
          livestream_id: livestreamId,
          platform: data.platform,
          title: data.title
        }
      });

    // Generate streaming widget URL
    const widgetToken = jwt.sign(
      { 
        livestreamId,
        sellerId,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      process.env.JWT_SECRET!
    );

    return NextResponse.json({
      success: true,
      livestream: {
        id: livestreamId,
        widgetUrl: `${process.env.APP_URL}/widget/livestream?token=${widgetToken}`,
        captureInterval: 5000, // 5 seconds
        instructions: {
          step1: 'Open the widget URL in a browser',
          step2: 'Position the widget on your screen during livestream',
          step3: 'Products will be automatically captured every 5 seconds',
          step4: 'Captured products appear on your store instantly'
        }
      }
    });
  } catch (error) {
    console.error('Livestream start error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve active livestream
export async function GET(request: NextRequest) {
  try {
    const sellerId = await verifyAuth(request);
    if (!sellerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: livestream } = await supabase
      .from('livestreams')
      .select('*')
      .eq('seller_id', sellerId)
      .eq('status', 'live')
      .single();

    if (!livestream) {
      return NextResponse.json({
        active: false,
        message: 'No active livestream found'
      });
    }

    // Calculate duration
    const duration = livestream.started_at 
      ? Math.floor((Date.now() - new Date(livestream.started_at).getTime()) / 1000)
      : 0;

    return NextResponse.json({
      active: true,
      livestream: {
        id: livestream.id,
        title: livestream.title,
        platform: livestream.platform,
        status: livestream.status,
        duration,
        stats: {
          viewers: livestream.viewer_count,
          productsCaptured: livestream.products_captured,
          ordersGenerated: livestream.orders_generated,
          revenue: livestream.gmv_generated
        }
      }
    });
  } catch (error) {
    console.error('Get livestream error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}