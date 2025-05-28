'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  DollarSign, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Download,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

interface PaymentTransaction {
  id: string;
  orderId: string;
  sellerName: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  date: Date;
  settledAmount?: number;
  commission: number;
  bankReference?: string;
}

interface PaymentSummary {
  totalProcessed: number;
  totalPending: number;
  totalFailed: number;
  totalCommission: number;
  todayVolume: number;
  weeklyVolume: number;
}

interface PaymentReconciliationProps {
  transactions: PaymentTransaction[];
  summary: PaymentSummary;
}

export const PaymentReconciliation: React.FC<PaymentReconciliationProps> = ({ 
  transactions, 
  summary 
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isReconciling, setIsReconciling] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredTransactions = selectedStatus === 'all' 
    ? transactions 
    : transactions.filter(t => t.status === selectedStatus);

  const handleReconcile = async () => {
    setIsReconciling(true);
    // Simulate reconciliation process
    setTimeout(() => {
      setIsReconciling(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalProcessed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time volume</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Settlements</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalFailed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalCommission.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Platform earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Volume Trends */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Volume Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Today</span>
                  <span className="text-sm font-semibold">${summary.todayVolume.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">This Week</span>
                  <span className="text-sm font-semibold">${summary.weeklyVolume.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">UPI</span>
                </div>
                <span className="text-sm text-muted-foreground">65%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Cards</span>
                </div>
                <span className="text-sm text-muted-foreground">20%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Net Banking</span>
                </div>
                <span className="text-sm text-muted-foreground">10%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Wallets</span>
                </div>
                <span className="text-sm text-muted-foreground">5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReconcile}
                disabled={isReconciling}
              >
                {isReconciling ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Reconcile
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Status Filter */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={selectedStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('all')}
              className={selectedStatus === 'all' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              All
            </Button>
            <Button
              variant={selectedStatus === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('completed')}
              className={selectedStatus === 'completed' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              Completed
            </Button>
            <Button
              variant={selectedStatus === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('pending')}
              className={selectedStatus === 'pending' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              Pending
            </Button>
            <Button
              variant={selectedStatus === 'failed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('failed')}
              className={selectedStatus === 'failed' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              Failed
            </Button>
          </div>

          {/* Transactions Table */}
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Transaction ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Seller</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Commission</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Method</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{transaction.id}</td>
                    <td className="px-4 py-3 text-sm">{transaction.sellerName}</td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      ${transaction.commission.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-4 py-3 text-sm">{transaction.paymentMethod}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {format(transaction.date, 'MMM dd, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};