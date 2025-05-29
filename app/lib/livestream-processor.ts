import { ProcessedImage } from './client-image-processor';

interface CachedImage extends ProcessedImage {
  id: string;
  livestreamId: string;
  timestamp: number;
}

export class LivestreamProcessor {
  private worker: Worker | null = null;
  private db: IDBDatabase | null = null;
  private pendingRequests = new Map<string, {
    resolve: (value: ProcessedImage) => void;
    reject: (error: Error) => void;
  }>();
  private processingQueue: Array<{
    id: string;
    imageData: string;
    livestreamId: string;
    timestamp: number;
  }> = [];
  private isProcessing = false;
  private captureInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.initializeDB();
  }

  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LivestreamCaptures', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store for processed images
        if (!db.objectStoreNames.contains('processedImages')) {
          const store = db.createObjectStore('processedImages', { keyPath: 'id' });
          store.createIndex('livestreamId', 'livestreamId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Create object store for temporary captures
        if (!db.objectStoreNames.contains('tempCaptures')) {
          const store = db.createObjectStore('tempCaptures', { keyPath: 'id' });
          store.createIndex('livestreamId', 'livestreamId', { unique: false });
        }
      };
    });
  }

  private async initializeWorker(): Promise<void> {
    if (this.worker) return;

    return new Promise((resolve, reject) => {
      // Create worker with inline code for better compatibility
      const workerCode = `
        let processor = null;
        
        self.addEventListener('message', async (event) => {
          const { data } = event;
          
          switch (data.type) {
            case 'INITIALIZE':
              try {
                // Dynamic import for Web Worker
                const module = await import('/lib/client-image-processor.js');
                const { ClientImageProcessor } = module;
                processor = new ClientImageProcessor();
                await processor.initialize();
                self.postMessage({ type: 'INITIALIZED' });
              } catch (error) {
                self.postMessage({ 
                  type: 'ERROR', 
                  id: 'init', 
                  error: error.message 
                });
              }
              break;
              
            case 'PROCESS_IMAGE':
              try {
                if (!processor) {
                  throw new Error('Processor not initialized');
                }
                const result = await processor.processImage(data.imageData);
                self.postMessage({
                  type: 'IMAGE_PROCESSED',
                  id: data.id,
                  result
                });
              } catch (error) {
                self.postMessage({
                  type: 'ERROR',
                  id: data.id,
                  error: error.message
                });
              }
              break;
          }
        });
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      this.worker = new Worker(workerUrl);
      
      this.worker.addEventListener('message', (event) => {
        const { data } = event;
        
        switch (data.type) {
          case 'INITIALIZED':
            resolve();
            break;
            
          case 'IMAGE_PROCESSED':
            const request = this.pendingRequests.get(data.id);
            if (request) {
              request.resolve(data.result);
              this.pendingRequests.delete(data.id);
            }
            this.processNext();
            break;
            
          case 'ERROR':
            if (data.id === 'init') {
              reject(new Error(data.error));
            } else {
              const request = this.pendingRequests.get(data.id);
              if (request) {
                request.reject(new Error(data.error));
                this.pendingRequests.delete(data.id);
              }
              this.processNext();
            }
            break;
        }
      });
      
      // Initialize the worker
      this.worker.postMessage({ type: 'INITIALIZE' });
    });
  }

  async startCapture(
    livestreamId: string,
    captureElement: HTMLElement,
    intervalSeconds: number = 5
  ): Promise<void> {
    if (this.captureInterval) {
      this.stopCapture();
    }

    // Initialize worker if needed
    if (!this.worker) {
      await this.initializeWorker();
    }

    // Start capturing at intervals
    this.captureInterval = setInterval(async () => {
      try {
        const screenshot = await this.captureScreenshot(captureElement);
        await this.processCapture(screenshot, livestreamId);
      } catch (error) {
        console.error('Capture error:', error);
      }
    }, intervalSeconds * 1000);

    // Capture immediately
    const screenshot = await this.captureScreenshot(captureElement);
    await this.processCapture(screenshot, livestreamId);
  }

  stopCapture(): void {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }
  }

  private async captureScreenshot(element: HTMLElement): Promise<string> {
    // Use html2canvas for screenshot capture
    const html2canvas = (await import('html2canvas')).default;
    
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: null,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    } as any);

    return canvas.toDataURL('image/jpeg', 0.9);
  }

  private async processCapture(
    screenshot: string,
    livestreamId: string
  ): Promise<void> {
    const id = `${livestreamId}_${Date.now()}`;
    const timestamp = Date.now();

    // Add to processing queue
    this.processingQueue.push({
      id,
      imageData: screenshot,
      livestreamId,
      timestamp
    });

    // Store temporary capture in IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(['tempCaptures'], 'readwrite');
      const store = transaction.objectStore('tempCaptures');
      
      await store.put({
        id,
        livestreamId,
        imageData: screenshot,
        timestamp
      });
    }

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processNext();
    }
  }

  private async processNext(): Promise<void> {
    if (this.processingQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const item = this.processingQueue.shift()!;

    try {
      const processed = await this.processImage(item.imageData, item.id);
      
      // Store processed image in IndexedDB
      if (this.db) {
        const transaction = this.db.transaction(['processedImages', 'tempCaptures'], 'readwrite');
        const processedStore = transaction.objectStore('processedImages');
        const tempStore = transaction.objectStore('tempCaptures');
        
        const cachedImage: CachedImage = {
          ...processed,
          id: item.id,
          livestreamId: item.livestreamId,
          timestamp: item.timestamp
        };
        
        await processedStore.put(cachedImage);
        await tempStore.delete(item.id);
      }
      
      // Emit event for processed image
      window.dispatchEvent(new CustomEvent('livestream-image-processed', {
        detail: {
          livestreamId: item.livestreamId,
          image: processed,
          timestamp: item.timestamp
        }
      }));
    } catch (error) {
      console.error('Processing error:', error);
    }

    // Process next item
    this.processNext();
  }

  private processImage(imageData: string, id: string): Promise<ProcessedImage> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        // Fallback to main thread processing
        import('./client-image-processor').then(({ getImageProcessor }) => {
          const processor = getImageProcessor();
          processor.processImage(imageData).then(resolve).catch(reject);
        });
        return;
      }

      this.pendingRequests.set(id, { resolve, reject });
      this.worker.postMessage({
        type: 'PROCESS_IMAGE',
        id,
        imageData
      });
    });
  }

  async getProcessedImages(livestreamId: string): Promise<CachedImage[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['processedImages'], 'readonly');
      const store = transaction.objectStore('processedImages');
      const index = store.index('livestreamId');
      const request = index.getAll(livestreamId);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearProcessedImages(livestreamId: string): Promise<void> {
    if (!this.db) return;

    const images = await this.getProcessedImages(livestreamId);
    const transaction = this.db.transaction(['processedImages'], 'readwrite');
    const store = transaction.objectStore('processedImages');
    
    for (const image of images) {
      await store.delete(image.id);
    }
  }

  async exportProcessedImages(livestreamId: string): Promise<ProcessedImage[]> {
    const images = await this.getProcessedImages(livestreamId);
    return images.map(({ id, livestreamId, timestamp, ...image }) => image);
  }

  dispose(): void {
    this.stopCapture();
    
    if (this.worker) {
      this.worker.postMessage({ type: 'DISPOSE' });
      this.worker.terminate();
      this.worker = null;
    }
    
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    
    this.pendingRequests.clear();
    this.processingQueue = [];
  }
}

// Singleton instance
let processorInstance: LivestreamProcessor | null = null;

export function getLivestreamProcessor(): LivestreamProcessor {
  if (!processorInstance) {
    processorInstance = new LivestreamProcessor();
  }
  return processorInstance;
}