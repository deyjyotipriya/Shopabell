-- SHOPABELL DEMO DATA SEED SCRIPT
-- Run this in Supabase SQL Editor after running the main schema

-- ===========================
-- CREATE USERS
-- ===========================

-- Admin User
INSERT INTO users (id, phone, name, email, type, status, created_at) 
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '9999999999',
  'Admin User',
  'admin@shopabell.com',
  'admin',
  'active',
  NOW() - INTERVAL '30 days'
) ON CONFLICT (id) DO NOTHING;

-- Demo Sellers
INSERT INTO users (id, phone, name, email, type, status, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '9876543210', 'Priya Sharma', 'priya@demo.com', 'seller', 'active', NOW() - INTERVAL '90 days'),
  ('550e8400-e29b-41d4-a716-446655440002', '9876543211', 'Raj Kumar', 'raj@demo.com', 'seller', 'active', NOW() - INTERVAL '60 days'),
  ('550e8400-e29b-41d4-a716-446655440003', '9876543212', 'Anita Patel', 'anita@demo.com', 'seller', 'active', NOW() - INTERVAL '45 days'),
  ('550e8400-e29b-41d4-a716-446655440004', '9876543213', 'Mohammed Ali', 'spices@demo.com', 'seller', 'active', NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- Demo Buyers
INSERT INTO users (id, phone, name, email, type, status, created_at) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '9876543214', 'Rahul Kumar', 'rahul@demo.com', 'buyer', 'active', NOW() - INTERVAL '20 days'),
  ('650e8400-e29b-41d4-a716-446655440002', '9876543215', 'Sneha Sharma', 'sneha@demo.com', 'buyer', 'active', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- ===========================
-- CREATE SELLER PROFILES
-- ===========================

INSERT INTO sellers (user_id, business_name, store_url, category, upi_id, rating, total_gmv, total_orders, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Priya Fashion Store', 'priya-fashion', 'Fashion & Accessories', 'priya@paytm', 4.8, 248500.00, 156, NOW() - INTERVAL '90 days'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Raj Electronics Hub', 'raj-electronics', 'Electronics & Gadgets', 'raj@gpay', 4.6, 567800.00, 89, NOW() - INTERVAL '60 days'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Anita Home Decor', 'anita-decor', 'Home & Living', 'anita@phonepe', 4.9, 145600.00, 201, NOW() - INTERVAL '45 days'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Mumbai Spices & More', 'mumbai-spices', 'Food & Beverages', 'spices@paytm', 4.7, 89500.00, 342, NOW() - INTERVAL '30 days')
ON CONFLICT (user_id) DO NOTHING;

-- ===========================
-- CREATE PRODUCTS
-- ===========================

-- Priya Fashion Store Products
INSERT INTO products (id, seller_id, name, description, price, category, images, stock, views, status, source) VALUES
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Silk Saree - Royal Blue', 'Beautiful handwoven silk saree with golden border. Perfect for weddings and festivals.', 2499.00, 'Sarees', '["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800"]', 15, 234, 'active', 'upload'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Designer Lehenga Set', 'Stunning pink lehenga with heavy embroidery work. Includes blouse and dupatta.', 4999.00, 'Lehenga', '["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800"]', 8, 567, 'active', 'upload'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Cotton Kurti - Floral Print', 'Comfortable cotton kurti with beautiful floral prints. Available in multiple sizes.', 699.00, 'Kurtis', '["https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800"]', 25, 189, 'active', 'upload'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Palazzo Set - Mustard Yellow', 'Trendy palazzo set with crop top. Perfect for casual outings.', 1299.00, 'Western Wear', '["https://images.unsplash.com/photo-1592301933927-35b597393c0a?w=800"]', 20, 145, 'active', 'livestream'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Oxidized Silver Jhumkas', 'Traditional oxidized silver jhumkas with intricate design.', 499.00, 'Jewelry', '["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800"]', 30, 412, 'active', 'upload');

-- Raj Electronics Products
INSERT INTO products (id, seller_id, name, description, price, category, images, stock, views, status, source) VALUES
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'Wireless Earbuds Pro', 'Premium wireless earbuds with active noise cancellation. 24-hour battery life.', 3999.00, 'Audio', '["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"]', 50, 892, 'active', 'upload'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'Smart Watch Series 5', 'Feature-rich smartwatch with health monitoring and GPS tracking.', 8999.00, 'Wearables', '["https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800"]', 25, 645, 'active', 'upload'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'Portable Power Bank 20000mAh', 'High-capacity power bank with fast charging support.', 1499.00, 'Accessories', '["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800"]', 100, 534, 'active', 'livestream'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'Bluetooth Speaker - Bass Boost', 'Waterproof bluetooth speaker with powerful bass and 12-hour battery.', 2499.00, 'Audio', '["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800"]', 40, 423, 'active', 'upload');

-- Anita Home Decor Products
INSERT INTO products (id, seller_id, name, description, price, category, images, stock, views, status, source) VALUES
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'Macrame Wall Hanging', 'Handmade macrame wall hanging. Adds bohemian charm to any room.', 899.00, 'Wall Decor', '["https://images.unsplash.com/photo-1571032555917-9d4e5c39824a?w=800"]', 15, 234, 'active', 'upload'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'Ceramic Planter Set', 'Set of 3 ceramic planters in pastel colors. Perfect for succulents.', 1299.00, 'Planters', '["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800"]', 20, 456, 'active', 'livestream'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'Cushion Covers - Geometric', 'Set of 4 cushion covers with modern geometric patterns.', 699.00, 'Soft Furnishing', '["https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800"]', 35, 567, 'active', 'upload'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'Bamboo Wind Chimes', 'Melodious bamboo wind chimes for peaceful ambiance.', 499.00, 'Garden Decor', '["https://images.unsplash.com/photo-1524634126442-357e0eac3c14?w=800"]', 25, 189, 'active', 'upload');

-- Mumbai Spices Products
INSERT INTO products (id, seller_id, name, description, price, category, images, stock, views, status, source) VALUES
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'Garam Masala Premium', 'Authentic blend of 13 spices. No artificial colors or preservatives.', 149.00, 'Spices', '["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800"]', 200, 892, 'active', 'upload'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'Organic Turmeric Powder', '100% organic turmeric powder from Kerala farms.', 99.00, 'Spices', '["https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800"]', 150, 756, 'active', 'upload'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'Pickle Variety Pack', 'Pack of 4 traditional Indian pickles - Mango, Lemon, Mixed, Chilli.', 299.00, 'Pickles', '["https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=800"]', 80, 534, 'active', 'livestream'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'Basmati Rice Premium', 'Long grain premium basmati rice. Aged for perfect aroma.', 399.00, 'Rice & Grains', '["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800"]', 100, 423, 'active', 'upload');

-- ===========================
-- CREATE ORDERS
-- ===========================

-- Recent Orders for Demo (status options: 'placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned')
INSERT INTO orders (id, order_number, seller_id, buyer_id, items, subtotal, shipping_cost, tax, total_amount, status, payment_status, payment_method, shipping_address, created_at) VALUES
  (gen_random_uuid(), 'ORD-2024-0001', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '[{"product_id": "123", "name": "Silk Saree", "quantity": 1, "price": 2499}]'::jsonb, 2499.00, 100.00, 249.90, 2848.90, 'delivered', 'paid', 'upi', '{"name": "Rahul Kumar", "phone": "9876543214", "address": "123, MG Road", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001"}'::jsonb, NOW() - INTERVAL '15 days'),
  (gen_random_uuid(), 'ORD-2024-0002', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', '[{"product_id": "456", "name": "Wireless Earbuds", "quantity": 1, "price": 3999}]'::jsonb, 3999.00, 0.00, 399.90, 4398.90, 'shipped', 'paid', 'card', '{"name": "Sneha Sharma", "phone": "9876543215", "address": "456, Park Street", "city": "Delhi", "state": "Delhi", "pincode": "110001"}'::jsonb, NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'ORD-2024-0003', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', '[{"product_id": "789", "name": "Macrame Wall Hanging", "quantity": 2, "price": 899}]'::jsonb, 1798.00, 100.00, 179.80, 2077.80, 'packed', 'paid', 'upi', '{"name": "Rahul Kumar", "phone": "9876543214", "address": "123, MG Road", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001"}'::jsonb, NOW() - INTERVAL '5 days');

-- ===========================
-- CREATE CHATS
-- ===========================

INSERT INTO chats (id, seller_id, buyer_id, status, last_message_at, created_at) VALUES
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'active', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'active', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 day');

-- ===========================
-- CREATE LIVESTREAMS (if table exists)
-- ===========================

-- Note: The livestreams table schema might be different based on your migrations
-- Uncomment and adjust if needed:

-- INSERT INTO livestreams (id, user_id, title, description, platform, stream_url, status, started_at, ended_at, products_captured) VALUES
--   (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Diwali Collection Launch', 'Showcasing our exclusive Diwali collection', 'facebook', 'https://facebook.com/live/demo1', 'ended', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '2 hours', 12),
--   (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'New Gadgets Unboxing', 'Unboxing latest electronic gadgets', 'instagram', 'https://instagram.com/live/demo2', 'ended', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '1 hour', 8);

-- ===========================
-- PRINT LOGIN CREDENTIALS
-- ===========================

SELECT '=== DEMO LOGIN CREDENTIALS ===' as info;
SELECT 'Admin Login:' as role, '9999999999' as phone, '123456' as otp
UNION ALL
SELECT 'Seller Login (Priya):' as role, '9876543210' as phone, '123456' as otp
UNION ALL
SELECT 'Seller Login (Raj):' as role, '9876543211' as phone, '123456' as otp
UNION ALL
SELECT 'Buyer Login (Rahul):' as role, '9876543214' as phone, '123456' as otp
UNION ALL
SELECT 'Buyer Login (Sneha):' as role, '9876543215' as phone, '123456' as otp;

SELECT '=== DEMO STORE URLS ===' as info;
SELECT 'Priya Fashion Store:' as store, 'http://localhost:3000/store/priya-fashion' as url
UNION ALL
SELECT 'Raj Electronics:' as store, 'http://localhost:3000/store/raj-electronics' as url
UNION ALL
SELECT 'Anita Home Decor:' as store, 'http://localhost:3000/store/anita-decor' as url
UNION ALL
SELECT 'Mumbai Spices:' as store, 'http://localhost:3000/store/mumbai-spices' as url;