import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/lib/auth';

interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  type: 'all' | 'sellers' | 'buyers' | 'specific';
  recipients: string[];
  channel: 'whatsapp' | 'email' | 'sms' | 'push';
  scheduledAt?: string;
  sentAt?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  stats?: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
}

// Mock broadcast history
const mockBroadcasts: BroadcastMessage[] = [
  {
    id: '1',
    title: 'Holiday Sale Announcement',
    message: 'Get ready for our biggest sale of the year! 50% off on selected items.',
    type: 'all',
    recipients: [],
    channel: 'whatsapp',
    sentAt: '2024-12-15T10:00:00Z',
    status: 'sent',
    stats: {
      sent: 1234,
      delivered: 1200,
      read: 890,
      failed: 34,
    },
  },
  {
    id: '2',
    title: 'New Feature: Live Streaming',
    message: 'Exciting news! You can now host live streaming sessions to showcase your products.',
    type: 'sellers',
    recipients: [],
    channel: 'email',
    sentAt: '2024-12-10T14:30:00Z',
    status: 'sent',
    stats: {
      sent: 456,
      delivered: 450,
      read: 320,
      failed: 6,
    },
  },
];

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user || user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let broadcasts = [...mockBroadcasts];

    if (status) {
      broadcasts = broadcasts.filter(b => b.status === status);
    }

    return NextResponse.json({ 
      data: broadcasts,
      total: broadcasts.length 
    });
  } catch (error) {
    console.error('Error fetching broadcasts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch broadcasts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user || user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, message, type, recipients, channel, scheduledAt } = body;

    // Validate required fields
    if (!title || !message || !type || !channel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate channel
    const validChannels = ['whatsapp', 'email', 'sms', 'push'];
    if (!validChannels.includes(channel)) {
      return NextResponse.json(
        { error: 'Invalid channel' },
        { status: 400 }
      );
    }

    // In a real app, you would:
    // 1. Save the broadcast to database
    // 2. Queue it for sending
    // 3. Integrate with actual messaging services

    const newBroadcast: BroadcastMessage = {
      id: Date.now().toString(),
      title,
      message,
      type,
      recipients: recipients || [],
      channel,
      scheduledAt,
      status: scheduledAt ? 'scheduled' : 'sending',
    };

    // Simulate sending
    if (!scheduledAt) {
      setTimeout(() => {
        // Update status to sent
        console.log('Broadcast sent:', newBroadcast.id);
      }, 2000);
    }

    return NextResponse.json({ 
      success: true,
      data: newBroadcast,
      message: scheduledAt ? 'Broadcast scheduled successfully' : 'Broadcast is being sent'
    });
  } catch (error) {
    console.error('Error creating broadcast:', error);
    return NextResponse.json(
      { error: 'Failed to create broadcast' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user || user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const broadcastId = searchParams.get('id');

    if (!broadcastId) {
      return NextResponse.json(
        { error: 'Missing broadcast ID' },
        { status: 400 }
      );
    }

    // In a real app, you would delete from database
    return NextResponse.json({ 
      success: true, 
      message: 'Broadcast deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting broadcast:', error);
    return NextResponse.json(
      { error: 'Failed to delete broadcast' },
      { status: 500 }
    );
  }
}