import { NextRequest, NextResponse } from 'next/server';
import { importFromUrl, UploadOptions } from '@/app/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const { url, options }: { url: string; options?: UploadOptions } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }

    // Import image from URL
    const uploadedUrl = await importFromUrl(url, options || {});

    return NextResponse.json({ url: uploadedUrl });
  } catch (error) {
    console.error('URL import error:', error);
    return NextResponse.json(
      { error: 'Failed to import image from URL' },
      { status: 500 }
    );
  }
}