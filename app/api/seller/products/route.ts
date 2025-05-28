import { NextRequest, NextResponse } from 'next/server';
import { Product, ProductFormData } from '@/app/types/product';

// Mock database - replace with real database
let products: Product[] = [];

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would:
    // 1. Get the seller ID from the authenticated session
    // 2. Query the database for products belonging to this seller
    
    // For now, we'll return all products
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: ProductFormData = await request.json();
    
    // Validate required fields
    if (!data.name || !data.description || !data.category || data.variants.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new product
    const newProduct: Product = {
      id: Date.now().toString(),
      ...data,
      images: data.images as string[], // Assuming images are already uploaded
      variants: data.variants.map(v => ({
        ...v,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      sellerId: 'mock-seller-id' // In real app, get from session
    };

    // Save to database (mock implementation)
    products.push(newProduct);

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}