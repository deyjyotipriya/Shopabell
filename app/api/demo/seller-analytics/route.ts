import { NextResponse } from 'next/server';

const demoAnalytics = {
  metrics: {
    totalRevenue: 125600,
    totalOrders: 342,
    productCount: 48,
    customerCount: 287,
    conversionRate: 12.4,
    avgOrderValue: 1850
  },
  revenueData: [
    { date: '2024-01-01', revenue: 8500, orders: 15 },
    { date: '2024-01-02', revenue: 12300, orders: 22 },
    { date: '2024-01-03', revenue: 9800, orders: 18 },
    { date: '2024-01-04', revenue: 15600, orders: 28 },
    { date: '2024-01-05', revenue: 11200, orders: 20 },
    { date: '2024-01-06', revenue: 18400, orders: 32 },
    { date: '2024-01-07', revenue: 13900, orders: 25 }
  ],
  topProducts: [
    { name: 'Banarasi Silk Saree', sales: 45, revenue: 112455 },
    { name: 'Designer Lehenga Choli', sales: 32, revenue: 159968 },
    { name: 'Cotton Anarkali Set', sales: 67, revenue: 60233 },
    { name: 'Embroidered Kurta', sales: 89, revenue: 62211 }
  ],
  recentOrders: [
    {
      id: 'ORD001',
      customer: 'Priya Sharma',
      product: 'Banarasi Silk Saree - Red',
      amount: 2499,
      status: 'Delivered',
      date: '2024-01-07',
      location: 'Mumbai, Maharashtra'
    },
    {
      id: 'ORD002', 
      customer: 'Anita Patel',
      product: 'Designer Lehenga - Pink',
      amount: 4999,
      status: 'Shipped',
      date: '2024-01-07',
      location: 'Ahmedabad, Gujarat'
    },
    {
      id: 'ORD003',
      customer: 'Sneha Reddy',
      product: 'Cotton Kurti Set - Blue',
      amount: 899,
      status: 'Processing',
      date: '2024-01-06',
      location: 'Hyderabad, Telangana'
    },
    {
      id: 'ORD004',
      customer: 'Kavya Nair',
      product: 'Sharara Set - Magenta',
      amount: 1899,
      status: 'Confirmed',
      date: '2024-01-06',
      location: 'Kochi, Kerala'
    }
  ],
  categories: [
    { name: 'Sarees', count: 12, revenue: 45600 },
    { name: 'Kurtis', count: 18, revenue: 38900 },
    { name: 'Lehengas', count: 8, revenue: 28400 },
    { name: 'Sets', count: 10, revenue: 12700 }
  ]
};

export async function GET() {
  return NextResponse.json({
    success: true,
    ...demoAnalytics
  });
}