-- Fix the featured suppliers section type
UPDATE homepage_sections 
SET 
  type = 'supplier_cards',
  title_he = 'ספקים מובילים',
  updated_at = now()
WHERE id = 'aed4caf6-e86b-4505-8bea-3e75cd7528b1';