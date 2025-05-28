// import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')
// const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })

interface DetectedProduct {
  title: string
  description?: string
  price: number
  confidence: number
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
  image: string
  metadata: {
    category?: string
    color?: string
    brand?: string
    features?: string[]
  }
}

export async function processScreenshot(screenshot: string): Promise<DetectedProduct[]> {
  try {
    // For development, return mock products
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return generateMockProducts(screenshot)
    }

    // Convert base64 screenshot to image parts for Gemini
    const imageParts = [
      {
        inlineData: {
          data: screenshot.replace(/^data:image\/\w+;base64,/, ''),
          mimeType: 'image/jpeg',
        },
      },
    ]

    // Prompt for product detection
    const prompt = `
    Analyze this livestream screenshot and detect all visible products being showcased.
    For each product found, provide:
    1. Product title/name
    2. Estimated price (in USD)
    3. Brief description
    4. Category (clothing, accessories, electronics, etc.)
    5. Visible features (color, size, material, etc.)
    6. Confidence score (0-1) of detection accuracy
    7. Approximate location in image (if possible)

    Focus on:
    - Products being actively shown or worn
    - Items with clear visibility
    - Products that appear to be for sale

    Return the results in JSON format as an array of products.
    `

    // For now, use mock detection until we integrate a proper AI service
    // const result = await model.generateContent([prompt, ...imageParts])
    // const response = await result.response
    // const text = response.text()

    // Parse AI response
    const products = generateMockProducts(screenshot) // parseAIResponse(text)
    
    // Process each product
    const processedProducts = await Promise.all(
      products.map(async (product) => ({
        ...product,
        image: await extractProductImage(screenshot, product.boundingBox),
      }))
    )

    return processedProducts
  } catch (error) {
    console.error('AI processing error:', error)
    return generateMockProducts(screenshot)
  }
}

function parseAIResponse(text: string): DetectedProduct[] {
  try {
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return []

    const products = JSON.parse(jsonMatch[0])
    
    return products.map((product: any) => ({
      title: product.title || product.name || 'Unnamed Product',
      description: product.description,
      price: parseFloat(product.price) || 29.99,
      confidence: parseFloat(product.confidence) || 0.7,
      boundingBox: product.location || product.boundingBox,
      image: '', // Will be filled later
      metadata: {
        category: product.category,
        color: product.color || product.features?.color,
        brand: product.brand,
        features: Array.isArray(product.features) ? product.features : [product.features].filter(Boolean),
      },
    }))
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    return []
  }
}

async function extractProductImage(
  screenshot: string,
  boundingBox?: { x: number; y: number; width: number; height: number }
): Promise<string> {
  // If no bounding box, return the full screenshot
  if (!boundingBox) {
    return screenshot
  }

  // In a server environment, we can't use browser APIs like Image and Canvas
  // For now, return the full screenshot
  // In production, you would use a library like sharp or jimp for image processing
  return screenshot
}

function generateMockProducts(screenshot: string): DetectedProduct[] {
  // Generate 1-3 mock products per capture
  const productCount = Math.floor(Math.random() * 3) + 1
  const mockProducts: DetectedProduct[] = []

  const categories = ['Clothing', 'Accessories', 'Beauty', 'Electronics', 'Home Decor']
  const colors = ['Red', 'Blue', 'Black', 'White', 'Pink', 'Green', 'Yellow']
  const materials = ['Cotton', 'Polyester', 'Leather', 'Silk', 'Denim', 'Wool']

  for (let i = 0; i < productCount; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const color = colors[Math.floor(Math.random() * colors.length)]
    const material = materials[Math.floor(Math.random() * materials.length)]
    
    const product: DetectedProduct = {
      title: `${color} ${category} Item ${Date.now() + i}`,
      description: `Beautiful ${material.toLowerCase()} ${category.toLowerCase()} in ${color.toLowerCase()}`,
      price: Math.floor(Math.random() * 100) + 19.99,
      confidence: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
      image: screenshot, // In real implementation, this would be cropped
      metadata: {
        category,
        color: color.toLowerCase(),
        features: [
          `${material} material`,
          `${color} color`,
          'High quality',
          'Trending item',
        ],
      },
    }
    
    mockProducts.push(product)
  }

  return mockProducts
}

// Export additional utilities
export function calculateProductSimilarity(product1: DetectedProduct, product2: DetectedProduct): number {
  let score = 0
  
  // Title similarity (40% weight)
  const titleSim = stringSimilarity(product1.title, product2.title)
  score += titleSim * 0.4
  
  // Price similarity (20% weight)
  const priceDiff = Math.abs(product1.price - product2.price)
  const avgPrice = (product1.price + product2.price) / 2
  const priceSim = 1 - (priceDiff / avgPrice)
  score += Math.max(0, priceSim) * 0.2
  
  // Category match (20% weight)
  if (product1.metadata.category === product2.metadata.category) {
    score += 0.2
  }
  
  // Color match (10% weight)
  if (product1.metadata.color === product2.metadata.color) {
    score += 0.1
  }
  
  // Feature overlap (10% weight)
  const features1 = new Set(product1.metadata.features || [])
  const features2 = new Set(product2.metadata.features || [])
  const intersection = new Set(Array.from(features1).filter(x => features2.has(x)))
  const union = new Set([...Array.from(features1), ...Array.from(features2)])
  const featureSim = union.size > 0 ? intersection.size / union.size : 0
  score += featureSim * 0.1
  
  return score
}

function stringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const editDistance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase())
  return (longer.length - editDistance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}