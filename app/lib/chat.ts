import { v4 as uuidv4 } from 'uuid'

export interface ChatMessage {
  id: string
  chatId: string
  content: string
  isSellerMessage: boolean
  attachments?: MessageAttachment[]
  createdAt: string
}

export interface MessageAttachment {
  type: 'product' | 'image' | 'checkout'
  url?: string
  name?: string
  price?: number
  amount?: string
}

export interface SellCommand {
  amount: number
  originalCommand: string
}

export class ChatManager {
  private websocket: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(
    private chatId: string,
    private onMessage: (message: ChatMessage) => void,
    private onTyping?: (isTyping: boolean) => void
  ) {}

  connect() {
    try {
      // In production, use your WebSocket server URL
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
      this.websocket = new WebSocket(`${wsUrl}/chat/${this.chatId}`)

      this.websocket.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
      }

      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        if (data.type === 'message') {
          this.onMessage(data.message)
        } else if (data.type === 'typing' && this.onTyping) {
          this.onTyping(data.isTyping)
        }
      }

      this.websocket.onclose = () => {
        console.log('WebSocket disconnected')
        this.reconnect()
      }

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      // Fall back to polling
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`)
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  sendMessage(content: string, attachments?: MessageAttachment[]) {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'message',
        content,
        attachments
      }))
    }
  }

  sendTypingIndicator(isTyping: boolean) {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'typing',
        isTyping
      }))
    }
  }

  disconnect() {
    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
    }
  }
}

// Parse sell commands from chat messages
export function parseSellCommand(message: string): SellCommand | null {
  const sellRegex = /^sell\s+(\d+(?:\.\d{2})?)/i
  const match = message.trim().match(sellRegex)
  
  if (match) {
    return {
      amount: parseFloat(match[1]),
      originalCommand: message
    }
  }
  
  return null
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Generate checkout session
export async function createCheckoutSession(
  chatId: string,
  amount: number,
  productId?: string
): Promise<string> {
  const response = await fetch('/api/chat/sell-command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chatId,
      command: `sell ${amount}`
    })
  })

  if (!response.ok) {
    throw new Error('Failed to create checkout session')
  }

  const data = await response.json()
  return data.checkoutUrl
}

// Timer utility for checkout sessions
export class CheckoutTimer {
  private timerId: NodeJS.Timeout | null = null
  private startTime: number = 0
  private duration: number = 15 * 60 * 1000 // 15 minutes

  constructor(
    private onUpdate: (timeRemaining: number) => void,
    private onExpire: () => void
  ) {}

  start(expiresAt?: string) {
    this.stop()
    
    if (expiresAt) {
      const expiryTime = new Date(expiresAt).getTime()
      this.duration = expiryTime - Date.now()
    }
    
    this.startTime = Date.now()
    
    this.timerId = setInterval(() => {
      const elapsed = Date.now() - this.startTime
      const remaining = Math.max(0, this.duration - elapsed)
      
      this.onUpdate(Math.floor(remaining / 1000))
      
      if (remaining === 0) {
        this.stop()
        this.onExpire()
      }
    }, 1000)
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId)
      this.timerId = null
    }
  }
}

// Quick reply suggestions
export const quickReplySuggestions = {
  initial: [
    'Is this available?',
    'What\'s the lowest price?',
    'Can you ship today?',
    'Do you have more photos?'
  ],
  negotiation: [
    'Would you take $X?',
    'Can you do better on price?',
    'What\'s your best price?',
    'I\'m ready to buy now'
  ],
  shipping: [
    'How much is shipping?',
    'Do you offer free shipping?',
    'How long does shipping take?',
    'Can you ship to my area?'
  ],
  closing: [
    'I\'ll take it',
    'Send me the payment link',
    'How do I pay?',
    'What payment methods?'
  ]
}

// Auto-attach product screenshots to first message
export function createInitialMessage(
  chatId: string,
  product?: any
): ChatMessage {
  const attachments: MessageAttachment[] = []
  
  if (product) {
    attachments.push({
      type: 'product',
      name: product.name,
      price: product.price,
      url: product.images?.[0]
    })
  }
  
  return {
    id: uuidv4(),
    chatId,
    content: 'Hi! I\'m interested in this item.',
    isSellerMessage: false,
    attachments,
    createdAt: new Date().toISOString()
  }
}