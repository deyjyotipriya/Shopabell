'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { toast } from '@/app/components/ui/use-toast'
import { 
  Camera, 
  Pause, 
  Play, 
  X, 
  Package, 
  Users, 
  Minimize2, 
  Maximize2,
  Settings,
  Loader2
} from 'lucide-react'
import LivestreamCapture from './LivestreamCapture'

interface LivestreamWidgetProps {
  livestreamId: string
  onClose?: () => void
}

export default function LivestreamWidget({ livestreamId, onClose }: LivestreamWidgetProps) {
  const [isCapturing, setIsCapturing] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [productCount, setProductCount] = useState(0)
  const [viewerCount, setViewerCount] = useState(0)
  const [captureInterval, setCaptureInterval] = useState(5000) // 5 seconds default
  const [lastCaptureTime, setLastCaptureTime] = useState<Date | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const captureRef = useRef<any>(null)

  useEffect(() => {
    // Fetch initial stats
    fetchStats()
    const statsInterval = setInterval(fetchStats, 10000) // Update stats every 10 seconds

    return () => {
      clearInterval(statsInterval)
    }
  }, [livestreamId])

  useEffect(() => {
    let captureTimer: NodeJS.Timeout

    if (isCapturing && !isMinimized) {
      captureTimer = setInterval(() => {
        handleCapture()
      }, captureInterval)
    }

    return () => {
      if (captureTimer) clearInterval(captureTimer)
    }
  }, [isCapturing, isMinimized, captureInterval])

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/livestream/stats?id=${livestreamId}`)
      if (response.ok) {
        const data = await response.json()
        setProductCount(data.productCount)
        setViewerCount(data.viewerCount)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleCapture = async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    setLastCaptureTime(new Date())

    try {
      // Trigger screenshot capture
      const screenshot = await captureRef.current?.captureScreenshot()
      
      if (screenshot) {
        // Send to API for processing
        const response = await fetch('/api/livestream/capture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            livestreamId,
            screenshot,
            timestamp: new Date().toISOString()
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.productsDetected > 0) {
            setProductCount(prev => prev + data.productsDetected)
            toast({
              title: 'Products detected',
              description: `${data.productsDetected} new product(s) captured`,
            })
          }
        }
      }
    } catch (error) {
      console.error('Capture failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleCapture = () => {
    setIsCapturing(!isCapturing)
    toast({
      title: isCapturing ? 'Capture paused' : 'Capture resumed',
      description: isCapturing 
        ? 'Screenshot capture has been paused' 
        : 'Screenshot capture has been resumed',
    })
  }

  const handleSettingsChange = (interval: number) => {
    setCaptureInterval(interval * 1000)
    toast({
      title: 'Settings updated',
      description: `Capture interval set to ${interval} seconds`,
    })
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="p-2 shadow-lg border-2 border-primary">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Camera className="h-5 w-5" />
              {isCapturing && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <Badge variant="secondary">{productCount} products</Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setIsMinimized(false)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-2xl border-2 border-primary">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Camera className="h-5 w-5" />
              {isCapturing && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <span className="font-semibold">Livestream Capture</span>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setIsMinimized(true)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>Products</span>
              </div>
              <div className="text-2xl font-bold">{productCount}</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Viewers</span>
              </div>
              <div className="text-2xl font-bold">{viewerCount.toLocaleString()}</div>
            </div>
          </div>

          {/* Capture Status */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              {isCapturing ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Capturing every {captureInterval / 1000}s</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full" />
                  <span>Capture paused</span>
                </div>
              )}
            </div>
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>

          {lastCaptureTime && (
            <div className="text-xs text-muted-foreground">
              Last capture: {lastCaptureTime.toLocaleTimeString()}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            <Button 
              onClick={toggleCapture} 
              variant={isCapturing ? "secondary" : "default"}
              className="flex-1"
            >
              {isCapturing ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                const interval = prompt('Set capture interval (seconds):', String(captureInterval / 1000))
                if (interval && !isNaN(Number(interval))) {
                  handleSettingsChange(Number(interval))
                }
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Hidden capture component */}
        <LivestreamCapture ref={captureRef} />
      </Card>
    </div>
  )
}