'use client';

import { useState, useEffect } from 'react';
import { BiDollar, BiPackage, BiCart, BiGroup } from 'react-icons/bi';
import MetricCard from '@/app/components/dashboard/MetricCard';
import RevenueChart from '@/app/components/dashboard/RevenueChart';
import OrdersTable from '@/app/components/dashboard/OrdersTable';
import LivestreamStats from '@/app/components/dashboard/LivestreamStats';
import QuickActions from '@/app/components/dashboard/QuickActions';

interface SellerInfo {
  businessName: string;
  category: string;
  upiId: string;
  phone: string;
  storeUrl: string;
}

export default function DashboardPage() {
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);

  useEffect(() => {
    // Load seller info from localStorage
    const storedSellerInfo = localStorage.getItem('sellerInfo');
    if (storedSellerInfo) {
      try {
        setSellerInfo(JSON.parse(storedSellerInfo));
      } catch (error) {
        console.error('Error parsing seller info:', error);
      }
    }
  }, []);

  const businessName = sellerInfo?.businessName || 'Your Business';
  const firstName = businessName.split(' ')[0];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {firstName}!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with {businessName} today.</p>
        {sellerInfo && (
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
            <span>📦 {sellerInfo.category}</span>
            <span>💳 {sellerInfo.upiId}</span>
            <span>🔗 {sellerInfo.storeUrl}</span>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Revenue"
          value="₹1,25,600"
          change={18.5}
          icon={<BiDollar className="w-6 h-6" />}
        />
        <MetricCard
          title="Total Orders"
          value="342"
          change={12.8}
          icon={<BiCart className="w-6 h-6" />}
        />
        <MetricCard
          title="Active Products"
          value="48"
          change={6.2}
          icon={<BiPackage className="w-6 h-6" />}
        />
        <MetricCard
          title="Total Customers"
          value="287"
          change={15.3}
          icon={<BiGroup className="w-6 h-6" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - Spans 2 columns */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>

        {/* Recent Orders - Spans 2 columns */}
        <div className="lg:col-span-2">
          <OrdersTable />
        </div>

        {/* Livestream Stats */}
        <div>
          <LivestreamStats />
        </div>
      </div>
    </div>
  );
}