import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadOptions {
  removeBackground?: boolean;
  autoCrop?: boolean;
  enhance?: boolean;
  folder?: string;
}

export async function uploadImage(
  file: File | string,
  options: UploadOptions = {}
): Promise<string> {
  try {
    const transformations: any[] = [];

    // Background removal
    if (options.removeBackground) {
      transformations.push({ background_removal: 'cloudinary_ai' });
    }

    // Auto-crop
    if (options.autoCrop) {
      transformations.push({ 
        gravity: 'auto', 
        crop: 'auto',
        width: 1000,
        height: 1000
      });
    }

    // Enhancement
    if (options.enhance) {
      transformations.push({ 
        effect: 'improve:50',
        quality: 'auto:best'
      });
    }

    // Convert File to base64 if needed
    let uploadSource: string;
    if (file instanceof File) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      uploadSource = `data:${file.type};base64,${base64}`;
    } else {
      uploadSource = file;
    }

    const result = await cloudinary.uploader.upload(uploadSource, {
      folder: options.folder || 'products',
      transformation: transformations,
      resource_type: 'auto',
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
}

export async function uploadBulkImages(
  files: (File | string)[],
  options: UploadOptions = {}
): Promise<string[]> {
  const uploadPromises = files.map(file => uploadImage(file, options));
  return Promise.all(uploadPromises);
}

export async function processLivestreamCapture(
  videoUrl: string,
  timestamps: number[]
): Promise<string[]> {
  try {
    const capturePromises = timestamps.map(async (timestamp) => {
      const result = await cloudinary.uploader.upload(videoUrl, {
        resource_type: 'video',
        transformation: [
          { 
            start_offset: timestamp,
            duration: 0.1,
            crop: 'fill',
            width: 1000,
            height: 1000
          },
          { format: 'jpg' }
        ],
        folder: 'livestream-captures'
      });
      return result.secure_url;
    });

    return Promise.all(capturePromises);
  } catch (error) {
    console.error('Livestream processing error:', error);
    throw new Error('Failed to process livestream captures');
  }
}

export async function importFromUrl(
  url: string,
  options: UploadOptions = {}
): Promise<string> {
  return uploadImage(url, options);
}

// Alias for importFromUrl for backward compatibility  
export async function uploadFromUrl(
  url: string,
  options: UploadOptions = {}
): Promise<string> {
  return uploadImage(url, options);
}

export default cloudinary;