interface CourierRate {
  courier_company_id: string;
  courier_name: string;
  rate: number;
  cod: boolean;
  cod_charges: number;
  min_weight: number;
  estimated_delivery_days: number;
  etd: string;
}

interface TrackingEvent {
  date: string;
  time: string;
  activity: string;
  location: string;
}

interface Order {
  order_id: string;
  order_date: string;
  pickup_location: string;
  channel_id: string;
  comment: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: number;
    discount: number;
    tax: number;
    hsn: string;
  }>;
  payment_method: 'Prepaid' | 'COD';
  shipping_charges: number;
  giftwrap_charges: number;
  transaction_charges: number;
  total_discount: number;
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
  shipment_id?: string;
  awb?: string;
  courier_company_id?: string;
  status?: string;
  tracking_events?: TrackingEvent[];
}

export class ShiprocketEmulator {
  private orders: Map<string, Order> = new Map();
  private tokens: Map<string, { email: string; created: Date }> = new Map();
  private webhookUrl: string | null = null;

  // Authentication
  generateToken(email: string, password: string): { token: string } | null {
    if (!email || !password) return null;
    
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(
      JSON.stringify({ email, timestamp: Date.now() })
    ).toString('base64')}`;
    
    this.tokens.set(token, { email, created: new Date() });
    return { token };
  }

  validateToken(token: string): boolean {
    const tokenData = this.tokens.get(token);
    if (!tokenData) return false;
    
    // Token expires after 10 days
    const expiryTime = 10 * 24 * 60 * 60 * 1000;
    return Date.now() - tokenData.created.getTime() < expiryTime;
  }

  // Order Management
  createOrder(orderData: Partial<Order>): Order {
    const order: Order = {
      order_id: orderData.order_id || `ORD${Date.now()}`,
      order_date: orderData.order_date || new Date().toISOString(),
      pickup_location: orderData.pickup_location || 'Default',
      channel_id: orderData.channel_id || '1',
      comment: orderData.comment || '',
      billing_customer_name: orderData.billing_customer_name || '',
      billing_last_name: orderData.billing_last_name || '',
      billing_address: orderData.billing_address || '',
      billing_city: orderData.billing_city || '',
      billing_pincode: orderData.billing_pincode || '',
      billing_state: orderData.billing_state || '',
      billing_country: orderData.billing_country || 'India',
      billing_email: orderData.billing_email || '',
      billing_phone: orderData.billing_phone || '',
      shipping_is_billing: orderData.shipping_is_billing ?? true,
      order_items: orderData.order_items || [],
      payment_method: orderData.payment_method || 'Prepaid',
      shipping_charges: orderData.shipping_charges || 0,
      giftwrap_charges: orderData.giftwrap_charges || 0,
      transaction_charges: orderData.transaction_charges || 0,
      total_discount: orderData.total_discount || 0,
      sub_total: orderData.sub_total || 0,
      length: orderData.length || 10,
      breadth: orderData.breadth || 10,
      height: orderData.height || 10,
      weight: orderData.weight || 0.5,
      shipment_id: `SHIP${Date.now()}`,
      status: 'NEW',
      tracking_events: []
    };

    this.orders.set(order.order_id, order);
    return order;
  }

  // AWB Generation
  generateAWB(orderId: string, courierCompanyId: string): string | null {
    const order = this.orders.get(orderId);
    if (!order) return null;

    const awb = `${courierCompanyId}${Date.now()}`;
    order.awb = awb;
    order.courier_company_id = courierCompanyId;
    order.status = 'AWB_ASSIGNED';
    
    // Initialize tracking
    this.addTrackingEvent(orderId, 'AWB Assigned', 'Warehouse');
    
    return awb;
  }

  // Rate Calculation
  calculateRates(pickup: string, delivery: string, weight: number, cod: boolean): CourierRate[] {
    const baseRate = 45; // Actual cost
    const sellerRate = 70; // What we charge
    
    // Zone-based pricing multipliers
    const zoneMultipliers: { [key: string]: number } = {
      'same_city': 1.0,
      'same_state': 1.2,
      'metro': 1.3,
      'rest_of_india': 1.5,
      'special_zone': 2.0
    };

    const zone = this.getZone(pickup, delivery);
    const multiplier = zoneMultipliers[zone] || 1.5;

    const couriers = [
      {
        courier_company_id: '1',
        courier_name: 'Bluedart',
        base_rate: sellerRate * multiplier,
        cod_available: true,
        cod_charge_percent: 2,
        delivery_days: zone === 'same_city' ? 1 : zone === 'same_state' ? 2 : 3
      },
      {
        courier_company_id: '2',
        courier_name: 'Delhivery',
        base_rate: sellerRate * multiplier * 0.95,
        cod_available: true,
        cod_charge_percent: 2.5,
        delivery_days: zone === 'same_city' ? 1 : zone === 'same_state' ? 3 : 4
      },
      {
        courier_company_id: '3',
        courier_name: 'Ecom Express',
        base_rate: sellerRate * multiplier * 0.9,
        cod_available: true,
        cod_charge_percent: 3,
        delivery_days: zone === 'same_city' ? 2 : zone === 'same_state' ? 3 : 5
      },
      {
        courier_company_id: '4',
        courier_name: 'DTDC',
        base_rate: sellerRate * multiplier * 0.85,
        cod_available: false,
        cod_charge_percent: 0,
        delivery_days: zone === 'same_city' ? 2 : zone === 'same_state' ? 4 : 6
      }
    ];

    return couriers
      .filter(c => !cod || c.cod_available)
      .map(c => ({
        courier_company_id: c.courier_company_id,
        courier_name: c.courier_name,
        rate: Math.round(c.base_rate + (weight > 0.5 ? (weight - 0.5) * 40 : 0)),
        cod: c.cod_available,
        cod_charges: cod && c.cod_available ? Math.round(sellerRate * c.cod_charge_percent / 100) : 0,
        min_weight: 0.5,
        estimated_delivery_days: c.delivery_days,
        etd: new Date(Date.now() + c.delivery_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }))
      .sort((a, b) => a.rate - b.rate);
  }

  private getZone(pickup: string, delivery: string): string {
    // Simplified zone detection based on pincodes
    const pickupZone = pickup.substring(0, 2);
    const deliveryZone = delivery.substring(0, 2);
    
    if (pickupZone === deliveryZone) return 'same_city';
    if (pickup.substring(0, 1) === delivery.substring(0, 1)) return 'same_state';
    
    const metros = ['11', '40', '56', '60', '70']; // Delhi, Mumbai, Bangalore, Chennai, Kolkata
    if (metros.includes(deliveryZone)) return 'metro';
    
    const specialZones = ['19', '67']; // J&K, Northeast
    if (specialZones.includes(deliveryZone)) return 'special_zone';
    
    return 'rest_of_india';
  }

  // Tracking
  trackShipment(awb: string): any {
    const order = Array.from(this.orders.values()).find(o => o.awb === awb);
    if (!order) return null;

    return {
      tracking_data: {
        track_status: 1,
        shipment_status: order.status,
        shipment_track: [{
          awb_code: awb,
          courier_company_id: order.courier_company_id,
          shipment_id: order.shipment_id,
          order_id: order.order_id,
          pickup_date: order.order_date,
          delivered_date: order.status === 'DELIVERED' ? new Date().toISOString() : null,
          weight: order.weight,
          packages: 1,
          current_status: order.status,
          delivered_to: order.status === 'DELIVERED' ? order.billing_customer_name : '',
          destination: order.billing_city,
          consignee_name: order.billing_customer_name,
          origin: order.pickup_location,
          shipment_track_activities: order.tracking_events || []
        }]
      }
    };
  }

  private addTrackingEvent(orderId: string, activity: string, location: string) {
    const order = this.orders.get(orderId);
    if (!order) return;

    const event: TrackingEvent = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      activity,
      location
    };

    if (!order.tracking_events) order.tracking_events = [];
    order.tracking_events.push(event);

    // Send webhook if configured
    if (this.webhookUrl) {
      this.sendWebhook(order);
    }
  }

  // Pickup Scheduling
  schedulePickup(awb: string, pickupDate: string): any {
    const order = Array.from(this.orders.values()).find(o => o.awb === awb);
    if (!order) return null;

    order.status = 'PICKUP_SCHEDULED';
    this.addTrackingEvent(order.order_id, 'Pickup Scheduled', order.pickup_location);

    // Simulate pickup after scheduled time
    setTimeout(() => {
      if (order.status === 'PICKUP_SCHEDULED') {
        order.status = 'PICKED';
        this.addTrackingEvent(order.order_id, 'Shipment Picked Up', order.pickup_location);
        
        // Simulate in-transit
        setTimeout(() => {
          order.status = 'IN_TRANSIT';
          this.addTrackingEvent(order.order_id, 'In Transit', 'Hub');
          
          // Simulate out for delivery
          setTimeout(() => {
            order.status = 'OUT_FOR_DELIVERY';
            this.addTrackingEvent(order.order_id, 'Out for Delivery', order.billing_city);
            
            // Simulate delivery
            setTimeout(() => {
              order.status = 'DELIVERED';
              this.addTrackingEvent(order.order_id, 'Delivered', order.billing_address);
            }, 4 * 60 * 60 * 1000); // 4 hours
          }, 24 * 60 * 60 * 1000); // 1 day
        }, 2 * 60 * 60 * 1000); // 2 hours
      }
    }, new Date(pickupDate).getTime() - Date.now());

    return {
      pickup_scheduled: true,
      pickup_id: `PU${Date.now()}`,
      pickup_date: pickupDate,
      awb
    };
  }

  // Webhook
  setWebhookUrl(url: string) {
    this.webhookUrl = url;
  }

  private async sendWebhook(order: Order) {
    if (!this.webhookUrl) return;

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          awb: order.awb,
          order_id: order.order_id,
          shipment_id: order.shipment_id,
          current_status: order.status,
          tracking_events: order.tracking_events
        })
      });
    } catch (error) {
      console.error('Webhook error:', error);
    }
  }
}

// Singleton instance
export const shiprocketEmulator = new ShiprocketEmulator();