import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/lib/auth';

interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage: number;
    cores: number;
    temperature?: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    errors: number;
  };
  services: {
    name: string;
    status: 'running' | 'stopped' | 'error';
    uptime: number;
    responseTime: number;
    errorRate: number;
  }[];
  alerts: {
    type: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: string;
  }[];
}

// Generate mock system metrics
const generateSystemMetrics = (): SystemMetrics => {
  const now = new Date();
  
  const metrics: SystemMetrics = {
    timestamp: now.toISOString(),
    cpu: {
      usage: Math.floor(Math.random() * 30) + 40, // 40-70%
      cores: 8,
      temperature: Math.floor(Math.random() * 20) + 60, // 60-80°C
    },
    memory: {
      total: 16384, // 16GB in MB
      used: Math.floor(Math.random() * 4096) + 8192, // 8-12GB
      free: 0, // Will calculate
      percentage: 0, // Will calculate
    },
    disk: {
      total: 512000, // 500GB in MB
      used: Math.floor(Math.random() * 102400) + 307200, // 300-400GB
      free: 0, // Will calculate
      percentage: 0, // Will calculate
    },
    network: {
      bytesIn: Math.floor(Math.random() * 1000000000),
      bytesOut: Math.floor(Math.random() * 1000000000),
      packetsIn: Math.floor(Math.random() * 1000000),
      packetsOut: Math.floor(Math.random() * 1000000),
      errors: Math.floor(Math.random() * 10),
    },
    services: [
      {
        name: 'API Server',
        status: 'running',
        uptime: 864000, // 10 days in seconds
        responseTime: Math.floor(Math.random() * 50) + 100, // 100-150ms
        errorRate: Math.random() * 0.5, // 0-0.5%
      },
      {
        name: 'Database',
        status: 'running',
        uptime: 864000,
        responseTime: Math.floor(Math.random() * 20) + 30, // 30-50ms
        errorRate: Math.random() * 0.1, // 0-0.1%
      },
      {
        name: 'Redis Cache',
        status: 'running',
        uptime: 432000, // 5 days
        responseTime: Math.floor(Math.random() * 5) + 5, // 5-10ms
        errorRate: 0,
      },
      {
        name: 'WhatsApp Service',
        status: 'running',
        uptime: 259200, // 3 days
        responseTime: Math.floor(Math.random() * 100) + 200, // 200-300ms
        errorRate: Math.random() * 2, // 0-2%
      },
      {
        name: 'Payment Gateway',
        status: Math.random() > 0.9 ? 'error' : 'running',
        uptime: 172800, // 2 days
        responseTime: Math.floor(Math.random() * 200) + 300, // 300-500ms
        errorRate: Math.random() * 1, // 0-1%
      },
      {
        name: 'Image Processing',
        status: 'running',
        uptime: 604800, // 7 days
        responseTime: Math.floor(Math.random() * 500) + 500, // 500-1000ms
        errorRate: Math.random() * 0.5, // 0-0.5%
      },
    ],
    alerts: [],
  };
  
  // Calculate percentages
  metrics.memory.free = metrics.memory.total - metrics.memory.used;
  metrics.memory.percentage = (metrics.memory.used / metrics.memory.total) * 100;
  metrics.disk.free = metrics.disk.total - metrics.disk.used;
  metrics.disk.percentage = (metrics.disk.used / metrics.disk.total) * 100;
  
  // Generate alerts based on metrics
  if (metrics.cpu.usage > 80) {
    metrics.alerts.push({
      type: 'cpu',
      severity: 'warning',
      message: 'High CPU usage detected',
      timestamp: now.toISOString(),
    });
  }
  
  if (metrics.memory.percentage > 90) {
    metrics.alerts.push({
      type: 'memory',
      severity: 'critical',
      message: 'Memory usage critical',
      timestamp: now.toISOString(),
    });
  }
  
  if (metrics.disk.percentage > 85) {
    metrics.alerts.push({
      type: 'disk',
      severity: 'warning',
      message: 'Disk space running low',
      timestamp: now.toISOString(),
    });
  }
  
  metrics.services.forEach(service => {
    if (service.status === 'error') {
      metrics.alerts.push({
        type: 'service',
        severity: 'error',
        message: `${service.name} is down`,
        timestamp: now.toISOString(),
      });
    } else if (service.errorRate > 1) {
      metrics.alerts.push({
        type: 'service',
        severity: 'warning',
        message: `High error rate on ${service.name}`,
        timestamp: now.toISOString(),
      });
    }
  });
  
  return metrics;
};

// Generate historical data
const generateHistoricalData = (hours: number) => {
  const data = [];
  const now = Date.now();
  
  for (let i = hours - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * 3600000);
    data.push({
      timestamp: timestamp.toISOString(),
      cpu: Math.floor(Math.random() * 30) + 40,
      memory: Math.floor(Math.random() * 20) + 60,
      requests: Math.floor(Math.random() * 1000) + 500,
      responseTime: Math.floor(Math.random() * 50) + 100,
      errorRate: Math.random() * 2,
    });
  }
  
  return data;
};

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user || user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const timeRange = searchParams.get('timeRange') || '24h';

    if (type === 'current') {
      // Return current system metrics
      const metrics = generateSystemMetrics();
      return NextResponse.json({ data: metrics });
    } else if (type === 'historical') {
      // Return historical data
      const hours = timeRange === '7d' ? 168 : timeRange === '30d' ? 720 : 24;
      const historicalData = generateHistoricalData(hours);
      return NextResponse.json({ data: historicalData });
    } else {
      // Return both current and summary
      const metrics = generateSystemMetrics();
      const summary = {
        uptime: 99.9,
        totalRequests: Math.floor(Math.random() * 1000000) + 5000000,
        averageResponseTime: 123,
        errorRate: 0.1,
        activeConnections: Math.floor(Math.random() * 500) + 200,
        queueSize: Math.floor(Math.random() * 50),
      };
      
      return NextResponse.json({ 
        current: metrics,
        summary,
        historical: generateHistoricalData(24),
      });
    }
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user || user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, service } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'restart':
        if (!service) {
          return NextResponse.json(
            { error: 'Missing service name' },
            { status: 400 }
          );
        }
        
        // Simulate service restart
        console.log(`Restarting service: ${service}`);
        
        return NextResponse.json({ 
          success: true,
          message: `Service ${service} is being restarted`
        });
        
      case 'clear-cache':
        // Simulate cache clearing
        console.log('Clearing system cache');
        
        return NextResponse.json({ 
          success: true,
          message: 'Cache cleared successfully'
        });
        
      case 'run-diagnostics':
        // Simulate running diagnostics
        console.log('Running system diagnostics');
        
        return NextResponse.json({ 
          success: true,
          message: 'Diagnostics started',
          jobId: Date.now().toString()
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error performing system action:', error);
    return NextResponse.json(
      { error: 'Failed to perform system action' },
      { status: 500 }
    );
  }
}