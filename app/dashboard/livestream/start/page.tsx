'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group'
import { Textarea } from '@/app/components/ui/textarea'
import { toast } from '@/app/components/ui/use-toast'
import { Video, Facebook, Instagram, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function StartLivestream() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: 'facebook',
    streamUrl: '',
    streamKey: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/livestream/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Livestream started',
          description: 'Your livestream session has been started successfully.',
        })
        router.push(`/dashboard/livestream/${data.id}`)
      } else {
        throw new Error('Failed to start livestream')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start livestream. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/livestream">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Start New Livestream</h1>
          <p className="text-muted-foreground">
            Set up your livestream capture session
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Livestream Details</CardTitle>
          <CardDescription>
            Configure your livestream settings and start capturing products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Livestream Title</Label>
              <Input
                id="title"
                placeholder="Summer Collection Launch"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe what you'll be showcasing..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label>Platform</Label>
              <RadioGroup
                value={formData.platform}
                onValueChange={(value) => setFormData({ ...formData, platform: value })}
              >
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50">
                  <RadioGroupItem value="facebook" id="facebook" />
                  <Label htmlFor="facebook" className="flex items-center cursor-pointer">
                    <Facebook className="h-5 w-5 mr-2 text-blue-600" />
                    Facebook Live
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50">
                  <RadioGroupItem value="instagram" id="instagram" />
                  <Label htmlFor="instagram" className="flex items-center cursor-pointer">
                    <Instagram className="h-5 w-5 mr-2 text-pink-600" />
                    Instagram Live
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="streamUrl">Stream URL (Optional)</Label>
              <Input
                id="streamUrl"
                placeholder="https://www.facebook.com/your-page/live"
                value={formData.streamUrl}
                onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Add your livestream URL to track viewers and engagement
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="streamKey">Stream Key (Optional)</Label>
              <Input
                id="streamKey"
                type="password"
                placeholder="Your stream key"
                value={formData.streamKey}
                onChange={(e) => setFormData({ ...formData, streamKey: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                For advanced integration features
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">What happens next?</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• A floating widget will appear on your screen</li>
                <li>• Screenshots will be captured every 5 seconds</li>
                <li>• AI will detect and group similar products</li>
                <li>• Products will be created automatically in your store</li>
                <li>• You can pause/resume capture anytime</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    Start Livestream Capture
                  </>
                )}
              </Button>
              <Link href="/dashboard/livestream">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}