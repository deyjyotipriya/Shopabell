'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShoppingBag,
  Activity,
  AlertCircle,
  Globe,
  Zap
} from 'lucide-react';
import { formatCurrency } from '@/app/utils/format';

export default function PlatformOverview() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalSellers: 0,
    activeSellers: 0,
    totalRevenue: 0,
    totalCommission: 0,
    totalOrders: 0,
    conversionRate: 0,
    weeklyRevenue: 0,
    pendingPayouts: 0,
    pendingDisputes: 0,
  });
  
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any[]>([]);

  useEffect(() => {
    fetchPlatformData();
    const interval = setInterval(fetchPlatformData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchPlatformData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/master/metrics');
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.metrics);
        
        // Generate chart data (mock for now)
        setChartData(generateChartData());
        setCategoryData(generateCategoryData());
        setGeoData(generateGeoData());
      }
    } catch (error) {
      console.error('Failed to fetch platform data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = () => {
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.floor(50000 + Math.random() * 100000),
        orders: Math.floor(100 + Math.random() * 200),
        sellers: Math.floor(20 + Math.random() * 50),
      });
    }
    return data;
  };

  const generateCategoryData = () => [
    { name: 'Fashion', value: 35, color: '#8b5cf6' },
    { name: 'Beauty', value: 25, color: '#ec4899' },
    { name: 'Electronics', value: 20, color: '#3b82f6' },
    { name: 'Home', value: 15, color: '#10b981' },
    { name: 'Others', value: 5, color: '#f59e0b' },
  ];

  const generateGeoData = () => [
    { state: 'Maharashtra', revenue: 280000, sellers: 150 },
    { state: 'Delhi NCR', revenue: 220000, sellers: 120 },
    { state: 'Karnataka', revenue: 180000, sellers: 100 },
    { state: 'Tamil Nadu', revenue: 150000, sellers: 80 },
    { state: 'Gujarat', revenue: 120000, sellers: 60 },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const activeSellerPercentage = metrics.totalSellers > 0 
    ? (metrics.activeSellers / metrics.totalSellers) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(metrics.totalRevenue)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This week: {formatCurrency(metrics.weeklyRevenue)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Platform Commission</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(metrics.totalCommission)}
              </p>
              <p className="text-sm text-purple-600 mt-1">
                3% of GMV
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Sellers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {metrics.activeSellers.toLocaleString()}
              </p>
              <Progress value={activeSellerPercentage} className="mt-2 h-2" />
              <p className="text-sm text-gray-500 mt-1">
                {activeSellerPercentage.toFixed(1)}% of total
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {metrics.totalOrders.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {metrics.conversionRate.toFixed(1)}% conversion
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Action Items */}
      {(metrics.pendingPayouts > 0 || metrics.pendingDisputes > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.pendingPayouts > 0 && (
            <Card className="p-4 border-orange-200 bg-orange-50">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    {metrics.pendingPayouts} Pending Payouts
                  </p>
                  <p className="text-sm text-gray-600">
                    Review and process seller payouts
                  </p>
                </div>
              </div>
            </Card>
          )}
          
          {metrics.pendingDisputes > 0 && (
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    {metrics.pendingDisputes} Open Disputes
                  </p>
                  <p className="text-sm text-gray-600">
                    Requires immediate attention
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Revenue Trend */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Platform Performance</h3>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue (₹)"
              />
              <Area 
                type="monotone" 
                dataKey="orders" 
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorOrders)"
                name="Orders"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sales by Category</h3>
            <Zap className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name} ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Geographic Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Regions</h3>
            <Globe className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={geoData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis dataKey="state" type="category" stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  formatter={(value: any, name: string) => 
                    name === 'revenue' ? formatCurrency(value) : value
                  }
                />
                <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" />
                <Bar dataKey="sellers" fill="#ec4899" name="Sellers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}