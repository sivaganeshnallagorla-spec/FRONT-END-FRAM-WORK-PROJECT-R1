/*
  # Orders and Reviews Schema

  ## Overview
  Creates tables for managing orders, transactions, and product reviews.

  ## New Tables
  
  ### `orders`
  Customer orders from buyers
  - `id` (uuid, primary key)
  - `buyer_id` (uuid) - References user_profiles
  - `farmer_id` (uuid) - References user_profiles
  - `total_amount` (decimal) - Total order value in INR
  - `status` (text) - Order status: pending, confirmed, shipped, delivered, cancelled
  - `payment_status` (text) - Payment status: pending, completed, failed, refunded
  - `delivery_address` (jsonb) - Delivery address details
  - `notes` (text) - Special instructions from buyer
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `order_items`
  Individual items within orders
  - `id` (uuid, primary key)
  - `order_id` (uuid) - References orders
  - `product_id` (uuid) - References products
  - `quantity` (integer) - Quantity ordered
  - `unit_price` (decimal) - Price per unit at time of order
  - `subtotal` (decimal) - Line item total
  - `created_at` (timestamptz)

  ### `reviews`
  Product reviews and ratings from buyers
  - `id` (uuid, primary key)
  - `product_id` (uuid) - References products
  - `buyer_id` (uuid) - References user_profiles
  - `order_id` (uuid) - References orders
  - `rating` (integer) - Rating from 1-5
  - `comment` (text) - Review text
  - `is_verified_purchase` (boolean) - Verified buyer
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Buyers can read their own orders and create reviews
  - Farmers can read orders for their products
  - Admins can read all orders
  - Reviews are publicly readable but only created by verified buyers

  ## Important Notes
  1. Order status tracking for shipment visibility
  2. Payment status separate from order status
  3. Reviews linked to verified purchases
  4. Delivery address stored as JSONB for flexibility
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  farmer_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  total_amount decimal(10, 2) NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  delivery_address jsonb NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid());

CREATE POLICY "Farmers can read their orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (farmer_id = auth.uid());

CREATE POLICY "Admins can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Buyers can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    buyer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'buyer'
    )
  );

CREATE POLICY "Farmers can update their orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10, 2) NOT NULL CHECK (unit_price >= 0),
  subtotal decimal(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read order items for their orders"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.buyer_id = auth.uid() OR orders.farmer_id = auth.uid())
    )
  );

CREATE POLICY "Buyers can create order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.buyer_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_verified_purchase boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, buyer_id, order_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Buyers can create reviews for purchased products"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    buyer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'buyer'
    ) AND
    EXISTS (
      SELECT 1 FROM order_items
      JOIN orders ON orders.id = order_items.order_id
      WHERE order_items.product_id = reviews.product_id
      AND orders.buyer_id = auth.uid()
      AND orders.status = 'delivered'
    )
  );

CREATE POLICY "Buyers can update own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (buyer_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer ON orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_buyer ON reviews(buyer_id);
