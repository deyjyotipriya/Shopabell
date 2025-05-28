'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Download, TrendingUp, DollarSign } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface EarningsData {
  date: string;
  revenue: number;
  commission: number;
  orders: number;
}

interface EarningsChartProps {
  data: EarningsData[];
  timeRange: '7d' | '30d' | '90d';
  onTimeRangeChange: (range: '7d' | '30d' | '90d') => void;
  summary?: {
    totalRevenue: number;
    totalCommission: number;
    totalOrders: number;
    averageOrderValue: number;
  };
  onExport?: () => void;
}

export const EarningsChart: React.FC<EarningsChartProps> = ({ 
  data, 
  timeRange, 
  onTimeRangeChange,
  summary,
  onExport 
}) => {
  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Total Revenue</p>
                  <p className="text-2xl font-bold text-purple-900">
                    ${summary.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Commission Earned</p>
                  <p className="text-2xl font-bold text-purple-900">
                    ${summary.totalCommission.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200">
            <CardContent className="p-4">
              <div>
                <p className="text-sm font-medium text-purple-700">Total Orders</p>
                <p className="text-2xl font-bold text-purple-900">
                  {summary.totalOrders.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200">
            <CardContent className="p-4">
              <div>
                <p className="text-sm font-medium text-purple-700">Avg Order Value</p>
                <p className="text-2xl font-bold text-purple-900">
                  ${summary.averageOrderValue.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-800">Earnings Overview</CardTitle>
            <div className="flex items-center gap-2">
              {onExport && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onExport}
                  className="border-purple-200 hover:bg-purple-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
              <Tabs value={timeRange} onValueChange={(value: string) => onTimeRangeChange(value as '7d' | '30d' | '90d')}>
                <TabsList className="bg-purple-100">
                  <TabsTrigger value="7d" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    7 Days
                  </TabsTrigger>
                  <TabsTrigger value="30d" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    30 Days
                  </TabsTrigger>
                  <TabsTrigger value="90d" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    90 Days
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="bg-purple-100">
            <TabsTrigger value="revenue" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Revenue & Commission
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Orders
            </TabsTrigger>
          </TabsList>
          <TabsContent value="revenue" className="space-y-4">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number | string) => `$${Number(value).toLocaleString()}`}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#9333ea" 
                    name="Revenue"
                    dot={{ fill: '#9333ea', r: 4 }}
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="commission" 
                    stroke="#7c3aed" 
                    name="Commission"
                    dot={{ fill: '#7c3aed', r: 4 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="orders" className="space-y-4">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="orders" 
                    fill="#9333ea" 
                    name="Orders"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};