import { NextRequest, NextResponse } from 'next/server';
import DecentroEmulator from '@/app/lib/decentro-emulator';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('virtual_account_id');

    if (!accountId) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'virtual_account_id is required' 
        },
        { status: 400 }
      );
    }

    const emulator = DecentroEmulator.getInstance();
    const account = emulator.getVirtualAccount(accountId);

    if (!account) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Virtual account not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'Balance retrieved successfully',
      data: {
        virtual_account_id: account.id,
        account_number: account.accountNumber,
        balance: account.balance,
        currency: 'INR',
        last_updated: new Date().toISOString()
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