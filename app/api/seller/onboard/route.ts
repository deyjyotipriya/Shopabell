import { NextRequest, NextResponse } from 'next/server';

interface OnboardSellerRequest {
  userId: string;
  businessName: string;
  category: string;
  upiId: string;
  phone: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: OnboardSellerRequest = await request.json();
    const { userId, businessName, category, upiId, phone } = body;

    console.log('Onboarding seller:', { userId, businessName, category, upiId, phone });

    // For demo - just return success with the provided data
    // In production, this would save to database
    return NextResponse.json({
      success: true,
      seller: {
        id: `seller-${userId}`,
        userId,
        businessName,
        category,
        upiId,
        phone,
        storeUrl: businessName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10) + '-store',
        isOnboarded: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

  } catch (error: any) {
    console.error('Seller onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to onboard seller' },
      { status: 500 }
    );
  }
}