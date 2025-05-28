'use client';

import { useState, useEffect } from 'react';
import { BiVideo, BiUser, BiDollar, BiTime, BiTrendingUp } from 'react-icons/bi';

interface LivestreamData {
  id: string;
  title: string;
  date: string;
  viewers: number;
  peakViewers: number;
  sales: number;
  revenue: number;
  duration: string;
  conversionRate: number;
  engagementRate: number;
  thumbnail?: string;
}

export default function LivestreamStats() {
  const [livestreams, setLivestreams] = useState<LivestreamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    fetchLivestreamData();
  }, [timeRange]);

  const fetchLivestreamData = async () => {
    try {
      const response = await fetch(`/api/seller/analytics/livestreams?range=${timeRange}`);
      if (response.ok) {
        const result = await response.json();
        setLivestreams(result.livestreams);
      }
    } catch (error) {
      console.error('Failed to fetch livestream data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalRevenue = livestreams.reduce((sum, stream) => sum + stream.revenue, 0);
  const totalViewers = livestreams.reduce((sum, stream) => sum + stream.viewers, 0);
  const avgConversionRate = livestreams.length > 0 
    ? livestreams.reduce((sum, stream) => sum + stream.conversionRate, 0) / livestreams.length 
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Livestream Performance</h3>
          <p className="text-sm text-gray-500 mt-1">Track your livestream metrics and engagement</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === 'all' ? 'All Time' : range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-medium">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900 mt-1">${totalRevenue.toLocaleString()}</p>
            </div>
            <BiDollar className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium">Total Viewers</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{totalViewers.toLocaleString()}</p>
            </div>
            <BiUser className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-medium">Avg Conversion</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{avgConversionRate.toFixed(1)}%</p>
            </div>
            <BiTrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Livestream List */}
      <div className="space-y-4">
        {livestreams.map((stream) => (
          <div key={stream.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BiVideo className="w-5 h-5 text-purple-600" />
                  <h4 className="font-medium text-gray-900">{stream.title}</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm font-semibold text-gray-900">{stream.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Viewers</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {stream.viewers.toLocaleString()}
                      <span className="text-xs text-gray-500 ml-1">(Peak: {stream.peakViewers.toLocaleString()})</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="text-sm font-semibold text-green-600">${stream.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                      <BiTime className="w-4 h-4" />
                      {stream.duration}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Conversion</p>
                    <p className="text-sm font-semibold text-purple-600">{stream.conversionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
              <button className="ml-4 text-purple-600 hover:text-purple-700 text-sm font-medium">
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>

      {livestreams.length === 0 && (
        <div className="text-center py-12">
          <BiVideo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No livestreams found for this period</p>
          <button className="mt-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow">
            Start Your First Livestream
          </button>
        </div>
      )}
    </div>
  );
}