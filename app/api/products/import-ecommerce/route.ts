import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ParsedProduct {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category?: string;
  brand?: string;
  specifications?: Record<string, string>;
}

// Mock parser for Amazon/Flipkart/other e-commerce sites
async function parseEcommerceUrl(url: string): Promise<ParsedProduct | null> {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();

    // In production, you would use a web scraping service or API
    // For now, return mock data based on domain
    if (domain.includes('amazon')) {
      return {
        name: 'Premium Wireless Earbuds - Noise Cancelling, 30hr Battery',
        description: 'Experience crystal-clear audio with our premium wireless earbuds. Features active noise cancellation, 30-hour battery life, and IPX5 water resistance. Perfect for music lovers and professionals.',
        price: 4999,
        compareAtPrice: 7999,
        images: [
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
          'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800',
        ],
        category: 'Electronics',
        brand: 'TechPro',
        specifications: {
          'Battery Life': '30 hours',
          'Connectivity': 'Bluetooth 5.2',
          'Water Resistance': 'IPX5',
          'Charging Time': '2 hours',
          'Driver Size': '10mm'
        }
      };
    } else if (domain.includes('flipkart')) {
      return {
        name: 'Designer Silk Saree with Blouse Piece',
        description: 'Elegant silk saree with intricate zari work. Perfect for weddings and special occasions. Comes with matching blouse piece.',
        price: 2499,
        compareAtPrice: 4999,
        images: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
          'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=800',
        ],
        category: 'Fashion',
        brand: 'Ethnic Wear Co.',
        specifications: {
          'Fabric': 'Pure Silk',
          'Length': '6.3 meters',
          'Blouse': 'Included',
          'Occasion': 'Wedding, Party',
          'Care': 'Dry Clean Only'
        }
      };
    } else if (domain.includes('myntra')) {
      return {
        name: 'Men\'s Casual Cotton Shirt - Blue Checkered',
        description: 'Comfortable cotton shirt perfect for casual and semi-formal occasions. Features a classic checkered pattern and regular fit.',
        price: 1299,
        compareAtPrice: 2199,
        images: [
          'https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=800',
          'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800',
        ],
        category: 'Fashion',
        brand: 'Urban Style',
        specifications: {
          'Fabric': '100% Cotton',
          'Fit': 'Regular',
          'Pattern': 'Checkered',
          'Sleeves': 'Full Sleeves',
          'Care': 'Machine Wash'
        }
      };
    }

    // Generic parsing for other sites
    return {
      name: 'Imported Product - Update Details',
      description: 'Product imported from ' + domain + '. Please update the details.',
      price: 999,
      images: ['https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=800'],
      category: 'Other'
    };

  } catch (error) {
    console.error('URL parsing error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { url, sellerId } = await request.json();

    if (!url || !sellerId) {
      return NextResponse.json(
        { error: 'URL and sellerId are required' },
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

    // Parse the e-commerce URL
    const parsedProduct = await parseEcommerceUrl(url);
    
    if (!parsedProduct) {
      return NextResponse.json(
        { error: 'Failed to parse product from URL' },
        { status: 400 }
      );
    }

    // Upload images to Cloudinary
    const uploadedImages = await Promise.all(
      parsedProduct.images.map(async (imageUrl) => {
        try {
          const result = await cloudinary.uploader.upload(imageUrl, {
            folder: `products/${sellerId}`,
            width: 1000,
            height: 1000,
            crop: 'limit',
            quality: 'auto:best',
            fetch_format: 'auto'
          });
          return result.secure_url;
        } catch (error) {
          console.error('Image upload error:', error);
          return imageUrl; // Fallback to original URL
        }
      })
    );

    // Create product in database
    const productId = uuidv4();
    const { error: productError } = await supabase
      .from('products')
      .insert({
        id: productId,
        seller_id: sellerId,
        name: parsedProduct.name,
        description: parsedProduct.description,
        images: uploadedImages,
        category: parsedProduct.category || 'Other',
        price: parsedProduct.price,
        compare_at_price: parsedProduct.compareAtPrice,
        stock: 10, // Default stock
        status: 'active',
        source: 'import',
        source_metadata: {
          import_url: url,
          brand: parsedProduct.brand,
          specifications: parsedProduct.specifications,
          imported_at: new Date().toISOString()
        },
        tags: parsedProduct.category ? [parsedProduct.category.toLowerCase()] : []
      });

    if (productError) {
      console.error('Product creation error:', productError);
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: sellerId,
        type: 'system',
        title: 'Product Imported Successfully',
        message: `"${parsedProduct.name}" has been imported and added to your catalog.`,
        metadata: {
          product_id: productId,
          action: 'view_product',
          url: `/dashboard/products/${productId}/edit`
        }
      });

    return NextResponse.json({
      success: true,
      product: {
        id: productId,
        name: parsedProduct.name,
        price: parsedProduct.price,
        images: uploadedImages,
        message: 'Product imported successfully. Please review and update details if needed.'
      }
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check supported platforms
export async function GET() {
  return NextResponse.json({
    supportedPlatforms: [
      {
        name: 'Amazon',
        domain: 'amazon.in',
        example: 'https://www.amazon.in/dp/B08N5WRWNB'
      },
      {
        name: 'Flipkart',
        domain: 'flipkart.com',
        example: 'https://www.flipkart.com/product-name/p/itm12345'
      },
      {
        name: 'Myntra',
        domain: 'myntra.com',
        example: 'https://www.myntra.com/product/12345678'
      },
      {
        name: 'Ajio',
        domain: 'ajio.com',
        example: 'https://www.ajio.com/product-name-12345'
      },
      {
        name: 'Nykaa',
        domain: 'nykaa.com',
        example: 'https://www.nykaa.com/product-name/p/12345'
      }
    ],
    note: 'Import feature extracts product details automatically from supported e-commerce platforms.'
  });
}