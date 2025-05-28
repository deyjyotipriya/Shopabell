import { NextRequest, NextResponse } from 'next/server';
import DecentroEmulator from '@/app/lib/decentro-emulator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.utr_number) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'utr_number is required' 
        },
        { status: 400 }
      );
    }

    const emulator = DecentroEmulator.getInstance();
    const transaction = await emulator.verifyUpiPayment(body.utr_number);

    if (!transaction) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Transaction not found or not a UPI payment' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'UPI payment verified successfully',
      data: {
        transaction_id: transaction.id,
        utr_number: transaction.utrNumber,
        amount: transaction.amount,
        status: transaction.status,
        payment_method: transaction.paymentMethod,
        timestamp: transaction.timestamp.toISOString(),
        account_id: transaction.accountId,
        verified: true
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