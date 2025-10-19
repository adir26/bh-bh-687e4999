import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Edit, Check, X, Loader2 } from 'lucide-react';

interface EditableFieldProps {
  value: string | null;
  isEditMode: boolean;
  onSave: (value: string) => Promise<void>;
  type?: 'text' | 'textarea' | 'email' | 'tel' | 'url';
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
  required?: boolean;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  value,
  isEditMode,
  onSave,
  type = 'text',
  placeholder = '',
  className = '',
  children,
  required = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditValue(value || '');
  }, [value]);

  const handleSave = async () => {
    if (required && !editValue.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  // In edit mode but not actively editing - show with hover effect
  if (isEditMode && !isEditing) {
    return (
      <div
        className={`relative group cursor-pointer transition-all rounded-md ${className}`}
        onClick={() => setIsEditing(true)}
      >
        <div className="group-hover:bg-muted/30 group-hover:outline group-hover:outline-2 group-hover:outline-dashed group-hover:outline-primary/30 group-hover:outline-offset-4 rounded-md transition-all p-1">
          {children || (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <Edit className="w-3 h-3 text-primary-foreground" />
          </div>
        </div>
      </div>
    );
  }

  // Actively editing
  if (isEditMode && isEditing) {
    const isTextarea = type === 'textarea';
    return (
      <div className={`space-y-2 ${className}`}>
        {isTextarea ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className="min-h-[100px]"
            autoFocus
            disabled={isSaving}
          />
        ) : (
          <Input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            autoFocus
            disabled={isSaving}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isTextarea) {
                handleSave();
              } else if (e.key === 'Escape') {
                handleCancel();
              }
            }}
          />
        )}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || (required && !editValue.trim())}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                שומר...
              </>
            ) : (
              <>
                <Check className="w-3 h-3" />
                שמור
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="w-3 h-3" />
            ביטול
          </Button>
        </div>
      </div>
    );
  }

  // Normal view mode
  return <>{children}</>;
};
