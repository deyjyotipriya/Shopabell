'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, trend }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {change} from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
};

interface AdminMetricsProps {
  metrics: {
    totalSellers: number;
    activeSellers: number;
    totalRevenue: number;
    totalCommission: number;
    totalOrders: number;
    conversionRate: number;
  };
}

export const AdminMetrics: React.FC<AdminMetricsProps> = ({ metrics }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Sellers"
        value={metrics.totalSellers}
        change="+12.5%"
        trend="up"
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      />
      <MetricCard
        title="Active Sellers"
        value={metrics.activeSellers}
        change="+8.2%"
        trend="up"
        icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />}
      />
      <MetricCard
        title="Total Revenue"
        value={`$${metrics.totalRevenue.toLocaleString()}`}
        change="+15.3%"
        trend="up"
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
      />
      <MetricCard
        title="Commission Earned"
        value={`$${metrics.totalCommission.toLocaleString()}`}
        change="+18.7%"
        trend="up"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
};