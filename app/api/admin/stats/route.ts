import { NextResponse } from 'next/server';

const demoAdminStats = {
  metrics: {
    totalSellers: 1247,
    activeSellers: 892,
    totalRevenue: 2456780,
    totalCommission: 245678,
    totalOrders: 8945,
    conversionRate: 8.7
  },
  earnings: [
    { date: '2024-01-01', commission: 12500, sellers: 45 },
    { date: '2024-01-02', commission: 18900, sellers: 52 },
    { date: '2024-01-03', commission: 15600, sellers: 48 },
    { date: '2024-01-04', commission: 22400, sellers: 61 },
    { date: '2024-01-05', commission: 19800, sellers: 55 },
    { date: '2024-01-06', commission: 25600, sellers: 68 },
    { date: '2024-01-07', commission: 21300, sellers: 58 }
  ],
  topSellers: [
    { 
      name: 'Rajesh Fashion Hub',
      category: 'Sarees & Lehengas',
      revenue: 89500,
      commission: 8950,
      orders: 156,
      location: 'Surat, Gujarat'
    },
    {
      name: 'Priya Ethnic Wear',
      category: 'Kurtis & Sets', 
      revenue: 67300,
      commission: 6730,
      orders: 134,
      location: 'Jaipur, Rajasthan'
    },
    {
      name: 'Mumbai Fashion House',
      category: 'Designer Wear',
      revenue: 125600,
      commission: 12560,
      orders: 89,
      location: 'Mumbai, Maharashtra'
    },
    {
      name: 'Chennai Silk Palace',
      category: 'Silk Sarees',
      revenue: 156700,
      commission: 15670,
      orders: 78,
      location: 'Chennai, Tamil Nadu'
    }
  ]
};

export async function GET() {
  return NextResponse.json({
    success: true,
    ...demoAdminStats
  });
}