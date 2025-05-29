'use client';

import { useState, useEffect } from 'react';
import { BiDollar, BiPackage, BiCart, BiGroup, BiTrendingUp, BiTrendingDown } from 'react-icons/bi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import MetricCard from '@/app/components/dashboard/MetricCard';

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];

interface AnalyticsData {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    productCount: number;
    customerCount: number;
    conversionRate: number;
    avgOrderValue: number;
  };
  revenueData: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  categories: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/demo/seller-analytics?range=${timeRange}`);
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return <div>Error loading analytics data</div>;
  }

  const { metrics, revenueData, topProducts, categories } = analyticsData;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Track your business performance and insights</p>
        
        {/* Time Range Selector */}
        <div className="mt-4 flex gap-2">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeRange === range
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Total Revenue"
          value={`₹${metrics.totalRevenue.toLocaleString()}`}
          change={18.5}
          icon={<BiDollar className="w-6 h-6" />}
        />
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders.toString()}
          change={12.8}
          icon={<BiCart className="w-6 h-6" />}
        />
        <MetricCard
          title="Avg Order Value"
          value={`₹${metrics.avgOrderValue}`}
          change={8.3}
          icon={<BiTrendingUp className="w-6 h-6" />}
        />
        <MetricCard
          title="Active Products"
          value={metrics.productCount.toString()}
          change={6.2}
          icon={<BiPackage className="w-6 h-6" />}
        />
        <MetricCard
          title="Total Customers"
          value={metrics.customerCount.toString()}
          change={15.3}
          icon={<BiGroup className="w-6 h-6" />}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate}%`}
          change={-2.1}
          icon={<BiTrendingDown className="w-6 h-6" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`₹${value}`, name === 'revenue' ? 'Revenue' : 'Orders']} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} />
              <Line type="monotone" dataKey="orders" stroke="#ec4899" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
              >
                {categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Top Performing Products</h3>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [name === 'sales' ? `${value} units` : `₹${value}`, name === 'sales' ? 'Sales' : 'Revenue']} />
              <Legend />
              <Bar dataKey="sales" fill="#8b5cf6" />
              <Bar dataKey="revenue" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}