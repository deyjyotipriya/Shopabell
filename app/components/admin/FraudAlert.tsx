'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { 
  AlertTriangle, 
  Shield, 
  Ban, 
  CheckCircle,
  Eye,
  FileText,
  Filter,
  TrendingUp,
  Clock,
  UserX
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

export interface FraudAlert {
  id: string;
  type: 'suspicious_activity' | 'policy_violation' | 'payment_issue' | 'account_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  seller: {
    id: string;
    name: string;
    email: string;
  };
  description: string;
  details: string[];
  timestamp: string;
  status: 'pending' | 'investigating' | 'resolved' | 'escalated';
}

interface FraudAlertProps {
  alerts: FraudAlert[];
  onInvestigate: (alert: FraudAlert) => void;
  onResolve: (alert: FraudAlert) => void;
  onBanSeller: (alert: FraudAlert) => void;
}

export const FraudAlertComponent: React.FC<FraudAlertProps> = ({ 
  alerts, 
  onInvestigate, 
  onResolve,
  onBanSeller
}) => {
  const getSeverityColor = (severity: FraudAlert['severity']) => {
    const colors = {
      low: 'border-blue-200 bg-blue-50',
      medium: 'border-yellow-200 bg-yellow-50',
      high: 'border-orange-200 bg-orange-50',
      critical: 'border-red-200 bg-red-50',
    };
    return colors[severity];
  };

  const getSeverityBadge = (severity: FraudAlert['severity']) => {
    const variants: Record<string, any> = {
      low: 'secondary',
      medium: 'secondary',
      high: 'destructive',
      critical: 'destructive',
    };
    return <Badge variant={variants[severity]}>{severity.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: FraudAlert['status']) => {
    const variants: Record<string, any> = {
      pending: 'outline',
      investigating: 'secondary',
      resolved: 'default',
      escalated: 'destructive',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getTypeIcon = (type: FraudAlert['type']) => {
    const icons = {
      suspicious_activity: <AlertTriangle className="h-4 w-4" />,
      policy_violation: <Shield className="h-4 w-4" />,
      payment_issue: <Ban className="h-4 w-4" />,
      account_anomaly: <FileText className="h-4 w-4" />,
    };
    return icons[type];
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium">No fraud alerts</p>
            <p className="text-sm text-muted-foreground">
              All systems are operating normally
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Fraud Detection Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(alert.type)}
                  <AlertTitle className="flex items-center gap-2">
                    {alert.description}
                    {getSeverityBadge(alert.severity)}
                    {getStatusBadge(alert.status)}
                  </AlertTitle>
                </div>
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">
                      Seller: {alert.seller.name} ({alert.seller.email})
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {alert.details.map((detail, index) => (
                        <li key={index} className="text-sm">{detail}</li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground">
                      Detected: {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </AlertDescription>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                {alert.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => onInvestigate(alert)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Investigate
                  </Button>
                )}
                {alert.status === 'investigating' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onResolve(alert)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onBanSeller(alert)}
                    >
                      <Ban className="h-3 w-3 mr-1" />
                      Ban Seller
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};