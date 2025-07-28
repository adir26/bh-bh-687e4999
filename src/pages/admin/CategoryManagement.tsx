import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Edit, Trash2, Plus, Tag, Eye, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const mockCategories = [
  {
    id: "CAT-001",
    name: "מטבחים",
    description: "עיצוב והתקנת מטבחים",
    suppliersCount: 234,
    ordersCount: 1247,
    status: "פעיל",
    createdDate: "2023-01-15",
    subcategories: ["מטבחי עץ", "מטבחים מודרניים", "ארונות מטבח"]
  },
  {
    id: "CAT-002", 
    name: "ריהוט",
    description: "ריהוט לבית ולמשרד",
    suppliersCount: 189,
    ordersCount: 856,
    status: "פעיל",
    createdDate: "2023-02-20",
    subcategories: ["ריהוט סלון", "ריהוט חדר שינה", "ריהוט משרדי"]
  },
  {
    id: "CAT-003",
    name: "אינסטלציה",
    description: "שירותי אינסטלציה ותיקונים",
    suppliersCount: 145,
    ordersCount: 623,
    status: "פעיל",
    createdDate: "2023-03-10",
    subcategories: ["צנרת", "ברזים ואביזרים", "תיקוני חירום"]
  },
  {
    id: "CAT-004",
    name: "חשמל",
    description: "עבודות חשמל ותאורה",
    suppliersCount: 167,
    ordersCount: 789,
    status: "לא פעיל",
    createdDate: "2023-04-05",
    subcategories: ["תאורה", "לוחות חשמל", "מתקני חשמל"]
  },
];

export default function CategoryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categories, setCategories] = useState(mockCategories);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    subcategories: ""
  });
  const { toast } = useToast();

  const filteredCategories = categories.filter(category => {
    const matchesSearch = 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || category.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "פעיל":
        return <Badge variant="default" className="bg-green-100 text-green-800">פעיל</Badge>;
      case "לא פעיל":
        return <Badge variant="destructive">לא פעיל</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return;
    
    const subcategories = newCategory.subcategories
      .split(',')
      .map(sub => sub.trim())
      .filter(sub => sub.length > 0);

    const category = {
      id: `CAT-${String(categories.length + 1).padStart(3, '0')}`,
      name: newCategory.name,
      description: newCategory.description,
      suppliersCount: 0,
      ordersCount: 0,
      status: "פעיל",
      createdDate: new Date().toISOString().split('T')[0],
      subcategories
    };

    setCategories([...categories, category]);
    setNewCategory({ name: "", description: "", subcategories: "" });
    setIsAddDialogOpen(false);
    
    toast({
      title: "קטגוריה נוספה",
      description: `קטגוריה "${category.name}" נוספה בהצלחה`,
    });
  };

  const handleEditCategory = () => {
    if (!selectedCategory || !newCategory.name.trim()) return;
    
    const subcategories = newCategory.subcategories
      .split(',')
      .map(sub => sub.trim())
      .filter(sub => sub.length > 0);

    const updatedCategories = categories.map(cat => 
      cat.id === selectedCategory.id 
        ? { 
            ...cat, 
            name: newCategory.name,
            description: newCategory.description,
            subcategories
          }
        : cat
    );

    setCategories(updatedCategories);
    setNewCategory({ name: "", description: "", subcategories: "" });
    setSelectedCategory(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "קטגוריה עודכנה",
      description: `קטגוריה "${newCategory.name}" עודכנה בהצלחה`,
    });
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
    toast({
      title: "קטגוריה נמחקה",
      description: `קטגוריה "${categoryName}" נמחקה בהצלחה`,
    });
  };

  const handleToggleStatus = (categoryId: string) => {
    const updatedCategories = categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, status: cat.status === "פעיל" ? "לא פעיל" : "פעיל" }
        : cat
    );
    setCategories(updatedCategories);
    toast({
      title: "סטטוס עודכן",
      description: "סטטוס הקטגוריה עודכן בהצלחה",
    });
  };

  return (
    <div className="space-y-4 md:space-y-6 font-hebrew">
      <div className="text-right flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">ניהול קטגוריות</h1>
          <p className="text-muted-foreground text-sm md:text-base">ניהול קטגוריות ותגיות השירותים</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-hebrew">
              <Plus className="h-4 w-4 ml-2" />
              הוספת קטגוריה
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md font-hebrew">
            <DialogHeader>
              <DialogTitle className="text-right">הוספת קטגוריה חדשה</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-right">
              <div>
                <Label htmlFor="category-name" className="font-hebrew">שם הקטגוריה</Label>
                <Input
                  id="category-name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  placeholder="למשל: בניה ושיפוצים"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div>
                <Label htmlFor="category-description" className="font-hebrew">תיאור</Label>
                <Textarea
                  id="category-description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  placeholder="תיאור הקטגוריה..."
                  className="text-right"
                  dir="rtl"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="subcategories" className="font-hebrew">תת-קטגוריות</Label>
                <Input
                  id="subcategories"
                  value={newCategory.subcategories}
                  onChange={(e) => setNewCategory({...newCategory, subcategories: e.target.value})}
                  placeholder="מופרד בפסיקים: צביעה, טיח, גיפסום"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <Button 
                onClick={handleAddCategory}
                className="w-full font-hebrew"
                disabled={!newCategory.name.trim()}
              >
                הוספת קטגוריה
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">סה״כ קטגוריות</CardTitle>
            <Tag className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">{categories.length}</div>
            <p className="text-xs text-muted-foreground text-right">קטגוריות פעילות</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">ספקים רשומים</CardTitle>
            <Tag className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">735</div>
            <p className="text-xs text-muted-foreground text-right">בכל הקטגוריות</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">הזמנות החודש</CardTitle>
            <Tag className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">3,515</div>
            <p className="text-xs text-muted-foreground text-right">+18% מהחודש הקודם</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground text-right">קטגוריה פופולרית</CardTitle>
            <Tag className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-right">מטבחים</div>
            <p className="text-xs text-muted-foreground text-right">1,247 הזמנות</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm order-2 sm:order-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש קטגוריות..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right"
                dir="rtl"
              />
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background font-hebrew text-right text-sm"
                dir="rtl"
              >
                <option value="all">כל הסטטוסים</option>
                <option value="פעיל">פעיל</option>
                <option value="לא פעיל">לא פעיל</option>
              </select>
              <Button variant="outline" size="sm" className="font-hebrew">
                <Filter className="h-4 w-4 ml-2" />
                סינון
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {/* Mobile Cards for small screens */}
          <div className="block md:hidden space-y-4">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="p-4">
                <div className="space-y-3 text-right">
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-primary">{category.id}</div>
                    {getStatusBadge(category.status)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><span className="font-medium">ספקים:</span> {category.suppliersCount}</p>
                    <p><span className="font-medium">הזמנות:</span> {category.ordersCount}</p>
                    <p><span className="font-medium">תאריך יצירה:</span> {category.createdDate}</p>
                    <div>
                      <span className="font-medium">תת-קטגוריות:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {category.subcategories.slice(0, 3).map((sub, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {sub}
                          </Badge>
                        ))}
                        {category.subcategories.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{category.subcategories.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 font-hebrew"
                      onClick={() => {
                        setSelectedCategory(category);
                        setNewCategory({
                          name: category.name,
                          description: category.description,
                          subcategories: category.subcategories.join(', ')
                        });
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 ml-2" />
                      עריכה
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="font-hebrew"
                      onClick={() => handleToggleStatus(category.id)}
                    >
                      {category.status === "פעיל" ? "השבת" : "הפעל"}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">מזהה</TableHead>
                  <TableHead className="text-right">שם הקטגוריה</TableHead>
                  <TableHead className="text-right">תיאור</TableHead>
                  <TableHead className="text-right">ספקים</TableHead>
                  <TableHead className="text-right">הזמנות</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-right">תת-קטגוריות</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium text-right">{category.id}</TableCell>
                    <TableCell className="text-right font-medium">{category.name}</TableCell>
                    <TableCell className="text-right max-w-xs">
                      <div className="truncate">{category.description}</div>
                    </TableCell>
                    <TableCell className="text-right">{category.suppliersCount}</TableCell>
                    <TableCell className="text-right">{category.ordersCount}</TableCell>
                    <TableCell className="text-right">{getStatusBadge(category.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap gap-1 justify-end">
                        {category.subcategories.slice(0, 2).map((sub, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {sub}
                          </Badge>
                        ))}
                        {category.subcategories.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{category.subcategories.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="font-hebrew">
                          <DropdownMenuItem 
                            className="text-right"
                            onClick={() => {
                              setSelectedCategory(category);
                              setNewCategory({
                                name: category.name,
                                description: category.description,
                                subcategories: category.subcategories.join(', ')
                              });
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 ml-2" />
                            עריכה
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-right"
                            onClick={() => handleToggleStatus(category.id)}
                          >
                            {category.status === "פעיל" ? "השבת" : "הפעל"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-right text-red-600"
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            מחיקה
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md font-hebrew">
          <DialogHeader>
            <DialogTitle className="text-right">עריכת קטגוריה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-right">
            <div>
              <Label htmlFor="edit-category-name" className="font-hebrew">שם הקטגוריה</Label>
              <Input
                id="edit-category-name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                className="text-right"
                dir="rtl"
              />
            </div>
            <div>
              <Label htmlFor="edit-category-description" className="font-hebrew">תיאור</Label>
              <Textarea
                id="edit-category-description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                className="text-right"
                dir="rtl"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-subcategories" className="font-hebrew">תת-קטגוריות</Label>
              <Input
                id="edit-subcategories"
                value={newCategory.subcategories}
                onChange={(e) => setNewCategory({...newCategory, subcategories: e.target.value})}
                placeholder="מופרד בפסיקים"
                className="text-right"
                dir="rtl"
              />
            </div>
            <Button 
              onClick={handleEditCategory}
              className="w-full font-hebrew"
              disabled={!newCategory.name.trim()}
            >
              עדכון קטגוריה
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}