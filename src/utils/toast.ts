import { toast } from '@/hooks/use-toast';

export const showToast = {
  success: (message: string) => {
    toast({
      title: "הצלחה",
      description: message,
      variant: "default",
    });
  },
  error: (message: string) => {
    toast({
      title: "שגיאה", 
      description: message,
      variant: "destructive",
    });
  },
  info: (message: string) => {
    toast({
      title: "מידע",
      description: message,
      variant: "default",
    });
  },
  comingSoon: (feature: string = "תכונה זו") => {
    toast({
      title: "בקרוב",
      description: `${feature} תהיה זמינה בעדכון הבא`,
      variant: "default",
    });
  }
};