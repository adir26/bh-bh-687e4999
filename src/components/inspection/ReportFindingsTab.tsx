import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Filter } from 'lucide-react';
import { useInspectionItems } from '@/hooks/useInspectionItems';
import FindingCard from './FindingCard';
import FindingFormSheet from './FindingFormSheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReportFindingsTabProps {
  reportId: string;
}

export default function ReportFindingsTab({ reportId }: ReportFindingsTabProps) {
  const [filters, setFilters] = useState<any>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: items = [], isLoading } = useInspectionItems(reportId, filters);

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>ממצאים</CardTitle>
            <CardDescription>נהל את הממצאים בדוח</CardDescription>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            ממצא חדש
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="חיפוש..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) =>
                setFilters({ ...filters, category: value === 'all' ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הקטגוריות</SelectItem>
                <SelectItem value="קירות">קירות</SelectItem>
                <SelectItem value="רצפה">רצפה</SelectItem>
                <SelectItem value="אינסטלציה">אינסטלציה</SelectItem>
                <SelectItem value="חשמל">חשמל</SelectItem>
                <SelectItem value="דלתות וחלונות">דלתות וחלונות</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status_check?.[0] || 'all'}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  status_check: value === 'all' ? undefined : [value],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="ok">תקין</SelectItem>
                <SelectItem value="not_ok">לא תקין</SelectItem>
                <SelectItem value="na">לא נבדק</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.severity || 'all'}
              onValueChange={(value) =>
                setFilters({ ...filters, severity: value === 'all' ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="חומרה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל רמות החומרה</SelectItem>
                <SelectItem value="low">נמוכה</SelectItem>
                <SelectItem value="medium">בינונית</SelectItem>
                <SelectItem value="high">גבוהה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items List */}
          {isLoading ? (
            <div className="text-center py-8">טוען...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">לא נוספו ממצאים</p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="ml-2 h-4 w-4" />
                ממצא חדש
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <FindingCard
                  key={item.id}
                  item={item}
                  reportId={reportId}
                  onEdit={() => handleEdit(item)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FindingFormSheet
        reportId={reportId}
        item={selectedItem}
        open={isFormOpen}
        onClose={handleClose}
      />
    </div>
  );
}
