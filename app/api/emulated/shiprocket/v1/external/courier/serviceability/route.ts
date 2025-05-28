import { NextRequest, NextResponse } from 'next/server';
import { shiprocketEmulator } from '@/app/lib/shiprocket-emulator';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token || !shiprocketEmulator.validateToken(token)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const pickup_postcode = searchParams.get('pickup_postcode');
    const delivery_postcode = searchParams.get('delivery_postcode');
    const weight = parseFloat(searchParams.get('weight') || '0.5');
    const cod = searchParams.get('cod') === '1';

    if (!pickup_postcode || !delivery_postcode) {
      return NextResponse.json(
        { message: 'pickup_postcode and delivery_postcode are required' },
        { status: 400 }
      );
    }

    const rates = shiprocketEmulator.calculateRates(
      pickup_postcode,
      delivery_postcode,
      weight,
      cod
    );

    return NextResponse.json({
      data: {
        available_courier_companies: rates.map(rate => ({
          courier_company_id: parseInt(rate.courier_company_id),
          courier_name: rate.courier_name,
          rate: rate.rate,
          cod: rate.cod ? 1 : 0,
          cod_charges: rate.cod_charges,
          min_weight: rate.min_weight,
          estimated_delivery_days: rate.estimated_delivery_days,
          etd: rate.etd,
          pickup_availability: 'All Days',
          rating: 4.5,
          air_max_weight: 100,
          surface_max_weight: 100,
          metro: ['Y', 'Y'],
          is_custom: false,
          assured_amount: 2500,
          charge_weight: weight,
          region: 'A',
          base_courier_id: null,
          id: parseInt(rate.courier_company_id),
          coverage_charges: 0,
          rto_charges: Math.round(rate.rate * 0.8),
          entry_tax: 0,
          suppression_dates: null,
          qc_courier: false,
          is_surface: false,
          pod_available: true
        }))
      },
      status: 200,
      currency: 'INR'
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}