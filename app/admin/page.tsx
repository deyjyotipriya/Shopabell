'use client';

import React, { useEffect, useState } from 'react';
import { AdminMetrics } from '@/app/components/admin/AdminMetrics';
import { EarningsChart } from '@/app/components/admin/EarningsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { ArrowRight, Users, DollarSign, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalSellers: 0,
    activeSellers: 0,
    totalRevenue: 0,
    totalCommission: 0,
    totalOrders: 0,
    conversionRate: 0,
  });

  const [earningsData, setEarningsData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/admin/stats?range=${timeRange}`);
      const data = await response.json();
      
      setMetrics(data.metrics);
      setEarningsData(data.earnings);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Manage Sellers',
      description: 'View and manage all onboarded sellers',
      icon: <Users className="h-5 w-5" />,
      href: '/admin/sellers',
      color: 'bg-blue-500',
    },
    {
      title: 'View Earnings',
      description: 'Track your commission earnings',
      icon: <DollarSign className="h-5 w-5" />,
      href: '/admin/earnings',
      color: 'bg-green-500',
    },
    {
      title: 'Send Broadcast',
      description: 'Message all sellers at once',
      icon: <MessageSquare className="h-5 w-5" />,
      href: '/admin/broadcast',
      color: 'bg-purple-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Group Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your sellers and track performance
        </p>
      </div>

      <AdminMetrics metrics={metrics} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EarningsChart 
            data={earningsData} 
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <Button variant="outline" className="w-full justify-start">
                    <div className={`p-2 rounded-lg ${action.color} text-white mr-3`}>
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{action.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm">New seller onboarded</p>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">Commission earned: $245</p>
                  <span className="text-xs text-muted-foreground">5 hours ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">Broadcast sent to 150 sellers</p>
                  <span className="text-xs text-muted-foreground">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}