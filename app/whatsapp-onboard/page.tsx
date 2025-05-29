'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, ArrowLeft, Check, CheckCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Message {
  id: string
  sender: 'bot' | 'user'
  text: string
  timestamp: Date
  status?: 'sent' | 'delivered' | 'read'
}

export default function WhatsAppOnboard() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [userData, setUserData] = useState({
    businessName: '',
    category: '',
    upiId: '',
    phone: ''
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initial bot message
    setTimeout(() => {
      addBotMessage("🎉 Welcome to ShopAbell! I'm your business assistant. Let's get your online store ready in just 30 seconds!")
      setTimeout(() => {
        addBotMessage("First, what's your business name?")
      }, 1000)
    }, 500)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addBotMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'bot',
      text,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date(),
      status: 'sent'
    }
    setMessages(prev => [...prev, newMessage])

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        )
      )
    }, 500)

    // Simulate message read
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
        )
      )
    }, 1000)
  }

  const handleSend = () => {
    if (!inputValue.trim()) return

    addUserMessage(inputValue)
    const userInput = inputValue
    setInputValue('')

    // Process based on onboarding step
    setTimeout(() => {
      switch (onboardingStep) {
        case 0: // Business name
          setUserData(prev => ({ ...prev, businessName: userInput }))
          addBotMessage(`Great! "${userInput}" sounds like an amazing business! 🌟`)
          setTimeout(() => {
            addBotMessage("What category best describes your products?")
            addBotMessage("1️⃣ Fashion & Accessories\n2️⃣ Electronics & Gadgets\n3️⃣ Home & Living\n4️⃣ Beauty & Personal Care\n5️⃣ Food & Beverages\n6️⃣ Others")
          }, 1500)
          setOnboardingStep(1)
          break

        case 1: // Category
          const categories = ['Fashion & Accessories', 'Electronics & Gadgets', 'Home & Living', 'Beauty & Personal Care', 'Food & Beverages', 'Others']
          const categoryIndex = parseInt(userInput) - 1
          const selectedCategory = categories[categoryIndex] || userInput
          setUserData(prev => ({ ...prev, category: selectedCategory }))
          addBotMessage(`Perfect! ${selectedCategory} is a great market! 📈`)
          setTimeout(() => {
            addBotMessage("Now, please share your UPI ID for receiving payments (e.g., yourname@paytm)")
          }, 1500)
          setOnboardingStep(2)
          break

        case 2: // UPI ID
          setUserData(prev => ({ ...prev, upiId: userInput }))
          addBotMessage(`Got it! Payments will be sent to ${userInput} 💰`)
          setTimeout(() => {
            addBotMessage("Last step! What's your phone number? (We'll create your account with this)")
          }, 1500)
          setOnboardingStep(3)
          break

        case 3: // Phone number
          setUserData(prev => ({ ...prev, phone: userInput }))
          addBotMessage("🎊 Congratulations! Your ShopAbell store is ready!")
          setTimeout(() => {
            addBotMessage("✅ Business: " + userData.businessName)
            addBotMessage("✅ Category: " + userData.category)
            addBotMessage("✅ UPI: " + userData.upiId)
            addBotMessage("✅ Phone: " + userInput)
          }, 1000)
          setTimeout(() => {
            addBotMessage("Creating your store... 🚀")
            setTimeout(() => {
              // Store user data and redirect to login
              localStorage.setItem('onboardingData', JSON.stringify({
                ...userData,
                phone: userInput
              }))
              router.push('/login?onboarded=true&phone=' + userInput)
            }, 2000)
          }, 3000)
          setOnboardingStep(4)
          break
      }
    }, 1500)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* WhatsApp Header */}
      <div className="bg-[#128C7E] text-white p-4 flex items-center shadow-lg">
        <button onClick={() => router.push('/')} className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex items-center flex-1">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
            <span className="text-[#128C7E] font-bold">SA</span>
          </div>
          <div>
            <h1 className="font-semibold">ShopAbell Business</h1>
            <p className="text-xs opacity-80">Always active</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 bg-[#E5DDD5]"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d5d5d5' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          minHeight: 'calc(100vh - 144px)'
        }}
      >
        <div className="max-w-2xl mx-auto space-y-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-3 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-[#DCF8C6] rounded-br-none'
                    : 'bg-white rounded-bl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <div className="flex items-center justify-end mt-1 space-x-1">
                  <span className="text-xs text-gray-500">
                    {formatTime(message.timestamp)}
                  </span>
                  {message.sender === 'user' && (
                    <span className="text-blue-500">
                      {message.status === 'sent' && <Check className="h-3 w-3" />}
                      {message.status === 'delivered' && <CheckCheck className="h-3 w-3" />}
                      {message.status === 'read' && <CheckCheck className="h-3 w-3 text-blue-500" />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gray-100 p-4 border-t">
        <div className="max-w-2xl mx-auto flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message"
            className="flex-1 px-4 py-2 bg-white rounded-full border border-gray-300 focus:outline-none focus:border-[#128C7E]"
            disabled={onboardingStep === 4}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || onboardingStep === 4}
            className="w-10 h-10 bg-[#128C7E] text-white rounded-full flex items-center justify-center hover:bg-[#0d7a6e] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}