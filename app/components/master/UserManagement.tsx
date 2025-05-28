'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  Ban, 
  CheckCircle,
  UserCheck,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  TrendingDown,
  Download,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'seller' | 'buyer';
  status: 'active' | 'suspended' | 'pending' | 'banned';
  joinDate: string;
  lastActive: string;
  totalOrders?: number;
  totalRevenue?: number;
  totalSpent?: number;
  verificationStatus: 'verified' | 'unverified' | 'pending';
  riskScore: number;
}

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - replace with actual API calls
  const users: User[] = [
    {
      id: 'USR001',
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91 98765 43210',
      type: 'seller',
      status: 'active',
      joinDate: '2024-01-15',
      lastActive: '2024-06-18',
      totalOrders: 156,
      totalRevenue: 234500,
      verificationStatus: 'verified',
      riskScore: 15
    },
    {
      id: 'USR002',
      name: 'Rahul Verma',
      email: 'rahul.v@email.com',
      phone: '+91 87654 32109',
      type: 'buyer',
      status: 'active',
      joinDate: '2024-02-20',
      lastActive: '2024-06-17',
      totalOrders: 23,
      totalSpent: 45600,
      verificationStatus: 'verified',
      riskScore: 5
    },
    {
      id: 'USR003',
      name: 'Fashion Boutique',
      email: 'info@fashionboutique.com',
      phone: '+91 76543 21098',
      type: 'seller',
      status: 'suspended',
      joinDate: '2024-03-10',
      lastActive: '2024-06-10',
      totalOrders: 89,
      totalRevenue: 178900,
      verificationStatus: 'pending',
      riskScore: 65
    },
    {
      id: 'USR004',
      name: 'Amit Patel',
      email: 'amit.patel@email.com',
      phone: '+91 65432 10987',
      type: 'buyer',
      status: 'pending',
      joinDate: '2024-06-15',
      lastActive: '2024-06-15',
      totalOrders: 0,
      totalSpent: 0,
      verificationStatus: 'unverified',
      riskScore: 25
    },
    {
      id: 'USR005',
      name: 'Electronics Hub',
      email: 'contact@electronichub.com',
      phone: '+91 54321 09876',
      type: 'seller',
      status: 'banned',
      joinDate: '2024-04-05',
      lastActive: '2024-05-20',
      totalOrders: 234,
      totalRevenue: 567800,
      verificationStatus: 'verified',
      riskScore: 85
    }
  ];

  const userStats = {
    totalUsers: 2847,
    activeUsers: 2341,
    newUsersThisMonth: 187,
    suspendedUsers: 45,
    bannedUsers: 12,
    verificationPending: 89
  };

  const getRiskBadge = (score: number) => {
    if (score < 30) return { variant: 'default' as const, label: 'Low Risk' };
    if (score < 60) return { variant: 'secondary' as const, label: 'Medium Risk' };
    return { variant: 'destructive' as const, label: 'High Risk' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'suspended': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'banned': return <Ban className="w-4 h-4 text-red-600" />;
      default: return <UserCheck className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{userStats.totalUsers}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{userStats.activeUsers}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New This Month</p>
                <p className="text-2xl font-bold">{userStats.newUsersThisMonth}</p>
              </div>
              <UserCheck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Suspended</p>
                <p className="text-2xl font-bold">{userStats.suspendedUsers}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Banned</p>
                <p className="text-2xl font-bold">{userStats.bannedUsers}</p>
              </div>
              <Ban className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{userStats.verificationPending}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>User Management</CardTitle>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="seller">Sellers</SelectItem>
                  <SelectItem value="buyer">Buyers</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Verification</th>
                  <th className="text-left py-3 px-4">Risk Score</th>
                  <th className="text-left py-3 px-4">Activity</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const risk = getRiskBadge(user.riskScore);
                  return (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={user.type === 'seller' ? 'default' : 'secondary'}>
                          {user.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(user.status)}
                          <span className="capitalize">{user.status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={
                          user.verificationStatus === 'verified' ? 'default' :
                          user.verificationStatus === 'pending' ? 'secondary' :
                          'outline'
                        }>
                          {user.verificationStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={risk.variant}>{risk.label}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p>{user.type === 'seller' ? `${user.totalOrders} orders` : `${user.totalOrders} purchases`}</p>
                          <p className="text-muted-foreground">
                            {user.type === 'seller' ? `₹${user.totalRevenue?.toLocaleString()}` : `₹${user.totalSpent?.toLocaleString()}`}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="w-4 h-4 mr-2" />
                              Verify User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === 'active' ? (
                              <DropdownMenuItem className="text-yellow-600">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Suspend User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-green-600">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Activate User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600">
                              <Ban className="w-4 h-4 mr-2" />
                              Ban User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Verification Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sellers">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sellers">Seller Verifications</TabsTrigger>
              <TabsTrigger value="buyers">Buyer Verifications</TabsTrigger>
            </TabsList>
            <TabsContent value="sellers">
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">Fashion Boutique</p>
                      <p className="text-sm text-muted-foreground">GST: 29ABCDE1234F1Z5</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Documents</Button>
                    <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                    <Button variant="destructive" size="sm">Reject</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="buyers">
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">Amit Patel</p>
                      <p className="text-sm text-muted-foreground">Phone: +91 65432 10987</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Send OTP</Button>
                    <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">Verify</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}