import { NextRequest, NextResponse } from 'next/server';
import { processLivestreamCapture } from '@/app/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, timestamps }: { 
      videoUrl: string; 
      timestamps?: number[] 
    } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(videoUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid video URL' },
        { status: 400 }
      );
    }

    // Default timestamps if not provided
    const captureTimestamps = timestamps || [10, 30, 60, 90, 120];

    // Process livestream captures
    const urls = await processLivestreamCapture(videoUrl, captureTimestamps);

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Livestream processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process livestream captures' },
      { status: 500 }
    );
  }
}