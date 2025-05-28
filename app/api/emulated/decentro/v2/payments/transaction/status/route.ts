import { NextRequest, NextResponse } from 'next/server';
import DecentroEmulator from '@/app/lib/decentro-emulator';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('transaction_id');

    if (!transactionId) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'transaction_id is required' 
        },
        { status: 400 }
      );
    }

    const emulator = DecentroEmulator.getInstance();
    const transaction = emulator.getTransactionStatus(transactionId);

    if (!transaction) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Transaction not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'Transaction status retrieved successfully',
      data: {
        transaction_id: transaction.id,
        account_id: transaction.accountId,
        amount: transaction.amount,
        transaction_status: transaction.status,
        transaction_type: transaction.type,
        payment_method: transaction.paymentMethod,
        utr_number: transaction.utrNumber,
        timestamp: transaction.timestamp.toISOString(),
        metadata: transaction.metadata
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