export interface Photo {
  id: string;
  title: string;
  description?: string;
  storage_path: string;
  room?: string;
  style?: string;
  width?: number;
  height?: number;
  uploader_id: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  likes?: number;
  is_liked?: boolean;
  tags?: string[];
  products_count?: number;
  color_palette?: string[];
}

export interface Ideabook {
  id: string;
  name: string;
  is_public: boolean;
  share_token?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  photos_count?: number;
}

export interface IdeabookPhoto {
  id: string;
  ideabook_id: string;
  photo_id: string;
  added_by: string;
  created_at: string;
  photos: {
    id: string;
    title: string;
    storage_path: string;
    room?: string;
    style?: string;
  };
}

export interface ProductTag {
  id: string;
  photo_id: string;
  product_id?: string;
  supplier_id?: string;
  tag_position: { x: number; y: number };
  note?: string;
  created_at: string;
  products?: {
    id: string;
    name: string;
    price?: number;
    currency: string;
    supplier_id: string;
  };
  profiles?: {
    id: string;
    full_name?: string;
    email: string;
  };
}

export interface PhotoTag {
  id: string;
  photo_id: string;
  tag: string;
  created_at: string;
}

export interface PhotoLike {
  id: string;
  photo_id: string;
  user_id: string;
  created_at: string;
}

export interface IdeabookCollaborator {
  id: string;
  ideabook_id: string;
  user_id: string;
  role: 'viewer' | 'editor';
  created_at: string;
  profiles: {
    id: string;
    full_name?: string;
    email: string;
  };
}

export interface UploadPhotoData {
  title: string;
  description?: string;
  room?: string;
  style?: string;
  tags: string[];
  is_public: boolean;
}

export type FilterOptions = {
  room?: string;
  style?: string;
  search?: string;
  tags?: string[];
  sortBy?: 'newest' | 'oldest' | 'most_liked';
};