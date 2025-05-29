import { useState, useEffect } from 'react'
import Image from 'next/image'
import { CheckoutSession } from '@/app/types'
import { ShippingCalculation } from '@/lib/shipping-calculator'

interface CheckoutFormProps {
  session: CheckoutSession
  onSubmit: (data: any) => void
}

export default function CheckoutForm({ session, onSubmit }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    saveInfo: false
  })
  const [processing, setProcessing] = useState(false)
  const [shippingInfo, setShippingInfo] = useState<ShippingCalculation | null>(null)
  const [checkingPincode, setCheckingPincode] = useState(false)
  const [pincodeError, setPincodeError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Calculate shipping when pincode or payment method changes
  useEffect(() => {
    const calculateShipping = async () => {
      if (formData.zipCode.length === 6 && /^\d{6}$/.test(formData.zipCode)) {
        setCheckingPincode(true)
        setPincodeError('')
        
        try {
          // Calculate total weight (assuming 0.5kg per item if not specified)
          const totalWeight = session.items.reduce((sum, item) => {
            const weight = (item as any).weight || 0.5
            return sum + (weight * item.quantity)
          }, 0)
          
          const response = await fetch('/api/shipping/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pincode: formData.zipCode,
              weight: totalWeight,
              orderValue: session.subtotal,
              paymentMethod: formData.paymentMethod
            })
          })
          
          const data = await response.json()
          
          if (data.success) {
            setShippingInfo(data.data)
            setPincodeError('')
          } else {
            setPincodeError(data.error || 'Invalid pincode')
            setShippingInfo(null)
          }
        } catch (error) {
          console.error('Error calculating shipping:', error)
          setPincodeError('Failed to calculate shipping')
        } finally {
          setCheckingPincode(false)
        }
      } else if (formData.zipCode.length > 0) {
        setPincodeError('Please enter a valid 6-digit pincode')
        setShippingInfo(null)
      }
    }
    
    const debounceTimer = setTimeout(calculateShipping, 500)
    return () => clearTimeout(debounceTimer)
  }, [formData.zipCode, formData.paymentMethod, session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!shippingInfo) {
      setPincodeError('Please enter a valid pincode for delivery')
      return
    }
    
    setProcessing(true)
    await onSubmit({
      ...formData,
      shippingCharge: shippingInfo.finalCharge,
      shippingZone: shippingInfo.zone,
      estimatedDelivery: shippingInfo.estimatedDays,
      codCharge: shippingInfo.codCharge
    })
    setProcessing(false)
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4)
    }
    return v
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
        
        <div className="space-y-4">
          {session.items.map((item) => (
            <div key={item.id} className="flex items-center space-x-4">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name || 'Product'}
                  width={60}
                  height={60}
                  className="rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium text-gray-900">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">₹{session.subtotal.toFixed(2)}</span>
          </div>
          
          {/* Shipping calculation */}
          {shippingInfo ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base Shipping</span>
                <span className="text-gray-900">₹{shippingInfo.baseCharge.toFixed(2)}</span>
              </div>
              {shippingInfo.weightCharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Weight Charge</span>
                  <span className="text-gray-900">₹{shippingInfo.weightCharge.toFixed(2)}</span>
                </div>
              )}
              {shippingInfo.codCharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">COD Charge</span>
                  <span className="text-gray-900">₹{shippingInfo.codCharge.toFixed(2)}</span>
                </div>
              )}
              {shippingInfo.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Free Shipping Discount</span>
                  <span>-₹{shippingInfo.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-900">Total Shipping</span>
                <span className="text-gray-900">₹{shippingInfo.finalCharge.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-500">
                {shippingInfo.zone} • Est. delivery in {shippingInfo.estimatedDays} days
              </div>
            </>
          ) : (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-400">
                {checkingPincode ? 'Calculating...' : 'Enter pincode'}
              </span>
            </div>
          )}
          
          <div className="flex justify-between text-lg font-semibold pt-2 border-t">
            <span>Total</span>
            <span>₹{(session.subtotal + (shippingInfo?.finalCharge || 0)).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                PIN Code
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="e.g. 400001"
                maxLength={6}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  pincodeError ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {pincodeError && (
                <p className="mt-1 text-sm text-red-600">{pincodeError}</p>
              )}
              {shippingInfo && (
                <p className="mt-1 text-sm text-green-600">
                  ✓ Delivery available to {shippingInfo.zone}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
        
        <div className="space-y-3">
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={formData.paymentMethod === 'card'}
              onChange={handleChange}
              className="mr-3"
            />
            <div>
              <div className="font-medium">Credit/Debit Card</div>
              <div className="text-sm text-gray-500">Pay securely with your card</div>
            </div>
          </label>
          
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value="upi"
              checked={formData.paymentMethod === 'upi'}
              onChange={handleChange}
              className="mr-3"
            />
            <div>
              <div className="font-medium">UPI</div>
              <div className="text-sm text-gray-500">Pay using any UPI app</div>
            </div>
          </label>
          
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={formData.paymentMethod === 'cod'}
              onChange={handleChange}
              className="mr-3"
            />
            <div>
              <div className="font-medium">Cash on Delivery</div>
              <div className="text-sm text-gray-500">
                Pay when you receive {shippingInfo?.codCharge ? `(+₹${shippingInfo.codCharge} COD charge)` : ''}
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Payment Information */}
      {formData.paymentMethod === 'card' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Card Information</h2>
          
          <div className="space-y-4">
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={formatCardNumber(formData.cardNumber)}
              onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value.replace(/\s/g, '') }))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                value={formatExpiryDate(formData.expiryDate)}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value.replace(/\D/g, '') }))}
                placeholder="MM/YY"
                maxLength={5}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                placeholder="123"
                maxLength={4}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="saveInfo"
              checked={formData.saveInfo}
              onChange={handleChange}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              Save my information for faster checkout
            </span>
          </label>
        </div>
      </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={processing}
          className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {processing ? 'Processing...' : `Complete Order - ₹${(session.subtotal + (shippingInfo?.finalCharge || 0)).toFixed(2)}`}
        </button>
      </div>
    </form>
  )
}