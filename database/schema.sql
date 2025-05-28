-- Core user system
CREATE TYPE user_type AS ENUM ('seller', 'buyer', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    type user_type NOT NULL,
    status user_status DEFAULT 'active',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Seller specific data
CREATE TYPE seller_tier AS ENUM ('free', 'growth', 'premium');

CREATE TABLE sellers (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    business_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    upi_id VARCHAR(100),
    pan VARCHAR(10),
    gst_number VARCHAR(15),
    virtual_account VARCHAR(20),
    ifsc VARCHAR(11) DEFAULT 'YESB0CMSNOC',
    tier seller_tier DEFAULT 'free',
    onboarding_source VARCHAR(50) DEFAULT 'whatsapp',
    referral_code VARCHAR(20) UNIQUE,
    referred_by UUID REFERENCES sellers(user_id),
    commission_rate DECIMAL(5,2) DEFAULT 3.00,
    total_gmv DECIMAL(12,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 5.00,
    shiprocket_token TEXT,
    store_url VARCHAR(100) UNIQUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Product catalog
CREATE TYPE product_status AS ENUM ('active', 'paused', 'deleted');
CREATE TYPE product_source AS ENUM ('livestream', 'upload', 'import', 'whatsapp');

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(user_id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    images JSONB NOT NULL DEFAULT '[]',
    category VARCHAR(100),
    subcategory VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    reserved_stock INTEGER DEFAULT 0,
    sku VARCHAR(100),
    weight DECIMAL(10,3),
    status product_status DEFAULT 'active',
    source product_source,
    source_metadata JSONB DEFAULT '{}',
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Product variants
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    attributes JSONB NOT NULL,
    price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'verified', 'failed', 'refunded');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled', 'returned');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    seller_id UUID REFERENCES sellers(user_id),
    buyer_id UUID REFERENCES users(id),
    items JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_charge DECIMAL(10,2) DEFAULT 0,
    cod_charge DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    payment_reference VARCHAR(255),
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    awb_number VARCHAR(50),
    courier_name VARCHAR(50),
    tracking_url TEXT,
    status order_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    payment_method VARCHAR(50),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(50) NOT NULL,
    gateway_response JSONB DEFAULT '{}',
    utr_number VARCHAR(100),
    payer_vpa VARCHAR(100),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Chat system
CREATE TYPE chat_status AS ENUM ('active', 'archived');
CREATE TYPE message_type AS ENUM ('text', 'image', 'product', 'order');

CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(user_id),
    buyer_id UUID REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    status chat_status DEFAULT 'active',
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    message_type message_type DEFAULT 'text',
    content TEXT,
    metadata JSONB DEFAULT '{}',
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Livestream sessions
CREATE TYPE livestream_status AS ENUM ('scheduled', 'live', 'ended');
CREATE TYPE livestream_platform AS ENUM ('facebook', 'instagram', 'youtube');

CREATE TABLE livestreams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(user_id),
    title VARCHAR(500),
    platform livestream_platform,
    stream_url TEXT,
    status livestream_status DEFAULT 'scheduled',
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    duration INTEGER,
    viewer_count INTEGER DEFAULT 0,
    products_captured INTEGER DEFAULT 0,
    orders_generated INTEGER DEFAULT 0,
    gmv_generated DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Admin groups
CREATE TABLE admin_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES users(id),
    group_name VARCHAR(255) NOT NULL,
    group_id VARCHAR(100),
    platform VARCHAR(50) DEFAULT 'facebook',
    member_count INTEGER DEFAULT 0,
    sellers_onboarded INTEGER DEFAULT 0,
    total_gmv DECIMAL(12,2) DEFAULT 0,
    commission_rate DECIMAL(5,2) DEFAULT 0.5,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Link sellers to admins
CREATE TYPE admin_seller_status AS ENUM ('active', 'inactive');

CREATE TABLE admin_sellers (
    admin_id UUID REFERENCES users(id),
    seller_id UUID REFERENCES sellers(user_id),
    commission_rate DECIMAL(5,2) DEFAULT 0.5,
    total_gmv DECIMAL(12,2) DEFAULT 0,
    total_commission DECIMAL(10,2) DEFAULT 0,
    status admin_seller_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (admin_id, seller_id)
);

-- Shipping records
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    shipment_id VARCHAR(100) UNIQUE,
    courier_id INTEGER,
    courier_name VARCHAR(100),
    awb_number VARCHAR(100),
    pickup_token VARCHAR(100),
    pickup_scheduled_date DATE,
    estimated_delivery DATE,
    actual_cost DECIMAL(10,2),
    charged_cost DECIMAL(10,2),
    profit DECIMAL(10,2),
    status VARCHAR(50),
    tracking_events JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TYPE notification_type AS ENUM ('order', 'payment', 'shipment', 'system');

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type notification_type,
    title VARCHAR(255),
    message TEXT,
    metadata JSONB DEFAULT '{}',
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics events
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(100),
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_products_seller ON products(seller_id, status);
CREATE INDEX idx_orders_seller ON orders(seller_id, created_at DESC);
CREATE INDEX idx_orders_buyer ON orders(buyer_id, created_at DESC);
CREATE INDEX idx_transactions_order ON transactions(order_id);
CREATE INDEX idx_messages_chat ON messages(chat_id, created_at);
CREATE INDEX idx_shipments_order ON shipments(order_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read_at);
CREATE INDEX idx_sellers_store_url ON sellers(store_url);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_orders_number ON orders(order_number);

-- Create functions for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();