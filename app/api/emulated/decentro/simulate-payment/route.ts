import { NextRequest, NextResponse } from 'next/server';
import DecentroEmulator from '@/app/lib/decentro-emulator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const emulator = DecentroEmulator.getInstance();

    // Validate required fields
    if (!body.amount || !body.payment_method) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'amount and payment_method are required' 
        },
        { status: 400 }
      );
    }

    // Set webhook URL if provided
    if (body.webhook_url) {
      emulator.setWebhookUrl(body.webhook_url);
    }

    // Simulate the payment
    const transaction = await emulator.simulatePayment({
      accountId: body.account_id,
      amount: body.amount,
      paymentMethod: body.payment_method,
      linkId: body.link_id,
      metadata: body.metadata
    });

    return NextResponse.json({
      status: 'success',
      message: `Payment simulation ${transaction.status === 'success' ? 'completed successfully' : 'failed'}`,
      data: {
        transaction_id: transaction.id,
        account_id: transaction.accountId,
        amount: transaction.amount,
        status: transaction.status,
        payment_method: transaction.paymentMethod,
        utr_number: transaction.utrNumber,
        timestamp: transaction.timestamp.toISOString(),
        metadata: transaction.metadata,
        simulation_note: `Payment will be processed with a ${transaction.status === 'success' ? '5-30 second' : 'immediate'} delay`
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

// GET endpoint to check simulation capabilities
export async function GET() {
  return NextResponse.json({
    status: 'success',
    message: 'Decentro Payment Simulator',
    capabilities: {
      payment_methods: ['upi', 'bank_transfer', 'card'],
      success_rate: 0.95,
      delay_range: '5-30 seconds',
      features: [
        'Virtual account creation',
        'UPI ID generation',
        'Payment link generation',
        'Transaction status tracking',
        'Webhook notifications',
        'UTR number generation'
      ]
    }
  });
}