-- Create enums for various statuses and roles
CREATE TYPE public.user_role AS ENUM ('client', 'supplier', 'admin');
CREATE TYPE public.project_status AS ENUM ('planning', 'active', 'completed', 'cancelled');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.message_status AS ENUM ('sent', 'delivered', 'read');

-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'client',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create companies table for suppliers
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    address TEXT,
    city TEXT,
    phone TEXT,
    email TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    parent_id UUID REFERENCES public.categories(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create projects table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id),
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    location TEXT,
    status project_status NOT NULL DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.profiles(id),
    client_id UUID NOT NULL REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    status order_status NOT NULL DEFAULT 'pending',
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status message_status NOT NULL DEFAULT 'sent',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewed_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(reviewer_id, reviewed_id, project_id)
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('avatars', 'avatars', true),
    ('company-logos', 'company-logos', true),
    ('project-documents', 'project-documents', false);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for companies
CREATE POLICY "Anyone can view companies" ON public.companies
    FOR SELECT USING (true);

CREATE POLICY "Suppliers can create companies" ON public.companies
    FOR INSERT WITH CHECK (
        auth.uid() = owner_id AND 
        public.get_user_role(auth.uid()) = 'supplier'
    );

CREATE POLICY "Company owners can update their company" ON public.companies
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Admins can update any company" ON public.companies
    FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for categories
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for projects
CREATE POLICY "Users can view projects they're involved in" ON public.projects
    FOR SELECT USING (
        auth.uid() = client_id OR
        public.get_user_role(auth.uid()) = 'admin' OR
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.project_id = projects.id 
            AND orders.supplier_id = auth.uid()
        )
    );

CREATE POLICY "Clients can create projects" ON public.projects
    FOR INSERT WITH CHECK (
        auth.uid() = client_id AND 
        public.get_user_role(auth.uid()) = 'client'
    );

CREATE POLICY "Project owners can update their projects" ON public.projects
    FOR UPDATE USING (auth.uid() = client_id);

-- RLS Policies for orders
CREATE POLICY "Users can view orders they're involved in" ON public.orders
    FOR SELECT USING (
        auth.uid() = client_id OR 
        auth.uid() = supplier_id OR
        public.get_user_role(auth.uid()) = 'admin'
    );

CREATE POLICY "Suppliers can create orders" ON public.orders
    FOR INSERT WITH CHECK (
        auth.uid() = supplier_id AND
        public.get_user_role(auth.uid()) = 'supplier'
    );

CREATE POLICY "Order participants can update orders" ON public.orders
    FOR UPDATE USING (
        auth.uid() = client_id OR 
        auth.uid() = supplier_id
    );

-- RLS Policies for messages
CREATE POLICY "Users can view their messages" ON public.messages
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id OR
        public.get_user_role(auth.uid()) = 'admin'
    );

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update message status" ON public.messages
    FOR UPDATE USING (auth.uid() = recipient_id);

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can update their reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for company logos
CREATE POLICY "Company logos are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'company-logos');

CREATE POLICY "Suppliers can upload company logos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'company-logos' AND 
        public.get_user_role(auth.uid()) = 'supplier'
    );

-- Storage policies for project documents
CREATE POLICY "Project participants can view documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'project-documents' AND (
            auth.uid()::text = (storage.foldername(name))[1] OR
            public.get_user_role(auth.uid()) = 'admin'
        )
    );

CREATE POLICY "Users can upload project documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'project-documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
    );
    RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Insert sample categories
INSERT INTO public.categories (name, description, icon) VALUES
    ('Kitchen', 'Kitchen renovation and design', 'chef-hat'),
    ('Bathroom', 'Bathroom renovation and plumbing', 'droplets'),
    ('Home Loans', 'Mortgage and financing services', 'banknote'),
    ('Air Conditioning', 'HVAC and climate control', 'snowflake'),
    ('Moving Services', 'Relocation and moving assistance', 'truck'),
    ('Furniture', 'Furniture and interior design', 'sofa'),
    ('Renovation', 'General home renovation', 'hammer');