import { NextRequest, NextResponse } from 'next/server';
import { whatsappEmulator } from '@/app/lib/whatsapp-emulator';

const AVAILABLE_TEMPLATES = [
  {
    name: 'order_update',
    category: 'TRANSACTIONAL',
    language: ['en', 'hi', 'bn'],
    components: [
      {
        type: 'BODY',
        text: 'Order Update: Order #{orderId} has been {status}. Track your order: {trackingLink}',
        parameters: ['orderId', 'status', 'trackingLink']
      }
    ]
  },
  {
    name: 'shipping_update',
    category: 'TRANSACTIONAL',
    language: ['en', 'hi', 'bn'],
    components: [
      {
        type: 'BODY',
        text: 'Shipping Update: Your order #{orderId} is {status}. Tracking ID: {trackingId}. Estimated Delivery: {estimatedDelivery}',
        parameters: ['orderId', 'status', 'trackingId', 'estimatedDelivery']
      }
    ]
  },
  {
    name: 'welcome_seller',
    category: 'MARKETING',
    language: ['en', 'hi', 'bn'],
    components: [
      {
        type: 'BODY',
        text: 'Welcome to Shopabell! Start selling on WhatsApp today.',
        parameters: []
      }
    ]
  }
];

export async function GET() {
  return NextResponse.json({
    templates: AVAILABLE_TEMPLATES,
    total: AVAILABLE_TEMPLATES.length
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.to || !body.template_name || !body.language) {
      return NextResponse.json(
        { error: 'Missing required fields: to, template_name, language' },
        { status: 400 }
      );
    }

    // Check if template exists
    const template = AVAILABLE_TEMPLATES.find(t => t.name === body.template_name);
    if (!template) {
      return NextResponse.json(
        { error: `Template '${body.template_name}' not found` },
        { status: 404 }
      );
    }

    // Check if language is supported
    if (!template.language.includes(body.language)) {
      return NextResponse.json(
        { error: `Language '${body.language}' not supported for this template` },
        { status: 400 }
      );
    }

    // Send template message
    const message = await whatsappEmulator.sendTemplate(
      body.to,
      body.template_name,
      body.language,
      body.parameters || {}
    );

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
    console.error('Error sending template message:', error);
    return NextResponse.json(
      { error: 'Failed to send template message' },
      { status: 500 }
    );
  }
}