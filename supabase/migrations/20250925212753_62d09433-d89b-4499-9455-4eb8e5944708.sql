-- Create mood boards management tables
CREATE TABLE public.mood_boards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL,
  order_id UUID,
  client_id UUID,
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'base64url'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  client_can_interact BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'shared', 'approved', 'archived'))
);

CREATE TABLE public.mood_board_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mood_board_id UUID NOT NULL REFERENCES public.mood_boards(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL,
  product_id UUID,
  image_url TEXT NOT NULL,
  position_x REAL NOT NULL DEFAULT 0,
  position_y REAL NOT NULL DEFAULT 0,
  width REAL NOT NULL DEFAULT 200,
  height REAL NOT NULL DEFAULT 200,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  currency TEXT DEFAULT 'ILS',
  supplier_notes TEXT
);

CREATE TABLE public.mood_board_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mood_board_id UUID NOT NULL REFERENCES public.mood_boards(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.mood_board_items(id) ON DELETE CASCADE,
  user_id UUID,
  client_name TEXT,
  client_email TEXT,
  is_supplier BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  comment_text TEXT NOT NULL
);

CREATE TABLE public.mood_board_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mood_board_id UUID NOT NULL REFERENCES public.mood_boards(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.mood_board_items(id) ON DELETE CASCADE,
  user_id UUID,
  client_identifier TEXT,
  reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mood_board_id, item_id, user_id, client_identifier)
);

-- Create indexes for performance
CREATE INDEX idx_mood_boards_supplier_id ON public.mood_boards(supplier_id);
CREATE INDEX idx_mood_boards_order_id ON public.mood_boards(order_id);
CREATE INDEX idx_mood_boards_share_token ON public.mood_boards(share_token);
CREATE INDEX idx_mood_board_items_board_id ON public.mood_board_items(mood_board_id);
CREATE INDEX idx_mood_board_items_display_order ON public.mood_board_items(mood_board_id, display_order);
CREATE INDEX idx_mood_board_comments_board_id ON public.mood_board_comments(mood_board_id);
CREATE INDEX idx_mood_board_reactions_board_id ON public.mood_board_reactions(mood_board_id);
CREATE INDEX idx_mood_board_reactions_item_id ON public.mood_board_reactions(item_id);

-- Add updated_at triggers
CREATE TRIGGER update_mood_boards_updated_at
  BEFORE UPDATE ON public.mood_boards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mood_board_items_updated_at
  BEFORE UPDATE ON public.mood_board_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.mood_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_board_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_board_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_board_reactions ENABLE ROW LEVEL SECURITY;

-- Mood boards policies
CREATE POLICY "Suppliers can manage their mood boards"
  ON public.mood_boards
  FOR ALL
  USING (auth.uid() = supplier_id);

CREATE POLICY "Clients can view mood boards for their orders"
  ON public.mood_boards
  FOR SELECT
  USING (auth.uid() = client_id OR get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Public can view shared mood boards"
  ON public.mood_boards
  FOR SELECT
  USING (status = 'shared' AND is_active = true);

-- Mood board items policies
CREATE POLICY "Suppliers can manage their mood board items"
  ON public.mood_board_items
  FOR ALL
  USING (auth.uid() = supplier_id);

CREATE POLICY "Users can view items of accessible mood boards"
  ON public.mood_board_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mood_boards mb
      WHERE mb.id = mood_board_items.mood_board_id
      AND (
        mb.supplier_id = auth.uid() OR
        mb.client_id = auth.uid() OR
        (mb.status = 'shared' AND mb.is_active = true) OR
        get_user_role(auth.uid()) = 'admin'
      )
    )
  );

-- Comments policies
CREATE POLICY "Users can create comments on accessible mood boards"
  ON public.mood_board_comments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mood_boards mb
      WHERE mb.id = mood_board_comments.mood_board_id
      AND mb.client_can_interact = true
      AND (
        mb.supplier_id = auth.uid() OR
        mb.client_id = auth.uid() OR
        mb.status = 'shared'
      )
    )
  );

CREATE POLICY "Users can view comments on accessible mood boards"
  ON public.mood_board_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mood_boards mb
      WHERE mb.id = mood_board_comments.mood_board_id
      AND (
        mb.supplier_id = auth.uid() OR
        mb.client_id = auth.uid() OR
        (mb.status = 'shared' AND mb.is_active = true) OR
        get_user_role(auth.uid()) = 'admin'
      )
    )
  );

CREATE POLICY "Suppliers can manage comments on their mood boards"
  ON public.mood_board_comments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.mood_boards mb
      WHERE mb.id = mood_board_comments.mood_board_id
      AND mb.supplier_id = auth.uid()
    )
  );

-- Reactions policies
CREATE POLICY "Users can create reactions on accessible mood boards"
  ON public.mood_board_reactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mood_boards mb
      WHERE mb.id = mood_board_reactions.mood_board_id
      AND mb.client_can_interact = true
      AND (
        mb.supplier_id = auth.uid() OR
        mb.client_id = auth.uid() OR
        mb.status = 'shared'
      )
    )
  );

CREATE POLICY "Users can view reactions on accessible mood boards"
  ON public.mood_board_reactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mood_boards mb
      WHERE mb.id = mood_board_reactions.mood_board_id
      AND (
        mb.supplier_id = auth.uid() OR
        mb.client_id = auth.uid() OR
        (mb.status = 'shared' AND mb.is_active = true) OR
        get_user_role(auth.uid()) = 'admin'
      )
    )
  );

CREATE POLICY "Users can manage their own reactions"
  ON public.mood_board_reactions
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Suppliers can manage reactions on their mood boards"
  ON public.mood_board_reactions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.mood_boards mb
      WHERE mb.id = mood_board_reactions.mood_board_id
      AND mb.supplier_id = auth.uid()
    )
  );

-- Helper function to get mood board by token
CREATE OR REPLACE FUNCTION public.get_mood_board_by_token(p_token TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  supplier_id UUID,
  client_id UUID,
  client_can_interact BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    mb.id,
    mb.title,
    mb.description,
    mb.status,
    mb.supplier_id,
    mb.client_id,
    mb.client_can_interact,
    mb.created_at,
    mb.updated_at
  FROM public.mood_boards mb
  WHERE mb.share_token = p_token
    AND mb.is_active = true
    AND mb.status = 'shared';
$$;

-- Function to add mood board item to selection group
CREATE OR REPLACE FUNCTION public.add_mood_board_item_to_selection(
  p_item_id UUID,
  p_selection_group_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
  v_selection_item_id UUID;
BEGIN
  -- Get mood board item details
  SELECT 
    mbi.title,
    mbi.description,
    mbi.image_url,
    mbi.price,
    mbi.currency,
    mbi.supplier_id,
    mb.order_id
  INTO v_item
  FROM public.mood_board_items mbi
  JOIN public.mood_boards mb ON mb.id = mbi.mood_board_id
  WHERE mbi.id = p_item_id
    AND mbi.supplier_id = auth.uid();
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mood board item not found or access denied';
  END IF;
  
  -- Verify selection group belongs to same order and supplier
  IF NOT EXISTS (
    SELECT 1 FROM public.selection_groups sg
    WHERE sg.id = p_selection_group_id
      AND sg.order_id = v_item.order_id
      AND sg.supplier_id = v_item.supplier_id
  ) THEN
    RAISE EXCEPTION 'Selection group not found or access denied';
  END IF;
  
  -- Create selection item
  INSERT INTO public.selection_items (
    group_id,
    supplier_id,
    item_type,
    name,
    description,
    image_url,
    price,
    currency,
    source_data
  ) VALUES (
    p_selection_group_id,
    v_item.supplier_id,
    'product',
    v_item.title,
    v_item.description,
    v_item.image_url,
    v_item.price,
    v_item.currency,
    jsonb_build_object('mood_board_item_id', p_item_id)
  )
  RETURNING id INTO v_selection_item_id;
  
  RETURN v_selection_item_id;
END;
$$;