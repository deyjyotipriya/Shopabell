'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '../ui/button';
import { Input } from '@/app/components/ui/input';
import { 
  MoreHorizontal, 
  Eye, 
  Ban, 
  Check, 
  Search,
  Filter,
  Download,
  Mail,
  TrendingUp,
  Store
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone?: string;
  facebookGroup: string;
  status: 'active' | 'pending' | 'suspended' | 'verified';
  totalSales: number;
  commission: number;
  joinDate: string;
  lastActive: string;
  productsCount?: number;
  ordersCount?: number;
  rating?: number;
  storeUrl?: string;
}

interface SellerTableProps {
  sellers: Seller[];
  onViewDetails: (seller: Seller) => void;
  onSuspend: (seller: Seller) => void;
  onApprove?: (seller: Seller) => void;
  onContactSeller?: (seller: Seller) => void;
  onExport?: () => void;
}

export const SellerTable: React.FC<SellerTableProps> = ({ 
  sellers, 
  onViewDetails, 
  onSuspend,
  onApprove,
  onContactSeller,
  onExport 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusBadge = (status: Seller['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'verified':
        return <Badge className="bg-purple-100 text-purple-800">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.facebookGroup.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || seller.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Seller Management</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="border-purple-200 hover:bg-purple-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search sellers..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-purple-200">
                <Filter className="h-4 w-4 mr-2" />
                {statusFilter === 'all' ? 'All Status' : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('verified')}>
                Verified
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('suspended')}>
                Suspended
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-purple-50/50">
                <TableHead>Seller</TableHead>
                <TableHead>Store Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSellers.map((seller) => (
                <TableRow key={seller.id} className="hover:bg-purple-50/30">
                  <TableCell>
                    <div>
                      <div className="font-medium">{seller.name}</div>
                      <div className="text-sm text-muted-foreground">{seller.email}</div>
                      {seller.phone && (
                        <div className="text-sm text-muted-foreground">{seller.phone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-purple-600" />
                      <div>
                        <div className="text-sm font-medium">{seller.facebookGroup}</div>
                        {seller.storeUrl && (
                          <div className="text-xs text-muted-foreground">{seller.storeUrl}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(seller.status)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Products:</span>
                        <span className="font-medium">{seller.productsCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Orders:</span>
                        <span className="font-medium">{seller.ordersCount || 0}</span>
                      </div>
                      {seller.rating && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Rating:</span>
                          <span className="font-medium">{seller.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">${seller.totalSales.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        Commission: ${seller.commission.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        Joined: {new Date(seller.joinDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last active: {new Date(seller.lastActive).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onViewDetails(seller)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        {onContactSeller && (
                          <DropdownMenuItem onClick={() => onContactSeller(seller)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Contact seller
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {seller.status === 'pending' && onApprove && (
                          <DropdownMenuItem 
                            onClick={() => onApprove(seller)}
                            className="text-green-600"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approve seller
                          </DropdownMenuItem>
                        )}
                        {seller.status !== 'suspended' && (
                          <DropdownMenuItem
                            onClick={() => onSuspend(seller)}
                            className="text-red-600"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend seller
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};