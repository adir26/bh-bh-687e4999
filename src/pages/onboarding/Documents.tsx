
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ChevronRight, Upload, File, X } from 'lucide-react';
import OnboardingProgress from '@/components/OnboardingProgress';
import documentsImage from '@/assets/documents.jpg';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

const documentCategories = [
  {
    id: 'contract',
    title: 'חוזה חתום',
    description: 'העלו את החוזה החתום עם הקבלן',
    icon: File
  },
  {
    id: 'specifications',
    title: 'מפרט טכני',
    description: 'מסמכים טכניים ותוכניות',
    icon: File
  },
  {
    id: 'receipts',
    title: 'קבלות תשלום',
    description: 'קבלות על תשלומים שבוצעו',
    icon: File
  },
  {
    id: 'changes',
    title: 'בקשות לשינוי עיצוב',
    description: 'מסמכים הקשורים לשינויים',
    icon: File
  },
  {
    id: 'other',
    title: 'מסמכים נוספים',
    description: 'כל מסמך אחר רלוונטי לפרויקט',
    icon: File
  }
];

export default function OnboardingDocuments() {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile[]>>({});

  const handleFileUpload = (categoryId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36),
      name: file.name,
      size: file.size,
      type: file.type
    }));

    setUploadedFiles(prev => ({
      ...prev,
      [categoryId]: [...(prev[categoryId] || []), ...newFiles]
    }));
  };

  const removeFile = (categoryId: string, fileId: string) => {
    setUploadedFiles(prev => ({
      ...prev,
      [categoryId]: (prev[categoryId] || []).filter(file => file.id !== fileId)
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleNext = () => {
    localStorage.setItem('uploadedDocuments', JSON.stringify(uploadedFiles));
    navigate('/onboarding/interests');
  };

  const handleBack = () => {
    navigate('/onboarding/project-planning');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-border">
        <div className="flex items-center space-x-2">
          <button onClick={handleBack} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-foreground text-xl font-light w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          ×
        </button>
      </div>

      {/* Progress Indicator */}
      <OnboardingProgress currentStep={4} totalSteps={5} />

      {/* Documents Image */}
      <div className="relative h-48 mx-6 mb-6 rounded-2xl overflow-hidden">
        <img 
          src={documentsImage}
          alt="ניהול מסמכים דיגיטלי"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-safe">
        <div className="max-w-md mx-auto">
          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              התיקייה הדיגיטלית של הדירה
            </h1>
            <p className="text-muted-foreground">
              כאן תוכלו לשמור מסמכים חשובים הקשורים לפרויקט
            </p>
          </div>

          {/* Document Categories */}
          <div className="space-y-4">
            {documentCategories.map((category) => {
              const Icon = category.icon;
              const files = uploadedFiles[category.id] || [];
              
              return (
                <Card key={category.id} className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl">
                  <CardContent className="p-4">
                     <div className="flex items-start space-x-3">
                       <Icon className="w-6 h-6 text-muted-foreground mt-1" />
                       <div className="flex-1">
                         <h3 className="font-medium text-foreground">{category.title}</h3>
                         <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                        
                        {/* Upload Button */}
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => handleFileUpload(category.id, e)}
                            className="hidden"
                           />
                           <div className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
                             <Upload className="w-4 h-4" />
                             <span className="text-sm">העלו קובץ</span>
                           </div>
                        </label>

                        {/* Uploaded Files */}
                        {files.length > 0 && (
                           <div className="mt-3 space-y-2">
                             {files.map((file) => (
                               <div key={file.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-lg">
                                 <div className="flex-1">
                                   <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                                   <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                                 </div>
                                 <button
                                   onClick={() => removeFile(category.id, file.id)}
                                   className="text-muted-foreground hover:text-destructive transition-colors"
                                 >
                                   <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-6 pb-safe z-50">
        <div className="max-w-md mx-auto space-y-3">
          <Button 
            onClick={handleNext}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg rounded-xl h-14 font-medium"
          >
            המשך
            <ArrowRight className="w-5 h-5 mr-2" />
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={handleNext}
            className="w-full text-muted-foreground hover:text-foreground h-14"
          >
            דלג לשלב הבא
          </Button>
        </div>
      </div>
    </div>
  );
}
