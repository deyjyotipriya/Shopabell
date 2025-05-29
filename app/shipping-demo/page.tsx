'use client'

import { useState } from 'react'
import { calculateShipping, ShippingCalculation } from '@/app/lib/shipping-calculator'

export default function ShippingDemo() {
  const [pincode, setPincode] = useState('')
  const [weight, setWeight] = useState('1')
  const [orderValue, setOrderValue] = useState('1000')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [result, setResult] = useState<ShippingCalculation | null>(null)
  const [error, setError] = useState('')

  const handleCalculate = () => {
    try {
      const calculation = calculateShipping(
        pincode,
        parseFloat(weight),
        parseFloat(orderValue),
        paymentMethod === 'cod'
      )
      setResult(calculation)
      setError('')
    } catch (err: any) {
      setError(err.message)
      setResult(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shipping Cost Calculator Demo</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Calculate Shipping</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 400001"
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                step="0.5"
                min="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Value (₹)
              </label>
              <input
                type="number"
                value={orderValue}
                onChange={(e) => setOrderValue(e.target.value)}
                step="100"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="card">Card/UPI</option>
                <option value="cod">Cash on Delivery</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={handleCalculate}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Calculate Shipping
          </button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>
        
        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Calculation Result</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Shipping Zone</span>
                <span className="font-medium">{result.zone}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Base Charge</span>
                <span>₹{result.baseCharge}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Weight Charge</span>
                <span>₹{result.weightCharge}</span>
              </div>
              
              {result.codCharge > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">COD Charge</span>
                  <span>₹{result.codCharge}</span>
                </div>
              )}
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Total Charge</span>
                <span>₹{result.totalCharge}</span>
              </div>
              
              {result.discount > 0 && (
                <div className="flex justify-between py-2 text-green-600">
                  <span>Free Shipping Discount</span>
                  <span>-₹{result.discount}</span>
                </div>
              )}
              
              <div className="flex justify-between py-2 text-lg font-semibold border-t pt-4">
                <span>Final Shipping Charge</span>
                <span>₹{result.finalCharge}</span>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  Estimated delivery: {result.estimatedDays} days
                </p>
                {result.freeShippingEligible && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Eligible for free shipping!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Shipping Zones</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Metro Cities (2 days)</h3>
              <p className="text-sm text-gray-600">Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad, Ahmedabad, Pune</p>
              <p className="text-sm text-gray-500">Base: ₹40 | Per kg: ₹10 | COD: ₹30 | Free shipping above: ₹999</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Tier 1 Cities (3 days)</h3>
              <p className="text-sm text-gray-600">Nagpur, Jaipur, Lucknow, Bhopal, Chandigarh, Vadodara, Nashik, etc.</p>
              <p className="text-sm text-gray-500">Base: ₹60 | Per kg: ₹15 | COD: ₹40 | Free shipping above: ₹1499</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">North East & Remote (7 days)</h3>
              <p className="text-sm text-gray-600">Assam, Arunachal Pradesh, Meghalaya, J&K, Himachal Pradesh, etc.</p>
              <p className="text-sm text-gray-500">Base: ₹100 | Per kg: ₹25 | COD: ₹60 | Free shipping above: ₹2499</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Rest of India (5 days)</h3>
              <p className="text-sm text-gray-600">All other locations</p>
              <p className="text-sm text-gray-500">Base: ₹80 | Per kg: ₹20 | COD: ₹50 | Free shipping above: ₹1999</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}