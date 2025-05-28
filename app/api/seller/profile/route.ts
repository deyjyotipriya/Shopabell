import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, PERMISSIONS } from '@/app/lib/auth-service';
import { getSeller, updateSeller } from '@/app/lib/database';

// GET /api/seller/profile - Get seller profile
export const GET = requireAuth([PERMISSIONS.MANAGE_PRODUCTS])(
  async (request: NextRequest & { user: any }) => {
    try {
      const seller = await getSeller(request.user.id);
      
      if (!seller) {
        return NextResponse.json(
          { error: 'Seller profile not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        seller: {
          userId: seller.user_id,
          businessName: seller.business_name,
          category: seller.category,
          upiId: seller.upi_id,
          panNumber: seller.pan,
          gstNumber: seller.gst_number,
          virtualAccount: seller.virtual_account,
          ifsc: seller.ifsc,
          tier: seller.tier,
          storeUrl: seller.store_url,
          totalGmv: seller.total_gmv,
          totalOrders: seller.total_orders,
          rating: seller.rating,
          commissionRate: seller.commission_rate,
          settings: seller.settings,
          createdAt: seller.created_at,
        }
      });
    } catch (error) {
      console.error('Get seller profile error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch seller profile' },
        { status: 500 }
      );
    }
  }
);

// PUT /api/seller/profile - Update seller profile
export const PUT = requireAuth([PERMISSIONS.MANAGE_PRODUCTS])(
  async (request: NextRequest & { user: any }) => {
    try {
      const body = await request.json();
      const {
        businessName,
        category,
        upiId,
        panNumber,
        gstNumber,
        settings
      } = body;
      
      // Validate required fields
      if (!businessName || businessName.length < 3) {
        return NextResponse.json(
          { error: 'Business name must be at least 3 characters' },
          { status: 400 }
        );
      }
      
      // Update seller profile
      const updateData: any = {
        business_name: businessName,
      };
      
      if (category) updateData.category = category;
      if (upiId) updateData.upi_id = upiId;
      if (panNumber) updateData.pan = panNumber;
      if (gstNumber) updateData.gst_number = gstNumber;
      if (settings) updateData.settings = settings;
      
      const updatedSeller = await updateSeller(request.user.id, updateData);
      
      if (!updatedSeller) {
        return NextResponse.json(
          { error: 'Failed to update seller profile' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
        seller: {
          userId: updatedSeller.user_id,
          businessName: updatedSeller.business_name,
          category: updatedSeller.category,
          upiId: updatedSeller.upi_id,
          panNumber: updatedSeller.pan,
          gstNumber: updatedSeller.gst_number,
          virtualAccount: updatedSeller.virtual_account,
          ifsc: updatedSeller.ifsc,
          tier: updatedSeller.tier,
          storeUrl: updatedSeller.store_url,
          totalGmv: updatedSeller.total_gmv,
          totalOrders: updatedSeller.total_orders,
          rating: updatedSeller.rating,
          commissionRate: updatedSeller.commission_rate,
          settings: updatedSeller.settings,
          createdAt: updatedSeller.created_at,
        }
      });
    } catch (error) {
      console.error('Update seller profile error:', error);
      return NextResponse.json(
        { error: 'Failed to update seller profile' },
        { status: 500 }
      );
    }
  }
);