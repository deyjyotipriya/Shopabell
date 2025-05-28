import { NextRequest, NextResponse } from 'next/server';
import { whatsappEmulator } from '@/app/lib/whatsapp-emulator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.webhook_url) {
      return NextResponse.json(
        { error: 'Missing required field: webhook_url' },
        { status: 400 }
      );
    }

    whatsappEmulator.setWebhookUrl(body.webhook_url);

    return NextResponse.json({
      success: true,
      webhook_url: body.webhook_url,
      message: 'Webhook URL configured successfully'
    });
  } catch (error) {
    console.error('Error configuring webhook:', error);
    return NextResponse.json(
      { error: 'Failed to configure webhook' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    description: 'Configure webhook URL for receiving WhatsApp events',
    usage: {
      method: 'POST',
      body: {
        webhook_url: 'required, URL to receive webhook events'
      }
    },
    webhook_events: [
      {
        event: 'message_status',
        description: 'Sent when message status changes (sent, delivered, read, failed)',
        payload_example: {
          object: 'whatsapp_business_account',
          entry: [{
            id: 'WABA_ID',
            changes: [{
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '15550555555',
                  phone_number_id: 'PHONE_NUMBER_ID'
                },
                statuses: [{
                  id: 'wamid.xxx',
                  status: 'delivered',
                  timestamp: '2024-01-01T00:00:00Z',
                  recipient_id: '+919876543210'
                }]
              },
              field: 'messages'
            }]
          }]
        }
      },
      {
        event: 'seller_account_created',
        description: 'Sent when a seller completes onboarding',
        payload_example: {
          object: 'seller_account',
          entry: [{
            id: 'seller_uuid',
            changes: [{
              value: {
                seller_id: 'uuid',
                phone_number: '+919876543210',
                business_name: 'My Shop',
                category: 'Fashion & Clothing',
                upi_id: 'myshop@paytm',
                language: 'en',
                created_at: '2024-01-01T00:00:00Z'
              },
              field: 'account_created'
            }]
          }]
        }
      }
    ]
  });
}