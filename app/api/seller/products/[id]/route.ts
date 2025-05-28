import { NextRequest, NextResponse } from 'next/server';
import { Product, ProductFormData } from '@/app/types/product';

// Mock database - replace with real database
declare global {
  var products: Product[];
}

if (!global.products) {
  global.products = [];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = global.products.find(p => p.id === params.id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data: ProductFormData = await request.json();
    const productIndex = global.products.findIndex(p => p.id === params.id);
    
    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update product
    const updatedProduct: Product = {
      ...global.products[productIndex],
      ...data,
      images: data.images as string[],
      variants: data.variants.map((v, index) => ({
        ...v,
        id: global.products[productIndex].variants[index]?.id || 
            `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      })),
      updatedAt: new Date()
    };

    global.products[productIndex] = updatedProduct;

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productIndex = global.products.findIndex(p => p.id === params.id);
    
    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete product
    global.products.splice(productIndex, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}