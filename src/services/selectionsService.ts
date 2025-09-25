import { supabase } from '@/integrations/supabase/client';
import { supaSelect, supaSelectMaybe, supaInsert, supaUpdate } from '@/lib/supaFetch';

export interface SelectionGroup {
  id: string;
  order_id: string;
  supplier_id: string;
  name: string;
  description?: string;
  allowance_amount: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SelectionItem {
  id: string;
  group_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  sku?: string;
  vendor_info?: Record<string, any>;
  specifications?: Record<string, any>;
  is_available: boolean;
  display_order: number;
  created_at: string;
}

export interface SelectionApproval {
  id: string;
  group_id: string;
  order_id: string;
  client_id: string;
  selected_items: string[];
  total_amount: number;
  allowance_amount: number;
  over_allowance_amount: number;
  approval_token: string;
  approved_at?: string;
  approved_by?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface SelectionComment {
  id: string;
  group_id: string;
  user_id: string;
  comment_text: string;
  is_internal: boolean;
  created_at: string;
}

export interface SelectionGroupWithItems extends SelectionGroup {
  items: SelectionItem[];
  approval?: SelectionApproval;
  comments: SelectionComment[];
}

// Selection Groups
export const getSelectionGroupsForOrder = async (orderId: string): Promise<SelectionGroupWithItems[]> => {
  const groups = await supaSelect<SelectionGroup[]>(
    supabase
      .from('selection_groups')
      .select('*')
      .eq('order_id', orderId)
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    { errorMessage: 'Error fetching selection groups' }
  );

  const groupsWithData = await Promise.all(
    groups.map(async (group) => {
      const [items, approval, comments] = await Promise.all([
        getSelectionItems(group.id),
        getSelectionApproval(group.id),
        getSelectionComments(group.id)
      ]);

      return {
        ...group,
        items,
        approval,
        comments
      };
    })
  );

  return groupsWithData;
};

export const createSelectionGroup = async (data: Omit<SelectionGroup, 'id' | 'created_at' | 'updated_at'>): Promise<SelectionGroup> => {
  return await supaInsert<SelectionGroup>(
    supabase
      .from('selection_groups')
      .insert(data)
      .select()
      .single(),
    { errorMessage: 'Error creating selection group' }
  );
};

export const updateSelectionGroup = async (id: string, data: Partial<SelectionGroup>): Promise<SelectionGroup> => {
  return await supaUpdate<SelectionGroup>(
    supabase
      .from('selection_groups')
      .update(data)
      .eq('id', id)
      .select()
      .single(),
    { errorMessage: 'Error updating selection group' }
  );
};

// Selection Items
export const getSelectionItems = async (groupId: string): Promise<SelectionItem[]> => {
  return await supaSelect<SelectionItem[]>(
    supabase
      .from('selection_items')
      .select('*')
      .eq('group_id', groupId)
      .eq('is_available', true)
      .order('display_order', { ascending: true }),
    { errorMessage: 'Error fetching selection items' }
  );
};

export const createSelectionItem = async (data: Omit<SelectionItem, 'id' | 'created_at'>): Promise<SelectionItem> => {
  return await supaInsert<SelectionItem>(
    supabase
      .from('selection_items')
      .insert(data)
      .select()
      .single(),
    { errorMessage: 'Error creating selection item' }
  );
};

export const updateSelectionItem = async (id: string, data: Partial<SelectionItem>): Promise<SelectionItem> => {
  return await supaUpdate<SelectionItem>(
    supabase
      .from('selection_items')
      .update(data)
      .eq('id', id)
      .select()
      .single(),
    { errorMessage: 'Error updating selection item' }
  );
};

// Selection Approvals
export const getSelectionApproval = async (groupId: string): Promise<SelectionApproval | null> => {
  return await supaSelectMaybe<SelectionApproval>(
    supabase
      .from('selection_approvals')
      .select('*')
      .eq('group_id', groupId),
    { errorMessage: 'Error fetching selection approval' }
  );
};

export const createSelectionApproval = async (data: Omit<SelectionApproval, 'id' | 'approval_token' | 'created_at' | 'updated_at'>): Promise<SelectionApproval> => {
  return await supaInsert<SelectionApproval>(
    supabase
      .from('selection_approvals')
      .insert(data)
      .select()
      .single(),
    { errorMessage: 'Error creating selection approval' }
  );
};

export const getSelectionApprovalByToken = async (token: string): Promise<SelectionApproval | null> => {
  return await supaSelectMaybe<SelectionApproval>(
    supabase
      .from('selection_approvals')
      .select(`
        *,
        selection_groups!inner(
          id, name, order_id, allowance_amount,
          orders!inner(id, title, client_id)
        )
      `)
      .eq('approval_token', token)
      .gt('expires_at', new Date().toISOString()),
    { errorMessage: 'Error fetching selection approval by token' }
  );
};

// Selection Comments
export const getSelectionComments = async (groupId: string): Promise<SelectionComment[]> => {
  return await supaSelect<SelectionComment[]>(
    supabase
      .from('selection_comments')
      .select(`
        *,
        profiles!inner(id, full_name)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true }),
    { errorMessage: 'Error fetching selection comments' }
  );
};

export const createSelectionComment = async (data: Omit<SelectionComment, 'id' | 'created_at'>): Promise<SelectionComment> => {
  return await supaInsert<SelectionComment>(
    supabase
      .from('selection_comments')
      .insert(data)
      .select()
      .single(),
    { errorMessage: 'Error creating selection comment' }
  );
};

// Client approval workflow
export const approveSelections = async (
  token: string,
  selectedItems: string[],
  signature?: string
): Promise<{ success: boolean; totals: any }> => {
  const { data, error } = await supabase.rpc('approve_selections', {
    p_approval_token: token,
    p_selected_items: JSON.stringify(selectedItems.map(id => ({ id }))),
    p_client_signature: signature
  });

  if (error) {
    throw new Error(error.message || 'Error approving selections');
  }

  return data as { success: boolean; totals: any };
};