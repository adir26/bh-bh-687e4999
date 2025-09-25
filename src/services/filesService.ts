import { supabase } from '@/integrations/supabase/client';
import { supaSelect, supaInsert, supaUpdate, supaDelete } from '@/lib/supaFetch';

export interface SupplierFile {
  id: string;
  order_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
  // Joined data
  order?: {
    id: string;
    title: string;
    status: string;
    client_name?: string;
  };
}

export interface FileUploadOptions {
  orderId: string;
  file: File;
  folder?: string;
}

export interface FileFilters {
  orderId?: string;
  fileType?: 'image' | 'document' | 'drawing' | 'other' | 'all';
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export const filesService = {
  // Get all files for a supplier with optional filters
  async getSupplierFiles(
    supplierId: string, 
    filters: FileFilters = {},
    page = 1,
    limit = 20
  ): Promise<{
    files: SupplierFile[];
    total: number;
    hasMore: boolean;
  }> {
    let query = supabase
      .from('order_files')
      .select(`
        *,
        order:orders (
          id,
          title,
          status,
          customer_name
        )
      `);

    // Filter by supplier's orders only
    query = query.eq('orders.supplier_id', supplierId);

    // Apply filters
    if (filters.orderId) {
      query = query.eq('order_id', filters.orderId);
    }

    if (filters.fileType && filters.fileType !== 'all') {
      switch (filters.fileType) {
        case 'image':
          query = query.like('mime_type', 'image%');
          break;
        case 'document':
          query = query.or('mime_type.like.%pdf%,mime_type.like.%doc%,mime_type.like.%text%');
          break;
        case 'drawing':
          query = query.or('file_name.ilike.%dwg%,file_name.ilike.%cad%,file_name.ilike.%drawing%');
          break;
        case 'other':
          query = query.not('mime_type', 'like', 'image%')
                      .not('mime_type', 'like', '%pdf%')
                      .not('mime_type', 'like', '%doc%');
          break;
      }
    }

    if (filters.search) {
      query = query.ilike('file_name', `%${filters.search}%`);
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom.toISOString());
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo.toISOString());
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const data = await supaSelect<SupplierFile[]>(query, {
      errorMessage: 'Failed to fetch supplier files'
    });

    // Get total count for pagination
    let countQuery = supabase
      .from('order_files')
      .select('id', { count: 'exact', head: true });

    countQuery = countQuery.eq('orders.supplier_id', supplierId);
    
    if (filters.orderId) countQuery = countQuery.eq('order_id', filters.orderId);
    if (filters.search) countQuery = countQuery.ilike('file_name', `%${filters.search}%`);

    const { count } = await countQuery;
    const total = count || 0;
    const hasMore = offset + limit < total;

    return {
      files: data || [],
      total,
      hasMore
    };
  },

  // Upload file to specific order
  async uploadFile({ orderId, file, folder }: FileUploadOptions): Promise<SupplierFile> {
    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 50MB');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    
    // Create file path with optional folder organization
    const folderPath = folder ? `${folder}/` : '';
    const filePath = `${orderId}/${folderPath}${fileName}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('order-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get signed URL for secure download
    const { data: { signedUrl }, error: urlError } = await supabase.storage
      .from('order-files')
      .createSignedUrl(filePath, 86400); // 24 hour expiry

    if (urlError) {
      throw new Error(`Failed to generate download URL: ${urlError.message}`);
    }

    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Authentication required');
    }

    // Save file record
    const fileRecord = {
      order_id: orderId,
      uploaded_by: userData.user.id,
      file_name: file.name,
      file_url: signedUrl,
      file_size: file.size,
      mime_type: file.type || 'application/octet-stream'
    };

    const data = await supaInsert<SupplierFile>(
      supabase
        .from('order_files')
        .insert(fileRecord)
        .select(`
          *,
          order:orders (
            id,
            title,
            status,
            customer_name
          )
        `)
        .single(),
      { errorMessage: 'Failed to save file record' }
    );

    return data;
  },

  // Delete file
  async deleteFile(fileId: string): Promise<void> {
    // Get file info first
    const file = await supaSelect<SupplierFile>(
      supabase
        .from('order_files')
        .select('*')
        .eq('id', fileId)
        .single(),
      { errorMessage: 'File not found' }
    );

    // Extract storage path from URL
    const url = new URL(file.file_url);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'order-files');
    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('order-files')
      .remove([filePath]);

    if (storageError) {
      console.warn('Storage deletion failed:', storageError.message);
    }

    // Delete database record
    await supaDelete(
      supabase
        .from('order_files')
        .delete()
        .eq('id', fileId),
      { errorMessage: 'Failed to delete file record' }
    );
  },

  // Get signed download URL for file
  async getDownloadUrl(fileId: string): Promise<string> {
    const file = await supaSelect<SupplierFile>(
      supabase
        .from('order_files')
        .select('file_url')
        .eq('id', fileId)
        .single(),
      { errorMessage: 'File not found' }
    );

    // If URL is already signed and not expired, return it
    if (file.file_url.includes('token=')) {
      return file.file_url;
    }

    // Extract path and generate new signed URL
    const url = new URL(file.file_url);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'order-files');
    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    const { data: { signedUrl }, error } = await supabase.storage
      .from('order-files')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }

    return signedUrl;
  },

  // Get file statistics for supplier
  async getFileStats(supplierId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    byType: Record<string, number>;
    recentUploads: number;
  }> {
    const data = await supaSelect<Array<{
      count: number;
      total_size: number;
      mime_type: string;
      created_at: string;
    }>>(
      supabase
        .from('order_files')
        .select(`
          count(*),
          sum(file_size),
          mime_type,
          created_at
        `, { count: 'exact' })
        .eq('orders.supplier_id', supplierId),
      { errorMessage: 'Failed to fetch file statistics' }
    );

    const totalFiles = data?.length || 0;
    const totalSize = data?.reduce((sum, row) => sum + (row.total_size || 0), 0) || 0;
    
    const byType: Record<string, number> = {};
    data?.forEach(row => {
      const type = row.mime_type?.split('/')[0] || 'other';
      byType[type] = (byType[type] || 0) + row.count;
    });

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUploads = data?.filter(row => 
      new Date(row.created_at) > oneWeekAgo
    ).length || 0;

    return {
      totalFiles,
      totalSize,
      byType,
      recentUploads
    };
  },

  // Search files across all orders
  async searchFiles(
    supplierId: string,
    searchTerm: string,
    limit = 10
  ): Promise<SupplierFile[]> {
    const data = await supaSelect<SupplierFile[]>(
      supabase
        .from('order_files')
        .select(`
          *,
          order:orders (
            id,
            title,
            status,
            customer_name
          )
        `)
        .eq('orders.supplier_id', supplierId)
        .ilike('file_name', `%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(limit),
      { errorMessage: 'Search failed' }
    );

    return data || [];
  }
};