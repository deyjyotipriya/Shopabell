import Image from 'next/image'
import Link from 'next/link'
import { Order, OrderStatus } from '@/app/types'

interface OrderTrackingProps {
  order: Order
}

const statusSteps: { status: OrderStatus; label: string; icon: string }[] = [
  { status: 'pending', label: 'Order Placed', icon: '📋' },
  { status: 'confirmed', label: 'Confirmed', icon: '✅' },
  { status: 'shipped', label: 'Shipped', icon: '📦' },
  { status: 'delivered', label: 'Delivered', icon: '🎉' }
]

export default function OrderTracking({ order }: OrderTrackingProps) {
  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(step => step.status === order.status)
  }

  const currentStepIndex = getCurrentStepIndex()

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Order #{order.id.slice(0, 8)}
          </h3>
          <p className="text-sm text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Link
          href={`/orders/${order.id}`}
          className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
        >
          View Details →
        </Link>
      </div>

      {/* Status Timeline */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {statusSteps.map((step, index) => (
            <div key={step.status} className="flex-1 relative">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    index <= currentStepIndex
                      ? 'bg-indigo-600'
                      : 'bg-gray-200'
                  }`}
                >
                  <span>{step.icon}</span>
                </div>
                <p className={`text-xs mt-2 ${
                  index <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.label}
                </p>
              </div>
              {index < statusSteps.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-0.5 ${
                    index < currentStepIndex
                      ? 'bg-indigo-600'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Order Items */}
      <div className="border-t pt-4">
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center space-x-4">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={50}
                  height={50}
                  className="rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-gray-900">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t flex justify-between">
          <span className="font-medium text-gray-900">Total</span>
          <span className="font-semibold text-gray-900">
            ${order.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Tracking Info */}
      {order.trackingNumber && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            Tracking Number: 
            <span className="font-medium text-gray-900 ml-1">
              {order.trackingNumber}
            </span>
          </p>
          {order.carrier && (
            <p className="text-sm text-gray-600 mt-1">
              Carrier: {order.carrier}
            </p>
          )}
        </div>
      )}

      {/* Delivery Info */}
      {order.estimatedDelivery && (
        <div className="mt-4 bg-blue-50 rounded-lg p-3">
          <p className="text-sm text-blue-900">
            Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-3">
        {order.status === 'delivered' && (
          <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Write Review
          </button>
        )}
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Contact Seller
          </button>
        )}
        <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          Order Again
        </button>
      </div>
    </div>
  )
}