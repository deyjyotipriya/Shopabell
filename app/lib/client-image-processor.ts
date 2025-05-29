import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as mobilenet from '@tensorflow-models/mobilenet';

export interface ProcessedImage {
  originalImage: string;
  processedImage: string;
  thumbnail: string;
  metadata: {
    width: number;
    height: number;
    size: number;
    format: string;
    timestamp: number;
  };
  detection: ProductDetection;
  imageHash?: string;
}

export interface ProductDetection {
  isProduct: boolean;
  confidence: number;
  category?: string;
  boundingBox?: BoundingBox;
  suggestedCrop?: BoundingBox;
  name?: string;
  description?: string;
  suggestedPrice?: number;
  tags?: string[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ClientImageProcessor {
  private cocoModel: cocoSsd.ObjectDetection | null = null;
  private mobilenetModel: mobilenet.MobileNet | null = null;
  private isInitialized = false;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreenCanvas: OffscreenCanvas | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
    
    // Try to use OffscreenCanvas if available
    if (typeof OffscreenCanvas !== 'undefined') {
      this.offscreenCanvas = new OffscreenCanvas(1, 1);
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load TensorFlow.js models
      await tf.ready();
      
      // Load COCO-SSD for object detection
      this.cocoModel = await cocoSsd.load({
        base: 'lite_mobilenet_v2'
      });
      
      // Load MobileNet for classification
      this.mobilenetModel = await mobilenet.load({
        version: 2,
        alpha: 0.5
      });
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize image processor:', error);
      throw error;
    }
  }

  async processImage(imageData: string | Blob): Promise<ProcessedImage> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Convert to image element
    const img = await this.loadImage(imageData);
    
    // Detect products
    const detection = await this.detectProduct(img);
    
    // Process image based on detection
    let processedImage: string;
    if (detection.isProduct && detection.suggestedCrop) {
      processedImage = await this.cropAndEnhance(img, detection.suggestedCrop);
    } else {
      processedImage = await this.enhanceImage(img);
    }
    
    // Apply background removal for fashion and beauty products
    if (detection.isProduct && ['Fashion', 'Beauty', 'Accessories'].includes(detection.category || '')) {
      try {
        processedImage = await this.removeBackground(processedImage);
      } catch (error) {
        console.warn('Background removal failed, using original:', error);
      }
    }
    
    // Generate thumbnail
    const thumbnail = await this.generateThumbnail(processedImage);
    
    // Convert to WebP and compress
    const finalImage = await this.convertToWebP(processedImage);
    
    // Get metadata
    const metadata = await this.getImageMetadata(finalImage);
    
    return {
      originalImage: typeof imageData === 'string' ? imageData : URL.createObjectURL(imageData),
      processedImage: finalImage,
      thumbnail,
      metadata,
      detection
    };
  }

  private async loadImage(imageData: string | Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      
      if (typeof imageData === 'string') {
        img.src = imageData;
      } else {
        img.src = URL.createObjectURL(imageData);
      }
    });
  }

  private async detectProduct(img: HTMLImageElement): Promise<ProductDetection> {
    if (!this.cocoModel || !this.mobilenetModel) {
      return { isProduct: false, confidence: 0 };
    }

    try {
      // Run object detection
      const predictions = await this.cocoModel.detect(img);
      
      // Filter for product-related classes
      const productClasses = [
        'bottle', 'cup', 'bowl', 'banana', 'apple', 'sandwich', 
        'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 
        'donut', 'cake', 'chair', 'couch', 'potted plant', 
        'bed', 'dining table', 'toilet', 'tv', 'laptop', 
        'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 
        'oven', 'toaster', 'sink', 'refrigerator', 'book', 
        'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 
        'toothbrush', 'handbag', 'tie', 'suitcase', 'umbrella',
        'sports ball', 'kite', 'baseball bat', 'skateboard', 
        'tennis racket', 'wine glass', 'fork', 'knife', 'spoon'
      ];
      
      const productPredictions = predictions.filter(p => 
        productClasses.includes(p.class)
      );
      
      if (productPredictions.length > 0) {
        const bestPrediction = productPredictions.reduce((best, current) => 
          current.score > best.score ? current : best
        );
        
        return {
          isProduct: true,
          confidence: bestPrediction.score,
          category: this.mapToProductCategory(bestPrediction.class),
          boundingBox: {
            x: bestPrediction.bbox[0],
            y: bestPrediction.bbox[1],
            width: bestPrediction.bbox[2],
            height: bestPrediction.bbox[3]
          },
          suggestedCrop: this.calculateOptimalCrop(
            bestPrediction.bbox,
            img.width,
            img.height
          )
        };
      }
      
      // If no specific product detected, try general classification
      const classifications = await this.mobilenetModel.classify(img);
      if (classifications.length > 0 && classifications[0].probability > 0.5) {
        return {
          isProduct: true,
          confidence: classifications[0].probability,
          category: 'Other'
        };
      }
      
      return { isProduct: false, confidence: 0 };
    } catch (error) {
      console.error('Product detection error:', error);
      return { isProduct: false, confidence: 0 };
    }
  }

  private mapToProductCategory(cocoClass: string): string {
    const categoryMap: Record<string, string> = {
      'bottle': 'Beverages',
      'cup': 'Kitchenware',
      'bowl': 'Kitchenware',
      'banana': 'Food',
      'apple': 'Food',
      'sandwich': 'Food',
      'cell phone': 'Electronics',
      'laptop': 'Electronics',
      'keyboard': 'Electronics',
      'handbag': 'Fashion',
      'tie': 'Fashion',
      'book': 'Books',
      'chair': 'Furniture',
      'couch': 'Furniture',
      'bed': 'Furniture'
    };
    
    return categoryMap[cocoClass] || 'Other';
  }

  private calculateOptimalCrop(
    bbox: number[],
    imgWidth: number,
    imgHeight: number
  ): BoundingBox {
    const [x, y, width, height] = bbox;
    
    // Add 10% padding around the detected object
    const padding = 0.1;
    const paddedWidth = width * (1 + padding * 2);
    const paddedHeight = height * (1 + padding * 2);
    const paddedX = Math.max(0, x - width * padding);
    const paddedY = Math.max(0, y - height * padding);
    
    // Ensure crop doesn't exceed image bounds
    const finalWidth = Math.min(paddedWidth, imgWidth - paddedX);
    const finalHeight = Math.min(paddedHeight, imgHeight - paddedY);
    
    return {
      x: paddedX,
      y: paddedY,
      width: finalWidth,
      height: finalHeight
    };
  }

  private async cropAndEnhance(
    img: HTMLImageElement,
    crop: BoundingBox
  ): Promise<string> {
    // Set canvas size to crop dimensions
    this.canvas.width = crop.width;
    this.canvas.height = crop.height;
    
    // Draw cropped image
    this.ctx.drawImage(
      img,
      crop.x, crop.y, crop.width, crop.height,
      0, 0, crop.width, crop.height
    );
    
    // Apply enhancements
    this.applyEnhancements();
    
    return this.canvas.toDataURL('image/jpeg', 0.9);
  }

  private async enhanceImage(img: HTMLImageElement): Promise<string> {
    // Set canvas size to image dimensions
    this.canvas.width = img.width;
    this.canvas.height = img.height;
    
    // Draw image
    this.ctx.drawImage(img, 0, 0);
    
    // Apply enhancements
    this.applyEnhancements();
    
    return this.canvas.toDataURL('image/jpeg', 0.9);
  }

  private applyEnhancements(): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    // Apply brightness and contrast adjustments
    const brightness = 10;
    const contrast = 1.1;
    
    for (let i = 0; i < data.length; i += 4) {
      // Red
      data[i] = this.adjustPixel(data[i], brightness, contrast);
      // Green
      data[i + 1] = this.adjustPixel(data[i + 1], brightness, contrast);
      // Blue
      data[i + 2] = this.adjustPixel(data[i + 2], brightness, contrast);
      // Alpha remains unchanged
    }
    
    // Apply subtle sharpening
    this.ctx.putImageData(imageData, 0, 0);
    this.applySharpen();
  }

  private adjustPixel(value: number, brightness: number, contrast: number): number {
    // Apply contrast
    value = ((value - 128) * contrast) + 128;
    // Apply brightness
    value += brightness;
    // Clamp to valid range
    return Math.max(0, Math.min(255, value));
  }

  private applySharpen(): void {
    // Simple sharpening kernel
    const weights = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];
    
    const side = Math.round(Math.sqrt(weights.length));
    const halfSide = Math.floor(side / 2);
    
    const src = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const dst = this.ctx.createImageData(this.canvas.width, this.canvas.height);
    const srcData = src.data;
    const dstData = dst.data;
    
    for (let y = 0; y < this.canvas.height; y++) {
      for (let x = 0; x < this.canvas.width; x++) {
        const dstIdx = (y * this.canvas.width + x) * 4;
        let r = 0, g = 0, b = 0;
        
        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = y + cy - halfSide;
            const scx = x + cx - halfSide;
            
            if (scy >= 0 && scy < this.canvas.height && scx >= 0 && scx < this.canvas.width) {
              const srcIdx = (scy * this.canvas.width + scx) * 4;
              const wt = weights[cy * side + cx];
              
              r += srcData[srcIdx] * wt;
              g += srcData[srcIdx + 1] * wt;
              b += srcData[srcIdx + 2] * wt;
            }
          }
        }
        
        dstData[dstIdx] = Math.max(0, Math.min(255, r));
        dstData[dstIdx + 1] = Math.max(0, Math.min(255, g));
        dstData[dstIdx + 2] = Math.max(0, Math.min(255, b));
        dstData[dstIdx + 3] = srcData[dstIdx + 3];
      }
    }
    
    this.ctx.putImageData(dst, 0, 0);
  }

  private async generateThumbnail(imageUrl: string): Promise<string> {
    const img = await this.loadImage(imageUrl);
    
    // Calculate thumbnail dimensions (max 200x200)
    const maxSize = 200;
    let width = img.width;
    let height = img.height;
    
    if (width > height) {
      if (width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      }
    } else {
      if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
    }
    
    // Create thumbnail
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.drawImage(img, 0, 0, width, height);
    
    return this.canvas.toDataURL('image/jpeg', 0.8);
  }

  private async convertToWebP(imageUrl: string): Promise<string> {
    const img = await this.loadImage(imageUrl);
    
    // Resize if needed to keep file size down
    const maxDimension = 1200;
    let width = img.width;
    let height = img.height;
    
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = (height * maxDimension) / width;
        width = maxDimension;
      } else {
        width = (width * maxDimension) / height;
        height = maxDimension;
      }
    }
    
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.drawImage(img, 0, 0, width, height);
    
    // Try WebP first, fallback to JPEG
    let quality = 0.85;
    let dataUrl = this.canvas.toDataURL('image/webp', quality);
    
    // If WebP not supported or too large, use JPEG
    if (!dataUrl.includes('image/webp') || dataUrl.length > 100000) {
      quality = 0.8;
      dataUrl = this.canvas.toDataURL('image/jpeg', quality);
      
      // Further compress if still too large
      while (dataUrl.length > 100000 && quality > 0.5) {
        quality -= 0.1;
        dataUrl = this.canvas.toDataURL('image/jpeg', quality);
      }
    }
    
    return dataUrl;
  }

  private async getImageMetadata(imageUrl: string): Promise<ProcessedImage['metadata']> {
    const img = await this.loadImage(imageUrl);
    const base64Data = imageUrl.split(',')[1] || '';
    const sizeInBytes = Math.round(base64Data.length * 0.75);
    
    return {
      width: img.width,
      height: img.height,
      size: sizeInBytes,
      format: imageUrl.includes('image/webp') ? 'webp' : 'jpeg',
      timestamp: Date.now()
    };
  }

  async removeBackground(imageUrl: string): Promise<string> {
    const img = await this.loadImage(imageUrl);
    
    this.canvas.width = img.width;
    this.canvas.height = img.height;
    this.ctx.drawImage(img, 0, 0);
    
    // Get image data
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    
    // Use the enhanced background remover
    const { BackgroundRemover } = await import('./background-remover');
    const remover = new BackgroundRemover();
    
    try {
      const processedData = await remover.removeBackground(imageData);
      this.ctx.putImageData(processedData, 0, 0);
      
      // Convert to PNG to preserve transparency
      return this.canvas.toDataURL('image/png');
    } finally {
      remover.dispose();
    }
  }

  dispose(): void {
    if (this.cocoModel) {
      this.cocoModel.dispose();
    }
    if (this.mobilenetModel) {
      // MobileNet doesn't have a dispose method
    }
    this.isInitialized = false;
  }
}

// Singleton instance
let processorInstance: ClientImageProcessor | null = null;

export function getImageProcessor(): ClientImageProcessor {
  if (!processorInstance) {
    processorInstance = new ClientImageProcessor();
  }
  return processorInstance;
}