import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Default quick reply templates
const defaultTemplates = {
  seller: [
    {
      id: 'greeting',
      title: 'Greeting',
      content: 'Hi! Welcome to our store. How can I help you today?',
      category: 'greeting'
    },
    {
      id: 'available',
      title: 'Product Available',
      content: 'Yes, this product is available and ready to ship!',
      category: 'availability'
    },
    {
      id: 'out_of_stock',
      title: 'Out of Stock',
      content: 'Sorry, this item is currently out of stock. We expect to restock within 3-5 days.',
      category: 'availability'
    },
    {
      id: 'price_negotiable',
      title: 'Price Negotiation',
      content: 'For bulk orders, we can offer special pricing. How many units are you interested in?',
      category: 'pricing'
    },
    {
      id: 'shipping_info',
      title: 'Shipping Info',
      content: 'We ship within 24 hours. Delivery usually takes 3-5 business days depending on your location.',
      category: 'shipping'
    },
    {
      id: 'payment_options',
      title: 'Payment Options',
      content: 'We accept UPI, credit/debit cards, net banking, and cash on delivery.',
      category: 'payment'
    },
    {
      id: 'thank_you',
      title: 'Thank You',
      content: 'Thank you for your purchase! Your order will be shipped soon.',
      category: 'closing'
    }
  ],
  buyer: [
    {
      id: 'interested',
      title: 'Interested',
      content: "Hi, I'm interested in this product. Is it available?",
      category: 'inquiry'
    },
    {
      id: 'price_inquiry',
      title: 'Price Inquiry',
      content: 'What is the best price you can offer?',
      category: 'pricing'
    },
    {
      id: 'bulk_order',
      title: 'Bulk Order',
      content: 'I need to order multiple units. Do you offer bulk discounts?',
      category: 'pricing'
    },
    {
      id: 'shipping_cost',
      title: 'Shipping Cost',
      content: 'How much is shipping to my location?',
      category: 'shipping'
    },
    {
      id: 'delivery_time',
      title: 'Delivery Time',
      content: 'How long will delivery take?',
      category: 'shipping'
    },
    {
      id: 'cod_available',
      title: 'COD Available?',
      content: 'Is cash on delivery available?',
      category: 'payment'
    }
  ]
}

// Get quick reply templates for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userType = searchParams.get('userType') // 'seller' or 'buyer'

    if (!userId || !userType) {
      return NextResponse.json(
        { error: 'User ID and type are required' },
        { status: 400 }
      )
    }

    // Get custom templates from user settings (if implemented)
    // For now, return default templates based on user type
    const templates = defaultTemplates[userType as keyof typeof defaultTemplates] || []

    // Group templates by category
    const groupedTemplates = templates.reduce((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = []
      }
      acc[template.category].push(template)
      return acc
    }, {} as Record<string, typeof templates>)

    return NextResponse.json({
      templates,
      groupedTemplates,
      categories: Object.keys(groupedTemplates)
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// Create or update custom template
export async function POST(request: NextRequest) {
  try {
    const { userId, template } = await request.json()

    if (!userId || !template) {
      return NextResponse.json(
        { error: 'User ID and template are required' },
        { status: 400 }
      )
    }

    // Validate template
    if (!template.title || !template.content || !template.category) {
      return NextResponse.json(
        { error: 'Template must have title, content, and category' },
        { status: 400 }
      )
    }

    // In a real implementation, save to database
    // For now, just return the template
    const savedTemplate = {
      id: template.id || `custom_${Date.now()}`,
      ...template,
      isCustom: true,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({ template: savedTemplate })
  } catch (error) {
    console.error('Error saving template:', error)
    return NextResponse.json(
      { error: 'Failed to save template' },
      { status: 500 }
    )
  }
}

// Delete custom template
export async function DELETE(request: NextRequest) {
  try {
    const { userId, templateId } = await request.json()

    if (!userId || !templateId) {
      return NextResponse.json(
        { error: 'User ID and template ID are required' },
        { status: 400 }
      )
    }

    // In a real implementation, delete from database
    // For now, just acknowledge
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}