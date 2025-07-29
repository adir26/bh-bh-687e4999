import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  parent_id?: string;
  created_at: string;
}

export interface Company {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  website?: string;
  logo_url?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  rating: number;
  review_count: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  category_id?: string;
  budget_min?: number;
  budget_max?: number;
  location?: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  project_id: string;
  supplier_id: string;
  client_id: string;
  title: string;
  description?: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  project_id?: string;
  order_id?: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  read_at?: string;
  created_at: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewed_id: string;
  project_id?: string;
  order_id?: string;
  rating: number;
  title?: string;
  content?: string;
  created_at: string;
}

// Categories Service
export const categoriesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as Category[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Category;
  }
};

// Companies Service
export const companiesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Company[];
  },

  async getByOwnerId(ownerId: string) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_id', ownerId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as Company | null;
  },

  async create(company: Omit<Company, 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count' | 'verified'>) {
    const { data, error } = await supabase
      .from('companies')
      .insert(company)
      .select()
      .single();
    
    if (error) throw error;
    return data as Company;
  },

  async update(id: string, updates: Partial<Company>) {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Company;
  }
};

// Projects Service
export const projectsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Project[];
  },

  async getByClientId(clientId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Project[];
  },

  async create(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    if (error) throw error;
    return data as Project;
  },

  async update(id: string, updates: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Project;
  }
};

// Orders Service
export const ordersService = {
  async getAll() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Order[];
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`client_id.eq.${userId},supplier_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Order[];
  },

  async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    
    if (error) throw error;
    return data as Order;
  },

  async update(id: string, updates: Partial<Order>) {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Order;
  }
};

// Messages Service
export const messagesService = {
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Message[];
  },

  async send(message: Omit<Message, 'id' | 'created_at' | 'status' | 'read_at'>) {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();
    
    if (error) throw error;
    return data as Message;
  },

  async markAsRead(id: string) {
    const { data, error } = await supabase
      .from('messages')
      .update({ 
        status: 'read', 
        read_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Message;
  }
};

// Reviews Service
export const reviewsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Review[];
  },

  async getByReviewedId(reviewedId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('reviewed_id', reviewedId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Review[];
  },

  async create(review: Omit<Review, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();
    
    if (error) throw error;
    return data as Review;
  }
};

// Storage Service
export const storageService = {
  async uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });
    
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  },

  async uploadCompanyLogo(companyId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${companyId}/logo.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('company-logos')
      .upload(fileName, file, { upsert: true });
    
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from('company-logos')
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  },

  async uploadProjectDocument(projectId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${projectId}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('project-documents')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from('project-documents')
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  }
};