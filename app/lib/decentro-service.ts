// Decentro API Service - Can switch between emulator and real API
const DECENTRO_API_BASE = process.env.DECENTRO_API_URL || '/api/emulated/decentro';
const DECENTRO_API_KEY = process.env.DECENTRO_API_KEY || 'emulated';
const DECENTRO_API_SECRET = process.env.DECENTRO_API_SECRET || 'emulated';

export interface DecentroConfig {
  useEmulator?: boolean;
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
}

export class DecentroService {
  private baseUrl: string;
  private apiKey: string;
  private apiSecret: string;

  constructor(config?: DecentroConfig) {
    this.baseUrl = config?.baseUrl || DECENTRO_API_BASE;
    this.apiKey = config?.apiKey || DECENTRO_API_KEY;
    this.apiSecret = config?.apiSecret || DECENTRO_API_SECRET;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'x-api-secret': this.apiSecret,
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`Decentro API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Virtual Account APIs
  async createVirtualAccount(params: {
    customer_id: string;
    purpose?: string;
    metadata?: Record<string, any>;
  }) {
    return this.request('/v2/banking/account/virtual', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async getAccountBalance(virtualAccountId: string) {
    return this.request(`/v2/banking/account/virtual/balance?virtual_account_id=${virtualAccountId}`);
  }

  // Payment APIs
  async generateUpiLink(params: {
    amount: number;
    currency?: string;
    purpose: string;
    customer_id: string;
    expires_in?: number;
  }) {
    return this.request('/v2/payments/upi/link', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async getTransactionStatus(transactionId: string) {
    return this.request(`/v2/payments/transaction/status?transaction_id=${transactionId}`);
  }

  async verifyUpiPayment(utrNumber: string) {
    return this.request('/v2/payments/upi/verify', {
      method: 'POST',
      body: JSON.stringify({ utr_number: utrNumber })
    });
  }

  // Emulator-specific: Simulate payment
  async simulatePayment(params: {
    account_id?: string;
    amount: number;
    payment_method: 'upi' | 'bank_transfer' | 'card';
    webhook_url?: string;
    link_id?: string;
    metadata?: Record<string, any>;
  }) {
    if (!this.baseUrl.includes('emulated')) {
      throw new Error('simulatePayment is only available in emulator mode');
    }
    
    return this.request('/simulate-payment', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
}

// Export singleton instance for convenience
export const decentroService = new DecentroService();

// Helper functions for common operations
export async function createPaymentForOrder(orderId: string, amount: number, customerId: string) {
  // Create virtual account
  const accountResponse = await decentroService.createVirtualAccount({
    customer_id: customerId,
    purpose: `Order ${orderId}`,
    metadata: { order_id: orderId }
  });

  // Generate UPI payment link
  const linkResponse = await decentroService.generateUpiLink({
    amount,
    purpose: `Payment for order ${orderId}`,
    customer_id: customerId,
    expires_in: 30 // 30 minutes
  });

  return {
    account: accountResponse.data,
    paymentLink: linkResponse.data
  };
}

export async function checkPaymentStatus(transactionId: string) {
  const response = await decentroService.getTransactionStatus(transactionId);
  return response.data;
}

export async function verifyPayment(utrNumber: string) {
  const response = await decentroService.verifyUpiPayment(utrNumber);
  return response.data;
}