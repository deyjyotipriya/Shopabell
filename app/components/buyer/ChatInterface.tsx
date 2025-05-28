import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Chat, Message } from '@/app/types'

interface ChatInterfaceProps {
  chat: Chat
  messages: Message[]
  onSendMessage: (content: string, attachments?: any[]) => void
}

export default function ChatInterface({ chat, messages, onSendMessage }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim())
      setInputValue('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickReplies = [
    'Is this available?',
    'What\'s the lowest price?',
    'Can you ship today?',
    'Do you have more photos?'
  ]

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow px-4 py-3">
        <div className="flex items-center space-x-3">
          {chat.store.logo ? (
            <Image
              src={chat.store.logo}
              alt={chat.store.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {chat.store.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">{chat.store.name}</h2>
            <p className="text-sm text-gray-500">Active now</p>
          </div>
          {chat.product && (
            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="text-sm text-gray-700">{chat.product.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Product Attachment */}
      {chat.product && messages.length === 0 && (
        <div className="bg-white mx-4 mt-4 p-4 rounded-lg shadow">
          <div className="flex items-center space-x-4">
            {chat.product.images?.[0] && (
              <Image
                src={chat.product.images[0]}
                alt={chat.product.name}
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{chat.product.name}</h3>
              <p className="text-lg font-bold text-indigo-600">${chat.product.price.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${message.isSellerMessage ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.isSellerMessage
                  ? 'bg-white text-gray-900'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              
              {message.attachments?.map((attachment, index) => (
                <div key={index} className="mt-2">
                  {attachment.type === 'product' && (
                    <div className="bg-gray-100 p-2 rounded">
                      <p className="text-sm font-medium">{attachment.name}</p>
                      <p className="text-sm">${attachment.price}</p>
                    </div>
                  )}
                  {attachment.type === 'checkout' && (
                    <a
                      href={attachment.url}
                      className="block bg-green-500 text-white text-center py-2 px-4 rounded mt-2 hover:bg-green-600"
                    >
                      Complete Purchase - ${attachment.amount}
                    </a>
                  )}
                </div>
              ))}
              
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="mb-4 flex justify-start">
            <div className="bg-white px-4 py-2 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 py-2">
        <div className="flex space-x-2 overflow-x-auto">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              onClick={() => setInputValue(reply)}
              className="flex-shrink-0 px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t px-4 py-3">
        <div className="flex items-end space-x-2">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Type "sell [amount]" to create an instant checkout
        </p>
      </div>
    </div>
  )
}