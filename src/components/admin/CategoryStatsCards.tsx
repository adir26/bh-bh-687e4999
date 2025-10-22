import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "lucide-react";
import { EnhancedCategory } from '@/types/admin';

interface CategoryStatsCardsProps {
  categories: EnhancedCategory[];
  totalCount: number;
}

export function CategoryStatsCards({ categories, totalCount }: CategoryStatsCardsProps) {
  const activeCount = categories.filter(cat => cat.is_active).length;
  const totalSuppliers = categories.reduce((sum, cat) => sum + (cat.supplier_count || 0), 0);
  const totalProducts = categories.reduce((sum, cat) => sum + (cat.product_count || 0), 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">
            סה״כ קטגוריות
          </CardTitle>
          <Tag className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-right">{totalCount}</div>
          <p className="text-xs text-muted-foreground text-right">קטגוריות בסיסטם</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">
            קטגוריות פעילות
          </CardTitle>
          <Tag className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-right">{activeCount}</div>
          <p className="text-xs text-muted-foreground text-right">מתוך {totalCount} קטגוריות</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">
            ספקים משויכים
          </CardTitle>
          <Tag className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-right">{totalSuppliers}</div>
          <p className="text-xs text-muted-foreground text-right">בכל הקטגוריות</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">
            מוצרים משויכים
          </CardTitle>
          <Tag className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-right">{totalProducts}</div>
          <p className="text-xs text-muted-foreground text-right">בכל הקטגוריות</p>
        </CardContent>
      </Card>
    </div>
  );
}
