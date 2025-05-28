'use client';

import { useState, useEffect } from 'react';
import { BiCalendar, BiTrendingUp, BiInfoCircle } from 'react-icons/bi';

interface HeatmapData {
  date: string;
  day: string;
  week: number;
  sales: number;
  orders: number;
  intensity: number; // 0-4 scale
}

interface SalesPattern {
  bestDay: string;
  bestTime: string;
  peakSeason: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export default function SalesHeatmap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [patterns, setPatterns] = useState<SalesPattern | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'quarter' | 'year'>('quarter');
  const [hoveredCell, setHoveredCell] = useState<HeatmapData | null>(null);

  useEffect(() => {
    fetchSalesData();
  }, [view]);

  const fetchSalesData = async () => {
    try {
      const response = await fetch(`/api/seller/analytics/sales-heatmap?view=${view}`);
      if (response.ok) {
        const result = await response.json();
        setHeatmapData(result.heatmap);
        setPatterns(result.patterns);
      }
    } catch (error) {
      console.error('Failed to fetch sales heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIntensityColor = (intensity: number) => {
    const colors = [
      'bg-gray-100',
      'bg-purple-200',
      'bg-purple-300',
      'bg-purple-400',
      'bg-purple-500',
      'bg-purple-600',
    ];
    return colors[intensity] || colors[0];
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  // Group data by weeks
  const weeks: HeatmapData[][] = [];
  let currentWeek: HeatmapData[] = [];
  
  heatmapData.forEach((data, index) => {
    currentWeek.push(data);
    if (currentWeek.length === 7 || index === heatmapData.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sales Heatmap</h3>
          <p className="text-sm text-gray-500 mt-1">Visualize your sales patterns and identify trends</p>
        </div>
        <div className="flex gap-2">
          {(['month', 'quarter', 'year'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                view === v
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {v === 'quarter' ? '3 Months' : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {patterns && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
            <p className="text-xs text-purple-600 font-medium">Best Day</p>
            <p className="text-lg font-bold text-gray-900">{patterns.bestDay}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
            <p className="text-xs text-blue-600 font-medium">Peak Time</p>
            <p className="text-lg font-bold text-gray-900">{patterns.bestTime}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
            <p className="text-xs text-green-600 font-medium">Peak Season</p>
            <p className="text-lg font-bold text-gray-900">{patterns.peakSeason}</p>
          </div>
          <div className={`rounded-lg p-3 ${
            patterns.trend === 'up' 
              ? 'bg-gradient-to-br from-emerald-50 to-emerald-100' 
              : patterns.trend === 'down'
              ? 'bg-gradient-to-br from-red-50 to-red-100'
              : 'bg-gradient-to-br from-gray-50 to-gray-100'
          }`}>
            <p className={`text-xs font-medium ${
              patterns.trend === 'up' 
                ? 'text-emerald-600' 
                : patterns.trend === 'down'
                ? 'text-red-600'
                : 'text-gray-600'
            }`}>Sales Trend</p>
            <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
              <BiTrendingUp className={`w-4 h-4 ${
                patterns.trend === 'down' ? 'rotate-180' : ''
              }`} />
              {patterns.trendPercentage}%
            </p>
          </div>
        </div>
      )}

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Day labels */}
          <div className="flex gap-1 mb-2 ml-10">
            {days.map((day) => (
              <div key={day} className="w-8 text-center text-xs text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <div className="flex gap-1">
            {/* Month labels */}
            <div className="flex flex-col gap-1 justify-around mr-2">
              {Array.from(new Set(heatmapData.map(d => {
                const date = new Date(d.date);
                return months[date.getMonth()];
              }))).map((month, index) => (
                <div key={index} className="text-xs text-gray-500 h-8 flex items-center">
                  {month}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className={`w-8 h-8 rounded cursor-pointer transition-all hover:ring-2 hover:ring-purple-400 ${getIntensityColor(day.intensity)}`}
                      onMouseEnter={() => setHoveredCell(day)}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={`${day.date}: $${day.sales.toLocaleString()}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-6">
            <span className="text-xs text-gray-500">Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5].map((intensity) => (
                <div
                  key={intensity}
                  className={`w-4 h-4 rounded ${getIntensityColor(intensity)}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">More</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-start gap-2">
          <BiInfoCircle className="w-4 h-4 text-gray-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-gray-900">{hoveredCell.date}</p>
            <div className="flex gap-4 text-gray-600">
              <span>Sales: ${hoveredCell.sales.toLocaleString()}</span>
              <span>Orders: {hoveredCell.orders}</span>
              <span>Avg Order: ${(hoveredCell.sales / hoveredCell.orders).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="mt-6 p-4 bg-purple-50 rounded-lg">
        <h4 className="text-sm font-medium text-purple-900 mb-2">💡 Sales Insights</h4>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• Your sales peak on {patterns?.bestDay || 'weekends'} - consider scheduling livestreams then</li>
          <li>• {patterns?.bestTime || 'Evening'} shows the highest customer activity</li>
          <li>• Focus inventory management around {patterns?.peakSeason || 'peak seasons'}</li>
        </ul>
      </div>
    </div>
  );
}