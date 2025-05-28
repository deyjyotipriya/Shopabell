import { GoogleGenerativeAI } from '@google/generative-ai';
import { v2 as cloudinary } from 'cloudinary';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface ProductDetection {
  isProduct: boolean;
  confidence: number;
  category?: string;
  name?: string;
  description?: string;
  suggestedPrice?: number;
  features?: string[];
  colors?: string[];
  tags?: string[];
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ProcessedProduct {
  originalImageUrl: string;
  processedImageUrl: string;
  detection: ProductDetection;
  variants?: {
    color?: string;
    angle?: string;
    imageUrl: string;
  }[];
}

// Analyze image for product detection
export async function analyzeProductImage(imageUrl: string): Promise<ProductDetection> {
  try {
    // Fetch image as base64
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    
    // Create prompt for product analysis
    const prompt = `Analyze this image and determine if it contains a product being sold. 
    If it is a product, provide the following information in JSON format:
    {
      "isProduct": true/false,
      "confidence": 0-1,
      "category": "Fashion/Beauty/Electronics/Home/Food/Other",
      "name": "suggested product name",
      "description": "brief product description",
      "suggestedPrice": estimated price in INR,
      "features": ["feature1", "feature2"],
      "colors": ["color1", "color2"],
      "tags": ["tag1", "tag2"],
      "boundingBox": {
        "x": percentage from left,
        "y": percentage from top,
        "width": percentage width,
        "height": percentage height
      }
    }
    
    Focus on:
    1. Is there a clear product being showcased?
    2. Is it suitable for e-commerce?
    3. What category does it belong to?
    4. What are the key selling points?
    
    If it's not a product (like a person talking, background, or unclear image), set isProduct to false.`;
    
    // Generate content
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ]);
    
    const response_text = result.response.text();
    
    // Parse JSON from response
    try {
      const jsonMatch = response_text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const detection = JSON.parse(jsonMatch[0]);
        return detection;
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }
    
    // Default response if parsing fails
    return {
      isProduct: false,
      confidence: 0
    };
    
  } catch (error) {
    console.error('Product analysis error:', error);
    // Fallback to basic detection
    return {
      isProduct: true, // Assume it's a product if AI fails
      confidence: 0.5,
      category: 'Other',
      name: 'Product',
      description: 'Product from livestream'
    };
  }
}

// Process and enhance product image
export async function processProductImage(
  imageUrl: string,
  detection: ProductDetection
): Promise<string> {
  try {
    const transformations: any[] = [];
    
    // If bounding box is detected, crop to product
    if (detection.boundingBox) {
      transformations.push({
        crop: 'crop',
        x: Math.floor(detection.boundingBox.x),
        y: Math.floor(detection.boundingBox.y),
        width: Math.floor(detection.boundingBox.width),
        height: Math.floor(detection.boundingBox.height),
        gravity: 'north_west'
      });
    }
    
    // Remove background for fashion and beauty products
    if (['Fashion', 'Beauty'].includes(detection.category || '')) {
      transformations.push({ background_removal: 'cloudinary_ai' });
    }
    
    // Auto enhance
    transformations.push(
      { effect: 'improve:50' },
      { quality: 'auto:best' },
      { fetch_format: 'auto' }
    );
    
    // Upload with transformations
    const result = await cloudinary.uploader.upload(imageUrl, {
      transformation: transformations,
      folder: 'products/processed'
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('Image processing error:', error);
    // Return original if processing fails
    return imageUrl;
  }
}

// Group similar products from livestream
export async function groupSimilarProducts(
  products: ProcessedProduct[]
): Promise<ProcessedProduct[][]> {
  try {
    if (products.length === 0) return [];
    
    // Create prompt for grouping
    const productInfo = products.map((p, i) => ({
      index: i,
      name: p.detection.name,
      category: p.detection.category,
      colors: p.detection.colors,
      description: p.detection.description
    }));
    
    const prompt = `Group these products by similarity. Products are from a livestream and may show the same item from different angles or in different colors.
    
    Products: ${JSON.stringify(productInfo)}
    
    Return a JSON array of groups, where each group contains the indices of similar products:
    [[0,2,3], [1,4], [5]]`;
    
    const result = await model.generateContent(prompt);
    const response_text = result.response.text();
    
    try {
      const jsonMatch = response_text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const groups = JSON.parse(jsonMatch[0]);
        
        // Convert indices to product groups
        return groups.map((group: number[]) => 
          group.map(index => products[index]).filter(Boolean)
        );
      }
    } catch (error) {
      console.error('Failed to parse grouping response:', error);
    }
    
    // Fallback: each product is its own group
    return products.map(p => [p]);
    
  } catch (error) {
    console.error('Product grouping error:', error);
    return products.map(p => [p]);
  }
}

// Extract text from image (for imported products)
export async function extractProductInfo(imageUrl: string): Promise<{
  title?: string;
  price?: string;
  description?: string;
}> {
  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    
    const prompt = `Extract any product information from this image including:
    - Product title/name
    - Price (look for ₹ or Rs. or numbers)
    - Description or features
    
    Return as JSON: {"title": "", "price": "", "description": ""}`;
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ]);
    
    const response_text = result.response.text();
    
    try {
      const jsonMatch = response_text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse extraction response:', error);
    }
    
    return {};
    
  } catch (error) {
    console.error('Text extraction error:', error);
    return {};
  }
}

// Process livestream capture with AI
export async function processLivestreamCapture(
  imageUrl: string,
  timestamp: number,
  livestreamId: string
): Promise<ProcessedProduct | null> {
  try {
    // Step 1: Analyze if image contains a product
    const detection = await analyzeProductImage(imageUrl);
    
    // Skip if not a product or low confidence
    if (!detection.isProduct || detection.confidence < 0.6) {
      return null;
    }
    
    // Step 2: Process and enhance the image
    const processedImageUrl = await processProductImage(imageUrl, detection);
    
    // Step 3: Create processed product object
    const processedProduct: ProcessedProduct = {
      originalImageUrl: imageUrl,
      processedImageUrl,
      detection: {
        ...detection,
        name: detection.name || `Product from livestream at ${timestamp}s`,
        description: detection.description || 'Captured from livestream'
      }
    };
    
    return processedProduct;
    
  } catch (error) {
    console.error('Livestream capture processing error:', error);
    return null;
  }
}

// Batch process livestream captures
export async function batchProcessLivestreamCaptures(
  captures: { imageUrl: string; timestamp: number }[],
  livestreamId: string
): Promise<ProcessedProduct[]> {
  try {
    // Process all captures in parallel
    const processPromises = captures.map(capture =>
      processLivestreamCapture(capture.imageUrl, capture.timestamp, livestreamId)
    );
    
    const results = await Promise.all(processPromises);
    
    // Filter out null results
    const validProducts = results.filter((p): p is ProcessedProduct => p !== null);
    
    // Group similar products
    const groupedProducts = await groupSimilarProducts(validProducts);
    
    // Merge groups into single products with variants
    const mergedProducts: ProcessedProduct[] = groupedProducts.map(group => {
      if (group.length === 1) return group[0];
      
      // Use the best detection as main product
      const mainProduct = group.reduce((best, current) => 
        (current.detection.confidence > best.detection.confidence) ? current : best
      );
      
      // Add others as variants
      mainProduct.variants = group
        .filter(p => p !== mainProduct)
        .map((p, i) => ({
          angle: `View ${i + 2}`,
          imageUrl: p.processedImageUrl
        }));
      
      return mainProduct;
    });
    
    return mergedProducts;
    
  } catch (error) {
    console.error('Batch processing error:', error);
    return [];
  }
}

// Generate product metadata from AI
export async function generateProductMetadata(
  productName: string,
  category: string,
  description?: string
): Promise<{
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  hashTags: string[];
}> {
  try {
    const prompt = `Generate e-commerce metadata for this product:
    Name: ${productName}
    Category: ${category}
    Description: ${description || 'N/A'}
    
    Return JSON with:
    {
      "seoTitle": "SEO optimized title (max 60 chars)",
      "seoDescription": "SEO meta description (max 160 chars)",
      "keywords": ["keyword1", "keyword2", ...],
      "hashTags": ["#hashtag1", "#hashtag2", ...]
    }`;
    
    const result = await model.generateContent(prompt);
    const response_text = result.response.text();
    
    const jsonMatch = response_text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback
    return {
      seoTitle: productName.substring(0, 60),
      seoDescription: description?.substring(0, 160) || `Buy ${productName} online`,
      keywords: [productName.toLowerCase(), category.toLowerCase()],
      hashTags: [`#${category}`, '#shopabell']
    };
    
  } catch (error) {
    console.error('Metadata generation error:', error);
    return {
      seoTitle: productName,
      seoDescription: description || productName,
      keywords: [],
      hashTags: []
    };
  }
}