-- Remove consent requirement from lead_scores RLS policy
-- This allows suppliers to see scores for ALL assigned leads, regardless of consent status

DROP POLICY IF EXISTS "Suppliers can view scores of their assigned leads" ON lead_scores;

CREATE POLICY "Suppliers can view scores of their assigned leads"
ON lead_scores FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM leads l
    JOIN lead_assignments la ON la.lead_id = l.id
    JOIN companies c ON la.supplier_id = c.id
    WHERE lead_scores.lead_id = l.id
      AND c.owner_id = auth.uid()
      -- Removed: AND l.consent_to_share = true
      -- Now suppliers can see scores for all their assigned leads
  )
);

COMMENT ON POLICY "Suppliers can view scores of their assigned leads" ON lead_scores IS
'Allows suppliers to view lead scores for all their assigned leads, regardless of consent status. The consent flag only controls lead visibility, not score visibility.';