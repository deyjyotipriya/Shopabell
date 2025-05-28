'use client';

import React, { useEffect, useState } from 'react';
import { SellerTable, Seller } from '@/app/components/admin/SellerTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Search, Download, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<Seller[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    filterSellers();
  }, [searchTerm, sellers]);

  const fetchSellers = async () => {
    try {
      const response = await fetch('/api/admin/sellers');
      const data = await response.json();
      setSellers(data.sellers);
      setFilteredSellers(data.sellers);
    } catch (error) {
      console.error('Failed to fetch sellers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSellers = () => {
    const filtered = sellers.filter(
      (seller) =>
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.facebookGroup.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSellers(filtered);
  };

  const handleExport = () => {
    // Export sellers data as CSV
    const csv = [
      ['Name', 'Email', 'Facebook Group', 'Status', 'Total Sales', 'Commission', 'Join Date'],
      ...filteredSellers.map(seller => [
        seller.name,
        seller.email,
        seller.facebookGroup,
        seller.status,
        seller.totalSales,
        seller.commission,
        seller.joinDate
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sellers-export.csv';
    a.click();
  };

  const handleViewDetails = (seller: Seller) => {
    setSelectedSeller(seller);
  };

  const handleSuspend = async (seller: Seller) => {
    if (confirm(`Are you sure you want to suspend ${seller.name}?`)) {
      try {
        await fetch(`/api/admin/sellers/${seller.id}/suspend`, {
          method: 'POST',
        });
        fetchSellers();
      } catch (error) {
        console.error('Failed to suspend seller:', error);
      }
    }
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
          <h1 className="text-3xl font-bold">Manage Sellers</h1>
          <p className="text-muted-foreground">
            View and manage all onboarded sellers in your groups
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Seller
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sellers</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sellers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <SellerTable
            sellers={filteredSellers}
            onViewDetails={handleViewDetails}
            onSuspend={handleSuspend}
          />
        </CardContent>
      </Card>

      <Dialog open={!!selectedSeller} onOpenChange={() => setSelectedSeller(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Seller Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedSeller?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedSeller && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{selectedSeller.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Facebook Group</p>
                  <p className="text-sm text-muted-foreground">{selectedSeller.facebookGroup}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-muted-foreground">{selectedSeller.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Join Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedSeller.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Performance Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        ${selectedSeller.totalSales.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Total Sales</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        ${selectedSeller.commission.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Commission Earned</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {new Date(selectedSeller.lastActive).toLocaleDateString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Last Active</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}