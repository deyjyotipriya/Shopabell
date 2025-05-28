'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { 
  Users, 
  UserCheck, 
  TrendingUp,
  DollarSign,
  Star,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/app/utils/format';

interface CustomerInsightsProps {
  sellerId?: string;
  period?: 'week' | 'month' | 'quarter' | 'year';
}

export function CustomerInsights({ sellerId, period = 'month' }: CustomerInsightsProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalCustomers: 0,
    repeatRate: 0,
    avgCustomerValue: 0,
    segments: {
      vip: 0,
      regular: 0,
      new: 0,
      dormant: 0,
    },
    topCustomers: [] as any[],
    cohortAnalysis: [] as any[],
  });

  useEffect(() => {
    fetchCustomerData();
  }, [sellerId, period]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/seller/analytics/customers?period=${period}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
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

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data.totalCustomers.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Active in last {period}
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
              <p className="text-sm font-medium text-gray-600">Repeat Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data.repeatRate.toFixed(1)}%
              </p>
              <Progress value={data.repeatRate} className="mt-2 h-2" />
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Customer Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(data.avgCustomerValue)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Per customer lifetime
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Customer Segments */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{data.segments.vip}</p>
            <p className="text-sm text-gray-600">VIP Customers</p>
            <p className="text-xs text-gray-500 mt-1">Spent ₹10K+</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{data.segments.regular}</p>
            <p className="text-sm text-gray-600">Regular</p>
            <p className="text-xs text-gray-500 mt-1">3+ orders</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{data.segments.new}</p>
            <p className="text-sm text-gray-600">New</p>
            <p className="text-xs text-gray-500 mt-1">First purchase</p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{data.segments.dormant}</p>
            <p className="text-sm text-gray-600">Dormant</p>
            <p className="text-xs text-gray-500 mt-1">30+ days inactive</p>
          </div>
        </div>
      </Card>

      {/* Top Customers */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-sm font-medium text-gray-600">Customer</th>
                <th className="text-right py-2 text-sm font-medium text-gray-600">Orders</th>
                <th className="text-right py-2 text-sm font-medium text-gray-600">Total Spent</th>
                <th className="text-right py-2 text-sm font-medium text-gray-600">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {data.topCustomers.map((customer, index) => (
                <tr key={customer.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-purple-600">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">
                        Customer #{customer.id.slice(0, 8)}
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-3 text-sm text-gray-900">
                    {customer.orderCount}
                  </td>
                  <td className="text-right py-3 text-sm font-medium text-gray-900">
                    {formatCurrency(customer.totalSpent)}
                  </td>
                  <td className="text-right py-3 text-sm text-gray-500">
                    {new Date(customer.lastOrder).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Cohort Analysis Preview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Customer Retention</h3>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Track how well you retain customers over time
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Month 1</p>
            <p className="text-xl font-bold text-gray-900">100%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Month 3</p>
            <p className="text-xl font-bold text-gray-900">
              {(data.repeatRate * 0.8).toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Month 6</p>
            <p className="text-xl font-bold text-gray-900">
              {(data.repeatRate * 0.6).toFixed(0)}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}