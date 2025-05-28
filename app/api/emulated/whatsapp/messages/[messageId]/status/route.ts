import { NextRequest, NextResponse } from 'next/server';
import { whatsappEmulator } from '@/app/lib/whatsapp-emulator';

export async function PUT(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const body = await request.json();
    
    if (!body.status) {
      return NextResponse.json(
        { error: 'Missing required field: status' },
        { status: 400 }
      );
    }

    const validStatuses = ['sent', 'delivered', 'read', 'failed'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    await whatsappEmulator.updateMessageStatus(params.messageId, body.status);

    return NextResponse.json({
      success: true,
      message_id: params.messageId,
      status: body.status,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating message status:', error);
    return NextResponse.json(
      { error: 'Failed to update message status' },
      { status: 500 }
    );
  }
}