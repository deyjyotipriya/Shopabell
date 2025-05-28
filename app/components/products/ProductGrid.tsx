'use client';

import { Product } from '@/app/types/product';
import ProductCard from './ProductCard';
import { Grid, List } from 'lucide-react';
import { useState } from 'react';

interface ProductGridProps {
  products: Product[];
  onDelete?: (id: string) => void;
}

export default function ProductGrid({ products, onDelete }: ProductGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No products yet</h3>
        <p className="mt-2 text-sm text-gray-600">
          Create your first product to get started
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md ${
              viewMode === 'grid'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md ${
              viewMode === 'list'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4"
            >
              {product.images[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                <div className="mt-2 flex items-center gap-4">
                  <p className="text-lg font-bold text-gray-900">
                    ${product.basePrice.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {product.variants.reduce((sum, v) => sum + v.stock, 0)} in stock
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {product.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/dashboard/products/${product.id}/edit`}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Edit
                </a>
                <button
                  onClick={() => onDelete?.(product.id)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}