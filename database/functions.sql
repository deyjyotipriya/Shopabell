-- Function to decrement product stock
CREATE OR REPLACE FUNCTION decrement_product_stock(
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE products 
  SET stock = stock - p_quantity,
      reserved_stock = reserved_stock + p_quantity
  WHERE id = p_product_id 
    AND stock >= p_quantity;
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to increment livestream products count
CREATE OR REPLACE FUNCTION increment_livestream_products(
  p_livestream_id UUID,
  p_count INTEGER DEFAULT 1
) RETURNS VOID AS $$
BEGIN
  UPDATE livestreams 
  SET products_captured = products_captured + p_count
  WHERE id = p_livestream_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment livestream orders and GMV
CREATE OR REPLACE FUNCTION increment_livestream_orders(
  p_livestream_id UUID,
  p_amount DECIMAL DEFAULT 0
) RETURNS VOID AS $$
BEGIN
  UPDATE livestreams 
  SET orders_generated = orders_generated + 1,
      gmv_generated = gmv_generated + p_amount
  WHERE id = p_livestream_id;
END;
$$ LANGUAGE plpgsql;