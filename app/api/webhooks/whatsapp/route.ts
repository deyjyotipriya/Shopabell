import { NextRequest, NextResponse } from 'next/server';
import { WebhookPayload } from '@/app/lib/whatsapp-emulator';

// Webhook verification for WhatsApp Business API
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify webhook
  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log('WHATSAPP WEBHOOK VERIFIED');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// Handle incoming webhook events
export async function POST(request: NextRequest) {
  try {
    const payload: WebhookPayload = await request.json();
    console.log('WhatsApp Webhook Received:', JSON.stringify(payload, null, 2));

    // Process each entry
    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        const value = change.value;

        // Handle status updates
        if (value.statuses) {
          for (const status of value.statuses) {
            console.log(`Message ${status.id} status: ${status.status}`);
            // Update message status in database
            // TODO: Implement database update
          }
        }

        // Handle incoming messages
        if (value.messages) {
          for (const message of value.messages) {
            console.log(`Received message from ${message.from}: ${message.text?.body}`);
            // Process incoming message
            // This would typically trigger automated responses or notifications
            // TODO: Implement message processing logic
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}