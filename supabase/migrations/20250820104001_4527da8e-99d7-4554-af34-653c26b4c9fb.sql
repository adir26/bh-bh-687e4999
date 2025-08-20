-- Create inspiration photos table
CREATE TABLE public.photos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    room TEXT, -- e.g., 'kitchen', 'bathroom', 'living_room'
    style TEXT, -- e.g., 'modern', 'rustic', 'minimalist'
    color_palette JSONB DEFAULT '[]'::jsonb, -- Array of dominant colors
    is_public BOOLEAN NOT NULL DEFAULT true,
    width INTEGER,
    height INTEGER,
    storage_path TEXT NOT NULL, -- Path in storage bucket
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ideabooks table
CREATE TABLE public.ideabooks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT false,
    share_token TEXT UNIQUE, -- For public sharing
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ideabook_photos junction table
CREATE TABLE public.ideabook_photos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ideabook_id UUID NOT NULL REFERENCES public.ideabooks(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
    added_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(ideabook_id, photo_id)
);

-- Create photo_products table for product tagging
CREATE TABLE public.photo_products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tag_position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}'::jsonb, -- {x: percentage, y: percentage}
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create photo_tags table for flexible tagging
CREATE TABLE public.photo_tags (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create photo_likes table
CREATE TABLE public.photo_likes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(photo_id, user_id)
);

-- Create ideabook_collaborators table
CREATE TABLE public.ideabook_collaborators (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ideabook_id UUID NOT NULL REFERENCES public.ideabooks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('viewer', 'editor')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(ideabook_id, user_id)
);

-- Create storage bucket for inspiration photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('inspiration-photos', 'inspiration-photos', true);

-- Create performance indexes
CREATE INDEX idx_photos_public_created ON public.photos(is_public, created_at DESC);
CREATE INDEX idx_photos_uploader ON public.photos(uploader_id);
CREATE INDEX idx_photos_company ON public.photos(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX idx_photos_room_style ON public.photos(room, style) WHERE room IS NOT NULL AND style IS NOT NULL;

CREATE INDEX idx_ideabooks_owner ON public.ideabooks(owner_id);
CREATE INDEX idx_ideabooks_public ON public.ideabooks(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX idx_ideabooks_share_token ON public.ideabooks(share_token) WHERE share_token IS NOT NULL;

CREATE INDEX idx_ideabook_photos_ideabook ON public.ideabook_photos(ideabook_id, created_at DESC);
CREATE INDEX idx_ideabook_photos_photo ON public.ideabook_photos(photo_id);

CREATE INDEX idx_photo_products_photo ON public.photo_products(photo_id);
CREATE INDEX idx_photo_products_product ON public.photo_products(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_photo_products_supplier ON public.photo_products(supplier_id) WHERE supplier_id IS NOT NULL;

CREATE INDEX idx_photo_tags_tag ON public.photo_tags(tag);
CREATE INDEX idx_photo_tags_photo ON public.photo_tags(photo_id);

CREATE INDEX idx_photo_likes_photo ON public.photo_likes(photo_id);
CREATE INDEX idx_photo_likes_user ON public.photo_likes(user_id);

CREATE INDEX idx_ideabook_collaborators_ideabook ON public.ideabook_collaborators(ideabook_id);
CREATE INDEX idx_ideabook_collaborators_user ON public.ideabook_collaborators(user_id);

-- Enable Row Level Security
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideabooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideabook_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideabook_collaborators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for photos
CREATE POLICY "Anyone can view public photos" ON public.photos
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own photos" ON public.photos
    FOR SELECT USING (auth.uid() = uploader_id);

CREATE POLICY "Admins can view all photos" ON public.photos
    FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can create their own photos" ON public.photos
    FOR INSERT WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Users can update their own photos" ON public.photos
    FOR UPDATE USING (auth.uid() = uploader_id);

CREATE POLICY "Admins can update any photo" ON public.photos
    FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can delete their own photos" ON public.photos
    FOR DELETE USING (auth.uid() = uploader_id);

CREATE POLICY "Admins can delete any photo" ON public.photos
    FOR DELETE USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for ideabooks
CREATE POLICY "Users can view their own ideabooks" ON public.ideabooks
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Anyone can view public ideabooks" ON public.ideabooks
    FOR SELECT USING (is_public = true);

CREATE POLICY "Collaborators can view shared ideabooks" ON public.ideabooks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ideabook_collaborators 
            WHERE ideabook_id = ideabooks.id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all ideabooks" ON public.ideabooks
    FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can create their own ideabooks" ON public.ideabooks
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own ideabooks" ON public.ideabooks
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Editors can update shared ideabooks" ON public.ideabooks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.ideabook_collaborators 
            WHERE ideabook_id = ideabooks.id AND user_id = auth.uid() AND role = 'editor'
        )
    );

CREATE POLICY "Users can delete their own ideabooks" ON public.ideabooks
    FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for ideabook_photos
CREATE POLICY "Users can view photos in accessible ideabooks" ON public.ideabook_photos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ideabooks 
            WHERE id = ideabook_photos.ideabook_id 
            AND (
                owner_id = auth.uid() 
                OR is_public = true 
                OR EXISTS (
                    SELECT 1 FROM public.ideabook_collaborators 
                    WHERE ideabook_id = ideabooks.id AND user_id = auth.uid()
                )
                OR get_user_role(auth.uid()) = 'admin'
            )
        )
    );

CREATE POLICY "Users can add photos to their ideabooks" ON public.ideabook_photos
    FOR INSERT WITH CHECK (
        auth.uid() = added_by 
        AND EXISTS (
            SELECT 1 FROM public.ideabooks 
            WHERE id = ideabook_photos.ideabook_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Editors can add photos to shared ideabooks" ON public.ideabook_photos
    FOR INSERT WITH CHECK (
        auth.uid() = added_by 
        AND EXISTS (
            SELECT 1 FROM public.ideabook_collaborators 
            WHERE ideabook_id = ideabook_photos.ideabook_id 
            AND user_id = auth.uid() 
            AND role = 'editor'
        )
    );

CREATE POLICY "Users can remove photos from their ideabooks" ON public.ideabook_photos
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.ideabooks 
            WHERE id = ideabook_photos.ideabook_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Editors can remove photos from shared ideabooks" ON public.ideabook_photos
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.ideabook_collaborators 
            WHERE ideabook_id = ideabook_photos.ideabook_id 
            AND user_id = auth.uid() 
            AND role = 'editor'
        )
    );

-- RLS Policies for photo_products
CREATE POLICY "Users can view product tags on visible photos" ON public.photo_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.photos 
            WHERE id = photo_products.photo_id 
            AND (is_public = true OR uploader_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
        )
    );

CREATE POLICY "Photo owners can manage product tags" ON public.photo_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.photos 
            WHERE id = photo_products.photo_id AND uploader_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all product tags" ON public.photo_products
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for photo_tags
CREATE POLICY "Users can view tags on visible photos" ON public.photo_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.photos 
            WHERE id = photo_tags.photo_id 
            AND (is_public = true OR uploader_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
        )
    );

CREATE POLICY "Photo owners can manage tags" ON public.photo_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.photos 
            WHERE id = photo_tags.photo_id AND uploader_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all tags" ON public.photo_tags
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for photo_likes
CREATE POLICY "Users can view likes on visible photos" ON public.photo_likes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.photos 
            WHERE id = photo_likes.photo_id 
            AND (is_public = true OR uploader_id = auth.uid() OR get_user_role(auth.uid()) = 'admin')
        )
    );

CREATE POLICY "Users can manage their own likes" ON public.photo_likes
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for ideabook_collaborators
CREATE POLICY "Users can view collaborators of accessible ideabooks" ON public.ideabook_collaborators
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ideabooks 
            WHERE id = ideabook_collaborators.ideabook_id 
            AND (
                owner_id = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM public.ideabook_collaborators ic
                    WHERE ic.ideabook_id = ideabooks.id AND ic.user_id = auth.uid()
                )
                OR get_user_role(auth.uid()) = 'admin'
            )
        )
    );

CREATE POLICY "Ideabook owners can manage collaborators" ON public.ideabook_collaborators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.ideabooks 
            WHERE id = ideabook_collaborators.ideabook_id AND owner_id = auth.uid()
        )
    );

-- Storage policies for inspiration-photos bucket
CREATE POLICY "Anyone can view public inspiration photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'inspiration-photos');

CREATE POLICY "Users can upload to their own folder" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'inspiration-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own photos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'inspiration-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'inspiration-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Admins can manage all inspiration photos" ON storage.objects
    FOR ALL USING (
        bucket_id = 'inspiration-photos' 
        AND get_user_role(auth.uid()) = 'admin'
    );

-- Add updated_at trigger for photos
CREATE TRIGGER update_photos_updated_at
    BEFORE UPDATE ON public.photos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for ideabooks
CREATE TRIGGER update_ideabooks_updated_at
    BEFORE UPDATE ON public.ideabooks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();