import { NextResponse } from 'next/server';

const demoProducts = [
  {
    id: '1',
    name: 'Elegant Banarasi Silk Saree',
    price: 2499,
    originalPrice: 3499,
    discount: 29,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
    category: 'Sarees',
    description: 'Beautiful handwoven Banarasi silk saree with traditional motifs. Perfect for weddings and festivals.',
    colors: ['Red', 'Gold', 'Maroon'],
    sizes: ['Free Size'],
    inStock: true,
    rating: 4.5,
    reviews: 127,
    tags: ['Wedding', 'Festival', 'Traditional', 'Silk']
  },
  {
    id: '2',
    name: 'Cotton Anarkali Kurti Set',
    price: 899,
    originalPrice: 1299,
    discount: 31,
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e3?w=400',
    category: 'Kurtis',
    description: 'Comfortable cotton Anarkali kurti with palazzo pants. Ideal for daily wear and casual occasions.',
    colors: ['Blue', 'Pink', 'White', 'Yellow'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    rating: 4.2,
    reviews: 89,
    tags: ['Casual', 'Comfort', 'Cotton', 'Set']
  },
  {
    id: '3',
    name: 'Designer Lehenga Choli',
    price: 4999,
    originalPrice: 7999,
    discount: 38,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
    category: 'Lehengas',
    description: 'Stunning designer lehenga choli with heavy embroidery work. Perfect for weddings and special occasions.',
    colors: ['Pink', 'Red', 'Royal Blue', 'Green'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    rating: 4.8,
    reviews: 203,
    tags: ['Wedding', 'Designer', 'Embroidery', 'Special Occasion']
  },
  {
    id: '4',
    name: 'Chiffon Dupatta with Lace',
    price: 399,
    originalPrice: 599,
    discount: 33,
    image: 'https://images.unsplash.com/photo-1594736797933-d0a9ba2a26db?w=400',
    category: 'Accessories',
    description: 'Lightweight chiffon dupatta with beautiful lace border. Complements any traditional outfit.',
    colors: ['Cream', 'Pink', 'Blue', 'Mint Green'],
    sizes: ['2.5m'],
    inStock: true,
    rating: 4.1,
    reviews: 45,
    tags: ['Accessory', 'Chiffon', 'Lace', 'Traditional']
  },
  {
    id: '5',
    name: 'Embroidered Straight Kurta',
    price: 699,
    originalPrice: 999,
    discount: 30,
    image: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=400',
    category: 'Kurtis',
    description: 'Elegant straight kurta with intricate embroidery. Perfect for office wear and casual outings.',
    colors: ['White', 'Cream', 'Light Blue', 'Peach'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    rating: 4.3,
    reviews: 156,
    tags: ['Office Wear', 'Embroidery', 'Casual', 'Elegant']
  },
  {
    id: '6',
    name: 'Traditional Sharara Set',
    price: 1899,
    originalPrice: 2699,
    discount: 30,
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e3?w=400',
    category: 'Sets',
    description: 'Beautiful sharara set with kurti and dupatta. Perfect for festivals and celebrations.',
    colors: ['Magenta', 'Orange', 'Turquoise'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    rating: 4.4,
    reviews: 78,
    tags: ['Festival', 'Traditional', 'Set', 'Celebration']
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    products: demoProducts,
    total: demoProducts.length
  });
}