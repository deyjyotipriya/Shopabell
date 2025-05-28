'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign, 
  Store, 
  Package,
  Activity,
  AlertCircle
} from 'lucide-react';

interface PlatformMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

export default function PlatformOverview() {
  // Mock data - replace with actual API calls
  const metrics: PlatformMetric[] = [
    {
      label: 'Total Revenue',
      value: '₹8,45,230',
      change: 12.5,
      trend: 'up',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Active Users',
      value: '2,847',
      change: 8.3,
      trend: 'up',
      icon: <Users className="w-5 h-5" />,
      color: 'from-blue-500 to-purple-500'
    },
    {
      label: 'Total Orders',
      value: '1,234',
      change: 15.7,
      trend: 'up',
      icon: <ShoppingBag className="w-5 h-5" />,
      color: 'from-green-500 to-teal-500'
    },
    {
      label: 'Active Sellers',
      value: '187',
      change: -2.1,
      trend: 'down',
      icon: <Store className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500'
    },
    {
      label: 'Products Listed',
      value: '5,432',
      change: 22.4,
      trend: 'up',
      icon: <Package className="w-5 h-5" />,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      label: 'Platform Health',
      value: '98.7%',
      change: 0.3,
      trend: 'up',
      icon: <Activity className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const systemAlerts = [
    { severity: 'high', message: 'Payment gateway experiencing delays', timestamp: '10 mins ago' },
    { severity: 'medium', message: 'Unusual spike in new seller registrations', timestamp: '1 hour ago' },
    { severity: 'low', message: 'Scheduled maintenance tomorrow at 2 AM IST', timestamp: '3 hours ago' }
  ];

  return (
    <div className="space-y-6">
      {/* Platform Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color} bg-opacity-10`}>
                  {metric.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{metric.value}</p>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                    {Math.abs(metric.change)}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status and Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>System Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemAlerts.map((alert, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${
                  alert.severity === 'high' ? 'bg-red-500' :
                  alert.severity === 'medium' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">API Response Time</span>
                  <span className="text-sm text-muted-foreground">87ms avg</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Database Performance</span>
                  <span className="text-sm text-muted-foreground">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">CDN Cache Hit Rate</span>
                  <span className="text-sm text-muted-foreground">94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Server Uptime</span>
                  <span className="text-sm text-muted-foreground">99.98%</span>
                </div>
                <Progress value={99.98} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}