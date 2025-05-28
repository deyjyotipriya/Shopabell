'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play, Users, X } from 'lucide-react'

interface LivestreamBannerProps {
  livestream: {
    id: string
    title: string
    platform: string
    viewerCount: number
    startedAt: string
  }
  storeUrl: string
}

export default function LivestreamBanner({ livestream, storeUrl }: LivestreamBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [duration, setDuration] = useState('0:00')

  useEffect(() => {
    const interval = setInterval(() => {
      const start = new Date(livestream.startedAt).getTime()
      const now = Date.now()
      const diff = Math.floor((now - start) / 1000)
      
      const hours = Math.floor(diff / 3600)
      const minutes = Math.floor((diff % 3600) / 60)
      const seconds = diff % 60
      
      if (hours > 0) {
        setDuration(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      } else {
        setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [livestream.startedAt])

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Play className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <span className="font-semibold">LIVE NOW</span>
            </div>
            
            <div className="hidden sm:flex items-center space-x-4 text-sm">
              <span className="opacity-90">{livestream.title}</span>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{livestream.viewerCount} watching</span>
              </div>
              <span className="opacity-75">{duration}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href={`/store/${storeUrl}/livestream/${livestream.id}`}
              className="bg-white text-purple-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-100 transition"
            >
              Watch Live
            </Link>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/80 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}