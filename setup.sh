#!/bin/bash

echo "🚀 Setting up ShopAbell..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual credentials!"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate a random JWT secret if not set
if grep -q "your-jwt-secret-key" .env.local; then
    echo "🔐 Generating JWT secret..."
    JWT_SECRET=$(openssl rand -base64 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-jwt-secret-key/$JWT_SECRET/g" .env.local
    else
        # Linux
        sed -i "s/your-jwt-secret-key/$JWT_SECRET/g" .env.local
    fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a Supabase account at https://supabase.com"
echo "2. Update .env.local with your Supabase credentials"
echo "3. Run the database schema in Supabase SQL editor"
echo "4. (Optional) Create a Cloudinary account for image processing"
echo "5. Run 'npm run dev' to start the development server"
echo ""
echo "🎉 Happy selling with ShopAbell!"