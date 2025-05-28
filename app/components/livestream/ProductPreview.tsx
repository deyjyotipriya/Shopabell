'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Card } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { toast } from '@/app/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'
import { Check, X, Edit, Eye, Sparkles, Clock } from 'lucide-react'

interface Product {
  id: string
  title: string
  price: number
  image: string
  capturedAt: string
  confidence: number
  status: 'pending' | 'published' | 'rejected'
}

interface ProductPreviewProps {
  products: Product[]
  onProductUpdate?: (productId: string, updates: Partial<Product>) => void
}

export default function ProductPreview({ products, onProductUpdate }: ProductPreviewProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'published' | 'rejected'>('all')

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true
    return product.status === filter
  })

  const handleApprove = async (product: Product) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          status: 'published',
        }),
      })

      if (response.ok) {
        onProductUpdate?.(product.id, { status: 'published' })
        toast({
          title: 'Product published',
          description: `${product.title} has been published to your store.`,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish product',
        variant: 'destructive',
      })
    }
  }

  const handleReject = (product: Product) => {
    onProductUpdate?.(product.id, { status: 'rejected' })
    toast({
      title: 'Product rejected',
      description: `${product.title} has been rejected.`,
    })
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
  }

  const handleSaveEdit = async () => {
    if (!editingProduct) return

    try {
      onProductUpdate?.(editingProduct.id, {
        title: editingProduct.title,
        price: editingProduct.price,
      })
      
      toast({
        title: 'Product updated',
        description: 'Product details have been updated.',
      })
      
      setEditingProduct(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      })
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Published</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">Pending Review</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'published', 'rejected'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && (
              <Badge variant="secondary" className="ml-2">
                {products.filter(p => p.status === status).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2">
                {getStatusBadge(product.status)}
              </div>
              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1">
                <div className="flex items-center gap-1">
                  <Sparkles className={`h-3 w-3 ${getConfidenceColor(product.confidence)}`} />
                  <span className={`text-xs font-medium ${getConfidenceColor(product.confidence)}`}>
                    {Math.round(product.confidence * 100)}% match
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-3">
              <h3 className="font-semibold text-sm line-clamp-2">{product.title}</h3>
              <p className="text-lg font-bold mt-1">${product.price}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                <Clock className="h-3 w-3" />
                {new Date(product.capturedAt).toLocaleTimeString()}
              </div>
              
              {product.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1"
                    onClick={() => handleApprove(product)}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(product)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {product.status === 'published' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => setSelectedProduct(product)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details before publishing
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div className="aspect-video relative bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={editingProduct.image}
                  alt={editingProduct.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Product Title</Label>
                <Input
                  id="title"
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    title: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    price: parseFloat(e.target.value)
                  })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProduct?.title}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="aspect-video relative bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-lg font-bold">${selectedProduct.price}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedProduct.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className={`font-medium ${getConfidenceColor(selectedProduct.confidence)}`}>
                    {Math.round(selectedProduct.confidence * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Captured At</p>
                  <p className="font-medium">
                    {new Date(selectedProduct.capturedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedProduct(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}