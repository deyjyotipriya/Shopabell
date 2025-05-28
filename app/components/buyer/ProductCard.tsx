'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/app/types'
import { ShoppingBag, Eye, Heart } from 'lucide-react'
import { useCart } from '@/app/hooks/useCart'
import { formatPrice } from '@/app/utils/format'

interface ProductCardProps {
  product: Product
  storeUrl: string
}

export default function ProductCard({ product, storeUrl }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { addToCart } = useCart()

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    addToCart(product)
  }

  const inStock = product.stock > 0

  return (
    <div
      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/store/${storeUrl}/product/${product.id}`}>
        <div className="relative aspect-square bg-gray-100">
          {product.images && product.images.length > 0 && !imageError ? (
            <>
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
              {product.images.length > 1 && isHovered && (
                <Image
                  src={product.images[1]}
                  alt={product.name}
                  fill
                  className="object-cover absolute inset-0"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-300" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
              </span>
            )}
            {product.source === 'livestream' && (
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                LIVE
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 transform transition-transform duration-300 ${
            isHovered ? 'translate-y-0' : 'translate-y-full'
          }`}>
            <div className="flex gap-2">
              <button
                onClick={handleQuickAdd}
                disabled={!inStock}
                className="flex-1 bg-white text-gray-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition disabled:bg-gray-200 disabled:text-gray-400"
              >
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button className="bg-white p-2 rounded-md hover:bg-gray-100 transition">
                <Eye className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/store/${storeUrl}/product/${product.id}`}>
          <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-purple-600 transition">
            {product.name}
          </h3>
        </Link>

        {product.category && (
          <p className="text-xs text-gray-500 mb-2">{product.category}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Stock indicator */}
        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-xs text-orange-600 mt-2">Only {product.stock} left!</p>
        )}
      </div>
    </div>
  )
}