'use client';

import { useState, useEffect } from 'react';
import { BiPackage, BiErrorCircle, BiCheckCircle, BiTrendingDown } from 'react-icons/bi';

interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  currentStock: number;
  lowStockThreshold: number;
  status: 'critical' | 'low' | 'healthy';
  salesVelocity: number; // units per day
  daysUntilStockout: number;
  lastRestocked: string;
  image?: string;
}

export default function InventoryAlert() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'low'>('all');
  const [showOnlyAlerts, setShowOnlyAlerts] = useState(true);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const response = await fetch('/api/seller/analytics/inventory');
      if (response.ok) {
        const result = await response.json();
        setInventory(result.inventory);
      }
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusIcon = (status: InventoryItem['status']) => {
    switch (status) {
      case 'critical':
        return <BiErrorCircle className="w-5 h-5" />;
      case 'low':
        return <BiTrendingDown className="w-5 h-5" />;
      case 'healthy':
        return <BiCheckCircle className="w-5 h-5" />;
    }
  };

  const filteredInventory = inventory.filter(item => {
    if (showOnlyAlerts && item.status === 'healthy') return false;
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const criticalCount = inventory.filter(item => item.status === 'critical').length;
  const lowCount = inventory.filter(item => item.status === 'low').length;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
          <p className="text-sm text-gray-500 mt-1">Monitor stock levels and prevent stockouts</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showOnlyAlerts}
              onChange={(e) => setShowOnlyAlerts(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-gray-600">Show alerts only</span>
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="critical">Critical ({criticalCount})</option>
            <option value="low">Low Stock ({lowCount})</option>
          </select>
        </div>
      </div>

      {/* Alert Summary */}
      {(criticalCount > 0 || lowCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {criticalCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <BiErrorCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-900">{criticalCount} Critical Items</p>
                  <p className="text-xs text-red-700">Immediate restocking required</p>
                </div>
              </div>
            </div>
          )}
          {lowCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <BiTrendingDown className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">{lowCount} Low Stock Items</p>
                  <p className="text-xs text-yellow-700">Consider restocking soon</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inventory List */}
      <div className="space-y-3">
        {filteredInventory.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <BiPackage className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{item.productName}</h4>
                  <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Current Stock</p>
                  <p className="text-lg font-semibold text-gray-900">{item.currentStock} units</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Days Until Stockout</p>
                  <p className={`text-lg font-semibold ${item.daysUntilStockout < 7 ? 'text-red-600' : 'text-gray-900'}`}>
                    {item.daysUntilStockout} days
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Sales Velocity</p>
                  <p className="text-sm font-medium text-gray-900">{item.salesVelocity} units/day</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                  <button className="px-3 py-1 text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-shadow">
                    Restock
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <BiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-500">No inventory alerts at this time</p>
          <p className="text-sm text-gray-400 mt-1">All items are well-stocked</p>
        </div>
      )}
    </div>
  );
}