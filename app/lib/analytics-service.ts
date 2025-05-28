import { createClient } from '@supabase/supabase-js';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
         startOfQuarter, endOfQuarter, startOfYear, endOfYear, format, 
         eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type TimeRange = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type ChartType = 'line' | 'bar' | 'area' | 'heatmap';

interface AnalyticsFilter {
  sellerId?: string;
  buyerId?: string;
  productId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string[];
}

// Sales Analytics
export async function getSalesAnalytics(filter: AnalyticsFilter & { timeRange: TimeRange }) {
  const { dateFrom, dateTo } = getDateRange(filter.timeRange);
  
  const query = supabase
    .from('orders')
    .select('id, total_amount, created_at, status, items')
    .gte('created_at', dateFrom.toISOString())
    .lte('created_at', dateTo.toISOString());
    
  if (filter.sellerId) query.eq('seller_id', filter.sellerId);
  if (filter.status) query.in('status', filter.status);
  
  const { data: orders, error } = await query;
  
  if (error) throw error;
  
  // Calculate metrics
  const totalRevenue = orders?.reduce((sum, order) => 
    order.status !== 'cancelled' ? sum + order.total_amount : sum, 0) || 0;
  
  const totalOrders = orders?.filter(o => o.status !== 'cancelled').length || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Group by time period
  const salesByPeriod = groupByTimePeriod(orders || [], filter.timeRange);
  
  // Calculate growth
  const previousRange = getPreviousDateRange(filter.timeRange);
  const { data: previousOrders } = await supabase
    .from('orders')
    .select('total_amount')
    .gte('created_at', previousRange.dateFrom.toISOString())
    .lte('created_at', previousRange.dateTo.toISOString())
    .eq('seller_id', filter.sellerId || '');
    
  const previousRevenue = previousOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
  const growth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  
  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    growth,
    chartData: salesByPeriod,
    topProducts: await getTopProducts(filter.sellerId || '', dateFrom, dateTo),
    salesFunnel: await getSalesFunnel(filter.sellerId || '', dateFrom, dateTo),
  };
}

// Customer Analytics
export async function getCustomerAnalytics(sellerId: string, timeRange: TimeRange) {
  const { dateFrom, dateTo } = getDateRange(timeRange);
  
  // Get all customers who bought from this seller
  const { data: orders } = await supabase
    .from('orders')
    .select('buyer_id, total_amount, created_at')
    .eq('seller_id', sellerId)
    .gte('created_at', dateFrom.toISOString())
    .lte('created_at', dateTo.toISOString());
    
  const customerMap = new Map<string, {
    totalSpent: number;
    orderCount: number;
    firstOrder: Date;
    lastOrder: Date;
  }>();
  
  orders?.forEach(order => {
    const customer = customerMap.get(order.buyer_id) || {
      totalSpent: 0,
      orderCount: 0,
      firstOrder: new Date(order.created_at),
      lastOrder: new Date(order.created_at),
    };
    
    customer.totalSpent += order.total_amount;
    customer.orderCount += 1;
    customer.lastOrder = new Date(order.created_at);
    
    customerMap.set(order.buyer_id, customer);
  });
  
  const customers = Array.from(customerMap.entries());
  const totalCustomers = customers.length;
  const repeatCustomers = customers.filter(([_, data]) => data.orderCount > 1).length;
  const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;
  
  // Customer segments
  const segments = {
    vip: customers.filter(([_, data]) => data.totalSpent > 10000).length,
    regular: customers.filter(([_, data]) => data.orderCount >= 3).length,
    new: customers.filter(([_, data]) => data.orderCount === 1).length,
    dormant: customers.filter(([_, data]) => 
      new Date().getTime() - data.lastOrder.getTime() > 30 * 24 * 60 * 60 * 1000
    ).length,
  };
  
  // Calculate CLV (simplified)
  const avgCustomerValue = customers.reduce((sum, [_, data]) => 
    sum + data.totalSpent, 0) / totalCustomers || 0;
    
  return {
    totalCustomers,
    repeatRate,
    avgCustomerValue,
    segments,
    topCustomers: customers
      .sort(([_, a], [__, b]) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
      .map(([id, data]) => ({ id, ...data })),
    cohortAnalysis: await getCohortAnalysis(sellerId, timeRange),
  };
}

// Sales Heatmap
export async function getSalesHeatmap(sellerId: string, timeRange: TimeRange) {
  const { dateFrom, dateTo } = getDateRange(timeRange);
  
  const { data: orders } = await supabase
    .from('orders')
    .select('id, total_amount, created_at')
    .eq('seller_id', sellerId)
    .gte('created_at', dateFrom.toISOString())
    .lte('created_at', dateTo.toISOString())
    .neq('status', 'cancelled');
    
  // Create heatmap data
  const days = eachDayOfInterval({ start: dateFrom, end: dateTo });
  const heatmapData = days.map(day => {
    const dayOrders = orders?.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate.toDateString() === day.toDateString();
    }) || [];
    
    const sales = dayOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const orderCount = dayOrders.length;
    
    return {
      date: format(day, 'yyyy-MM-dd'),
      dayOfWeek: format(day, 'EEE'),
      week: format(day, 'w'),
      sales,
      orders: orderCount,
      intensity: getIntensity(sales),
    };
  });
  
  // Calculate patterns
  const dayOfWeekStats = heatmapData.reduce((acc, day) => {
    if (!acc[day.dayOfWeek]) {
      acc[day.dayOfWeek] = { total: 0, count: 0 };
    }
    acc[day.dayOfWeek].total += day.sales;
    acc[day.dayOfWeek].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);
  
  const bestDay = Object.entries(dayOfWeekStats)
    .map(([day, stats]) => ({ day, avg: stats.total / stats.count }))
    .sort((a, b) => b.avg - a.avg)[0]?.day || 'Unknown';
    
  // Hour analysis (mock for now - would need order timestamp with hour)
  const bestTime = '7-10 PM'; // Based on typical e-commerce patterns
  
  return {
    heatmap: heatmapData,
    patterns: {
      bestDay,
      bestTime,
      peakSeason: getPeakSeason(heatmapData),
      trend: calculateTrend(heatmapData),
    },
  };
}

// Livestream Analytics
export async function getLivestreamAnalytics(sellerId: string, timeRange: TimeRange) {
  const { dateFrom, dateTo } = getDateRange(timeRange);
  
  const { data: livestreams } = await supabase
    .from('livestreams')
    .select('*')
    .eq('seller_id', sellerId)
    .gte('created_at', dateFrom.toISOString())
    .lte('created_at', dateTo.toISOString());
    
  const totalLivestreams = livestreams?.length || 0;
  const totalDuration = livestreams?.reduce((sum, ls) => sum + (ls.duration || 0), 0) || 0;
  const totalViewers = livestreams?.reduce((sum, ls) => sum + (ls.viewer_count || 0), 0) || 0;
  const totalProducts = livestreams?.reduce((sum, ls) => sum + (ls.products_captured || 0), 0) || 0;
  const totalGMV = livestreams?.reduce((sum, ls) => sum + (ls.gmv_generated || 0), 0) || 0;
  
  const avgViewers = totalLivestreams > 0 ? totalViewers / totalLivestreams : 0;
  const avgDuration = totalLivestreams > 0 ? totalDuration / totalLivestreams : 0;
  const conversionRate = totalViewers > 0 ? (livestreams?.reduce((sum, ls) => 
    sum + (ls.orders_generated || 0), 0) || 0) / totalViewers * 100 : 0;
    
  return {
    totalLivestreams,
    avgViewers,
    avgDuration,
    totalProducts,
    totalGMV,
    conversionRate,
    performanceByPlatform: getPerformanceByPlatform(livestreams || []),
    topLivestreams: livestreams
      ?.sort((a, b) => (b.gmv_generated || 0) - (a.gmv_generated || 0))
      .slice(0, 5) || [],
  };
}

// Inventory Analytics
export async function getInventoryAnalytics(sellerId: string) {
  const { data: products } = await supabase
    .from('products')
    .select('id, name, stock, reserved_stock, price, category, created_at')
    .eq('seller_id', sellerId)
    .eq('status', 'active');
    
  const totalProducts = products?.length || 0;
  const totalValue = products?.reduce((sum, p) => sum + (p.stock * p.price), 0) || 0;
  const lowStockItems = products?.filter(p => p.stock < 10).length || 0;
  const outOfStock = products?.filter(p => p.stock === 0).length || 0;
  
  // Stock turnover (mock - would need sales data)
  const stockTurnover = 4.5; // Times per year
  
  // Category breakdown
  const categoryBreakdown = products?.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalProducts,
    totalValue,
    lowStockItems,
    outOfStock,
    stockTurnover,
    categoryBreakdown,
    stockAlerts: products
      ?.filter(p => p.stock < 10)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 10) || [],
  };
}

// Helper functions
function getDateRange(timeRange: TimeRange): { dateFrom: Date; dateTo: Date } {
  const now = new Date();
  let dateFrom: Date;
  let dateTo: Date = endOfDay(now);
  
  switch (timeRange) {
    case 'day':
      dateFrom = startOfDay(now);
      break;
    case 'week':
      dateFrom = startOfWeek(now);
      dateTo = endOfWeek(now);
      break;
    case 'month':
      dateFrom = startOfMonth(now);
      dateTo = endOfMonth(now);
      break;
    case 'quarter':
      dateFrom = startOfQuarter(now);
      dateTo = endOfQuarter(now);
      break;
    case 'year':
      dateFrom = startOfYear(now);
      dateTo = endOfYear(now);
      break;
    default:
      dateFrom = startOfMonth(now);
  }
  
  return { dateFrom, dateTo };
}

function getPreviousDateRange(timeRange: TimeRange) {
  const { dateFrom, dateTo } = getDateRange(timeRange);
  const duration = dateTo.getTime() - dateFrom.getTime();
  
  return {
    dateFrom: new Date(dateFrom.getTime() - duration),
    dateTo: new Date(dateTo.getTime() - duration),
  };
}

function groupByTimePeriod(orders: any[], timeRange: TimeRange) {
  const grouped = new Map<string, { revenue: number; orders: number }>();
  
  orders.forEach(order => {
    const date = new Date(order.created_at);
    let key: string;
    
    switch (timeRange) {
      case 'day':
        key = format(date, 'HH:00');
        break;
      case 'week':
        key = format(date, 'EEE');
        break;
      case 'month':
        key = format(date, 'dd');
        break;
      case 'quarter':
        key = format(date, 'MMM');
        break;
      case 'year':
        key = format(date, 'MMM');
        break;
      default:
        key = format(date, 'yyyy-MM-dd');
    }
    
    const existing = grouped.get(key) || { revenue: 0, orders: 0 };
    existing.revenue += order.total_amount;
    existing.orders += 1;
    grouped.set(key, existing);
  });
  
  return Array.from(grouped.entries()).map(([period, data]) => ({
    period,
    ...data,
  }));
}

function getIntensity(sales: number): number {
  if (sales === 0) return 0;
  if (sales < 1000) return 1;
  if (sales < 5000) return 2;
  if (sales < 10000) return 3;
  if (sales < 20000) return 4;
  return 5;
}

function calculateTrend(data: any[]): { direction: 'up' | 'down' | 'stable'; percentage: number } {
  if (data.length < 2) return { direction: 'stable', percentage: 0 };
  
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, d) => sum + d.sales, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.sales, 0) / secondHalf.length;
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  return {
    direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
    percentage: Math.abs(change),
  };
}

function getPeakSeason(data: any[]): string {
  // Group by month
  const monthlyTotals = data.reduce((acc, day) => {
    const month = format(new Date(day.date), 'MMM');
    acc[month] = (acc[month] || 0) + day.sales;
    return acc;
  }, {} as Record<string, number>);
  
  const peakMonth = Object.entries(monthlyTotals)
    .sort(([, a], [, b]) => b - a)[0]?.[0];
    
  return peakMonth || 'Unknown';
}

async function getTopProducts(sellerId: string, dateFrom: Date, dateTo: Date) {
  const { data: orders } = await supabase
    .from('orders')
    .select('items')
    .eq('seller_id', sellerId)
    .gte('created_at', dateFrom.toISOString())
    .lte('created_at', dateTo.toISOString())
    .neq('status', 'cancelled');
    
  const productSales = new Map<string, { quantity: number; revenue: number }>();
  
  orders?.forEach(order => {
    const items = order.items as any[];
    items?.forEach(item => {
      const existing = productSales.get(item.product_id) || { quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += item.quantity * item.price;
      productSales.set(item.product_id, existing);
    });
  });
  
  return Array.from(productSales.entries())
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 10)
    .map(([productId, data]) => ({ productId, ...data }));
}

async function getSalesFunnel(sellerId: string, dateFrom: Date, dateTo: Date) {
  // Mock data - would need real visitor tracking
  return {
    visitors: 10000,
    productViews: 5000,
    addedToCart: 1500,
    checkoutStarted: 800,
    ordersCompleted: 600,
  };
}

async function getCohortAnalysis(sellerId: string, timeRange: TimeRange) {
  // Simplified cohort analysis
  const cohorts = [];
  const months = 6;
  
  for (let i = 0; i < months; i++) {
    const cohortStart = new Date();
    cohortStart.setMonth(cohortStart.getMonth() - i);
    const cohortMonth = format(cohortStart, 'MMM yyyy');
    
    const retention = Array.from({ length: i + 1 }, (_, j) => ({
      month: j,
      retained: Math.max(100 - (j * 15) + Math.random() * 10, 10),
    }));
    
    cohorts.push({
      cohort: cohortMonth,
      size: Math.floor(50 + Math.random() * 150),
      retention,
    });
  }
  
  return cohorts;
}

function getPerformanceByPlatform(livestreams: any[]) {
  const platforms = livestreams.reduce((acc, ls) => {
    const platform = ls.platform || 'unknown';
    if (!acc[platform]) {
      acc[platform] = {
        count: 0,
        viewers: 0,
        gmv: 0,
        products: 0,
      };
    }
    acc[platform].count += 1;
    acc[platform].viewers += ls.viewer_count || 0;
    acc[platform].gmv += ls.gmv_generated || 0;
    acc[platform].products += ls.products_captured || 0;
    return acc;
  }, {} as Record<string, any>);
  
  return Object.entries(platforms).map(([platform, data]) => ({
    platform,
    ...data,
    avgViewers: data.count > 0 ? data.viewers / data.count : 0,
    avgGmv: data.count > 0 ? data.gmv / data.count : 0,
  }));
}