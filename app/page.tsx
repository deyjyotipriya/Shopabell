import Link from 'next/link'
import Image from 'next/image'
import { 
  ShoppingBag, 
  Smartphone, 
  MessageCircle, 
  TrendingUp, 
  Zap, 
  Users, 
  CreditCard,
  Truck,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Play,
  Camera,
  Upload,
  Link2,
  Globe
} from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-8 w-8 text-purple-600" />
              <h1 className="text-2xl font-bold gradient-text">ShopAbell</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-purple-600 transition">Features</Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-purple-600 transition">How it Works</Link>
              <Link href="#pricing" className="text-gray-600 hover:text-purple-600 transition">Pricing</Link>
              <Link href="#testimonials" className="text-gray-600 hover:text-purple-600 transition">Testimonials</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">Login</Link>
              <Link href="/dashboard" className="btn-primary">Try Demo Dashboard</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-bg pt-20 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full mb-6">
              <Zap className="h-4 w-4 text-purple-600 mr-2" />
              <span className="text-purple-700 text-sm font-medium">Join 10,000+ sellers already using ShopAbell</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Transform Your Live</span>
              <br />
              <span className="gradient-text">Selling Business</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              The all-in-one platform that helps social media sellers turn live streams into sales. 
              Join in 30 seconds via WhatsApp and start selling immediately.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-primary flex items-center">
                Try Demo Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a href="https://wa.me/919876543210?text=Hi,%20I%20want%20to%20start%20selling%20on%20ShopAbell" 
                 className="btn-secondary flex items-center">
                <MessageCircle className="mr-2 h-5 w-5" />
                Start on WhatsApp
              </a>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">10K+</p>
                <p className="text-sm text-gray-600">Active Sellers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">₹50L+</p>
                <p className="text-sm text-gray-600">Monthly GMV</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">30 sec</p>
                <p className="text-sm text-gray-600">To Start Selling</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Sell Online</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From livestream to delivery, we handle everything so you can focus on selling
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 card-hover">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <MessageCircle className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">WhatsApp-First Onboarding</h3>
              <p className="text-gray-600 mb-4">
                Start selling in just 30 seconds. Message our WhatsApp bot, share your business details, and you're ready to go!
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Multi-language support
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  No app download required
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Instant store creation
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 card-hover">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Camera className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Live Selling</h3>
              <p className="text-gray-600 mb-4">
                Go live on Facebook or Instagram. Our AI automatically captures products and creates your catalog in real-time.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Auto screenshot every 5 sec
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Background removal
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Smart product grouping
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 card-hover">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <CreditCard className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Universal Payment Acceptance</h3>
              <p className="text-gray-600 mb-4">
                Accept payments via UPI, cards, wallets, bank transfer, or COD. Money goes directly to your account.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  All payment methods
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Instant verification
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Only 3% platform fee
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 card-hover">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Upload className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-Channel Product Upload</h3>
              <p className="text-gray-600 mb-4">
                Upload products your way - bulk photos, import from other platforms, or share via WhatsApp.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Bulk photo upload
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Import from Amazon/Flipkart
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Social media import
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 card-hover">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <MessageCircle className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Chat Commerce</h3>
              <p className="text-gray-600 mb-4">
                Buyers chat with you about products. Type "sell 599" to create instant checkout links.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Product-attached chats
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Quick sell commands
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  15-min checkout timer
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 card-hover">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Truck className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Automated Shipping</h3>
              <p className="text-gray-600 mb-4">
                We handle shipping with top couriers. Fixed ₹70 rate nationwide with automatic pickup scheduling.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  All major couriers
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Real-time tracking
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  COD available
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 gradient-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How ShopAbell Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start selling in minutes with our simple 4-step process
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Join via WhatsApp</h3>
              <p className="text-sm text-gray-600">
                Message our bot, share business name & UPI ID
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Add Products</h3>
              <p className="text-sm text-gray-600">
                Go live, upload photos, or import from links
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Share & Sell</h3>
              <p className="text-sm text-gray-600">
                Share your store link, chat with buyers
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">Ship & Earn</h3>
              <p className="text-sm text-gray-600">
                We handle shipping, you get paid instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Methods */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Upload Products Your Way</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Multiple ways to add products - choose what works best for you
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Play className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Live Stream</h3>
              <p className="text-sm text-gray-600">Auto-capture from Facebook/Instagram live</p>
            </div>
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Photo Upload</h3>
              <p className="text-sm text-gray-600">Bulk upload from gallery or camera</p>
            </div>
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Link2 className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Import Links</h3>
              <p className="text-sm text-gray-600">From Amazon, Flipkart, etc.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Social Import</h3>
              <p className="text-sm text-gray-600">From Instagram/Facebook posts</p>
            </div>
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">WhatsApp</h3>
              <p className="text-sm text-gray-600">Send photos to our bot</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 gradient-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free, upgrade as you grow. No hidden charges.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mb-6">Perfect for getting started</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>50 products</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>100 orders/month</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>WhatsApp support</span>
                </li>
              </ul>
              <button className="w-full btn-secondary">Start Free</button>
            </div>

            {/* Standard Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-purple-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Standard</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹500</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mb-6">For growing businesses</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>200 products</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>500 orders/month</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Custom store URL</span>
                </li>
              </ul>
              <button className="w-full btn-primary">Get Started</button>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹1000</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mb-6">For established sellers</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Unlimited products</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Unlimited orders</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Premium analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>API access</span>
                </li>
              </ul>
              <button className="w-full btn-secondary">Contact Sales</button>
            </div>
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-600">
              All plans include: 3% transaction fee • All payment methods • Shipping at ₹70/order
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by 10,000+ Sellers</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our sellers have to say about ShopAbell
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">RS</span>
                </div>
                <div className="ml-3">
                  <p className="font-semibold">Riya Sharma</p>
                  <p className="text-sm text-gray-600">Fashion Boutique</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "ShopAbell transformed my Facebook live selling. The automatic product capture saves me hours! 
                My sales increased 3x in just 2 months."
              </p>
              <div className="flex text-yellow-400">
                ⭐⭐⭐⭐⭐
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">AK</span>
                </div>
                <div className="ml-3">
                  <p className="font-semibold">Amit Kumar</p>
                  <p className="text-sm text-gray-600">Electronics Store</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "The WhatsApp onboarding was so simple! I started selling in literally 30 seconds. 
                Best platform for sellers like me."
              </p>
              <div className="flex text-yellow-400">
                ⭐⭐⭐⭐⭐
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">PD</span>
                </div>
                <div className="ml-3">
                  <p className="font-semibold">Priya Das</p>
                  <p className="text-sm text-gray-600">Beauty Products</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "Managing orders through chat is genius! The 'sell' command makes it so easy. 
                My customers love the quick checkout."
              </p>
              <div className="flex text-yellow-400">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join 10,000+ sellers who are already growing their business with ShopAbell
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-medium transition flex items-center">
              Try Demo Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a href="https://wa.me/919876543210?text=Hi,%20I%20want%20to%20start%20selling%20on%20ShopAbell" 
               className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-4 rounded-lg font-medium transition flex items-center">
              <MessageCircle className="mr-2 h-5 w-5" />
              Start on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingBag className="h-6 w-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">ShopAbell</h3>
              </div>
              <p className="text-sm">
                The all-in-one platform for social media sellers
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-purple-400 transition">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-purple-400 transition">Pricing</Link></li>
                <li><Link href="#" className="hover:text-purple-400 transition">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-purple-400 transition">About</Link></li>
                <li><Link href="#" className="hover:text-purple-400 transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-purple-400 transition">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-purple-400 transition">Help Center</Link></li>
                <li><Link href="#" className="hover:text-purple-400 transition">Contact</Link></li>
                <li><a href="https://wa.me/919876543210" className="hover:text-purple-400 transition">WhatsApp</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 ShopAbell. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}