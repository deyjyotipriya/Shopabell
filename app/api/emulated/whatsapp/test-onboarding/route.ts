import { NextRequest, NextResponse } from 'next/server';
import { whatsappEmulator } from '@/app/lib/whatsapp-emulator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phoneNumber = body.phone_number || '+919876543210';
    const webhookUrl = body.webhook_url;

    // Set webhook URL if provided
    if (webhookUrl) {
      whatsappEmulator.setWebhookUrl(webhookUrl);
    }

    // Clear any existing conversation
    whatsappEmulator.clearConversation(phoneNumber);

    // Start onboarding flow
    const welcomeMessage = await whatsappEmulator.sendMessage({
      from: '15550555555',
      to: phoneNumber,
      type: 'text',
      text: {
        body: "Welcome to Shopabell! 🛍️\n\nI'm here to help you set up your online business on WhatsApp.\n\nPlease select your preferred language:\n\n1️⃣ English\n2️⃣ हिंदी\n3️⃣ বাংলা"
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding flow initiated',
      phone_number: phoneNumber,
      first_message_id: welcomeMessage.id,
      instructions: {
        step1: 'Reply with 1, 2, or 3 to select language',
        step2: 'Enter your business name',
        step3: 'Select business category (1-6)',
        step4: 'Enter your UPI ID',
        note: 'Use the /messages endpoint to simulate user responses'
      }
    });
  } catch (error) {
    console.error('Error initiating onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to initiate onboarding' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    description: 'WhatsApp Business API Emulator - Test Onboarding',
    usage: {
      method: 'POST',
      body: {
        phone_number: 'optional, defaults to +919876543210',
        webhook_url: 'optional, URL to receive webhook events'
      }
    },
    flow: [
      '1. Welcome message with language selection',
      '2. Business name prompt',
      '3. Business category selection',
      '4. UPI ID entry',
      '5. Success message and account creation'
    ],
    test_example: {
      start_onboarding: 'POST /api/emulated/whatsapp/test-onboarding',
      simulate_user_response: 'POST /api/emulated/whatsapp/messages',
      check_conversation: 'GET /api/emulated/whatsapp/messages?phone_number=+919876543210'
    }
  });
}