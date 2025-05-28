import { NextRequest, NextResponse } from 'next/server';
import DecentroEmulator from '@/app/lib/decentro-emulator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const emulator = DecentroEmulator.getInstance();

    // Validate required fields
    if (!body.amount || !body.purpose || !body.customer_id) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'amount, purpose, and customer_id are required' 
        },
        { status: 400 }
      );
    }

    // Generate payment link
    const paymentLink = await emulator.generatePaymentLink({
      amount: body.amount,
      currency: body.currency || 'INR',
      purpose: body.purpose,
      customer_id: body.customer_id,
      expires_in: body.expires_in
    });

    return NextResponse.json({
      status: 'success',
      message: 'Payment link generated successfully',
      data: {
        payment_link_id: paymentLink.id,
        amount: paymentLink.amount,
        currency: paymentLink.currency,
        purpose: paymentLink.purpose,
        upi_link: paymentLink.upiLink,
        qr_code_url: paymentLink.qrCode,
        expires_at: paymentLink.expiresAt.toISOString(),
        status: paymentLink.status,
        created_at: paymentLink.createdAt.toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}