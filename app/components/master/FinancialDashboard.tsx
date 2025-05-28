'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  DollarSign, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function FinancialDashboard() {
  // Mock data - replace with actual API calls
  const revenueData = [
    { month: 'Jan', revenue: 245000, orders: 342, avgOrderValue: 716 },
    { month: 'Feb', revenue: 298000, orders: 412, avgOrderValue: 723 },
    { month: 'Mar', revenue: 342000, orders: 478, avgOrderValue: 716 },
    { month: 'Apr', revenue: 387000, orders: 523, avgOrderValue: 740 },
    { month: 'May', revenue: 425000, orders: 598, avgOrderValue: 711 },
    { month: 'Jun', revenue: 468000, orders: 642, avgOrderValue: 729 },
  ];

  const paymentMethodsData = [
    { name: 'UPI', value: 45, color: '#8b5cf6' },
    { name: 'Cards', value: 25, color: '#ec4899' },
    { name: 'Net Banking', value: 20, color: '#3b82f6' },
    { name: 'Wallets', value: 10, color: '#10b981' },
  ];

  const sellerPayouts = [
    { id: 'PAY001', seller: 'Fashion Store', amount: 45230, status: 'completed', date: '2024-06-15' },
    { id: 'PAY002', seller: 'Electronics Hub', amount: 78900, status: 'processing', date: '2024-06-16' },
    { id: 'PAY003', seller: 'Home Decor', amount: 32100, status: 'pending', date: '2024-06-17' },
    { id: 'PAY004', seller: 'Beauty Boutique', amount: 56700, status: 'completed', date: '2024-06-17' },
    { id: 'PAY005', seller: 'Sports World', amount: 41200, status: 'failed', date: '2024-06-18' },
  ];

  const financialSummary = {
    totalRevenue: 845230,
    platformFees: 84523,
    netRevenue: 760707,
    pendingPayouts: 165900,
    completedPayouts: 523100,
    avgTransactionValue: 729,
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">₹{financialSummary.totalRevenue.toLocaleString()}</p>
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Platform Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">₹{financialSummary.platformFees.toLocaleString()}</p>
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">10% commission rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">₹{financialSummary.pendingPayouts.toLocaleString()}</p>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">23 transactions pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">₹{financialSummary.avgTransactionValue}</p>
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">+3.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trends and Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Revenue (₹)"
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#ec4899" 
                  strokeWidth={2}
                  name="Orders"
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Seller Payouts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Seller Payouts</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="default" size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
                Process Payouts
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Payout ID</th>
                  <th className="text-left py-3 px-4">Seller</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellerPayouts.map((payout) => (
                  <tr key={payout.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{payout.id}</td>
                    <td className="py-3 px-4">{payout.seller}</td>
                    <td className="py-3 px-4">₹{payout.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant={
                        payout.status === 'completed' ? 'default' :
                        payout.status === 'processing' ? 'secondary' :
                        payout.status === 'pending' ? 'outline' :
                        'destructive'
                      }>
                        {payout.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {payout.status === 'processing' && <Clock className="w-3 h-3 mr-1" />}
                        {payout.status === 'failed' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {payout.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{payout.date}</td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm">View Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reconciliation Status */}
      <Card>
        <CardHeader>
          <CardTitle>Reconciliation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="discrepancies">Discrepancies</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">June 2024 Reconciliation</p>
                    <p className="text-sm text-muted-foreground">234 transactions pending review</p>
                  </div>
                  <Button size="sm">Start Review</Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="completed">
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">May 2024 Reconciliation</p>
                    <p className="text-sm text-muted-foreground">1,234 transactions reconciled</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="discrepancies">
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50">
                  <div>
                    <p className="font-medium text-red-900">Payment Gateway Mismatch</p>
                    <p className="text-sm text-red-700">₹12,340 difference in settlements</p>
                  </div>
                  <Button variant="destructive" size="sm">Investigate</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}