import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: ReactNode;
}

export default function MetricCard({ title, value, change, icon }: MetricCardProps) {
  const isPositive = change && change > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {change !== undefined && (
            <p className={`text-sm mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-3 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}