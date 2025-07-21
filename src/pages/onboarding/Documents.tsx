import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ChevronRight, Upload, File, X } from 'lucide-react';

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
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center space-x-2">
          <button onClick={handleBack} className="p-2">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="text-sm text-gray-500">שלב 4</div>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-md mx-auto">
          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              התיקייה הדיגיטלית של הדירה
            </h1>
            <p className="text-gray-600">
              כאן תוכלו לשמור מסמכים חשובים הקשורים לפרויקט
            </p>
          </div>

          {/* Document Categories */}
          <div className="space-y-4">
            {documentCategories.map((category) => {
              const Icon = category.icon;
              const files = uploadedFiles[category.id] || [];
              
              return (
                <Card key={category.id} className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Icon className="w-6 h-6 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{category.title}</h3>
                        <p className="text-sm text-gray-500 mb-3">{category.description}</p>
                        
                        {/* Upload Button */}
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => handleFileUpload(category.id, e)}
                            className="hidden"
                          />
                          <div className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                            <Upload className="w-4 h-4" />
                            <span className="text-sm">העלו קובץ</span>
                          </div>
                        </label>

                        {/* Uploaded Files */}
                        {files.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {files.map((file) => (
                              <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                </div>
                                <button
                                  onClick={() => removeFile(category.id, file.id)}
                                  className="text-gray-400 hover:text-red-500"
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

          {/* Skip/Next Button */}
          <div className="mt-8 space-y-3">
            <Button 
              onClick={handleNext}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
            >
              המשך
              <ArrowRight className="w-5 h-5 mr-2" />
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleNext}
              className="w-full text-gray-600"
            >
              דלג לשלב הבא
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center pb-6">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full" />
          <div className="w-2 h-2 bg-blue-600 rounded-full" />
          <div className="w-2 h-2 bg-blue-600 rounded-full" />
          <div className="w-2 h-2 bg-blue-600 rounded-full" />
          <div className="w-2 h-2 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}