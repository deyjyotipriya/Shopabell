import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import DecentroEmulator from '@/app/lib/decentro-emulator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface OnboardingData {
  phone: string;
  businessName: string;
  category: string;
  upiId: string;
  language?: string;
  referralCode?: string;
}

// Generate unique store URL from business name
function generateStoreUrl(businessName: string): string {
  const base = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `${base}${random}`;
}

// Generate referral code
function generateReferralCode(businessName: string): string {
  const prefix = businessName
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .substring(0, 3) || 'SHP';
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `${prefix}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const data: OnboardingData = await request.json();
    
    // Validate required fields
    if (!data.phone || !data.businessName || !data.category || !data.upiId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', data.phone)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this phone number' },
        { status: 409 }
      );
    }

    // Create user account
    const userId = uuidv4();
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        phone: data.phone,
        name: data.businessName,
        type: 'seller',
        status: 'active',
        language: data.language || 'en'
      });

    if (userError) {
      console.error('User creation error:', userError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create virtual account using Decentro emulator
    const decentroEmulator = DecentroEmulator.getInstance();
    const virtualAccount = await decentroEmulator.createVirtualAccount({
      customer_id: userId,
      purpose: 'seller_payments',
      metadata: {
        businessName: data.businessName,
        upiId: data.upiId
      }
    });

    // Check for referral
    let referredBy = null;
    if (data.referralCode) {
      const { data: referrer } = await supabase
        .from('sellers')
        .select('user_id')
        .eq('referral_code', data.referralCode)
        .single();
      
      if (referrer) {
        referredBy = referrer.user_id;
      }
    }

    // Create seller profile
    const storeUrl = generateStoreUrl(data.businessName);
    const referralCode = generateReferralCode(data.businessName);

    const { error: sellerError } = await supabase
      .from('sellers')
      .insert({
        user_id: userId,
        business_name: data.businessName,
        category: data.category,
        upi_id: data.upiId,
        virtual_account: virtualAccount.accountNumber,
        ifsc: virtualAccount.ifscCode,
        tier: 'free',
        onboarding_source: 'whatsapp',
        referral_code: referralCode,
        referred_by: referredBy,
        store_url: storeUrl,
        settings: {
          notifications: {
            order: true,
            payment: true,
            shipping: true
          },
          language: data.language || 'en'
        }
      });

    if (sellerError) {
      console.error('Seller creation error:', sellerError);
      // Rollback user creation
      await supabase.from('users').delete().eq('id', userId);
      return NextResponse.json(
        { error: 'Failed to create seller profile' },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId, 
        phone: data.phone, 
        type: 'seller' 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    // Create notification for successful onboarding
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'system',
        title: 'Welcome to ShopAbell!',
        message: `Your business "${data.businessName}" has been successfully onboarded. Start adding products to begin selling!`,
        metadata: {
          action: 'view_dashboard',
          url: '/dashboard'
        }
      });

    return NextResponse.json({
      success: true,
      data: {
        userId,
        token,
        seller: {
          businessName: data.businessName,
          category: data.category,
          storeUrl,
          referralCode,
          virtualAccount: {
            accountNumber: virtualAccount.accountNumber,
            ifsc: virtualAccount.ifscCode,
            upiId: `${storeUrl}${process.env.UPI_HANDLE}`
          }
        },
        urls: {
          store: `${process.env.APP_URL}/store/${storeUrl}`,
          dashboard: `${process.env.APP_URL}/dashboard`,
          appDownload: {
            android: 'https://play.google.com/store/apps/details?id=com.shopabell',
            ios: 'https://apps.apple.com/app/shopabell/id123456789'
          }
        }
      }
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check onboarding status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const phone = searchParams.get('phone');

  if (!phone) {
    return NextResponse.json(
      { error: 'Phone number is required' },
      { status: 400 }
    );
  }

  try {
    const { data: user } = await supabase
      .from('users')
      .select('id, status')
      .eq('phone', phone)
      .eq('type', 'seller')
      .single();

    if (!user) {
      return NextResponse.json({
        exists: false,
        message: 'No seller account found with this phone number'
      });
    }

    const { data: seller } = await supabase
      .from('sellers')
      .select('business_name, store_url, tier')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      exists: true,
      status: user.status,
      seller: seller ? {
        businessName: seller.business_name,
        storeUrl: seller.store_url,
        tier: seller.tier
      } : null
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}