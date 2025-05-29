interface ShippingZone {
  name: string;
  pincodes: string[];
  baseCost: number;
  perKgCost: number;
  codCharge: number;
  freeShippingAbove?: number;
}

// Indian shipping zones based on major regions
const SHIPPING_ZONES: ShippingZone[] = [
  {
    name: 'Metro Cities',
    pincodes: [
      '110', '111', '112', // Delhi NCR
      '400', '401', '402', // Mumbai
      '560', '561', '562', // Bangalore
      '600', '601', '602', // Chennai
      '700', '701', '702', // Kolkata
      '500', '501', '502', // Hyderabad
      '380', '381', '382', // Ahmedabad
      '411', '412', '413', // Pune
    ],
    baseCost: 40,
    perKgCost: 10,
    codCharge: 30,
    freeShippingAbove: 999
  },
  {
    name: 'Tier 1 Cities',
    pincodes: [
      '440', '441', // Nagpur
      '302', '303', // Jaipur
      '226', '227', // Lucknow
      '462', '463', // Bhopal
      '160', '161', // Chandigarh
      '390', '391', // Vadodara
      '422', '423', // Nashik
      '641', '642', // Coimbatore
      '682', '683', // Kochi
      '530', '531', // Visakhapatnam
    ],
    baseCost: 60,
    perKgCost: 15,
    codCharge: 40,
    freeShippingAbove: 1499
  },
  {
    name: 'North East & Remote',
    pincodes: [
      '781', '782', '783', '784', '785', '786', '787', '788', // Assam
      '790', '791', '792', // Arunachal Pradesh
      '793', '794', // Meghalaya
      '795', // Manipur
      '796', // Mizoram
      '797', // Nagaland
      '799', // Tripura
      '737', // Sikkim
      '190', '191', '192', '193', '194', // J&K
      '175', '176', '177', // Himachal Pradesh
    ],
    baseCost: 100,
    perKgCost: 25,
    codCharge: 60,
    freeShippingAbove: 2499
  },
  {
    name: 'Rest of India',
    pincodes: [], // Default zone for all other pincodes
    baseCost: 80,
    perKgCost: 20,
    codCharge: 50,
    freeShippingAbove: 1999
  }
];

export interface ShippingCalculation {
  baseCharge: number;
  weightCharge: number;
  codCharge: number;
  totalCharge: number;
  discount: number;
  finalCharge: number;
  zone: string;
  estimatedDays: number;
  freeShippingEligible: boolean;
}

export function getShippingZone(pincode: string): ShippingZone {
  // Get first 3 digits of pincode for zone matching
  const prefix = pincode.substring(0, 3);
  
  // Find matching zone
  for (const zone of SHIPPING_ZONES) {
    if (zone.pincodes.length > 0 && zone.pincodes.includes(prefix)) {
      return zone;
    }
  }
  
  // Return default zone (Rest of India)
  return SHIPPING_ZONES[SHIPPING_ZONES.length - 1];
}

export function calculateShipping(
  pincode: string,
  weight: number, // in kg
  orderValue: number,
  isCOD: boolean = false
): ShippingCalculation {
  // Validate pincode
  if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
    throw new Error('Invalid pincode. Please enter a valid 6-digit pincode.');
  }

  // Get shipping zone
  const zone = getShippingZone(pincode);
  
  // Calculate charges
  const baseCharge = zone.baseCost;
  const weightCharge = Math.ceil(weight) * zone.perKgCost;
  const codCharge = isCOD ? zone.codCharge : 0;
  const totalCharge = baseCharge + weightCharge + codCharge;
  
  // Check for free shipping eligibility
  const freeShippingEligible = zone.freeShippingAbove && orderValue >= zone.freeShippingAbove;
  const discount = freeShippingEligible ? (baseCharge + weightCharge) : 0; // COD charge is never discounted
  const finalCharge = totalCharge - discount;
  
  // Estimate delivery days based on zone
  let estimatedDays = 3;
  switch (zone.name) {
    case 'Metro Cities':
      estimatedDays = 2;
      break;
    case 'Tier 1 Cities':
      estimatedDays = 3;
      break;
    case 'North East & Remote':
      estimatedDays = 7;
      break;
    default:
      estimatedDays = 5;
  }
  
  return {
    baseCharge,
    weightCharge,
    codCharge,
    totalCharge,
    discount,
    finalCharge,
    zone: zone.name,
    estimatedDays,
    freeShippingEligible
  };
}

export function isDeliverable(pincode: string): boolean {
  // Check if pincode is valid
  if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
    return false;
  }
  
  // In a real implementation, you might have a list of non-serviceable pincodes
  // For now, we'll assume all valid pincodes are serviceable
  return true;
}

export function getEstimatedDeliveryDate(pincode: string): Date {
  const calculation = calculateShipping(pincode, 0.5, 0, false);
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + calculation.estimatedDays);
  return deliveryDate;
}

// Helper function to get shipping cost for a cart
export function calculateCartShipping(
  items: Array<{ weight?: number; price: number; quantity: number }>,
  pincode: string,
  paymentMethod: string
): ShippingCalculation {
  // Calculate total weight (default 0.5kg per item if not specified)
  const totalWeight = items.reduce((sum, item) => {
    const itemWeight = item.weight || 0.5;
    return sum + (itemWeight * item.quantity);
  }, 0);
  
  // Calculate total value
  const totalValue = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  // Check if COD
  const isCOD = paymentMethod === 'cod';
  
  return calculateShipping(pincode, totalWeight, totalValue, isCOD);
}