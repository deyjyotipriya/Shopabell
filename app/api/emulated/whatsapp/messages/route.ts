import { NextRequest, NextResponse } from 'next/server';
import { whatsappEmulator } from '@/app/lib/whatsapp-emulator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.to || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: to, type' },
        { status: 400 }
      );
    }

    // Send message
    const message = await whatsappEmulator.sendMessage({
      from: body.from || '15550555555',
      to: body.to,
      type: body.type,
      text: body.text,
      template: body.template,
      interactive: body.interactive
    });

    // WhatsApp API response format
    return NextResponse.json({
      messaging_product: 'whatsapp',
      contacts: [{
        input: body.to,
        wa_id: body.to.replace('+', '')
      }],
      messages: [{
        id: message.id
      }]
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const phoneNumber = searchParams.get('phone_number');
  
  if (!phoneNumber) {
    return NextResponse.json(
      { error: 'Missing phone_number parameter' },
      { status: 400 }
    );
  }

  const messages = whatsappEmulator.getMessages(phoneNumber);
  const state = whatsappEmulator.getConversationState(phoneNumber);

  return NextResponse.json({
    messages,
    conversation_state: state,
    total_messages: messages.length
  });
}