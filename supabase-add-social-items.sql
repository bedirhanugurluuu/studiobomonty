-- Add social_items column to header_settings table
-- This column will store an array of social media items with name, link, and order

-- Step 1: Add the social_items column as JSONB
ALTER TABLE header_settings 
ADD COLUMN IF NOT EXISTS social_items JSONB DEFAULT '[]'::jsonb;

-- Step 2: Add a check constraint to ensure it's always an array (optional but recommended)
ALTER TABLE header_settings
ADD CONSTRAINT check_social_items_is_array 
CHECK (jsonb_typeof(social_items) = 'array');

-- Step 3: Create an index for better query performance (optional)
CREATE INDEX IF NOT EXISTS idx_header_settings_social_items 
ON header_settings USING GIN (social_items);

-- Example structure for social_items:
-- [
--   {
--     "id": "1",
--     "name": "Instagram",
--     "link": "https://instagram.com/...",
--     "order": 1
--   },
--   {
--     "id": "2",
--     "name": "Twitter",
--     "link": "https://twitter.com/...",
--     "order": 2
--   }
-- ]

-- Note: The column is set to default to an empty array '[]' so existing rows will have an empty array
-- You can update existing rows manually if needed:
-- UPDATE header_settings SET social_items = '[]'::jsonb WHERE social_items IS NULL;

