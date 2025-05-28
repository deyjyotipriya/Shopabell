'use client';

import { useState } from 'react';
import { ProductVariant } from '@/app/types/product';
import { Plus, Trash2 } from 'lucide-react';

interface VariantManagerProps {
  variants: Omit<ProductVariant, 'id'>[];
  onChange: (variants: Omit<ProductVariant, 'id'>[]) => void;
  basePrice: number;
}

export default function VariantManager({ variants, onChange, basePrice }: VariantManagerProps) {
  const [newVariant, setNewVariant] = useState<Omit<ProductVariant, 'id'>>({
    size: '',
    color: '',
    price: basePrice,
    stock: 0,
    sku: ''
  });

  const addVariant = () => {
    if (!newVariant.sku) {
      alert('SKU is required');
      return;
    }

    onChange([...variants, newVariant]);
    setNewVariant({
      size: '',
      color: '',
      price: basePrice,
      stock: 0,
      sku: ''
    });
  };

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Product Variants
        </label>
        <button
          type="button"
          onClick={addVariant}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Variant
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Color
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {variants.map((variant, index) => (
              <tr key={index}>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={variant.size || ''}
                    onChange={(e) => updateVariant(index, 'size', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={variant.color || ''}
                    onChange={(e) => updateVariant(index, 'color', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    step="0.01"
                    min="0"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    min="0"
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td className="px-4 py-3">
                <input
                  type="text"
                  value={newVariant.sku}
                  onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                  placeholder="SKU"
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  value={newVariant.size || ''}
                  onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                  placeholder="Size"
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  value={newVariant.color || ''}
                  onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                  placeholder="Color"
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  value={newVariant.price}
                  onChange={(e) => setNewVariant({ ...newVariant, price: parseFloat(e.target.value) })}
                  placeholder="Price"
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                  step="0.01"
                  min="0"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  value={newVariant.stock}
                  onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) })}
                  placeholder="Stock"
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                  min="0"
                />
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={addVariant}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {variants.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No variants added yet. Add at least one variant for your product.
        </p>
      )}
    </div>
  );
}