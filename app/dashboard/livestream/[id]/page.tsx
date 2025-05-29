'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Progress } from '@/app/components/ui/progress'
import { ArrowLeft, Video, Users, Package, DollarSign, Clock, Eye, Download, Share2, Loader2, Upload, CheckCircle, XCircle } from 'lucide-react'
import LivestreamStats from '@/app/components/livestream/LivestreamStats'
import ProductPreview from '@/app/components/livestream/ProductPreview'

interface LivestreamDetails {
  id: string
  title: string
  description?: string
  platform: 'facebook' | 'instagram' | 'upload'
  status: 'live' | 'ended' | 'scheduled' | 'processing'
  processingStatus?: 'uploading' | 'queued' | 'processing' | 'completed' | 'failed'
  processingProgress?: number
  startTime: string
  endTime?: string
  viewerCount: number
  peakViewers: number
  productsCaptured: number
  totalSales: number
  streamUrl?: string
  products: Product[]
  metadata?: any
}

interface Product {
  id: string
  title: string
  price: number
  image: string
  capturedAt: string
  confidence: number
  status: 'pending' | 'published' | 'rejected'
}

export default function LivestreamDetailsPage() {
  const params = useParams()
  const [livestream, setLivestream] = useState<LivestreamDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLivestreamDetails()
    const interval = setInterval(fetchLivestreamDetails, 5000) // Update every 5 seconds if live
    return () => clearInterval(interval)
  }, [params.id])

  const fetchLivestreamDetails = async () => {
    try {
      const response = await fetch(`/api/livestream/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setLivestream(data)
      }
    } catch (error) {
      console.error('Failed to fetch livestream details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEndLivestream = async () => {
    try {
      const response = await fetch('/api/livestream/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: params.id }),
      })

      if (response.ok) {
        fetchLivestreamDetails()
      }
    } catch (error) {
      console.error('Failed to end livestream:', error)
    }
  }

  if (loading || !livestream) {
    return <div className="flex items-center justify-center h-96">Loading...</div>
  }

  const getStatusBadgeColor = () => {
    if (livestream.status === 'live') return 'bg-red-500'
    if (livestream.status === 'processing') return 'bg-yellow-500'
    if (livestream.status === 'ended' && livestream.processingStatus === 'completed') return 'bg-green-500'
    return 'bg-gray-500'
  }

  const getPlatformIcon = () => {
    if (livestream.platform === 'upload') return <Upload className="h-4 w-4" />
    return null
  }

  return (
    <div className="space-y-6">
      {/* Processing Status Banner */}
      {livestream.status === 'processing' && livestream.processingStatus && (
        <Card className="border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-semibold">Processing Video</h3>
                <p className="text-sm text-muted-foreground">
                  {livestream.processingStatus === 'uploading' && 'Uploading video...'}
                  {livestream.processingStatus === 'queued' && 'Video queued for processing...'}
                  {livestream.processingStatus === 'processing' && 'Extracting and analyzing products...'}
                </p>
                {livestream.processingProgress && (
                  <Progress value={livestream.processingProgress} className="mt-2 h-2" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failed Processing Banner */}
      {livestream.processingStatus === 'failed' && (
        <Card className="border-red-500/20 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold">Processing Failed</h3>
                <p className="text-sm text-muted-foreground">
                  Video processing failed. Please try uploading again.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Processing Banner */}
      {livestream.processingStatus === 'completed' && livestream.platform === 'upload' && (
        <Card className="border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-semibold">Processing Complete</h3>
                <p className="text-sm text-muted-foreground">
                  Successfully extracted {livestream.productsCaptured} products from your video.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/livestream">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{livestream.title}</h1>
              <Badge className={getStatusBadgeColor()}>
                {livestream.status === 'processing' ? livestream.processingStatus : livestream.status}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                {getPlatformIcon()}
                {livestream.platform}
              </Badge>
            </div>
            {livestream.description && (
              <p className="text-muted-foreground mt-1">{livestream.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {livestream.status === 'live' && (
            <Button variant="destructive" onClick={handleEndLivestream}>
              End Livestream
            </Button>
          )}
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        {livestream.platform !== 'upload' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Viewers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{livestream.viewerCount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Peak: {livestream.peakViewers.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Captured</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{livestream.productsCaptured}</div>
            <p className="text-xs text-muted-foreground">
              {livestream.products.filter(p => p.status === 'published').length} published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${livestream.totalSales.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const start = new Date(livestream.startTime)
                const end = livestream.endTime ? new Date(livestream.endTime) : new Date()
                const duration = Math.floor((end.getTime() - start.getTime()) / 1000 / 60)
                return duration < 60 ? `${duration}m` : `${Math.floor(duration / 60)}h ${duration % 60}m`
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="stream">Stream Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Captured Products</CardTitle>
              <CardDescription>
                Products detected and captured during the livestream
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductPreview products={livestream.products} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <LivestreamStats livestreamId={livestream.id} />
        </TabsContent>

        <TabsContent value="stream" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{livestream.platform === 'upload' ? 'Uploaded Video' : 'Stream Preview'}</CardTitle>
              <CardDescription>
                {livestream.platform === 'upload' ? 'Preview of your uploaded video' : 'Live preview of your stream'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {livestream.streamUrl ? (
                <div className="space-y-4">
                  {livestream.platform === 'upload' ? (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video 
                        controls 
                        className="w-full h-full"
                        src={livestream.streamUrl}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <Video className="h-16 w-16 mx-auto mb-4" />
                        <p>Stream preview would appear here</p>
                        <a 
                          href={livestream.streamUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline mt-2 inline-block"
                        >
                          <Eye className="h-4 w-4 inline mr-1" />
                          View on {livestream.platform}
                        </a>
                      </div>
                    </div>
                  )}
                  {livestream.metadata && livestream.platform === 'upload' && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Original file: {livestream.metadata.originalName}</p>
                      <p>File size: {(livestream.metadata.fileSize / (1024 * 1024)).toFixed(2)} MB</p>
                      <p>Uploaded: {new Date(livestream.metadata.uploadedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Video className="h-16 w-16 mx-auto mb-4" />
                    <p>No {livestream.platform === 'upload' ? 'video' : 'stream URL'} provided</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}