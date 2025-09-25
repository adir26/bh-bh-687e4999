import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getSelectionGroupsForOrder,
  createSelectionGroup,
  updateSelectionGroup,
  createSelectionItem,
  updateSelectionItem,
  createSelectionApproval,
  getSelectionApprovalByToken,
  createSelectionComment,
  approveSelections,
  SelectionGroup,
  SelectionItem,
  SelectionApproval,
  SelectionComment,
  SelectionGroupWithItems
} from '@/services/selectionsService';
import { toast } from 'sonner';

// Selection Groups
export const useSelectionGroups = (orderId?: string) => {
  return useQuery({
    queryKey: ['selection-groups', orderId],
    queryFn: () => getSelectionGroupsForOrder(orderId!),
    enabled: !!orderId,
    staleTime: 30_000,
  });
};

export const useCreateSelectionGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSelectionGroup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['selection-groups', data.order_id] });
      toast.success('Selection group created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create selection group');
    },
  });
};

export const useUpdateSelectionGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SelectionGroup> }) =>
      updateSelectionGroup(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['selection-groups', data.order_id] });
      toast.success('Selection group updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update selection group');
    },
  });
};

// Selection Items
export const useCreateSelectionItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSelectionItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['selection-groups'] });
      toast.success('Selection item created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create selection item');
    },
  });
};

export const useUpdateSelectionItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SelectionItem> }) =>
      updateSelectionItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selection-groups'] });
      toast.success('Selection item updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update selection item');
    },
  });
};

// Selection Approvals
export const useCreateSelectionApproval = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSelectionApproval,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['selection-groups', data.order_id] });
      toast.success('Selection approval created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create selection approval');
    },
  });
};

export const useSelectionApprovalByToken = (token?: string) => {
  return useQuery({
    queryKey: ['selection-approval-token', token],
    queryFn: () => getSelectionApprovalByToken(token!),
    enabled: !!token,
    staleTime: 60_000,
  });
};

// Selection Comments
export const useCreateSelectionComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSelectionComment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['selection-groups'] });
      toast.success('Comment added successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add comment');
    },
  });
};

// Client approval
export const useApproveSelections = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ token, selectedItems, signature }: {
      token: string;
      selectedItems: string[];
      signature?: string;
    }) => approveSelections(token, selectedItems, signature),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['selection-approval-token'] });
      toast.success('Selections approved successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to approve selections');
    },
  });
};