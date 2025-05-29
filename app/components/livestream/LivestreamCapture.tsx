'use client'

import { forwardRef, useImperativeHandle, useRef, useEffect, useState, useCallback } from 'react'
import html2canvas from 'html2canvas'
import { getLivestreamProcessor } from '@/app/lib/livestream-processor'
import { ProcessedImage } from '@/app/lib/client-image-processor'

interface LivestreamCaptureHandle {
  captureScreenshot: () => Promise<string | null>
  startAutoCapture: (livestreamId: string, intervalSeconds?: number) => Promise<void>
  stopAutoCapture: () => void
  getProcessedImages: () => Promise<ProcessedImage[]>
}

interface LivestreamCaptureProps {
  onImageProcessed?: (image: ProcessedImage, timestamp: number) => void
  captureElement?: HTMLElement | null
}

const LivestreamCapture = forwardRef<LivestreamCaptureHandle, LivestreamCaptureProps>(
  ({ onImageProcessed, captureElement }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const processorRef = useRef(getLivestreamProcessor())
    const [currentLivestreamId, setCurrentLivestreamId] = useState<string | null>(null)

    useEffect(() => {
      const processor = processorRef.current

      // Listen for processed images
      const handleProcessed = (event: CustomEvent) => {
        if (onImageProcessed && event.detail.livestreamId === currentLivestreamId) {
          onImageProcessed(event.detail.image, event.detail.timestamp)
        }
      }

      window.addEventListener('livestream-image-processed', handleProcessed as EventListener)

      return () => {
        window.removeEventListener('livestream-image-processed', handleProcessed as EventListener)
        processor.dispose()
      }
    }, [onImageProcessed, currentLivestreamId])

    const captureScreenshot = useCallback(async () => {
      try {
        // Determine what to capture
        const targetElement = captureElement || document.body
        
        // Hide the widget temporarily
        const widget = document.querySelector('.fixed.bottom-4.right-4')
        if (widget) {
          (widget as HTMLElement).style.display = 'none'
        }

        const canvas = await html2canvas(targetElement, {
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: null,
          windowWidth: targetElement.scrollWidth,
          windowHeight: targetElement.scrollHeight,
        } as any)

        if (widget) {
          (widget as HTMLElement).style.display = ''
        }

        // Convert to base64
        const screenshot = canvas.toDataURL('image/jpeg', 0.9)
        return screenshot

      } catch (error) {
        console.error('Screenshot capture failed:', error)
        
        // Return a mock screenshot for development
        return createMockScreenshot()
      }
    }, [captureElement])

    useImperativeHandle(ref, () => ({
      captureScreenshot,
      
      startAutoCapture: async (livestreamId: string, intervalSeconds = 5) => {
        setCurrentLivestreamId(livestreamId)
        const processor = processorRef.current
        const element = captureElement || document.body
        await processor.startCapture(livestreamId, element, intervalSeconds)
      },
      
      stopAutoCapture: () => {
        const processor = processorRef.current
        processor.stopCapture()
        setCurrentLivestreamId(null)
      },
      
      getProcessedImages: async () => {
        if (!currentLivestreamId) return []
        const processor = processorRef.current
        return processor.exportProcessedImages(currentLivestreamId)
      }
    }))

  const createMockScreenshot = (): string => {
    // Create a mock screenshot for development/testing
    const canvas = document.createElement('canvas')
    canvas.width = 1280
    canvas.height = 720
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // Create a gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#f0f0f0')
      gradient.addColorStop(1, '#e0e0e0')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add mock product placeholders
      const products = [
        { x: 200, y: 150, color: '#FF6B6B' },
        { x: 500, y: 150, color: '#4ECDC4' },
        { x: 800, y: 150, color: '#45B7D1' },
        { x: 350, y: 400, color: '#F7DC6F' },
        { x: 650, y: 400, color: '#BB8FCE' },
      ]

      products.forEach(product => {
        // Product box
        ctx.fillStyle = product.color
        ctx.fillRect(product.x, product.y, 200, 200)
        
        // Product label
        ctx.fillStyle = 'white'
        ctx.font = '20px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Product', product.x + 100, product.y + 100)
      })

      // Add timestamp
      ctx.fillStyle = '#333'
      ctx.font = '16px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(`Mock screenshot - ${new Date().toLocaleTimeString()}`, 20, 30)
    }

    return canvas.toDataURL('image/jpeg', 0.8)
  }

  return (
    <canvas 
      ref={canvasRef} 
      style={{ display: 'none' }}
      width={1280}
      height={720}
    />
  )
})

LivestreamCapture.displayName = 'LivestreamCapture'

export default LivestreamCapture