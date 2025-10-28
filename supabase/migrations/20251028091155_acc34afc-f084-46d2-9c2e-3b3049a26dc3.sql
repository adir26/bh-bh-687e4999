-- Add RLS policy for anyone to read reviews if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'reviews' 
    AND policyname = 'Anyone can read reviews'
  ) THEN
    CREATE POLICY "Anyone can read reviews"
    ON reviews FOR SELECT
    USING (true);
  END IF;
END $$;

-- Add RLS policy for authenticated users to create reviews if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'reviews' 
    AND policyname = 'Authenticated users can create reviews'
  ) THEN
    CREATE POLICY "Authenticated users can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);
  END IF;
END $$;

-- Function to update company rating based on reviews
CREATE OR REPLACE FUNCTION update_company_rating_from_reviews()
RETURNS TRIGGER AS $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Get company_id from the reviewed_id (which points to company)
  v_company_id := COALESCE(NEW.reviewed_id, OLD.reviewed_id);
  
  -- Update company rating and review count
  UPDATE companies
  SET 
    rating = (
      SELECT COALESCE(AVG(rating)::numeric(3,2), 0)
      FROM reviews
      WHERE reviewed_id = v_company_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE reviewed_id = v_company_id
    )
  WHERE id = v_company_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to update company rating on review changes
DROP TRIGGER IF EXISTS update_company_rating_on_review ON reviews;
CREATE TRIGGER update_company_rating_on_review
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_company_rating_from_reviews();