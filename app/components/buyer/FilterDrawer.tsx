'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Filter } from 'lucide-react'
import { Product } from '@/app/types'

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  filters: any
  setFilters: (filters: any) => void
  categories: string[]
  products: Product[]
}

export default function FilterDrawer({
  isOpen,
  onClose,
  filters,
  setFilters,
  categories,
  products
}: FilterDrawerProps) {
  // Calculate price range
  const prices = products.map(p => p.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  const handleReset = () => {
    setFilters({})
    onClose()
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-6 border-b">
                      <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-500" />
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Filters
                        </Dialog.Title>
                      </div>
                      <button
                        type="button"
                        className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                        onClick={onClose}
                      >
                        <span className="sr-only">Close panel</span>
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Filters */}
                    <div className="flex-1 overflow-y-auto px-4 py-6">
                      {/* Categories */}
                      <div className="mb-8">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">Category</h3>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="category"
                              value=""
                              checked={!filters.category}
                              onChange={() => setFilters({ ...filters, category: undefined })}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-3 text-sm text-gray-600">All Categories</span>
                          </label>
                          {categories.map(category => (
                            <label key={category} className="flex items-center">
                              <input
                                type="radio"
                                name="category"
                                value={category}
                                checked={filters.category === category}
                                onChange={() => setFilters({ ...filters, category })}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="ml-3 text-sm text-gray-600">{category}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Price Range */}
                      <div className="mb-8">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">Price Range</h3>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="minPrice" className="block text-sm text-gray-600 mb-1">
                              Min Price
                            </label>
                            <input
                              type="number"
                              id="minPrice"
                              min={minPrice}
                              max={maxPrice}
                              value={filters.minPrice || ''}
                              onChange={(e) => setFilters({ 
                                ...filters, 
                                minPrice: e.target.value ? Number(e.target.value) : undefined 
                              })}
                              placeholder={`₹${minPrice}`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <label htmlFor="maxPrice" className="block text-sm text-gray-600 mb-1">
                              Max Price
                            </label>
                            <input
                              type="number"
                              id="maxPrice"
                              min={minPrice}
                              max={maxPrice}
                              value={filters.maxPrice || ''}
                              onChange={(e) => setFilters({ 
                                ...filters, 
                                maxPrice: e.target.value ? Number(e.target.value) : undefined 
                              })}
                              placeholder={`₹${maxPrice}`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Common Price Ranges */}
                      <div className="mb-8">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">Quick Filters</h3>
                        <div className="space-y-2">
                          <button
                            onClick={() => setFilters({ ...filters, minPrice: undefined, maxPrice: 500 })}
                            className="text-sm text-purple-600 hover:text-purple-700"
                          >
                            Under ₹500
                          </button>
                          <button
                            onClick={() => setFilters({ ...filters, minPrice: 500, maxPrice: 1000 })}
                            className="text-sm text-purple-600 hover:text-purple-700 block"
                          >
                            ₹500 - ₹1,000
                          </button>
                          <button
                            onClick={() => setFilters({ ...filters, minPrice: 1000, maxPrice: 2000 })}
                            className="text-sm text-purple-600 hover:text-purple-700 block"
                          >
                            ₹1,000 - ₹2,000
                          </button>
                          <button
                            onClick={() => setFilters({ ...filters, minPrice: 2000, maxPrice: undefined })}
                            className="text-sm text-purple-600 hover:text-purple-700 block"
                          >
                            Above ₹2,000
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t px-4 py-6">
                      <div className="flex gap-3">
                        <button
                          onClick={handleReset}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Reset
                        </button>
                        <button
                          onClick={onClose}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}