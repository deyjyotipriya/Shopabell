'use client';

import React, { useEffect, useState } from 'react';
import { AdminMetrics } from '@/app/components/admin/AdminMetrics';
import { SystemHealth } from '@/app/components/admin/SystemHealth';
import { FraudAlertComponent, FraudAlert } from '@/app/components/admin/FraudAlert';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Settings, Activity, Users, Shield } from 'lucide-react';
import Link from 'next/link';

export default function MasterDashboard() {
  const [systemMetrics, setSystemMetrics] = useState({
    totalSellers: 0,
    activeSellers: 0,
    totalRevenue: 0,
    totalCommission: 0,
    totalOrders: 0,
    conversionRate: 0,
  });

  const [healthMetrics, setHealthMetrics] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    database: 'healthy' as const,
    api: {
      latency: 0,
      uptime: 0,
      errorRate: 0,
    },
    services: [] as any[],
  });

  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMasterData();
    const interval = setInterval(fetchMasterData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMasterData = async () => {
    try {
      const [metricsRes, healthRes, fraudRes] = await Promise.all([
        fetch('/api/master/metrics'),
        fetch('/api/master/health'),
        fetch('/api/master/fraud-alerts')
      ]);

      const metricsData = await metricsRes.json();
      const healthData = await healthRes.json();
      const fraudData = await fraudRes.json();

      setSystemMetrics(metricsData.metrics);
      setHealthMetrics(healthData);
      setFraudAlerts(fraudData.alerts);
    } catch (error) {
      console.error('Failed to fetch master data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvestigate = async (alert: FraudAlert) => {
    await fetch(`/api/master/fraud-alerts/${alert.id}/investigate`, {
      method: 'POST',
    });
    fetchMasterData();
  };

  const handleResolve = async (alert: FraudAlert) => {
    await fetch(`/api/master/fraud-alerts/${alert.id}/resolve`, {
      method: 'POST',
    });
    fetchMasterData();
  };

  const handleBanSeller = async (alert: FraudAlert) => {
    if (confirm(`Are you sure you want to ban ${alert.seller.name}?`)) {
      await fetch(`/api/master/sellers/${alert.seller.id}/ban`, {
        method: 'POST',
      });
      fetchMasterData();
    }
  };

  const quickLinks = [
    {
      title: 'Analytics',
      description: 'Platform-wide analytics',
      icon: <Activity className="h-5 w-5" />,
      href: '/master/analytics',
      color: 'bg-blue-500',
    },
    {
      title: 'User Management',
      description: 'Manage all users',
      icon: <Users className="h-5 w-5" />,
      href: '/master/users',
      color: 'bg-green-500',
    },
    {
      title: 'Financial',
      description: 'Revenue & reconciliation',
      icon: <Shield className="h-5 w-5" />,
      href: '/master/finance',
      color: 'bg-purple-500',
    },
    {
      title: 'Settings',
      description: 'System configuration',
      icon: <Settings className="h-5 w-5" />,
      href: '/master/settings',
      color: 'bg-orange-500',
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
        <h1 className="text-3xl font-bold">Master Control Dashboard</h1>
        <p className="text-muted-foreground">
          Complete platform oversight and management
        </p>
      </div>

      <AdminMetrics metrics={systemMetrics} />

      <div className="grid gap-6 lg:grid-cols-2">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                  <div className={`p-3 rounded-lg ${link.color} text-white`}>
                    {link.icon}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{link.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <FraudAlertComponent
        alerts={fraudAlerts}
        onInvestigate={handleInvestigate}
        onResolve={handleResolve}
        onBanSeller={handleBanSeller}
      />

      <SystemHealth metrics={healthMetrics} />
    </div>
  );
}