'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { ArrowLeft, Video, Users, Package, DollarSign, Clock, Eye, Download, Share2 } from 'lucide-react'
import LivestreamStats from '@/app/components/livestream/LivestreamStats'
import ProductPreview from '@/app/components/livestream/ProductPreview'

interface LivestreamDetails {
  id: string
  title: string
  description?: string
  platform: 'facebook' | 'instagram'
  status: 'live' | 'ended' | 'scheduled'
  startTime: string
  endTime?: string
  viewerCount: number
  peakViewers: number
  productsCaptured: number
  totalSales: number
  streamUrl?: string
  products: Product[]
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

  return (
    <div className="space-y-6">
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
              <Badge className={livestream.status === 'live' ? 'bg-red-500' : 'bg-gray-500'}>
                {livestream.status}
              </Badge>
              <Badge variant="outline">{livestream.platform}</Badge>
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
              <CardTitle>Stream Preview</CardTitle>
              <CardDescription>
                Live preview of your stream
              </CardDescription>
            </CardHeader>
            <CardContent>
              {livestream.streamUrl ? (
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
              ) : (
                <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Video className="h-16 w-16 mx-auto mb-4" />
                    <p>No stream URL provided</p>
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