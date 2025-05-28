'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Video, Users, Package, DollarSign, Calendar, Clock, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu'

interface Livestream {
  id: string
  title: string
  platform: 'facebook' | 'instagram'
  status: 'live' | 'ended' | 'scheduled'
  startTime: string
  endTime?: string
  viewerCount: number
  productsCaptured: number
  totalSales: number
  thumbnail?: string
}

export default function LivestreamDashboard() {
  const [livestreams, setLivestreams] = useState<Livestream[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLivestreams()
  }, [])

  const fetchLivestreams = async () => {
    try {
      const response = await fetch('/api/livestream')
      if (response.ok) {
        const data = await response.json()
        setLivestreams(data)
      }
    } catch (error) {
      console.error('Failed to fetch livestreams:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-500'
      case 'ended':
        return 'bg-gray-500'
      case 'scheduled':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatDuration = (start: string, end?: string) => {
    const startDate = new Date(start)
    const endDate = end ? new Date(end) : new Date()
    const duration = Math.floor((endDate.getTime() - startDate.getTime()) / 1000 / 60)
    
    if (duration < 60) {
      return `${duration} min`
    }
    return `${Math.floor(duration / 60)}h ${duration % 60}m`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Livestream Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your livestream sessions and captured products
          </p>
        </div>
        <Link href="/dashboard/livestream/start">
          <Button>
            <Video className="mr-2 h-4 w-4" />
            Start Livestream
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Livestreams</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {livestreams.filter(l => l.status === 'live').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {livestreams.reduce((sum, l) => sum + l.productsCaptured, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Viewers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {livestreams.reduce((sum, l) => sum + l.viewerCount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${livestreams.reduce((sum, l) => sum + l.totalSales, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Livestream List */}
      <Card>
        <CardHeader>
          <CardTitle>Livestream Sessions</CardTitle>
          <CardDescription>
            View and manage all your livestream sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading livestreams...</div>
          ) : livestreams.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No livestreams yet</p>
              <Link href="/dashboard/livestream/start">
                <Button variant="outline">Start Your First Livestream</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {livestreams.map((livestream) => (
                <div
                  key={livestream.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Video className="h-8 w-8 text-gray-400" />
                      </div>
                      {livestream.status === 'live' && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{livestream.title}</h3>
                        <Badge className={getStatusColor(livestream.status)}>
                          {livestream.status}
                        </Badge>
                        <Badge variant="outline">{livestream.platform}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(livestream.startTime).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(livestream.startTime, livestream.endTime)}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {livestream.viewerCount.toLocaleString()} viewers
                        </span>
                        <span className="flex items-center">
                          <Package className="h-3 w-3 mr-1" />
                          {livestream.productsCaptured} products
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/livestream/${livestream.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Export Products</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}