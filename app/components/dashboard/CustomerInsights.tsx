'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BiUser, BiShoppingBag, BiTime, BiHeart, BiMap, BiDevices } from 'react-icons/bi';

interface CustomerData {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  avgOrderValue: number;
  avgOrdersPerCustomer: number;
  topLocations: Array<{ location: string; customers: number; percentage: number }>;
  deviceBreakdown: Array<{ device: string; value: number }>;
  purchaseTimeDistribution: Array<{ hour: string; purchases: number }>;
  topProducts: Array<{ product: string; purchases: number; revenue: number }>;
  customerSegments: Array<{ segment: string; count: number; revenue: number }>;
}

const COLORS = ['#9333ea', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'];

export default function CustomerInsights() {
  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'behavior' | 'segments'>('overview');

  useEffect(() => {
    fetchCustomerData();
  }, [timeRange]);

  const fetchCustomerData = async () => {
    try {
      const response = await fetch(`/api/seller/analytics/customers?range=${timeRange}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Customer Insights</h3>
          <p className="text-sm text-gray-500 mt-1">Understand your customer behavior and preferences</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {(['overview', 'behavior', 'segments'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-1 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600 font-medium">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{data.totalCustomers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">+{data.newCustomers} new</p>
                </div>
                <BiUser className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">${data.avgOrderValue.toFixed(2)}</p>
                </div>
                <BiShoppingBag className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 font-medium">Returning Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {((data.returningCustomers / data.totalCustomers) * 100).toFixed(1)}%
                  </p>
                </div>
                <BiHeart className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-600 font-medium">Avg Orders/Customer</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{data.avgOrdersPerCustomer.toFixed(1)}</p>
                </div>
                <BiTime className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Top Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                <BiMap className="w-5 h-5 text-purple-600" />
                Top Customer Locations
              </h4>
              <div className="space-y-3">
                {data.topLocations.map((location, index) => (
                  <div key={location.location} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 w-4">{index + 1}.</span>
                      <span className="text-sm font-medium text-gray-900">{location.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-purple-700 h-2 rounded-full"
                          style={{ width: `${location.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{location.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Breakdown */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                <BiDevices className="w-5 h-5 text-purple-600" />
                Device Usage
              </h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.deviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {data.deviceBreakdown.map((device, index) => (
                  <div key={device.device} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-gray-600">{device.device}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'behavior' && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Purchase Time Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.purchaseTimeDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="purchases" fill="#9333ea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Peak shopping hours help optimize marketing campaigns and livestream timing
          </p>
        </div>
      )}

      {activeTab === 'segments' && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Customer Segments</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.customerSegments.map((segment) => (
              <div key={segment.segment} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900">{segment.segment}</h5>
                  <span className="text-sm text-purple-600 font-medium">
                    {((segment.count / data.totalCustomers) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Customers</p>
                    <p className="text-sm font-semibold text-gray-900">{segment.count.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="text-sm font-semibold text-green-600">${segment.revenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}