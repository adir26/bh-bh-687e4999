import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Upload, FileIcon, X, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';

interface FileUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (orderId: string, file: File) => Promise<void>;
  isUploading: boolean;
}

interface Order {
  id: string;
  title: string;
  status: string;
  customer_name?: string;
  created_at: string;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  open,
  onOpenChange,
  onUpload,
  isUploading
}) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  // Fetch supplier's orders for file association
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['supplier-orders-for-files', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('orders')
        .select('id, title, status, customer_name, created_at')
        .eq('supplier_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user?.id && open,
  });

  const handleFileSelect = useCallback((file: File) => {
    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('גודל הקובץ חייב להיות פחות מ-50MB');
      return;
    }

    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !selectedOrderId) return;

    try {
      await onUpload(selectedOrderId, selectedFile);
      
      // Reset form
      setSelectedFile(null);
      setSelectedOrderId('');
      onOpenChange(false);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [selectedFile, selectedOrderId, onUpload, onOpenChange]);

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const resetForm = () => {
    setSelectedFile(null);
    setSelectedOrderId('');
    setDragActive(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">העלאת קובץ חדש</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Selection */}
          <div className="space-y-2">
            <Label htmlFor="order-select">בחר הזמנה לשיוך הקובץ</Label>
            {loadingOrders ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : (
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר הזמנה..." />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{order.title || `הזמנה ${order.id.slice(-6)}`}</span>
                        <Badge variant="outline" className="mr-2">
                          {order.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* File Drop Zone */}
          <div className="space-y-2">
            <Label>קובץ להעלאה</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {selectedFile ? (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileIcon className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="font-medium">{selectedFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(selectedFile.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">גרור קובץ לכאן או</p>
                    <input
                      type="file"
                      id="file-input"
                      className="hidden"
                      onChange={handleFileInputChange}
                      accept="*/*"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      בחר קובץ מהמחשב
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      גודל מקסימלי: 50MB • כל סוגי הקבצים נתמכים
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* File size warning */}
          {selectedFile && selectedFile.size > 10 * 1024 * 1024 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">קובץ גדול</p>
                <p className="text-xs text-yellow-700">
                  קבצים גדולים עלולים לקחת זמן רב יותר להעלאה
                </p>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>מעלה קובץ...</span>
                <span>אנא המתן</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !selectedOrderId || isUploading}
            >
              <Upload className="h-4 w-4 ml-2" />
              {isUploading ? 'מעלה...' : 'העלה קובץ'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};