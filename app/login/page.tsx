'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { Phone, ArrowRight, CheckCircle, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtp, setShowOtp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    // Check if coming from WhatsApp onboarding
    const onboarded = searchParams.get('onboarded')
    const phoneParam = searchParams.get('phone')
    
    if (onboarded === 'true' && phoneParam) {
      setPhone(phoneParam)
      setSuccessMessage('🎉 Your store is ready! Enter OTP to access your dashboard.')
      handleSendOtp(phoneParam)
    }

    // Check if there's onboarding data
    const savedData = localStorage.getItem('onboardingData')
    if (savedData) {
      const data = JSON.parse(savedData)
      if (data.phone) {
        setPhone(data.phone)
      }
    }
  }, [searchParams])

  const handleSendOtp = async (phoneNumber?: string) => {
    const phoneToUse = phoneNumber || phone
    if (!phoneToUse || phoneToUse.length < 10) {
      setError('Please enter a valid phone number')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('Sending OTP request to:', '/api/auth/send-otp')
      console.log('Phone:', phoneToUse)
      
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneToUse })
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.log('Error response:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('Response data:', data)

      setShowOtp(true)
      setSuccessMessage('OTP sent! Use 123456 for demo.')
    } catch (err: any) {
      console.error('Send OTP error:', err)
      setError(`Network error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('Verifying OTP request to:', '/api/auth/verify-otp')
      console.log('Phone:', phone, 'OTP:', otp)
      
      // Direct API call instead of using AuthContext for debugging
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      })

      console.log('Verify response status:', response.status)
      console.log('Verify response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.log('Verify error response:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('Verify response data:', data)

      if (data.success && data.user) {
        console.log('Login successful! Processing...')
        
        // Store tokens in localStorage and set cookie for middleware
        if (data.tokens) {
          localStorage.setItem('accessToken', data.tokens.accessToken)
          localStorage.setItem('refreshToken', data.tokens.refreshToken)
          
          // Set authentication cookie for middleware
          document.cookie = `access_token=${data.tokens.accessToken}; path=/; max-age=${data.tokens.expiresIn || 900}; SameSite=Lax`
          
          console.log('Tokens stored and cookie set')
        }

        // Handle onboarding data
        const onboardingData = localStorage.getItem('onboardingData')
        if (onboardingData) {
          try {
            const { businessName, category, upiId } = JSON.parse(onboardingData)
            console.log('Processing onboarding data:', { businessName, category, upiId })
            
            // For demo, just remove the onboarding data for now
            localStorage.removeItem('onboardingData')
            console.log('Onboarding data removed')
          } catch (onboardError) {
            console.error('Onboarding error:', onboardError)
          }
        }

        // Show success message briefly before redirect
        setSuccessMessage('✅ Login successful! Redirecting...')
        
        // Redirect based on user role
        console.log('Redirecting user with role:', data.user.role)
        
        setTimeout(() => {
          if (data.user.role === 'admin') {
            console.log('Redirecting to /admin')
            window.location.href = '/admin'
          } else if (data.user.role === 'seller') {
            console.log('Redirecting to /dashboard')
            window.location.href = '/dashboard'
          } else {
            console.log('Redirecting to /')
            window.location.href = '/'
          }
        }, 1000)
        
      } else {
        setError('Login failed - invalid response')
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err)
      setError(`Network error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <Phone className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome to ShopAbell</h1>
            <p className="text-gray-600 mt-2">
              {showOtp ? 'Enter OTP to continue' : 'Login with your phone number'}
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={showOtp ? handleVerifyOtp : (e) => { e.preventDefault(); handleSendOtp(); }}>
            {!showOtp ? (
              <>
                <div className="mb-6">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      required
                    />
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                      +91
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || phone.length < 10}
                  className="w-full bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-4 py-3 text-center text-lg tracking-wider border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                    autoFocus
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Didn't receive OTP? 
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="text-purple-600 hover:text-purple-700 ml-1"
                    >
                      Resend
                    </button>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowOtp(false)
                    setOtp('')
                    setError('')
                  }}
                  className="w-full mt-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Change phone number
                </button>
              </>
            )}
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Demo Accounts (OTP: 123456)</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p>• Seller: 9876543210</p>
              <p>• Buyer: 9876543214</p>
              <p>• Admin: 9999999999</p>
            </div>
          </div>

          {/* New Seller CTA */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              New to ShopAbell? 
              <Link href="/whatsapp-onboard" className="text-purple-600 hover:text-purple-700 ml-1 font-medium inline-flex items-center">
                Start on WhatsApp
                <MessageCircle className="ml-1 h-4 w-4" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}