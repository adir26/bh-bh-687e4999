import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Edit, Check, X, Loader2 } from 'lucide-react';

interface EditableFieldProps {
  value: string | null;
  onSave: (value: string) => Promise<void>;
  type?: 'text' | 'textarea' | 'email' | 'tel' | 'url';
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
  required?: boolean;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  value,
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

  // Not editing - show with edit icon
  if (!isEditing) {
    return (
      <div
        className={`relative group cursor-pointer transition-all rounded-md ${className}`}
        onClick={() => setIsEditing(true)}
      >
        <div className="group-hover:bg-muted/30 rounded-md transition-all p-1 flex items-center gap-2">
          {children || (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-5 h-5 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center">
              <Edit className="w-3 h-3 text-primary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Actively editing
  if (isEditing) {
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
  if (!children) {
    return null;
  }
  return <>{children}</>;
};
