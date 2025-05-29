// Image processing Web Worker
import { ClientImageProcessor, ProcessedImage } from './client-image-processor';

let processor: ClientImageProcessor | null = null;

// Message types
interface ProcessImageMessage {
  type: 'PROCESS_IMAGE';
  id: string;
  imageData: string;
}

interface InitializeMessage {
  type: 'INITIALIZE';
}

interface DisposeMessage {
  type: 'DISPOSE';
}

type WorkerMessage = ProcessImageMessage | InitializeMessage | DisposeMessage;

// Response types
interface ProcessedImageResponse {
  type: 'IMAGE_PROCESSED';
  id: string;
  result: ProcessedImage;
}

interface ErrorResponse {
  type: 'ERROR';
  id: string;
  error: string;
}

interface InitializedResponse {
  type: 'INITIALIZED';
}

type WorkerResponse = ProcessedImageResponse | ErrorResponse | InitializedResponse;

// Handle messages from main thread
self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { data } = event;

  switch (data.type) {
    case 'INITIALIZE':
      try {
        if (!processor) {
          processor = new ClientImageProcessor();
          await processor.initialize();
        }
        const response: InitializedResponse = { type: 'INITIALIZED' };
        self.postMessage(response);
      } catch (error) {
        const response: ErrorResponse = {
          type: 'ERROR',
          id: 'init',
          error: error instanceof Error ? error.message : 'Failed to initialize'
        };
        self.postMessage(response);
      }
      break;

    case 'PROCESS_IMAGE':
      try {
        if (!processor) {
          processor = new ClientImageProcessor();
          await processor.initialize();
        }
        
        const result = await processor.processImage(data.imageData);
        const response: ProcessedImageResponse = {
          type: 'IMAGE_PROCESSED',
          id: data.id,
          result
        };
        self.postMessage(response);
      } catch (error) {
        const response: ErrorResponse = {
          type: 'ERROR',
          id: data.id,
          error: error instanceof Error ? error.message : 'Failed to process image'
        };
        self.postMessage(response);
      }
      break;

    case 'DISPOSE':
      if (processor) {
        processor.dispose();
        processor = null;
      }
      break;
  }
});

// Export types for TypeScript
export type { WorkerMessage, WorkerResponse };