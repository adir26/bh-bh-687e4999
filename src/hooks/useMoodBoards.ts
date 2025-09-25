import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moodBoardService, type CreateMoodBoardData, type CreateMoodBoardItemData, type MoodBoard, type MoodBoardItem } from '@/services/moodBoardService';
import { toast } from 'sonner';

export function useMoodBoards(supplierId?: string) {
  return useQuery({
    queryKey: ['mood-boards', supplierId],
    queryFn: () => moodBoardService.getMoodBoards(supplierId),
    staleTime: 30_000,
  });
}

export function useMoodBoard(id: string) {
  return useQuery({
    queryKey: ['mood-board', id],
    queryFn: () => moodBoardService.getMoodBoard(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useMoodBoardByToken(token: string) {
  return useQuery({
    queryKey: ['mood-board-token', token],
    queryFn: () => moodBoardService.getMoodBoardByToken(token),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useMoodBoardItems(moodBoardId: string) {
  return useQuery({
    queryKey: ['mood-board-items', moodBoardId],
    queryFn: () => moodBoardService.getMoodBoardItems(moodBoardId),
    enabled: !!moodBoardId,
    staleTime: 30_000,
  });
}

export function useMoodBoardComments(moodBoardId: string) {
  return useQuery({
    queryKey: ['mood-board-comments', moodBoardId],
    queryFn: () => moodBoardService.getMoodBoardComments(moodBoardId),
    enabled: !!moodBoardId,
    staleTime: 10_000,
  });
}

export function useMoodBoardReactions(moodBoardId: string) {
  return useQuery({
    queryKey: ['mood-board-reactions', moodBoardId],
    queryFn: () => moodBoardService.getMoodBoardReactions(moodBoardId),
    enabled: !!moodBoardId,
    staleTime: 10_000,
  });
}

export function useCreateMoodBoard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMoodBoardData) => moodBoardService.createMoodBoard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-boards'] });
      toast.success('לוח רגש נוצר בהצלחה');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'שגיאה ביצירת לוח הרגש');
    },
  });
}

export function useUpdateMoodBoard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MoodBoard> }) => 
      moodBoardService.updateMoodBoard(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mood-boards'] });
      queryClient.invalidateQueries({ queryKey: ['mood-board', data.id] });
      toast.success('לוח הרגש עודכן בהצלחה');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'שגיאה בעדכון לוח הרגש');
    },
  });
}

export function useDeleteMoodBoard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => moodBoardService.deleteMoodBoard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-boards'] });
      toast.success('לוח הרגש נמחק בהצלחה');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'שגיאה במחיקת לוח הרגש');
    },
  });
}

export function useCreateMoodBoardItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMoodBoardItemData) => moodBoardService.createMoodBoardItem(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mood-board-items', data.mood_board_id] });
      toast.success('פריט נוסף בהצלחה');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'שגיאה בהוספת פריט');
    },
  });
}

export function useUpdateMoodBoardItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MoodBoardItem> }) => 
      moodBoardService.updateMoodBoardItem(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mood-board-items', data.mood_board_id] });
      toast.success('פריט עודכן בהצלחה');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'שגיאה בעדכון פריט');
    },
  });
}

export function useDeleteMoodBoardItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => moodBoardService.deleteMoodBoardItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-board-items'] });
      toast.success('פריט נמחק בהצלחה');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'שגיאה במחיקת פריט');
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ moodBoardId, itemId, commentText, clientData }: {
      moodBoardId: string;
      itemId: string | null;
      commentText: string;
      clientData?: { name: string; email: string };
    }) => moodBoardService.addComment(moodBoardId, itemId, commentText, clientData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mood-board-comments', data.mood_board_id] });
      toast.success('תגובה נוספה בהצלחה');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'שגיאה בהוספת תגובה');
    },
  });
}

export function useAddReaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ moodBoardId, itemId, reactionType, clientIdentifier }: {
      moodBoardId: string;
      itemId: string | null;
      reactionType: 'like' | 'love' | 'dislike';
      clientIdentifier?: string;
    }) => moodBoardService.addReaction(moodBoardId, itemId, reactionType, clientIdentifier),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mood-board-reactions', data.mood_board_id] });
      toast.success('תגובה נוספה בהצלחה');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'שגיאה בהוספת תגובה');
    },
  });
}

export function useRemoveReaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => moodBoardService.removeReaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-board-reactions'] });
      toast.success('תגובה הוסרה בהצלחה');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'שגיאה בהסרת תגובה');
    },
  });
}

export function useAddItemToSelections() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, selectionGroupId }: { itemId: string; selectionGroupId: string }) =>
      moodBoardService.addItemToSelections(itemId, selectionGroupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selection-groups'] });
      queryClient.invalidateQueries({ queryKey: ['selection-items'] });
      toast.success('פריט הועבר לבחירות בהצלחה');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'שגיאה בהעברת פריט לבחירות');
    },
  });
}