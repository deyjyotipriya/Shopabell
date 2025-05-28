'use client';

import { Product } from '@/app/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { Edit, Trash2, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onDelete?: (id: string) => void;
}

export default function ProductCard({ product, onDelete }: ProductCardProps) {
  const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  const lowestPrice = Math.min(...product.variants.map(v => v.price));
  const highestPrice = Math.max(...product.variants.map(v => v.price));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square relative bg-gray-100">
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        {product.status === 'draft' && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
            Draft
          </div>
        )}
        {totalStock === 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
            Out of Stock
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
        
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">
              ${lowestPrice.toFixed(2)}
              {highestPrice > lowestPrice && ` - $${highestPrice.toFixed(2)}`}
            </p>
            {product.compareAtPrice && (
              <p className="text-sm text-gray-500 line-through">
                ${product.compareAtPrice.toFixed(2)}
              </p>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {totalStock} in stock
          </p>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/dashboard/products/${product.id}/edit`}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={() => onDelete?.(product.id)}
            className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}