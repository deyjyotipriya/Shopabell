import { BiDollar, BiPackage, BiCart, BiGroup } from 'react-icons/bi';
import MetricCard from '@/app/components/dashboard/MetricCard';
import RevenueChart from '@/app/components/dashboard/RevenueChart';
import OrdersTable from '@/app/components/dashboard/OrdersTable';
import LivestreamStats from '@/app/components/dashboard/LivestreamStats';
import QuickActions from '@/app/components/dashboard/QuickActions';

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, John!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your store today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Revenue"
          value="$31,200"
          change={12.5}
          icon={<BiDollar className="w-6 h-6" />}
        />
        <MetricCard
          title="Total Orders"
          value="248"
          change={8.2}
          icon={<BiCart className="w-6 h-6" />}
        />
        <MetricCard
          title="Active Products"
          value="142"
          change={-2.4}
          icon={<BiPackage className="w-6 h-6" />}
        />
        <MetricCard
          title="Total Customers"
          value="1,892"
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