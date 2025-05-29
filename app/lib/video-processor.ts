import { getImageProcessor } from './client-image-processor'
import { generateProductMetadata } from './ai-service'

interface VideoFrame {
  timestamp: number
  imageData: string
}

interface ProcessedProduct {
  name: string
  description: string
  category: string
  price: number
  confidence: number
  frameTimestamp: number
  imageData: string
  thumbnail: string
}

export class VideoProcessor {
  private videoElement: HTMLVideoElement | null = null
  private canvasElement: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeElements()
    }
  }

  private initializeElements() {
    this.videoElement = document.createElement('video')
    this.videoElement.crossOrigin = 'anonymous'
    this.videoElement.muted = true
    
    this.canvasElement = document.createElement('canvas')
    this.ctx = this.canvasElement.getContext('2d')
  }

  async processVideoUrl(videoUrl: string, options: {
    frameInterval?: number // seconds between frame captures
    maxFrames?: number
    onProgress?: (progress: number) => void
  } = {}): Promise<ProcessedProduct[]> {
    const {
      frameInterval = 2, // Capture frame every 2 seconds
      maxFrames = 150, // Max 5 minutes of video at 2s intervals
      onProgress
    } = options

    if (!this.videoElement || !this.canvasElement || !this.ctx) {
      throw new Error('Video processor not initialized')
    }

    return new Promise((resolve, reject) => {
      if (!this.videoElement) return reject(new Error('No video element'))

      const frames: VideoFrame[] = []
      let currentFrame = 0

      // Load video metadata
      this.videoElement.addEventListener('loadedmetadata', () => {
        if (!this.videoElement || !this.canvasElement) return

        const duration = this.videoElement.duration
        const totalFrames = Math.min(
          Math.floor(duration / frameInterval),
          maxFrames
        )

        // Set canvas size to match video
        this.canvasElement.width = this.videoElement.videoWidth
        this.canvasElement.height = this.videoElement.videoHeight

        // Process frames
        const captureFrame = () => {
          if (!this.videoElement || !this.ctx || !this.canvasElement) return

          // Draw current frame to canvas
          this.ctx.drawImage(
            this.videoElement,
            0,
            0,
            this.canvasElement.width,
            this.canvasElement.height
          )

          // Convert to base64
          const imageData = this.canvasElement.toDataURL('image/jpeg', 0.9)
          
          frames.push({
            timestamp: this.videoElement.currentTime,
            imageData
          })

          // Report progress
          if (onProgress) {
            onProgress((currentFrame + 1) / totalFrames)
          }

          currentFrame++

          // Move to next frame or finish
          if (currentFrame < totalFrames) {
            this.videoElement.currentTime = currentFrame * frameInterval
          } else {
            // Process all captured frames
            this.processFrames(frames).then(resolve).catch(reject)
          }
        }

        // Start capturing when frame is ready
        this.videoElement.addEventListener('seeked', captureFrame)

        // Start with first frame
        this.videoElement.currentTime = 0
      })

      // Handle errors
      this.videoElement.addEventListener('error', (e) => {
        reject(new Error('Failed to load video'))
      })

      // Load video
      this.videoElement.src = videoUrl
      this.videoElement.load()
    })
  }

  private async processFrames(frames: VideoFrame[]): Promise<ProcessedProduct[]> {
    const imageProcessor = getImageProcessor()
    const products: ProcessedProduct[] = []
    const processedHashes = new Set<string>()

    for (const frame of frames) {
      try {
        // Process image for product detection
        const processed = await imageProcessor.processImage(frame.imageData)
        
        // Skip if no product detected
        if (!processed.detection.isProduct || processed.detection.confidence < 0.7) {
          continue
        }

        // Skip if we've already processed a similar product (deduplication)
        if (processed.imageHash && processedHashes.has(processed.imageHash)) {
          continue
        }

        if (processed.imageHash) {
          processedHashes.add(processed.imageHash)
        }

        // Generate product metadata
        const metadata = await generateProductMetadata(
          processed.detection.name || 'Product from video',
          processed.detection.category || 'Other',
          processed.detection.description
        )

        products.push({
          name: processed.detection.name || `Product at ${Math.floor(frame.timestamp)}s`,
          description: processed.detection.description || metadata.seoDescription || '',
          category: processed.detection.category || 'Other',
          price: processed.detection.suggestedPrice || 0,
          confidence: processed.detection.confidence,
          frameTimestamp: frame.timestamp,
          imageData: processed.processedImage,
          thumbnail: processed.thumbnail
        })

      } catch (error) {
        console.error(`Failed to process frame at ${frame.timestamp}s:`, error)
      }
    }

    return products
  }

  async extractFrameAt(videoUrl: string, timestamp: number): Promise<string | null> {
    if (!this.videoElement || !this.canvasElement || !this.ctx) {
      throw new Error('Video processor not initialized')
    }

    return new Promise((resolve, reject) => {
      if (!this.videoElement || !this.canvasElement || !this.ctx) return reject(new Error('Not initialized'))

      const video = this.videoElement

      video.addEventListener('loadedmetadata', () => {
        if (!this.canvasElement || !this.ctx) return

        this.canvasElement.width = video.videoWidth
        this.canvasElement.height = video.videoHeight
        video.currentTime = timestamp
      })

      video.addEventListener('seeked', () => {
        if (!this.canvasElement || !this.ctx) return

        this.ctx.drawImage(video, 0, 0, this.canvasElement.width, this.canvasElement.height)
        const imageData = this.canvasElement.toDataURL('image/jpeg', 0.9)
        resolve(imageData)
      })

      video.addEventListener('error', () => {
        reject(new Error('Failed to load video'))
      })

      video.src = videoUrl
      video.load()
    })
  }

  dispose() {
    if (this.videoElement) {
      this.videoElement.remove()
      this.videoElement = null
    }
    if (this.canvasElement) {
      this.canvasElement.remove()
      this.canvasElement = null
    }
    this.ctx = null
  }
}

// Factory function for server/client compatibility
export function getVideoProcessor(): VideoProcessor | null {
  if (typeof window === 'undefined') {
    return null
  }
  return new VideoProcessor()
}