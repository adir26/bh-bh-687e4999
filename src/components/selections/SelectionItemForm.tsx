import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SelectionItem } from '@/services/selectionsService';
import { X, Plus, DollarSign } from 'lucide-react';

const selectionItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  image_url: z.string().url().optional().or(z.literal('')),
  sku: z.string().optional(),
});

type SelectionItemFormData = z.infer<typeof selectionItemSchema>;

interface SelectionItemFormProps {
  groupId: string;
  item?: SelectionItem;
  onSubmit: (data: SelectionItemFormData) => void;
  onCancel: () => void;
}

export const SelectionItemForm = ({ groupId, item, onSubmit, onCancel }: SelectionItemFormProps) => {
  const [specifications, setSpecifications] = useState<Record<string, string>>(
    item?.specifications || {}
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SelectionItemFormData>({
    resolver: zodResolver(selectionItemSchema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || 0,
      image_url: item?.image_url || '',
      sku: item?.sku || '',
    }
  });

  const onFormSubmit = (data: SelectionItemFormData) => {
    onSubmit({
      ...data,
      specifications,
    } as any);
  };

  const addSpecification = () => {
    const key = prompt('Specification name:');
    const value = prompt('Specification value:');
    if (key && value) {
      setSpecifications(prev => ({ ...prev, [key]: value }));
    }
  };

  const removeSpecification = (key: string) => {
    setSpecifications(prev => {
      const newSpecs = { ...prev };
      delete newSpecs[key];
      return newSpecs;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {item ? 'Edit Selection Option' : 'Add Selection Option'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Option Name *</Label>
              <Input 
                id="name"
                {...register('name')}
                placeholder="e.g., Premium Oak Flooring"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="price">Price (₪) *</Label>
              <Input 
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              {...register('description')}
              placeholder="Detailed description of the option"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sku">SKU / Model</Label>
              <Input 
                id="sku"
                {...register('sku')}
                placeholder="Product code or model number"
              />
            </div>

            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input 
                id="image_url"
                {...register('image_url')}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image_url && (
                <p className="text-sm text-destructive mt-1">{errors.image_url.message}</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Specifications</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSpecification}>
                <Plus className="h-4 w-4 mr-2" />
                Add Spec
              </Button>
            </div>
            
            {Object.entries(specifications).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-2">
                      {key}: {value}
                      <button
                        type="button"
                        onClick={() => removeSpecification(key)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specifications added</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {item ? 'Update Option' : 'Add Option'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};