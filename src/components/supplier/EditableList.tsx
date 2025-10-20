import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Loader2 } from 'lucide-react';

interface EditableListProps {
  items: string[];
  onUpdate: (items: string[]) => Promise<void>;
  title: string;
  placeholder?: string;
  className?: string;
}

export const EditableList: React.FC<EditableListProps> = ({
  items,
  onUpdate,
  title,
  placeholder = 'הוסף פריט...',
  className = ''
}) => {
  const [newItem, setNewItem] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    if (!newItem.trim()) return;

    setIsSaving(true);
    try {
      const updatedItems = [...items, newItem.trim()];
      await onUpdate(updatedItems);
      setNewItem('');
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (index: number) => {
    setIsSaving(true);
    try {
      const updatedItems = items.filter((_, i) => i !== index);
      await onUpdate(updatedItems);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className={`bg-muted/30 border-y ${className}`}>
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-lg font-semibold mb-4">{title}</h2>
          <div className="flex items-center gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={placeholder}
              disabled={isSaving}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAdd();
                }
              }}
              className="max-w-xs"
            />
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!newItem.trim() || isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              הוסף
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-muted/30 border-y ${className}`}>
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="text-sm py-1 px-3 gap-2 group"
            >
              {item}
              <button
                onClick={() => handleRemove(index)}
                disabled={isSaving}
                className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={placeholder}
            disabled={isSaving}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAdd();
              }
            }}
            className="max-w-xs"
          />
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!newItem.trim() || isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            הוסף
          </Button>
        </div>
      </div>
    </div>
  );
};
