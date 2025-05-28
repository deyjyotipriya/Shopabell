'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ChatInterface from '@/app/components/buyer/ChatInterface'
import { Chat, Message } from '@/app/types'

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const chatId = params.chatId as string
  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChatData()
    // Set up WebSocket or polling for real-time messages
    const interval = setInterval(fetchMessages, 2000)
    return () => clearInterval(interval)
  }, [chatId])

  const fetchChatData = async () => {
    try {
      const response = await fetch(`/api/chat/${chatId}`)
      if (response.ok) {
        const data = await response.json()
        setChat(data.chat)
        setMessages(data.messages)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching chat:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${chatId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async (content: string, attachments?: any[]) => {
    try {
      const response = await fetch(`/api/chat/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, attachments })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages([...messages, data.message])
        
        // Check if it's a sell command
        if (content.toLowerCase().startsWith('sell ')) {
          processSellCommand(content)
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const processSellCommand = async (command: string) => {
    try {
      const response = await fetch('/api/chat/sell-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, command })
      })

      if (response.ok) {
        const { checkoutUrl } = await response.json()
        // Show checkout link in chat
        setTimeout(() => {
          router.push(checkoutUrl)
        }, 1000)
      }
    } catch (error) {
      console.error('Error processing sell command:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Chat not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ChatInterface
        chat={chat}
        messages={messages}
        onSendMessage={sendMessage}
      />
    </div>
  )
}