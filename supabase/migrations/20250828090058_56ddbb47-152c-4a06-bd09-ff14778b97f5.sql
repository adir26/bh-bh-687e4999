-- Drop dependent materialized view temporarily
DROP MATERIALIZED VIEW IF EXISTS popular_products;

-- Update user_favorites table to support multiple entity types
ALTER TABLE user_favorites 
  ADD COLUMN IF NOT EXISTS entity_type TEXT NOT NULL DEFAULT 'supplier',
  ADD COLUMN IF NOT EXISTS entity_id UUID;

-- Update existing records to use new structure
UPDATE user_favorites 
SET entity_id = item_id, entity_type = 'supplier' 
WHERE entity_id IS NULL;

-- Drop old columns now that we have the data copied
ALTER TABLE user_favorites DROP COLUMN IF EXISTS item_id CASCADE;
ALTER TABLE user_favorites DROP COLUMN IF EXISTS item_type CASCADE;

-- Add constraint for entity_type
ALTER TABLE user_favorites 
  ADD CONSTRAINT user_favorites_entity_type_check 
  CHECK (entity_type IN ('supplier', 'product', 'inspiration', 'ideabook'));

-- Create unique constraint to prevent duplicate favorites
ALTER TABLE user_favorites 
  ADD CONSTRAINT user_favorites_unique 
  UNIQUE (user_id, entity_type, entity_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_entity_type ON user_favorites(entity_type);
CREATE INDEX IF NOT EXISTS idx_user_favorites_entity_id ON user_favorites(entity_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_entity ON user_favorites(user_id, entity_type);

-- Recreate popular_products view with new structure
CREATE MATERIALIZED VIEW popular_products AS
SELECT 
    p.id,
    p.name,
    p.supplier_id,
    COUNT(uf.id) as favorites_count,
    AVG(CASE WHEN o.status = 'completed' THEN 1 ELSE 0 END) as success_rate
FROM products p
LEFT JOIN user_favorites uf ON uf.entity_id = p.id AND uf.entity_type = 'product'
LEFT JOIN orders o ON o.project_id = p.id
WHERE p.is_published = true
GROUP BY p.id, p.name, p.supplier_id
ORDER BY favorites_count DESC, success_rate DESC
LIMIT 100;