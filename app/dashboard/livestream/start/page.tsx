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
import { Video, Facebook, Instagram, ArrowLeft, Loader2, Upload } from 'lucide-react'
import Link from 'next/link'

export default function StartLivestream() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [captureMode, setCaptureMode] = useState<'live' | 'upload'>('live')
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null)
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
      if (captureMode === 'upload' && uploadedVideo) {
        // Handle video upload
        const uploadFormData = new FormData()
        uploadFormData.append('video', uploadedVideo)
        uploadFormData.append('title', formData.title)
        uploadFormData.append('description', formData.description)
        
        const response = await fetch('/api/livestream/upload', {
          method: 'POST',
          body: uploadFormData,
        })

        if (response.ok) {
          const data = await response.json()
          toast({
            title: 'Processing video',
            description: 'Your video is being processed. Products will be extracted automatically.',
          })
          router.push(`/dashboard/livestream/${data.id}`)
        } else {
          throw new Error('Failed to upload video')
        }
      } else {
        // Handle live capture
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
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: captureMode === 'upload' ? 'Failed to upload video. Please try again.' : 'Failed to start livestream. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a video file.',
          variant: 'destructive',
        })
        return
      }
      // Validate file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload a video smaller than 500MB.',
          variant: 'destructive',
        })
        return
      }
      setUploadedVideo(file)
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
          <CardTitle>Capture Mode</CardTitle>
          <CardDescription>
            Choose how you want to capture products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={captureMode}
            onValueChange={(value: 'live' | 'upload') => setCaptureMode(value)}
          >
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50">
              <RadioGroupItem value="live" id="live-capture" />
              <Label htmlFor="live-capture" className="flex items-center cursor-pointer">
                <Video className="h-5 w-5 mr-2 text-blue-600" />
                <div>
                  <div className="font-medium">Live Capture</div>
                  <div className="text-sm text-muted-foreground">
                    Capture products in real-time during your livestream
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50">
              <RadioGroupItem value="upload" id="upload-capture" />
              <Label htmlFor="upload-capture" className="flex items-center cursor-pointer">
                <Upload className="h-5 w-5 mr-2 text-green-600" />
                <div>
                  <div className="font-medium">Upload Recording</div>
                  <div className="text-sm text-muted-foreground">
                    Extract products from a pre-recorded video
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{captureMode === 'live' ? 'Livestream Details' : 'Video Details'}</CardTitle>
          <CardDescription>
            {captureMode === 'live' 
              ? 'Configure your livestream settings and start capturing products' 
              : 'Upload your video and configure processing settings'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">{captureMode === 'live' ? 'Livestream Title' : 'Video Title'}</Label>
              <Input
                id="title"
                placeholder={captureMode === 'live' ? "Summer Collection Launch" : "Product Showcase Video"}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder={captureMode === 'live' ? "Describe what you'll be showcasing..." : "Describe the products in your video..."}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            {captureMode === 'upload' ? (
              <div className="space-y-2">
                <Label htmlFor="video">Upload Video</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                    required={captureMode === 'upload'}
                  />
                  <Label
                    htmlFor="video"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <div className="text-sm">
                      {uploadedVideo ? (
                        <div>
                          <p className="font-medium">{uploadedVideo.name}</p>
                          <p className="text-muted-foreground">
                            {(uploadedVideo.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium">Click to upload video</p>
                          <p className="text-muted-foreground">
                            MP4, MOV, AVI (max 500MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </Label>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}

            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">What happens next?</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {captureMode === 'live' ? (
                  <>
                    <li>• A floating widget will appear on your screen</li>
                    <li>• Screenshots will be captured every 5 seconds</li>
                    <li>• AI will detect and group similar products</li>
                    <li>• Products will be created automatically in your store</li>
                    <li>• You can pause/resume capture anytime</li>
                  </>
                ) : (
                  <>
                    <li>• Your video will be uploaded and processed</li>
                    <li>• AI will analyze frames to detect products</li>
                    <li>• Similar products will be grouped together</li>
                    <li>• Products will be created automatically in your store</li>
                    <li>• You'll receive a notification when processing is complete</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading || (captureMode === 'upload' && !uploadedVideo)} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {captureMode === 'live' ? 'Starting...' : 'Uploading...'}
                  </>
                ) : (
                  <>
                    {captureMode === 'live' ? (
                      <>
                        <Video className="mr-2 h-4 w-4" />
                        Start Livestream Capture
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload & Process Video
                      </>
                    )}
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