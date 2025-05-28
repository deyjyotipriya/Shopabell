import { NextRequest, NextResponse } from 'next/server';

// Test endpoint to demonstrate the Decentro emulator
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  return NextResponse.json({
    status: 'success',
    message: 'Decentro Emulator Test Endpoints',
    endpoints: {
      createVirtualAccount: {
        method: 'POST',
        url: `${baseUrl}/api/emulated/decentro/v2/banking/account/virtual`,
        body: {
          customer_id: 'CUST123',
          purpose: 'Order Payment',
          metadata: { order_id: 'ORD456' }
        }
      },
      checkBalance: {
        method: 'GET',
        url: `${baseUrl}/api/emulated/decentro/v2/banking/account/virtual/balance?virtual_account_id={account_id}`
      },
      generateUpiLink: {
        method: 'POST',
        url: `${baseUrl}/api/emulated/decentro/v2/payments/upi/link`,
        body: {
          amount: 1000,
          currency: 'INR',
          purpose: 'Product Purchase',
          customer_id: 'CUST123',
          expires_in: 30
        }
      },
      checkTransactionStatus: {
        method: 'GET',
        url: `${baseUrl}/api/emulated/decentro/v2/payments/transaction/status?transaction_id={transaction_id}`
      },
      verifyUpiPayment: {
        method: 'POST',
        url: `${baseUrl}/api/emulated/decentro/v2/payments/upi/verify`,
        body: {
          utr_number: 'DEC20240115123456'
        }
      },
      simulatePayment: {
        method: 'POST',
        url: `${baseUrl}/api/emulated/decentro/simulate-payment`,
        body: {
          account_id: '{virtual_account_id}',
          amount: 1000,
          payment_method: 'upi',
          webhook_url: `${baseUrl}/api/webhooks/decentro`,
          metadata: { order_id: 'ORD456' }
        }
      }
    },
    webhookEndpoint: `${baseUrl}/api/webhooks/decentro`,
    notes: [
      'Virtual accounts are created with realistic Indian bank account numbers',
      'UPI IDs are generated in format: customerId1234@decentro',
      'Payment simulation has 95% success rate',
      'Payment processing delay: 5-30 seconds',
      'UTR numbers follow format: DEC + date + random number',
      'Webhooks are sent for successful payments'
    ]
  });
}