-- Unified Favorites System Migration
-- Migrate existing favorites to unified structure and create meeting booking system

-- First, check if user_favorites table exists, if not create it
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('supplier', 'product', 'inspiration', 'ideabook')),
  entity_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id)
);

-- Migrate existing favorites data if the old favorites table exists
INSERT INTO public.user_favorites (user_id, entity_type, entity_id, created_at)
SELECT user_id, 'supplier'::TEXT, supplier_id, created_at
FROM public.favorites
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_favorites uf 
  WHERE uf.user_id = favorites.user_id 
  AND uf.entity_type = 'supplier' 
  AND uf.entity_id = favorites.supplier_id
)
ON CONFLICT (user_id, entity_type, entity_id) DO NOTHING;

-- Enable RLS on user_favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_favorites
CREATE POLICY "Users can manage their own favorites" 
ON public.user_favorites 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create toggle_favorite function to prevent duplicates
CREATE OR REPLACE FUNCTION public.toggle_favorite(
  p_entity_type TEXT,
  p_entity_id UUID
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_existing_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Check if already favorited
  SELECT id INTO v_existing_id
  FROM public.user_favorites
  WHERE user_id = v_user_id
    AND entity_type = p_entity_type
    AND entity_id = p_entity_id;

  IF v_existing_id IS NOT NULL THEN
    -- Remove from favorites
    DELETE FROM public.user_favorites WHERE id = v_existing_id;
    RETURN FALSE; -- Removed
  ELSE
    -- Add to favorites
    INSERT INTO public.user_favorites (user_id, entity_type, entity_id)
    VALUES (v_user_id, p_entity_type, p_entity_id);
    RETURN TRUE; -- Added
  END IF;
END;
$$;

-- Meeting Booking System

-- Supplier availability table
CREATE TABLE public.availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Jerusalem',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(supplier_id, day_of_week, start_time, end_time)
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL,
  client_id UUID NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on availability and bookings
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies for availability
CREATE POLICY "Suppliers can manage their own availability" 
ON public.availability 
FOR ALL 
USING (auth.uid() = supplier_id)
WITH CHECK (auth.uid() = supplier_id);

CREATE POLICY "Anyone can view supplier availability" 
ON public.availability 
FOR SELECT 
USING (true);

-- RLS policies for bookings
CREATE POLICY "Booking participants can view bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = supplier_id OR auth.uid() = client_id OR get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Clients can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Booking participants can update bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = supplier_id OR auth.uid() = client_id);

-- Function to check for booking conflicts
CREATE OR REPLACE FUNCTION public.check_booking_conflict(
  p_supplier_id UUID,
  p_starts_at TIMESTAMP WITH TIME ZONE,
  p_ends_at TIMESTAMP WITH TIME ZONE,
  p_exclude_booking_id UUID DEFAULT NULL
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.bookings
    WHERE supplier_id = p_supplier_id
      AND status IN ('pending', 'confirmed')
      AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
      AND (
        (starts_at <= p_starts_at AND ends_at > p_starts_at) OR
        (starts_at < p_ends_at AND ends_at >= p_ends_at) OR
        (starts_at >= p_starts_at AND ends_at <= p_ends_at)
      )
  );
END;
$$;

-- Function to validate booking against availability
CREATE OR REPLACE FUNCTION public.validate_booking_availability(
  p_supplier_id UUID,
  p_starts_at TIMESTAMP WITH TIME ZONE,
  p_ends_at TIMESTAMP WITH TIME ZONE
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_day_of_week INTEGER;
  v_start_time TIME;
  v_end_time TIME;
BEGIN
  -- Extract day of week and time from requested slot
  v_day_of_week := EXTRACT(DOW FROM p_starts_at); -- 0 = Sunday in PostgreSQL
  v_start_time := p_starts_at::TIME;
  v_end_time := p_ends_at::TIME;
  
  RETURN EXISTS (
    SELECT 1 
    FROM public.availability
    WHERE supplier_id = p_supplier_id
      AND day_of_week = v_day_of_week
      AND start_time <= v_start_time
      AND end_time >= v_end_time
  );
END;
$$;

-- Trigger to validate bookings before insert/update
CREATE OR REPLACE FUNCTION public.validate_booking()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Check for conflicts
  IF public.check_booking_conflict(NEW.supplier_id, NEW.starts_at, NEW.ends_at, NEW.id) THEN
    RAISE EXCEPTION 'Booking conflict: Supplier already has a booking at this time';
  END IF;
  
  -- Check availability (only for new bookings)
  IF TG_OP = 'INSERT' THEN
    IF NOT public.validate_booking_availability(NEW.supplier_id, NEW.starts_at, NEW.ends_at) THEN
      RAISE EXCEPTION 'Booking outside supplier availability hours';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_booking_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_booking();

-- Add updated_at triggers
CREATE TRIGGER update_availability_updated_at
  BEFORE UPDATE ON public.availability
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();