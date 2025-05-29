# Client-Side Image Processing for Livestream-to-Catalog

This document describes the new client-side image processing system that replaces the previous Cloudinary-based approach.

## Overview

The system now processes all livestream screenshots directly on the client device, providing:
- Faster processing with no server round-trips
- Reduced bandwidth usage (images compressed to <100KB)
- Better privacy (images processed locally)
- Lower infrastructure costs (no Cloudinary usage)

## Architecture

### 1. Core Components

- **ClientImageProcessor**: Main processing class using TensorFlow.js and Canvas API
- **LivestreamProcessor**: Manages capture intervals and IndexedDB caching
- **BackgroundRemover**: Handles background removal for fashion/beauty products
- **Web Workers**: Non-blocking processing in background threads

### 2. Processing Pipeline

1. **Capture**: Screenshot taken every 5 seconds during livestream
2. **Detection**: TensorFlow.js (COCO-SSD + MobileNet) detects products
3. **Enhancement**: Canvas API applies image improvements
4. **Background Removal**: ONNX Runtime removes backgrounds for fashion items
5. **Compression**: WebP conversion keeps images under 100KB
6. **Upload**: Only final processed images sent to server

### 3. Technology Stack

- **TensorFlow.js**: Product detection and classification
- **ONNX Runtime Web**: Background segmentation
- **Canvas API + WebGL**: Image processing and enhancement
- **Web Workers**: Parallel processing
- **IndexedDB**: Local caching of processed images

## Implementation Details

### Product Detection

```javascript
// Uses COCO-SSD for object detection
const cocoModel = await cocoSsd.load({
  base: 'lite_mobilenet_v2'
});

// MobileNet for additional classification
const mobilenetModel = await mobilenet.load({
  version: 2,
  alpha: 0.5
});
```

### Image Processing

```javascript
// Automatic enhancements
- Brightness adjustment
- Contrast optimization
- Sharpening filter
- Auto-cropping to product bounds
```

### Background Removal

Applied automatically for:
- Fashion items
- Beauty products
- Accessories

Uses edge detection and segmentation for clean cutouts.

### Compression

```javascript
// WebP with fallback to JPEG
- Target size: <100KB per image
- Adaptive quality (0.5-0.85)
- Automatic resizing if needed
```

## API Changes

### Old Endpoint (Deprecated)
```
POST /api/livestream/capture
{
  screenshot: "base64...", // Full resolution
  livestreamId: "...",
  timestamp: "..."
}
```

### New Endpoint
```
POST /api/livestream/v2/capture
{
  processedImage: "base64...", // <100KB WebP/JPEG
  thumbnail: "base64...",       // 200x200 thumbnail
  detection: {
    isProduct: true,
    confidence: 0.92,
    category: "Fashion",
    name: "Blue Dress",
    boundingBox: {...}
  },
  metadata: {
    width: 800,
    height: 800,
    size: 98234,
    format: "webp"
  },
  livestreamId: "...",
  timestamp: "..."
}
```

## Usage

### Basic Integration

```javascript
import LivestreamCapture from '@/components/livestream/LivestreamCapture';

function LivestreamPage() {
  const captureRef = useRef();
  
  // Start auto-capture
  useEffect(() => {
    captureRef.current?.startAutoCapture(livestreamId, 5); // 5 second intervals
    
    return () => {
      captureRef.current?.stopAutoCapture();
    };
  }, [livestreamId]);
  
  return (
    <LivestreamCapture 
      ref={captureRef}
      onImageProcessed={(image, timestamp) => {
        console.log('Product detected:', image.detection);
      }}
    />
  );
}
```

### Manual Capture

```javascript
const screenshot = await captureRef.current?.captureScreenshot();
const images = await captureRef.current?.getProcessedImages();
```

## Performance Considerations

1. **Model Loading**: Models are loaded once and cached
2. **Web Workers**: Processing doesn't block UI
3. **IndexedDB**: Processed images cached locally
4. **Adaptive Quality**: Compression adjusted based on content

## Browser Requirements

- Chrome 90+
- Firefox 88+
- Safari 14.1+
- Edge 90+

Required APIs:
- WebGL 2.0
- Web Workers
- IndexedDB
- OffscreenCanvas (optional, for better performance)

## Migration Guide

1. Update dependencies:
```bash
npm install @tensorflow/tfjs @tensorflow-models/coco-ssd @tensorflow-models/mobilenet onnxruntime-web
```

2. Replace LivestreamWidget import
3. Update API endpoint to v2
4. Remove Cloudinary configuration

## Future Enhancements

1. **Custom Models**: Train specific models for product categories
2. **Real-time Filters**: Apply AR effects during capture
3. **Batch Processing**: Process multiple frames simultaneously
4. **Progressive Enhancement**: Fallback to server processing if needed