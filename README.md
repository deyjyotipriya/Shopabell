# ShopAbell - Social Commerce Platform

Revolutionizing e-commerce for small sellers through WhatsApp integration, AI-powered cataloging, and livestream shopping.

## 🚀 Features

- **WhatsApp Integration**: Seamless onboarding and order management via WhatsApp
- **AI-Powered Product Detection**: Automatic product extraction from livestreams and videos
- **Client-Side Processing**: Privacy-focused AI processing using TensorFlow.js
- **Multi-Seller Platform**: Support for multiple sellers with individual storefronts
- **Livestream Commerce**: Convert livestreams into shoppable catalogs
- **Smart Shipping Calculator**: Pincode-based shipping cost calculation
- **Real-time Chat**: Built-in chat system for buyer-seller communication
- **Progressive Web App**: Mobile-optimized with offline capabilities

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **AI/ML**: TensorFlow.js (COCO-SSD, MobileNet)
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage
- **Payment**: Decentro API (Emulated)
- **Shipping**: Shiprocket API (Emulated)
- **Messaging**: WhatsApp Business API (Emulated)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/shopabell.git
cd shopabell
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Secret (generate a random string)
JWT_SECRET=your_jwt_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Emulator Keys (use these exact values for demo)
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=not-needed
CLOUDINARY_API_SECRET=not-needed
GOOGLE_AI_API_KEY=not-needed
WHATSAPP_API_TOKEN=demo-token
WHATSAPP_PHONE_NUMBER_ID=123456789
DECENTRO_API_KEY=demo-key
DECENTRO_API_SECRET=demo-secret
SHIPROCKET_EMAIL=demo@shopabell.com
SHIPROCKET_PASSWORD=demo-password
```

### 4. Set up Supabase

1. Create a new Supabase project
2. Run the database setup scripts in order:

```sql
-- Run in Supabase SQL Editor
-- 1. Run schema.sql
-- 2. Run functions.sql  
-- 3. Run migrations/*.sql (if any)
-- 4. Run seed-demo-data-correct.sql (for demo data)
```

3. Create storage buckets:
   - `products`
   - `livestream-videos`
   - `chat-uploads`

### 5. Run the development server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🌐 Deployment on Vercel

### 1. Prepare for deployment

1. Push your code to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Import your `shopabell` repository
5. Configure project:
   - Framework Preset: `Next.js`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3. Set Environment Variables in Vercel

1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Important: Update `NEXT_PUBLIC_APP_URL` to your Vercel domain

### 4. Deploy

Click "Deploy" and wait for the build to complete.

### 5. Configure Supabase for Production

1. Update Supabase URL allowlist to include your Vercel domain
2. Enable Row Level Security (RLS) policies
3. Set up proper authentication rules

## 📱 Mobile App Installation

ShopAbell is a Progressive Web App (PWA) that can be installed on mobile devices:

### Android

1. Open Chrome browser on your Android device
2. Navigate to your deployed app URL
3. Tap the menu (3 dots) → "Add to Home screen"
4. Name the app and tap "Add"
5. The app icon will appear on your home screen

### iOS (iPhone/iPad)

1. Open Safari browser on your iOS device
2. Navigate to your deployed app URL
3. Tap the Share button (square with arrow)
4. Scroll down and tap "Add to Home Screen"
5. Name the app and tap "Add"
6. The app icon will appear on your home screen

### Features on Mobile

- **Offline Support**: Basic functionality works offline
- **Push Notifications**: Get order and chat notifications
- **Camera Access**: For livestream and product photos
- **Native App Feel**: Full-screen experience without browser UI

## 🧪 Demo Accounts

After running the seed script, you can login with:

| Role | Phone | OTP |
|------|-------|-----|
| Admin | 9999999999 | 123456 |
| Seller (Priya) | 9876543210 | 123456 |
| Seller (Raj) | 9876543211 | 123456 |
| Buyer (Rahul) | 9876543214 | 123456 |

## 🏪 Demo Stores

- Priya Fashion: `/store/priya-fashion`
- Raj Electronics: `/store/raj-electronics`
- Anita Home Decor: `/store/anita-decor`
- Mumbai Spices: `/store/mumbai-spices`

## 📁 Project Structure

```
shopabell/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── lib/              # Utilities and services
│   ├── types/            # TypeScript types
│   └── (routes)/         # Page routes
├── database/              # SQL schemas and migrations
├── public/               # Static assets
└── docs/                 # Documentation
```

## 🔧 Key Features Implementation

### Client-Side AI Processing

- Uses TensorFlow.js for privacy-focused processing
- No server-side AI API calls required
- Works offline once models are cached

### Shipping Calculator

- Zone-based pricing for Indian pincodes
- Free shipping thresholds
- COD charge calculation
- Demo: `/shipping-demo`

### Livestream to Catalog

- Real-time product detection
- Background removal
- Video upload support
- Demo: `/dashboard/livestream/start`

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Check your Supabase URL and keys
   - Ensure RLS is properly configured

2. **Build Errors on Vercel**
   - Check Node.js version (should be 18+)
   - Verify all environment variables are set

3. **Mobile Installation Issues**
   - Ensure HTTPS is enabled (required for PWA)
   - Check manifest.json configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- TensorFlow.js team for client-side ML models
- Supabase for the backend infrastructure
- Next.js team for the amazing framework

---

Built with ❤️ by the ShopAbell team