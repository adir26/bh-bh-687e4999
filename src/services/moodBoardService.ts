import { supabase } from '@/integrations/supabase/client';
import { supaSelect, supaInsert, supaUpdate, supaDelete } from '@/lib/supaFetch';

export interface MoodBoard {
  id: string;
  supplier_id: string;
  order_id?: string;
  client_id?: string;
  share_token: string;
  is_active: boolean;
  client_can_interact: boolean;
  created_at: string;
  updated_at: string;
  title: string;
  description?: string;
  status: 'draft' | 'shared' | 'approved' | 'archived';
}

export interface MoodBoardItem {
  id: string;
  mood_board_id: string;
  supplier_id: string;
  product_id?: string;
  image_url: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  display_order: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  title: string;
  description?: string;
  price?: number;
  currency: string;
  supplier_notes?: string;
}

export interface MoodBoardComment {
  id: string;
  mood_board_id: string;
  item_id?: string;
  user_id?: string;
  client_name?: string;
  client_email?: string;
  is_supplier: boolean;
  created_at: string;
  comment_text: string;
}

export interface MoodBoardReaction {
  id: string;
  mood_board_id: string;
  item_id?: string;
  user_id?: string;
  client_identifier?: string;
  reaction_type: 'like' | 'love' | 'dislike';
  created_at: string;
}

export interface CreateMoodBoardData {
  title: string;
  description?: string;
  order_id?: string;
  client_id?: string;
}

export interface CreateMoodBoardItemData {
  mood_board_id: string;
  title: string;
  description?: string;
  image_url: string;
  price?: number;
  currency?: string;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  display_order?: number;
  product_id?: string;
  supplier_notes?: string;
}

export const moodBoardService = {
  // Mood Boards
  async getMoodBoards(supplierId?: string): Promise<MoodBoard[]> {
    const query = supabase
      .from('mood_boards')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (supplierId) {
      query.eq('supplier_id', supplierId);
    }
    
    return supaSelect(query, {
      errorMessage: 'שגיאה בטעינת לוחות הרגש'
    });
  },

  async getMoodBoard(id: string): Promise<MoodBoard> {
    const query = supabase
      .from('mood_boards')
      .select('*')
      .eq('id', id)
      .single();
    
    return supaSelect(query, {
      errorMessage: 'שגיאה בטעינת לוח הרגש'
    });
  },

  async getMoodBoardByToken(token: string): Promise<MoodBoard | null> {
    const { data, error } = await supabase.rpc('get_mood_board_by_token', {
      p_token: token
    });
    
    if (error) {
      throw new Error('שגיאה בטעינת לוח הרגש');
    }
    
    // Map the result to match MoodBoard interface
    if (data && data.length > 0) {
      const result = data[0];
      return {
        id: result.id,
        supplier_id: result.supplier_id,
        client_id: result.client_id,
        share_token: token,
        is_active: true,
        client_can_interact: result.client_can_interact,
        created_at: result.created_at,
        updated_at: result.updated_at,
        title: result.title,
        description: result.description,
        status: result.status,
        order_id: undefined
      };
    }
    
    return null;
  },

  async createMoodBoard(data: CreateMoodBoardData): Promise<MoodBoard> {
    const query = supabase
      .from('mood_boards')
      .insert({
        title: data.title,
        description: data.description,
        order_id: data.order_id,
        client_id: data.client_id,
        supplier_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    return supaInsert(query, {
      errorMessage: 'שגיאה ביצירת לוח הרגש'
    });
  },

  async updateMoodBoard(id: string, updates: Partial<MoodBoard>): Promise<MoodBoard> {
    const query = supabase
      .from('mood_boards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return supaUpdate(query, {
      errorMessage: 'שגיאה בעדכון לוח הרגש'
    });
  },

  async deleteMoodBoard(id: string): Promise<void> {
    const query = supabase
      .from('mood_boards')
      .delete()
      .eq('id', id);
    
    await supaDelete(query, {
      errorMessage: 'שגיאה במחיקת לוח הרגש'
    });
  },

  // Mood Board Items
  async getMoodBoardItems(moodBoardId: string): Promise<MoodBoardItem[]> {
    const query = supabase
      .from('mood_board_items')
      .select('*')
      .eq('mood_board_id', moodBoardId)
      .order('display_order', { ascending: true });
    
    return supaSelect(query, {
      errorMessage: 'שגיאה בטעינת פריטי לוח הרגש'
    });
  },

  async createMoodBoardItem(data: CreateMoodBoardItemData): Promise<MoodBoardItem> {
    const query = supabase
      .from('mood_board_items')
      .insert({
        ...data,
        supplier_id: (await supabase.auth.getUser()).data.user?.id,
        position_x: data.position_x || 0,
        position_y: data.position_y || 0,
        width: data.width || 200,
        height: data.height || 200,
        display_order: data.display_order || 0,
        currency: data.currency || 'ILS'
      })
      .select()
      .single();
    
    return supaInsert(query, {
      errorMessage: 'שגיאה בהוספת פריט ללוח הרגש'
    });
  },

  async updateMoodBoardItem(id: string, updates: Partial<MoodBoardItem>): Promise<MoodBoardItem> {
    const query = supabase
      .from('mood_board_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return supaUpdate(query, {
      errorMessage: 'שגיאה בעדכון פריט בלוח הרגש'
    });
  },

  async deleteMoodBoardItem(id: string): Promise<void> {
    const query = supabase
      .from('mood_board_items')
      .delete()
      .eq('id', id);
    
    await supaDelete(query, {
      errorMessage: 'שגיאה במחיקת פריט מלוח הרגש'
    });
  },

  // Comments
  async getMoodBoardComments(moodBoardId: string): Promise<MoodBoardComment[]> {
    const query = supabase
      .from('mood_board_comments')
      .select('*')
      .eq('mood_board_id', moodBoardId)
      .order('created_at', { ascending: true });
    
    return supaSelect(query, {
      errorMessage: 'שגיאה בטעינת תגובות'
    });
  },

  async addComment(moodBoardId: string, itemId: string | null, commentText: string, clientData?: { name: string; email: string }): Promise<MoodBoardComment> {
    const user = (await supabase.auth.getUser()).data.user;
    
    const query = supabase
      .from('mood_board_comments')
      .insert({
        mood_board_id: moodBoardId,
        item_id: itemId,
        user_id: user?.id,
        client_name: clientData?.name,
        client_email: clientData?.email,
        is_supplier: !!user,
        comment_text: commentText
      })
      .select()
      .single();
    
    return supaInsert(query, {
      errorMessage: 'שגיאה בהוספת תגובה'
    });
  },

  // Reactions
  async getMoodBoardReactions(moodBoardId: string): Promise<MoodBoardReaction[]> {
    const query = supabase
      .from('mood_board_reactions')
      .select('*')
      .eq('mood_board_id', moodBoardId);
    
    return supaSelect(query, {
      errorMessage: 'שגיאה בטעינת תגובות'
    });
  },

  async addReaction(moodBoardId: string, itemId: string | null, reactionType: 'like' | 'love' | 'dislike', clientIdentifier?: string): Promise<MoodBoardReaction> {
    const user = (await supabase.auth.getUser()).data.user;
    
    const query = supabase
      .from('mood_board_reactions')
      .insert({
        mood_board_id: moodBoardId,
        item_id: itemId,
        user_id: user?.id,
        client_identifier: clientIdentifier,
        reaction_type: reactionType
      })
      .select()
      .single();
    
    return supaInsert(query, {
      errorMessage: 'שגיאה בהוספת תגובה'
    });
  },

  async removeReaction(id: string): Promise<void> {
    const query = supabase
      .from('mood_board_reactions')
      .delete()
      .eq('id', id);
    
    await supaDelete(query, {
      errorMessage: 'שגיאה בהסרת תגובה'
    });
  },

  // Add to Selections
  async addItemToSelections(itemId: string, selectionGroupId: string): Promise<string> {
    const { data, error } = await supabase.rpc('add_mood_board_item_to_selection', {
      p_item_id: itemId,
      p_selection_group_id: selectionGroupId
    });
    
    if (error) {
      throw new Error('שגיאה בהעברת פריט לבחירות');
    }
    
    return data;
  }
};