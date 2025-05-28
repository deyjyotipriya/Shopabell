export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  price: number;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand?: string;
  images: string[];
  basePrice: number;
  compareAtPrice?: number;
  variants: ProductVariant[];
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  inventory: {
    trackInventory: boolean;
    lowStockAlert?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  sellerId: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  brand?: string;
  images: File[] | string[];
  basePrice: number;
  compareAtPrice?: number;
  variants: Omit<ProductVariant, 'id'>[];
  tags: string[];
  status: 'active' | 'draft';
  inventory: {
    trackInventory: boolean;
    lowStockAlert?: number;
  };
}