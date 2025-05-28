'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import CheckoutForm from '@/app/components/buyer/CheckoutForm'
import { CheckoutSession } from '@/app/types'

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session')
  const [session, setSession] = useState<CheckoutSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(900) // 15 minutes in seconds

  useEffect(() => {
    if (!sessionId) {
      router.push('/')
      return
    }

    fetchSession()
    
    // Countdown timer
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [sessionId])

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/checkout/session/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSession(data.session)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching session:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async (formData: any) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          ...formData
        })
      })

      if (response.ok) {
        const { orderId } = await response.json()
        router.push(`/orders/${orderId}/success`)
      }
    } catch (error) {
      console.error('Error processing checkout:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Session expired</h1>
          <p className="text-gray-600">Please start a new chat to continue shopping.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-yellow-800">
              Complete your purchase within: <span className="font-bold">{formatTime(timeRemaining)}</span>
            </p>
          </div>
        </div>

        <CheckoutForm
          session={session}
          onSubmit={handleCheckout}
        />
      </div>
    </div>
  )
}