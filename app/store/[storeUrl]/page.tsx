'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import StoreHeader from '@/app/components/buyer/StoreHeader'
import ProductCard from '@/app/components/buyer/ProductCard'
import { Product, Store } from '@/app/types'
import { Search, Filter, ShoppingBag, MessageCircle, Play, SlidersHorizontal } from 'lucide-react'
import { useCart } from '@/app/hooks/useCart'
import CartDrawer from '@/app/components/buyer/CartDrawer'
import FilterDrawer from '@/app/components/buyer/FilterDrawer'
import LivestreamBanner from '@/app/components/buyer/LivestreamBanner'

interface FilterOptions {
  category?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular'
}

export default function StorePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const storeUrl = params.storeUrl as string
  const [store, setStore] = useState<Store | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({})
  const [showFilters, setShowFilters] = useState(false)
  const [activeLivestream, setActiveLivestream] = useState<any>(null)
  const [categories, setCategories] = useState<string[]>([])
  
  const { cart, isCartOpen, setIsCartOpen } = useCart()

  useEffect(() => {
    fetchStoreData()
    checkActiveLivestream()
  }, [storeUrl])

  useEffect(() => {
    applyFilters()
  }, [products, searchTerm, filters])

  const fetchStoreData = async () => {
    try {
      const response = await fetch(`/api/store/${storeUrl}`)
      if (response.ok) {
        const data = await response.json()
        setStore(data.store)
        setProducts(data.products)
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.products.map((p: Product) => p.category))]
        setCategories(uniqueCategories.filter(Boolean) as string[])
      }
    } catch (error) {
      console.error('Error fetching store:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkActiveLivestream = async () => {
    try {
      const response = await fetch(`/api/store/${storeUrl}/livestream`)
      if (response.ok) {
        const data = await response.json()
        if (data.active) {
          setActiveLivestream(data.livestream)
        }
      }
    } catch (error) {
      console.error('Error checking livestream:', error)
    }
  }

  const applyFilters = useCallback(() => {
    let filtered = [...products]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category)
    }

    // Price filter
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(product => product.price >= filters.minPrice!)
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(product => product.price <= filters.maxPrice!)
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        break
      case 'popular':
        // Sort by some popularity metric (e.g., views, sales)
        break
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, filters])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store not found</h1>
          <p className="text-gray-600 mb-6">The store you're looking for doesn't exist.</p>
          <Link href="/" className="text-purple-600 hover:text-purple-700 font-medium">
            Browse other stores →
          </Link>
        </div>
      </div>
    )
  }

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader store={store} />
      
      {/* Active Livestream Banner */}
      {activeLivestream && (
        <LivestreamBanner 
          livestream={activeLivestream}
          storeUrl={storeUrl}
        />
      )}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filters.sortBy || ''}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Sort by</option>
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
              
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
                {(filters.category || filters.minPrice || filters.maxPrice) && (
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                    {Object.keys(filters).filter(k => filters[k as keyof FilterOptions]).length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Products ({filteredProducts.length})
            </h2>
            
            {/* Category Pills */}
            {categories.length > 0 && (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setFilters({ ...filters, category: undefined })}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    !filters.category 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setFilters({ ...filters, category })}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                      filters.category === category 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  storeUrl={storeUrl}
                />
              ))}
            </div>
          )}
        </div>

        {/* Store Policies */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Store Policies</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Shipping</h4>
              <p>Orders shipped within 24-48 hours. Free shipping on orders above ₹999.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Returns</h4>
              <p>7-day easy returns. Product must be unused with original packaging.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Payment</h4>
              <p>100% secure payments. All major payment methods accepted including COD.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        {/* Chat Button */}
        <Link
          href={`/chat/new?store=${storeUrl}`}
          className="bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition"
        >
          <MessageCircle className="w-6 h-6" />
        </Link>
        
        {/* Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition relative"
        >
          <ShoppingBag className="w-6 h-6" />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
        categories={categories}
        products={products}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        storeUrl={storeUrl}
      />
    </div>
  )
}