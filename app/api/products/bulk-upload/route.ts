import { NextRequest, NextResponse } from 'next/server';
import { uploadBulkImages, UploadOptions } from '@/app/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const images = formData.getAll('images') as File[];
    const optionsStr = formData.get('options') as string;
    const options: UploadOptions = optionsStr ? JSON.parse(optionsStr) : {};

    if (images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    // Upload images to Cloudinary
    const urls = await uploadBulkImages(images, options);

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';