'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
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
import { Download, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/app/components/ui/alert';

interface Transaction {
  id: string;
  date: string;
  type: 'sale' | 'commission' | 'refund' | 'payout';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  seller: string;
  group: string;
  description: string;
}

interface Reconciliation {
  id: string;
  period: string;
  totalRevenue: number;
  totalCommissions: number;
  totalPayouts: number;
  discrepancies: number;
  status: 'reconciled' | 'pending' | 'issues';
}

export default function FinancePage() {
  const [financialSummary, setFinancialSummary] = useState({
    totalRevenue: 0,
    totalCommissions: 0,
    totalPayouts: 0,
    pendingPayouts: 0,
    averageCommissionRate: 0,
    monthlyGrowth: 0,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      const [summaryRes, transactionsRes, reconciliationRes, revenueRes] = await Promise.all([
        fetch('/api/master/finance/summary'),
        fetch('/api/master/finance/transactions'),
        fetch('/api/master/finance/reconciliation'),
        fetch('/api/master/finance/revenue-trends')
      ]);

      const summaryData = await summaryRes.json();
      const transactionsData = await transactionsRes.json();
      const reconciliationData = await reconciliationRes.json();
      const revenueData = await revenueRes.json();

      setFinancialSummary(summaryData);
      setTransactions(transactionsData.transactions);
      setReconciliations(reconciliationData.reconciliations);
      setRevenueData(revenueData.data);
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportFinancialReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: financialSummary,
      transactions: transactions,
      reconciliations: reconciliations,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: { variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
      pending: { variant: 'secondary', icon: <AlertCircle className="h-3 w-3" /> },
      failed: { variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
      reconciled: { variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
      issues: { variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
    };

    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Management</h1>
          <p className="text-muted-foreground">
            Revenue tracking and financial reconciliation
          </p>
        </div>
        <Button onClick={exportFinancialReport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${financialSummary.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-green-600">
              +{financialSummary.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${financialSummary.totalCommissions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialSummary.averageCommissionRate}% avg rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${financialSummary.totalPayouts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Completed payouts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${financialSummary.pendingPayouts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="commissions"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Commissions"
                    />
                    <Line
                      type="monotone"
                      dataKey="payouts"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Payouts"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.type}</Badge>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.seller}</TableCell>
                      <TableCell>{transaction.group}</TableCell>
                      <TableCell className="font-medium">
                        ${transaction.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Reconciliation runs automatically at the end of each month. 
              Any discrepancies will be flagged for review.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Reconciliation History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Total Commissions</TableHead>
                    <TableHead>Total Payouts</TableHead>
                    <TableHead>Discrepancies</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconciliations.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell className="font-medium">{rec.period}</TableCell>
                      <TableCell>${rec.totalRevenue.toLocaleString()}</TableCell>
                      <TableCell>${rec.totalCommissions.toLocaleString()}</TableCell>
                      <TableCell>${rec.totalPayouts.toLocaleString()}</TableCell>
                      <TableCell>
                        {rec.discrepancies > 0 ? (
                          <span className="text-red-600">
                            ${rec.discrepancies.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-green-600">None</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(rec.status)}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}