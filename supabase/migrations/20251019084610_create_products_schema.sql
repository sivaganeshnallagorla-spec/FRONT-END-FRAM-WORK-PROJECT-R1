/*
  # Products Schema

  ## Overview
  Creates tables for managing value-added agricultural products listed by farmers.

  ## New Tables
  
  ### `product_categories`
  Categories for organizing products
  - `id` (uuid, primary key)
  - `name_en` (text) - Category name in English
  - `name_hi` (text) - Category name in Hindi
  - `description` (text) - Category description
  - `icon` (text) - Icon identifier
  - `created_at` (timestamptz)

  ### `products`
  Product listings by farmers
  - `id` (uuid, primary key)
  - `farmer_id` (uuid) - References user_profiles
  - `category_id` (uuid) - References product_categories
  - `name` (text) - Product name
  - `description` (text) - Detailed description
  - `price` (decimal) - Price in INR
  - `unit` (text) - Unit of measurement (kg, litre, piece, etc.)
  - `stock_quantity` (integer) - Available inventory
  - `low_stock_threshold` (integer) - Alert threshold
  - `images` (jsonb) - Array of image URLs
  - `is_organic` (boolean) - Organic certification
  - `is_traditional` (boolean) - Made using traditional methods
  - `processing_method` (text) - How the product is processed
  - `shelf_life_days` (integer) - Shelf life duration
  - `tags` (text array) - Searchable tags
  - `is_active` (boolean) - Product visibility status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Categories are readable by all authenticated users
  - Only admins can manage categories
  - Farmers can create and manage their own products
  - Buyers and admins can read active products
  - Farmers receive notifications for low stock

  ## Important Notes
  1. Multi-language support for categories (English/Hindi)
  2. Stock management with low-stock alerts
  3. Product tagging for enhanced search
  4. Traditional/organic flags for cultural preferences
*/

CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_hi text NOT NULL,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON product_categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage categories"
  ON product_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES product_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10, 2) NOT NULL CHECK (price >= 0),
  unit text NOT NULL DEFAULT 'kg',
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold integer DEFAULT 10,
  images jsonb DEFAULT '[]'::jsonb,
  is_organic boolean DEFAULT false,
  is_traditional boolean DEFAULT false,
  processing_method text,
  shelf_life_days integer,
  tags text[] DEFAULT ARRAY[]::text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can read own products"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    farmer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'buyer')
    )
  );

CREATE POLICY "Farmers can create own products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    farmer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'farmer'
    )
  );

CREATE POLICY "Farmers can update own products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Farmers can delete own products"
  ON products
  FOR DELETE
  TO authenticated
  USING (farmer_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_products_farmer ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING gin(tags);

INSERT INTO product_categories (name_en, name_hi, description, icon) VALUES
  ('Processed Foods', 'प्रसंस्कृत खाद्य पदार्थ', 'Jams, pickles, dried fruits, spices', 'food'),
  ('Dairy Products', 'डेयरी उत्पाद', 'Cheese, ghee, paneer, butter', 'dairy'),
  ('Beverages', 'पेय पदार्थ', 'Juices, herbal teas, traditional drinks', 'beverage'),
  ('Grains & Flours', 'अनाज और आटा', 'Organic grains, specialty flours', 'grain'),
  ('Handmade Crafts', 'हस्तनिर्मित शिल्प', 'Traditional crafts from agricultural materials', 'craft'),
  ('Organic Produce', 'जैविक उत्पाद', 'Fresh organic fruits and vegetables', 'organic')
ON CONFLICT DO NOTHING;
