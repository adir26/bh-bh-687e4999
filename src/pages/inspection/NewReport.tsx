import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Home, 
  Droplets, 
  Eye, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  Key, 
  Building2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { PageBoundary } from '@/components/system/PageBoundary';

const reportTypes = [
  { id: 'home_inspection', label: 'בדק בית', icon: Home, description: 'בדיקה כללית של דירה או בית' },
  { id: 'plumbing', label: 'אינסטלציה', icon: Droplets, description: 'בדיקת מערכות מים וביוב' },
  { id: 'supervision', label: 'פיקוח', icon: Eye, description: 'פיקוח על עבודות בנייה' },
  { id: 'leak_detection', label: 'איתור נזילות', icon: Search, description: 'איתור נזילות מים וצנרת' },
  { id: 'qa', label: 'בקרת איכות', icon: ShieldCheck, description: 'בדיקת איכות ביצוע' },
  { id: 'safety', label: 'בטיחות', icon: AlertTriangle, description: 'בדיקת תקני בטיחות' },
  { id: 'consultants', label: 'יועצים', icon: Users, description: 'דוחות יועצים מקצועיים' },
  { id: 'handover', label: 'מסירות דירות', icon: Key, description: 'בדיקת מסירה מקבלן' },
  { id: 'common_areas', label: 'שטחים ציבוריים', icon: Building2, description: 'בדיקת שטחים משותפים' },
];

export default function NewReport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const progress = (step / 1) * 100;

  const handleSelectType = async (typeId: string) => {
    setSelectedType(typeId);
    setLoading(true);

    try {
      const insertData: any = {
        report_type: typeId,
        status: 'draft',
        supplier_id: user?.id,
        created_by: user?.id,
      };

      const { data, error } = await supabase
        .from('inspection_reports')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast.success('דוח חדש נוצר בהצלחה');
      navigate(`/inspection/${data.id}`);
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('שגיאה ביצירת דוח');
      setLoading(false);
    }
  };

  return (
    <PageBoundary isLoading={false}>
      <div className="container max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/inspection/dashboard')}
            className="mb-4"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            חזרה לדשבורד
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">דוח חדש</h1>
          <p className="text-muted-foreground">בחרו את סוג הדוח שברצונכם ליצור</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">שלב {step} מתוך 1</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Report Type Selection */}
        {step === 1 && (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>בחרו סוג דוח</CardTitle>
                <CardDescription>
                  בחרו את סוג הדוח המתאים לבדיקה שאתם מבצעים
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;

                return (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => handleSelectType(type.id)}
                  >
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className={`p-4 rounded-full ${
                          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <Icon className="h-8 w-8" />
                        </div>
                      </div>
                      <CardTitle className="text-lg">{type.label}</CardTitle>
                      <CardDescription className="text-sm">
                        {type.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageBoundary>
  );
}
