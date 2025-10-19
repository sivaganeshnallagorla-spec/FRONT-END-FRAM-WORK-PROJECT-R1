/*
  # Messaging and Educational Resources Schema

  ## Overview
  Creates tables for farmer-buyer communication and educational resources for farmers.

  ## New Tables
  
  ### `messages`
  Direct messaging between farmers and buyers
  - `id` (uuid, primary key)
  - `sender_id` (uuid) - References user_profiles
  - `receiver_id` (uuid) - References user_profiles
  - `product_id` (uuid) - Optional reference to products
  - `order_id` (uuid) - Optional reference to orders
  - `content` (text) - Message content
  - `is_read` (boolean) - Read status
  - `created_at` (timestamptz)

  ### `educational_resources`
  Articles and guides for farmers
  - `id` (uuid, primary key)
  - `title_en` (text) - Title in English
  - `title_hi` (text) - Title in Hindi
  - `content_en` (text) - Content in English
  - `content_hi` (text) - Content in Hindi
  - `category` (text) - Resource category
  - `tags` (text array) - Searchable tags
  - `author_id` (uuid) - References user_profiles (admin)
  - `image_url` (text) - Featured image
  - `is_published` (boolean) - Visibility status
  - `view_count` (integer) - Number of views
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `resource_bookmarks`
  Farmers can bookmark helpful resources
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References user_profiles
  - `resource_id` (uuid) - References educational_resources
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can send and read their own messages
  - All authenticated users can read published resources
  - Only admins can create/edit resources
  - Users can manage their own bookmarks

  ## Important Notes
  1. Multi-language support for educational content
  2. Messages linked to products/orders for context
  3. View counting for resource analytics
  4. Bookmark system for personalized learning
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can mark their received messages as read"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

CREATE TABLE IF NOT EXISTS educational_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_hi text NOT NULL,
  content_en text NOT NULL,
  content_hi text NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  author_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  image_url text,
  is_published boolean DEFAULT false,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE educational_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published resources"
  ON educational_resources
  FOR SELECT
  TO authenticated
  USING (is_published = true OR author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage resources"
  ON educational_resources
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

CREATE TABLE IF NOT EXISTS resource_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES educational_resources(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

ALTER TABLE resource_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bookmarks"
  ON resource_bookmarks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own bookmarks"
  ON resource_bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own bookmarks"
  ON resource_bookmarks
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_resources_category ON educational_resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_tags ON educational_resources USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON resource_bookmarks(user_id);

INSERT INTO educational_resources (title_en, title_hi, content_en, content_hi, category, tags, is_published) VALUES
  ('Getting Started with Value Addition', 'मूल्य संवर्धन के साथ शुरुआत करना', 'Learn the basics of adding value to your farm products and increasing profitability.', 'अपने कृषि उत्पादों में मूल्य जोड़ने और लाभप्रदता बढ़ाने की मूल बातें जानें।', 'Getting Started', ARRAY['beginner', 'value-addition'], true),
  ('Food Safety and Packaging', 'खाद्य सुरक्षा और पैकेजिंग', 'Essential guidelines for safe food processing and attractive packaging.', 'सुरक्षित खाद्य प्रसंस्करण और आकर्षक पैकेजिंग के लिए आवश्यक दिशानिर्देश।', 'Production', ARRAY['safety', 'packaging'], true),
  ('Marketing Your Products Online', 'अपने उत्पादों को ऑनलाइन मार्केटिंग करना', 'Strategies for effective online marketing and reaching more customers.', 'प्रभावी ऑनलाइन मार्केटिंग और अधिक ग्राहकों तक पहुंचने की रणनीतियां।', 'Marketing', ARRAY['marketing', 'digital'], true)
ON CONFLICT DO NOTHING;
