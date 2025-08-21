-- Phase 1: Database Schema & Security Setup for Admin Supplier Management and Category Management

-- 1.1 Enhance Companies Table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('pending', 'approved', 'suspended')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_status text CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')) DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS verification_notes text,
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS area text,
ADD COLUMN IF NOT EXISTS business_license text,
ADD COLUMN IF NOT EXISTS tax_id text;

-- 1.2 Create Supplier Verifications Table
CREATE TABLE IF NOT EXISTS public.supplier_verifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    submitted_by uuid REFERENCES public.profiles(id) NOT NULL,
    status text CHECK (status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
    notes text,
    documents jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp with time zone,
    reviewed_by uuid REFERENCES public.profiles(id)
);

-- Enable RLS on supplier_verifications
ALTER TABLE public.supplier_verifications ENABLE ROW LEVEL SECURITY;

-- 1.3 Enhance Categories Table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS position integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;

-- Create unique constraint on slug
ALTER TABLE public.categories ADD CONSTRAINT categories_slug_unique UNIQUE (slug);

-- Update existing categories with slugs if they don't have them
UPDATE public.categories 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), 'ä', 'a'))
WHERE slug IS NULL;

-- Make slug NOT NULL after setting values
ALTER TABLE public.categories ALTER COLUMN slug SET NOT NULL;

-- 1.4 Create Company Categories Join Table
CREATE TABLE IF NOT EXISTS public.company_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(company_id, category_id)
);

-- Enable RLS on company_categories
ALTER TABLE public.company_categories ENABLE ROW LEVEL SECURITY;

-- 1.5 Create Supplier Verification Storage Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('supplier-verification', 'supplier-verification', false)
ON CONFLICT (id) DO NOTHING;

-- 1.6 RLS Policies for Admin Access

-- Admin can manage all companies
CREATE POLICY "Admins can manage all companies" ON public.companies
FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Suppliers can view and update their own company basic info only
CREATE POLICY "Suppliers can manage own company basic info" ON public.companies
FOR UPDATE USING (
    auth.uid() = owner_id AND 
    get_user_role(auth.uid()) = 'supplier'::user_role
);

-- Admin can manage supplier verifications
CREATE POLICY "Admins can manage supplier verifications" ON public.supplier_verifications
FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Suppliers can view and create their own verifications
CREATE POLICY "Suppliers can manage own verifications" ON public.supplier_verifications
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.companies 
        WHERE id = company_id AND owner_id = auth.uid()
    )
);

CREATE POLICY "Suppliers can create own verifications" ON public.supplier_verifications
FOR INSERT WITH CHECK (
    auth.uid() = submitted_by AND
    EXISTS (
        SELECT 1 FROM public.companies 
        WHERE id = company_id AND owner_id = auth.uid()
    )
);

-- Admin can manage all categories
CREATE POLICY "Admins can manage all categories" ON public.categories
FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Admin can manage company categories
CREATE POLICY "Admins can manage company categories" ON public.company_categories
FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Suppliers can manage their own company categories
CREATE POLICY "Suppliers can manage own company categories" ON public.company_categories
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.companies 
        WHERE id = company_id AND owner_id = auth.uid()
    )
);

-- Storage policies for supplier verification documents
CREATE POLICY "Admins can access all verification documents" ON storage.objects
FOR ALL USING (
    bucket_id = 'supplier-verification' AND
    get_user_role(auth.uid()) = 'admin'::user_role
);

CREATE POLICY "Suppliers can upload own verification documents" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'supplier-verification' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Suppliers can view own verification documents" ON storage.objects
FOR SELECT USING (
    bucket_id = 'supplier-verification' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- 1.7 Performance Indexes
CREATE INDEX IF NOT EXISTS companies_status_created_at_idx ON public.companies(status, created_at);
CREATE INDEX IF NOT EXISTS companies_verification_status_idx ON public.companies(verification_status);
CREATE INDEX IF NOT EXISTS companies_is_public_idx ON public.companies(is_public);
CREATE INDEX IF NOT EXISTS companies_featured_idx ON public.companies(featured);
CREATE INDEX IF NOT EXISTS companies_owner_id_idx ON public.companies(owner_id);

CREATE INDEX IF NOT EXISTS supplier_verifications_company_id_idx ON public.supplier_verifications(company_id);
CREATE INDEX IF NOT EXISTS supplier_verifications_status_idx ON public.supplier_verifications(status);

CREATE INDEX IF NOT EXISTS categories_parent_id_position_idx ON public.categories(parent_id, position);
CREATE INDEX IF NOT EXISTS categories_is_public_is_active_idx ON public.categories(is_public, is_active);

CREATE INDEX IF NOT EXISTS company_categories_category_id_idx ON public.company_categories(category_id);
CREATE INDEX IF NOT EXISTS company_categories_company_id_idx ON public.company_categories(company_id);

-- 1.8 Text Search Indexes (for better search performance)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS companies_name_trgm_idx ON public.companies USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS profiles_email_trgm_idx ON public.profiles USING gin (email gin_trgm_ops);

-- 1.9 Update existing companies to have proper status
UPDATE public.companies 
SET status = 'approved', verification_status = 'verified'
WHERE status IS NULL;