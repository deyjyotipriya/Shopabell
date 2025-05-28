'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { 
  Cpu, 
  HardDrive, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Server,
  Clock,
  Zap
} from 'lucide-react';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  value: number;
  max: number;
  unit: string;
  icon: React.ReactNode;
}

interface SystemHealthProps {
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    database: 'healthy' | 'warning' | 'critical';
    api: {
      latency: number;
      uptime: number;
      errorRate: number;
    };
    services: {
      name: string;
      status: 'up' | 'down' | 'degraded';
      lastCheck: string;
      responseTime?: number;
      uptime?: number;
    }[];
  };
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ metrics, onRefresh, isRefreshing }) => {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      healthy: { className: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      warning: { className: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="h-3 w-3" /> },
      critical: { className: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
      up: { className: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      down: { className: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
      degraded: { className: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="h-3 w-3" /> },
    };
    
    const config = variants[status] || variants.healthy;
    return (
      <Badge className={`flex items-center gap-1 ${config.className}`}>
        {config.icon}
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  const getProgressColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'bg-red-500';
    if (value >= thresholds.warning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const healthMetrics: HealthMetric[] = [
    {
      name: 'CPU Usage',
      status: metrics.cpu > 80 ? 'critical' : metrics.cpu > 60 ? 'warning' : 'healthy',
      value: metrics.cpu,
      max: 100,
      unit: '%',
      icon: <Cpu className="h-4 w-4 text-purple-600" />,
    },
    {
      name: 'Memory Usage',
      status: metrics.memory > 85 ? 'critical' : metrics.memory > 70 ? 'warning' : 'healthy',
      value: metrics.memory,
      max: 100,
      unit: '%',
      icon: <Server className="h-4 w-4 text-purple-600" />,
    },
    {
      name: 'Disk Usage',
      status: metrics.disk > 90 ? 'critical' : metrics.disk > 75 ? 'warning' : 'healthy',
      value: metrics.disk,
      max: 100,
      unit: '%',
      icon: <HardDrive className="h-4 w-4 text-purple-600" />,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-purple-800">System Health Monitor</h3>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="border-purple-200 hover:bg-purple-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {healthMetrics.map((metric) => {
          const thresholds = {
            'CPU Usage': { warning: 60, critical: 80 },
            'Memory Usage': { warning: 70, critical: 85 },
            'Disk Usage': { warning: 75, critical: 90 },
          }[metric.name] || { warning: 70, critical: 85 };

          return (
            <Card key={metric.name} className="border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  {metric.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {metric.value}{metric.unit}
                    </span>
                    {getStatusBadge(metric.status)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${getProgressColor(metric.value, thresholds)}`}
                      style={{ width: `${(metric.value / metric.max) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardTitle className="text-purple-800">API Performance</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-purple-50/50">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Latency</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{metrics.api.latency}ms</p>
              <p className="text-xs text-purple-600 mt-1">
                {metrics.api.latency < 100 ? 'Excellent' : metrics.api.latency < 200 ? 'Good' : 'Needs attention'}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50/50">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Uptime</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{metrics.api.uptime}%</p>
              <p className="text-xs text-purple-600 mt-1">
                {metrics.api.uptime >= 99.9 ? 'Excellent' : metrics.api.uptime >= 99 ? 'Good' : 'Needs improvement'}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50/50">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Error Rate</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{metrics.api.errorRate}%</p>
              <p className="text-xs text-purple-600 mt-1">
                {metrics.api.errorRate < 0.1 ? 'Excellent' : metrics.api.errorRate < 1 ? 'Acceptable' : 'High'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardTitle className="text-purple-800">Service Status</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {metrics.services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-purple-50/50 transition-colors">
                <div className="flex-1">
                  <p className="font-medium">{service.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-muted-foreground">
                      Last checked: {new Date(service.lastCheck).toLocaleTimeString()}
                    </p>
                    {service.responseTime && (
                      <p className="text-sm text-muted-foreground">
                        Response: {service.responseTime}ms
                      </p>
                    )}
                    {service.uptime && (
                      <p className="text-sm text-muted-foreground">
                        Uptime: {Math.floor(service.uptime / 3600)}h
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(service.status)}
                  {service.status === 'down' && (
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                      Restart
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};