import { v4 as uuidv4 } from 'uuid';

interface VirtualAccount {
  id: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  balance: number;
  createdAt: Date;
  metadata?: Record<string, any>;
}

interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  type: 'credit' | 'debit';
  paymentMethod: 'upi' | 'bank_transfer' | 'card';
  utrNumber?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface PaymentLink {
  id: string;
  amount: number;
  currency: string;
  purpose: string;
  upiLink: string;
  qrCode: string;
  expiresAt: Date;
  status: 'active' | 'expired' | 'paid';
  createdAt: Date;
}

export class DecentroEmulator {
  private static instance: DecentroEmulator;
  private virtualAccounts: Map<string, VirtualAccount> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private paymentLinks: Map<string, PaymentLink> = new Map();
  private webhookUrl?: string;

  private constructor() {}

  static getInstance(): DecentroEmulator {
    if (!DecentroEmulator.instance) {
      DecentroEmulator.instance = new DecentroEmulator();
    }
    return DecentroEmulator.instance;
  }

  setWebhookUrl(url: string) {
    this.webhookUrl = url;
  }

  // Generate realistic Indian bank account number
  private generateAccountNumber(): string {
    const prefix = Math.floor(Math.random() * 9000) + 1000;
    const suffix = Math.floor(Math.random() * 90000000) + 10000000;
    return `${prefix}${suffix}`;
  }

  // Generate UPI ID
  private generateUpiId(identifier: string): string {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `${identifier.toLowerCase().replace(/\s+/g, '')}${randomNum}@decentro`;
  }

  // Generate UTR number for transactions
  private generateUtrNumber(): string {
    const bankCode = 'DEC';
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 900000) + 100000;
    return `${bankCode}${date}${random}`;
  }

  // Create virtual account
  async createVirtualAccount(params: {
    customer_id: string;
    purpose?: string;
    metadata?: Record<string, any>;
  }): Promise<VirtualAccount> {
    const account: VirtualAccount = {
      id: uuidv4(),
      accountNumber: this.generateAccountNumber(),
      ifscCode: 'DCTR0001234',
      upiId: this.generateUpiId(params.customer_id),
      balance: 0,
      createdAt: new Date(),
      metadata: params.metadata
    };

    this.virtualAccounts.set(account.id, account);
    return account;
  }

  // Get virtual account details
  getVirtualAccount(accountId: string): VirtualAccount | undefined {
    return this.virtualAccounts.get(accountId);
  }

  // Get account balance
  getAccountBalance(accountId: string): number {
    const account = this.virtualAccounts.get(accountId);
    return account?.balance || 0;
  }

  // Generate payment link
  async generatePaymentLink(params: {
    amount: number;
    currency?: string;
    purpose: string;
    customer_id: string;
    expires_in?: number; // minutes
  }): Promise<PaymentLink> {
    const linkId = uuidv4();
    const expiresIn = params.expires_in || 60; // Default 60 minutes
    
    const paymentLink: PaymentLink = {
      id: linkId,
      amount: params.amount,
      currency: params.currency || 'INR',
      purpose: params.purpose,
      upiLink: `upi://pay?pa=decentro@payu&pn=Decentro&am=${params.amount}&cu=INR&tn=${params.purpose}&tr=${linkId}`,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=decentro@payu&pn=Decentro&am=${params.amount}&cu=INR&tn=${params.purpose}`,
      expiresAt: new Date(Date.now() + expiresIn * 60 * 1000),
      status: 'active',
      createdAt: new Date()
    };

    this.paymentLinks.set(linkId, paymentLink);
    return paymentLink;
  }

  // Simulate payment with configurable success rate
  async simulatePayment(params: {
    accountId?: string;
    amount: number;
    paymentMethod: 'upi' | 'bank_transfer' | 'card';
    linkId?: string;
    metadata?: Record<string, any>;
  }): Promise<Transaction> {
    // Simulate network delay (5-30 seconds)
    const delay = Math.floor(Math.random() * 25000) + 5000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // 95% success rate
    const isSuccess = Math.random() < 0.95;
    
    const transaction: Transaction = {
      id: uuidv4(),
      accountId: params.accountId || 'default',
      amount: params.amount,
      status: isSuccess ? 'success' : 'failed',
      type: 'credit',
      paymentMethod: params.paymentMethod,
      utrNumber: isSuccess ? this.generateUtrNumber() : undefined,
      timestamp: new Date(),
      metadata: params.metadata
    };

    this.transactions.set(transaction.id, transaction);

    // Update account balance if successful
    if (isSuccess && params.accountId) {
      const account = this.virtualAccounts.get(params.accountId);
      if (account) {
        account.balance += params.amount;
      }
    }

    // Update payment link status if provided
    if (params.linkId) {
      const link = this.paymentLinks.get(params.linkId);
      if (link && isSuccess) {
        link.status = 'paid';
      }
    }

    // Simulate webhook callback
    if (this.webhookUrl && isSuccess) {
      this.sendWebhook(transaction);
    }

    return transaction;
  }

  // Get transaction status
  getTransactionStatus(transactionId: string): Transaction | undefined {
    return this.transactions.get(transactionId);
  }

  // Get all transactions for an account
  getAccountTransactions(accountId: string): Transaction[] {
    return Array.from(this.transactions.values())
      .filter(tx => tx.accountId === accountId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Verify UPI payment
  async verifyUpiPayment(utrNumber: string): Promise<Transaction | undefined> {
    return Array.from(this.transactions.values())
      .find(tx => tx.utrNumber === utrNumber && tx.paymentMethod === 'upi');
  }

  // Send webhook notification
  private async sendWebhook(transaction: Transaction) {
    if (!this.webhookUrl) return;

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Decentro-Signature': this.generateWebhookSignature(transaction)
        },
        body: JSON.stringify({
          event: 'payment.success',
          data: {
            transaction_id: transaction.id,
            account_id: transaction.accountId,
            amount: transaction.amount,
            utr_number: transaction.utrNumber,
            payment_method: transaction.paymentMethod,
            timestamp: transaction.timestamp.toISOString(),
            metadata: transaction.metadata
          }
        })
      });
    } catch (error) {
      console.error('Webhook delivery failed:', error);
    }
  }

  // Generate webhook signature
  private generateWebhookSignature(transaction: Transaction): string {
    // Simple signature for emulation
    const data = `${transaction.id}:${transaction.amount}:${transaction.utrNumber}`;
    return Buffer.from(data).toString('base64');
  }

  // Clear all data (for testing)
  clearAll() {
    this.virtualAccounts.clear();
    this.transactions.clear();
    this.paymentLinks.clear();
  }
}

export default DecentroEmulator;