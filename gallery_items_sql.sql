-- Gallery Items Table
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_gallery_items_display_order ON gallery_items(display_order);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_gallery_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gallery_items_updated_at
  BEFORE UPDATE ON gallery_items
  FOR EACH ROW
  EXECUTE FUNCTION update_gallery_items_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Gallery items are viewable by everyone"
  ON gallery_items
  FOR SELECT
  USING (true);

-- Policy: Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert gallery items"
  ON gallery_items
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to update
CREATE POLICY "Authenticated users can update gallery items"
  ON gallery_items
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete gallery items"
  ON gallery_items
  FOR DELETE
  USING (auth.role() = 'authenticated');

