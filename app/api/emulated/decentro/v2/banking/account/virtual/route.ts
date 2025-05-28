import { NextRequest, NextResponse } from 'next/server';
import DecentroEmulator from '@/app/lib/decentro-emulator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const emulator = DecentroEmulator.getInstance();

    // Validate required fields
    if (!body.customer_id) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'customer_id is required' 
        },
        { status: 400 }
      );
    }

    // Create virtual account
    const account = await emulator.createVirtualAccount({
      customer_id: body.customer_id,
      purpose: body.purpose,
      metadata: body.metadata
    });

    // Return Decentro-like response
    return NextResponse.json({
      status: 'success',
      message: 'Virtual account created successfully',
      data: {
        virtual_account_id: account.id,
        account_number: account.accountNumber,
        ifsc_code: account.ifscCode,
        upi_id: account.upiId,
        bank_name: 'Decentro Bank',
        customer_id: body.customer_id,
        created_at: account.createdAt.toISOString()
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